import { createClient, RedisClientType } from "redis";

export let redisClient: RedisClientType;

export const connectRedis = async (redisUrl: string): Promise<RedisClientType> => {
    const url = redisUrl;

    if (!redisClient) {
        redisClient = createClient({
            url,
        }) as RedisClientType;

        redisClient.on("connect", () => {
            console.log("🔴 Redis connecting...");
        });

        redisClient.on("ready", () => {
            console.log("✅ Redis connected successfully");
        });

        redisClient.on("error", (error) => {
            console.error("❌ Redis error:", error);
        });

        redisClient.on("reconnecting", () => {
            console.log("🔄 Redis reconnecting...");
        });
    }

    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    return redisClient;
};

export type { RedisClientType };
