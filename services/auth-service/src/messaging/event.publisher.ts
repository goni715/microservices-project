import amqp, { Channel, ChannelModel } from "amqplib";
import {
    AUTH_EVENT_EXCHANGE,
    AUTH_USER_REGISTERED_ROUTING_KEY,
    UserRegisteredPayload,
} from "@chatapp/common";
import envConfig from "../config/env";

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
            console.warn("⚠️ RabbitMQ connection closed");
            channel = null;
            connection = null;
        });

        connection.on("error", (err: Error) => {
            console.error("❌ RabbitMQ connection error:", err);
        });

        console.log("🐰 Connected to RabbitMQ & Publisher initialized");
    } catch (error) {
        console.error("❌ Failed to connect to RabbitMQ:", error);
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

    console.log(`📤 Event published: ${AUTH_USER_REGISTERED_ROUTING_KEY}`);
}


//close RabbitMQ channel and connection during server shutdown.
export async function closeRabbitMQ() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        console.log("🔌 RabbitMQ connection closed gracefully");
    } catch (error) {
        console.error("Error closing RabbitMQ connection:", error);
    }
}

