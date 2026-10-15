/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "http";
import app from "./app";
import dns from 'node:dns/promises'
import envConfig from "./config/env";
import { closeRabbitMQ, initRabbitMQ } from "./messaging/event.publisher";
import logger from "./utils/logger";

dns.setServers(['1.1.1.1'])


const server = http.createServer(app);

const port = envConfig.port;

async function main() {
    try {
        await initRabbitMQ();
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

// graceful shutdown on SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
    await closeRabbitMQ();
    process.exit(0);
});