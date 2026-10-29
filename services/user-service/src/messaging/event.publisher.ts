import { Channel } from "amqplib";
import { getRabbitMQConnection, onRabbitMQReconnect, registerChannelCloser } from "./connection";
import logger from "../utils/logger";
import { USER_CREATED_ROUTING_KEY, USER_EVENT_EXCHANGE, UserRegisteredPayload } from "@chatapp/common";

let publisherChannel: Channel | null = null;


/*initialize RabbitMQ connection and exchange.*/
export const initUserPublisher = async () => {
    if (publisherChannel) {
        return publisherChannel;
    }

    try {
        const connection = await getRabbitMQConnection();
        publisherChannel = await connection.createChannel();

        publisherChannel.on("close", () => {
            logger.warn("Publisher channel closed");
            publisherChannel = null;
        });

        publisherChannel.on("error", (err) => {
            logger.error({ err }, "Publisher channel error");
            publisherChannel = null;
        });

        await publisherChannel.assertExchange(USER_EVENT_EXCHANGE, "topic", { durable: true });

        logger.info("Publisher channel initialized");
        return publisherChannel;
    }
    catch (error) {
        logger.error({ error }, "Failed to initialize publisher channel");
        throw error;
    }
}


// register reconnect callback to re-create publisher channel when connection restores
onRabbitMQReconnect(async () => {
    logger.info("Re-itialinizing User Publisher channel after RabbitMQ reconnect...");
    publisherChannel = null;
    await initUserPublisher();
});

// close RabbitMQ publisher channel during shutdown
export async function closePublisherChannel() {
    if (publisherChannel) {
        try {
            await publisherChannel.close();
            publisherChannel = null;
            logger.info("Publisher channel closed gracefully");
        } catch (error) {
            logger.error({ error }, "Error closing publisher channel");
        }
    }
}

// register channel closer so closeRabbitMQ() automatically closes this channel first
registerChannelCloser(closePublisherChannel);

export const publishUserCreatedEvent = async (data: UserRegisteredPayload) => {
    if (!publisherChannel) {
        logger.warn("Publisher channel is null. Attempting to re-initialize...");
        await initUserPublisher();
    }

    publisherChannel!.publish(
        USER_EVENT_EXCHANGE,
        USER_CREATED_ROUTING_KEY,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );
    logger.info(`Event published: ${USER_CREATED_ROUTING_KEY}`);
}