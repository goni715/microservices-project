import { Channel } from 'amqplib';
import { getRabbitMQConnection } from './connection';
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
        await publisherChannel.assertExchange(AUTH_EVENT_EXCHANGE, "topic", { durable: true });

        logger.info("Publisher channel initialized");
        return publisherChannel;
    } catch (error) {
        logger.error({ error }, "Failed to initialize publisher channel");
        throw error;
    }
}

//publish user registered event to RabbitMQ exchange.
export async function publishUserRegistered(data: UserRegisteredPayload) {
    if (!publisherChannel) {
        throw new Error("RabbitMQ channel is not initialized");
    }

    // persistent: true ensures messages are saved to disk to prevent loss on broker restart
    publisherChannel.publish(
        AUTH_EVENT_EXCHANGE,
        AUTH_USER_REGISTERED_ROUTING_KEY,
        Buffer.from(JSON.stringify(data)),
        { persistent: true }
    );

    logger.info(`Event published: ${AUTH_USER_REGISTERED_ROUTING_KEY}`);
}



