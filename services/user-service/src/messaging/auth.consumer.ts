import { Channel } from "amqplib";
import { getRabbitMQConnection } from "./connection";
import { AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY, UserRegisteredPayload } from "@chatapp/common";
import logger from "../utils/logger";
import db from "../db";
import { users } from "../db/schema";

let consumerChannel: Channel | null = null;

const USER_REGISTERED_QUEUE = "user_service_auth_registered_queue";

/*initialize RabbitMQ connection, exchange, and queue.*/
export async function initAuthConsumer() {
    if (consumerChannel) {
        return consumerChannel;
    }

    try {
        // import connection file
        const connection = await getRabbitMQConnection();

        consumerChannel = await connection.createChannel();
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

            consumerChannel?.ack(msg);
            logger.info(`Event consumed: ${AUTH_USER_REGISTERED_ROUTING_KEY}`);
        } catch (error) {
            logger.error({ error }, "Failed to process user registered event");
            consumerChannel?.nack(msg, false, false);
        }
    });

    logger.info(`Consumer listening on queue: ${USER_REGISTERED_QUEUE}`);
}
