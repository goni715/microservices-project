import { Channel } from "amqplib";
import { getRabbitMQConnection, onRabbitMQReconnect, registerChannelCloser } from "./connection";
import {
    AUTH_EVENT_EXCHANGE,
    AUTH_USER_REGISTERED_ROUTING_KEY,
    USER_SERVICE_AUTH_EVENTS_QUEUE,
    UserRegisteredPayload,
} from "@chatapp/common";
import logger from "../utils/logger";
import db from "../db";
import { users } from "../db/schema";
import { publishUserCreatedEvent } from "./event.publisher";

let consumerChannel: Channel | null = null;

// dedicated queue according to naming convention: chatapp.user-service.auth-events
const USER_REGISTERED_QUEUE = USER_SERVICE_AUTH_EVENTS_QUEUE;

/*initialize RabbitMQ connection, exchange, and queue.*/
export async function initAuthConsumer() {
    if (consumerChannel) {
        return consumerChannel;
    }

    try {
        // import connection file
        const connection = await getRabbitMQConnection();

        consumerChannel = await connection.createChannel();

        consumerChannel.on("close", () => {
            logger.warn("Consumer channel closed");
            consumerChannel = null;
        });

        consumerChannel.on("error", (err) => {
            logger.error({ err }, "Consumer channel error");
            consumerChannel = null;
        });

        await consumerChannel.assertExchange(AUTH_EVENT_EXCHANGE, "topic", { durable: true });

        await consumerChannel.assertQueue(USER_REGISTERED_QUEUE, { durable: true });
        await consumerChannel.bindQueue(
            USER_REGISTERED_QUEUE,
            AUTH_EVENT_EXCHANGE,
            AUTH_USER_REGISTERED_ROUTING_KEY
        );

        await consumerChannel.prefetch(1);

        logger.info("Consumer channel initialized");

        await consumeUserRegistered();

        return consumerChannel;
    } catch (error) {
        logger.error({ error }, "Failed to initialize consumer channel");
        throw error;
    }
}

// register reconnect callback to re-initialize consumer when RabbitMQ reconnects
onRabbitMQReconnect(async () => {
    logger.info("Re-initializing Auth Consumer after RabbitMQ reconnect...");
    consumerChannel = null;
    await initAuthConsumer();
});

// close RabbitMQ consumer channel during shutdown
export async function closeConsumerChannel() {
    if (consumerChannel) {
        try {
            await consumerChannel.close();
            consumerChannel = null;
            logger.info("Consumer channel closed gracefully");
        } catch (error) {
            logger.error({ error }, "Error closing consumer channel");
        }
    }
}

// register channel closer so closeRabbitMQ() automatically closes this channel first
registerChannelCloser(closeConsumerChannel);


//consume user registered event from RabbitMQ queue.
export async function consumeUserRegistered() {
    if (!consumerChannel) {
        throw new Error("RabbitMQ channel is not initialized");
    }

    consumerChannel.consume(USER_REGISTERED_QUEUE, async (msg) => {
        if (!msg) return;

        try {
            const data: UserRegisteredPayload = JSON.parse(msg.content.toString());
            logger.info({ userId: data.id }, "Processing user.registered event");

            // insert user into user-service database
            await db.insert(users).values({
                id: data.id,
                email: data.email,
                full_name: data.full_name,
                created_at: new Date(data.created_at),
            }).onConflictDoNothing();

            // publish user created event to RabbitMQ
            await publishUserCreatedEvent({
                id: data.id,
                email: data.email,
                full_name: data.full_name,
                created_at: new Date(data.created_at).toISOString(),
            });

            consumerChannel?.ack(msg);
            logger.info(`Event consumed: ${AUTH_USER_REGISTERED_ROUTING_KEY}`);
        } catch (error) {
            logger.error({ error }, "Failed to process user registered event");
            consumerChannel?.nack(msg, false, false);
        }
    });

    logger.info(`Consumer listening on queue: ${USER_REGISTERED_QUEUE}`);
}

