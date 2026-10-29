import { Channel } from "amqplib";
import { getRabbitMQConnection, onRabbitMQReconnect, registerChannelCloser } from "./connection";
import logger from "../utils/logger";
import { CHAT_SERVICE_USER_EVENTS_QUEUE, USER_CREATED_ROUTING_KEY, USER_EVENT_EXCHANGE, UserRegisteredPayload } from "@chatapp/common";
import UserModel from "../models/user.model";



let consumerChannel: Channel | null = null;


/*initialize RabbitMQ connection, exchange, and queue.*/
export async function initUserConsumer() {
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

        await consumerChannel.assertExchange(USER_EVENT_EXCHANGE, "topic", { durable: true });

        await consumerChannel.assertQueue(CHAT_SERVICE_USER_EVENTS_QUEUE, { durable: true });
        await consumerChannel.bindQueue(
            CHAT_SERVICE_USER_EVENTS_QUEUE,
            USER_EVENT_EXCHANGE,
            USER_CREATED_ROUTING_KEY
        );

        await consumerChannel.prefetch(1);

        logger.info("Consumer channel initialized");

        await consumeUserCreated();

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
    await initUserConsumer();
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


export async function consumeUserCreated() {
    if (!consumerChannel) {
        throw new Error("RabbitMQ channel is not initialized");
    }

    consumerChannel.consume(CHAT_SERVICE_USER_EVENTS_QUEUE, async (msg) => {
        if (!msg) return;

        try {
            const data: UserRegisteredPayload = JSON.parse(msg.content.toString());
            logger.info({ userId: data.id }, `Processing user.created event`);

            //create user
            await UserModel.create({
                _id: data.id,
                full_name: data.full_name,
                email: data.email,
                created_at: data.created_at,
                updated_at: data.created_at
            })

            consumerChannel?.ack(msg);
            logger.info(`Event consumed: ${USER_CREATED_ROUTING_KEY}`);
        }
        catch (error) {
            logger.error({ error }, "Failed to process user created event");
            consumerChannel?.nack(msg, false, false);
        }
    })
}