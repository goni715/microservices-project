import amqp, { Channel, ChannelModel } from "amqplib";
import {
    AUTH_EVENT_EXCHANGE,
    AUTH_USER_REGISTERED_ROUTING_KEY,
    UserRegisteredPayload,
} from "@chatapp/common";
import envConfig from "../config/env";
import logger from "../utils/logger";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

/*initialize RabbitMQ connection and exchange.*/
export async function initRabbitMQ() {
    // skip initialization if already connected
    if (channel) {
        return;
    }

    try {

        connection = await amqp.connect(envConfig.rabbitmq_url);
        channel = await connection.createChannel();

        // Assert topic exchange (durable: true ensures it survives RabbitMQ broker restarts)
        await channel.assertExchange(AUTH_EVENT_EXCHANGE, "topic", { durable: true });

        // handle connection drop and error events
        connection.on("close", () => {
            logger.warn("RabbitMQ connection closed");
            channel = null;
            connection = null;
        });

        connection.on("error", (err: Error) => {
            logger.error({err},"RabbitMQ connection error");
        });

        logger.info("Connected to RabbitMQ & Publisher initialized");
    } catch (error) {
        logger.error({error},"Failed to connect to RabbitMQ:");
        throw error; 
    }
}



//publish user registered event to RabbitMQ exchange.
export async function publishUserRegistered(data: UserRegisteredPayload) {
    if (!channel) {
        throw new Error("RabbitMQ channel is not initialized");
    }

    // persistent: true ensures messages are saved to disk to prevent loss on broker restart
    channel.publish(
        AUTH_EVENT_EXCHANGE,
        AUTH_USER_REGISTERED_ROUTING_KEY,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    logger.info(`Event published: ${AUTH_USER_REGISTERED_ROUTING_KEY}`);
}


//close RabbitMQ channel and connection during server shutdown.
export async function closeRabbitMQ() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        logger.info("RabbitMQ connection closed gracefully");
    } catch (error) {
        logger.error({error},"Error closing RabbitMQ connection:");
    }
}

