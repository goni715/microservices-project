import { Channel } from 'amqplib';
import { getRabbitMQConnection, onRabbitMQReconnect, registerChannelCloser } from './connection';
import { AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY, UserRegisteredPayload } from '@chatapp/common';
import logger from '../utils/logger';

let publisherChannel: Channel | null = null;

/*initialize RabbitMQ connection and exchange.*/
export async function initAuthPublisher() {
    if (publisherChannel) {
        return publisherChannel;
    }

    try {
        // import connection file
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

        await publisherChannel.assertExchange(AUTH_EVENT_EXCHANGE, "topic", { durable: true });

        logger.info("Publisher channel initialized");
        return publisherChannel;
    } catch (error) {
        logger.error({ error }, "Failed to initialize publisher channel");
        throw error;
    }
}

// Register reconnect callback to re-create publisher channel when connection restores
onRabbitMQReconnect(async () => {
    logger.info("Re-initializing Auth Publisher channel after RabbitMQ reconnect...");
    publisherChannel = null;
    await initAuthPublisher();
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


//publish user registered event to RabbitMQ exchange.
export async function publishUserRegistered(data: UserRegisteredPayload) {
    if (!publisherChannel) {
        logger.warn("Publisher channel is null. Attempting to re-initialize before publishing...");
        await initAuthPublisher();
    }

    // persistent: true ensures messages are saved to disk to prevent loss on broker restart
    publisherChannel!.publish(
        AUTH_EVENT_EXCHANGE,
        AUTH_USER_REGISTERED_ROUTING_KEY,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    logger.info(`Event published: ${AUTH_USER_REGISTERED_ROUTING_KEY}`);
}
