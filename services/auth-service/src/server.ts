/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "http";
import app from "./app";
import dns from 'node:dns/promises'
import envConfig from "./config/env";
import logger from "./utils/logger";
import { initAuthPublisher } from "./messaging/event.publisher";
import { closeRabbitMQ } from "./messaging/connection";

dns.setServers(['1.1.1.1'])


const server = http.createServer(app);

const port = envConfig.port;

async function main() {
    try {
        await initAuthPublisher();
        server.listen(port, () => {
            logger.info({ port }, `Auth Service is running on http://localhost:${port}`);
        });
    } catch (error) {
        logger.error(error);
    }
}

main();

//asynchronous code error
process.on("unhandledRejection", (err) => {
    logger.error({ err }, `unahandledRejection is detected , shutting down ...`);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

//synchronous code error--process immediately off
process.on("uncaughtException", (err) => {
    logger.error({ err }, `uncaughtException is detected , shutting down ...`);
    process.exit(1);
});

let isShuttingDown = false;

// graceful shutdown handler
async function handleGracefulShutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down gracefully...`);

    // Force exit if shutdown hangs beyond 10 seconds
    const forceExitTimeout = setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
    }, 10000);
    forceExitTimeout.unref();

    try {
        if (server.listening) {
            await new Promise<void>((resolve) => {
                server.close(() => {
                    logger.info("HTTP server closed");
                    resolve();
                });
            });
        }

        // close RabbitMQ channel and connection
        await closeRabbitMQ();

        logger.info("Graceful shutdown completed successfully");
        process.exit(0);
    } catch (err) {
        logger.error({ err }, "Error during graceful shutdown");
        process.exit(1);
    }
}

process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
