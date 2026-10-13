/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "http";
import app from "./app";
import dns from 'node:dns/promises'
import envConfig from "./config/env";

dns.setServers(['1.1.1.1'])


const server = http.createServer(app);

const port = envConfig.port;

async function main() {
    try {
        server.listen(port, () => {
            console.log(`🤷‍♂️🤷‍♂️  User Service is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.log(error);
    }
}

main();

//asynchronous code error
process.on("unhandledRejection", (err) => {
    console.log(`❤❤ unahandledRejection is detected , shutting down ...`, err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

//synchronous code error--process immediately off
process.on("uncaughtException", (err) => {
    console.log(`😛😛 uncaughtException is detected , shutting down ...`, err);
    process.exit(1);
});