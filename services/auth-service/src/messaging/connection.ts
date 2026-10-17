import amqp, { ChannelModel } from "amqplib";
import envConfig from "../config/env";
import logger from "../utils/logger";

let connection: ChannelModel | null = null;
let connectingPromise: Promise<ChannelModel> | null = null;
let isExplicitClose = false;
let retryTimeout: NodeJS.Timeout | null = null;

const RETRY_INTERVAL_MS = 5000;

type ReconnectCallback = () => Promise<void> | void;
const reconnectCallbacks: Set<ReconnectCallback> = new Set();

// register a callback to re-initialize publishers/channels when RabbitMQ reconnects
export function onRabbitMQReconnect(callback: ReconnectCallback) {
    reconnectCallbacks.add(callback);
}

// get or initialize RabbitMQ connection with auto-reconnect support
export async function getRabbitMQConnection(): Promise<ChannelModel> {
    if (connection) {
        return connection;
    }

    if (connectingPromise) {
        return connectingPromise;
    }

    connectingPromise = (async () => {
        try {
            const conn = await amqp.connect(envConfig.rabbitmq_url);
            connection = conn;
            isExplicitClose = false;

            connection.on("close", (err) => {
                connection = null;
                if (!isExplicitClose) {
                    logger.warn({ err }, "RabbitMQ connection closed unexpectedly. Scheduling reconnect...");
                    scheduleReconnect();
                } else {
                    logger.info("RabbitMQ connection closed normally");
                }
            });

            connection.on("error", (err: Error) => {
                logger.error({ err }, "RabbitMQ connection error occurred");
                // Note: amqplib emits 'close' right after 'error', where scheduleReconnect will be called
            });

            logger.info("Connected to RabbitMQ");
            return connection;
        } catch (error) {
            logger.error({ error }, "Failed to connect to RabbitMQ");
            if (!isExplicitClose) {
                scheduleReconnect();
            }
            throw error;
        } finally {
            connectingPromise = null;
        }
    })();

    return connectingPromise;
}

// schedule automatic reconnection retry
function scheduleReconnect() {
    if (retryTimeout || isExplicitClose) {
        return;
    }

    logger.info(`Scheduling RabbitMQ reconnect in ${RETRY_INTERVAL_MS / 1000} seconds...`);
    retryTimeout = setTimeout(async () => {
        retryTimeout = null;
        if (isExplicitClose) return;

        try {
            logger.info("Attempting to reconnect to RabbitMQ...");
            await getRabbitMQConnection();
            logger.info("RabbitMQ reconnected successfully. Triggering reconnect callbacks...");

            for (const callback of reconnectCallbacks) {
                try {
                    await callback();
                } catch (cbErr) {
                    logger.error({ cbErr }, "Error executing RabbitMQ reconnect callback");
                }
            }
        } catch (error) {
            logger.error({ error }, "RabbitMQ reconnect attempt failed. Will retry again.");
            scheduleReconnect();
        }
    }, RETRY_INTERVAL_MS);
}

type ChannelCloser = () => Promise<void> | void;
const channelClosers: Set<ChannelCloser> = new Set();

// register a channel closer to be executed during graceful shutdown
export function registerChannelCloser(closer: ChannelCloser) {
    channelClosers.add(closer);
}

// close RabbitMQ channel and connection gracefully during server shutdown
export async function closeRabbitMQ() {
    isExplicitClose = true;
    if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
    }

    try {
        // 1. Close all registered channels first
        for (const closeChannel of channelClosers) {
            try {
                await closeChannel();
            } catch (chErr) {
                logger.error({ chErr }, "Error closing channel during shutdown");
            }
        }
        channelClosers.clear();

        // 2. Close connection
        if (connection) {
            await connection.close();
            connection = null;
            logger.info("RabbitMQ connection closed gracefully");
        }
    } catch (error) {
        logger.error({ error }, "Error closing RabbitMQ connection");
    }
}


