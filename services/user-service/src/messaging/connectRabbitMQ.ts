import amqp, { ChannelModel } from "amqplib";
import envConfig from "../config/env";
import logger from "../utils/logger";

let connection: ChannelModel | null = null;

/*initialize RabbitMQ connection and exchange.*/
export async function connectRabbitMQ(): Promise<ChannelModel> {
    if (connection) {
        return connection;
    }

    try {
        connection = await amqp.connect(envConfig.rabbitmq_url);

        connection.on("close", () => {
            logger.warn("RabbitMQ connection closed");
            connection = null;
        });

        connection.on("error", (err: Error) => {
            logger.error({ err }, "RabbitMQ connection error");
        });

        logger.info("Connected to RabbitMQ");
        return connection;
    } catch (error) {
        logger.error({ error }, "Failed to connect to RabbitMQ");
        throw error;
    }
}

// close RabbitMQ channel and connection during server shutdown.
export async function closeRabbitMQ() {
    try {
        if (connection) {
            await connection.close();
            connection = null;
            logger.info("RabbitMQ connection closed gracefully");
        }
    } catch (error) {
        logger.error({ error }, "Error closing RabbitMQ connection");
    }
}
