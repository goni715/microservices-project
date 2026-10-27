import { requiredStringSchema } from "@chatapp/common";
import dotenv from "dotenv";
import path from "path";
import z from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

//schema validation
const envValidationSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default('development'),
    PORT: requiredStringSchema('PORT').transform((val) => Number(val)).default(4003),
    CHAT_DB_URL: requiredStringSchema('CHAT_DB_URL'),
    CORS_ORIGINS: requiredStringSchema('CORS_ORIGINS'),

    RABBITMQ_URL: requiredStringSchema('RABBITMQ_URL'),
    REDIS_URL: requiredStringSchema('REDIS_URL'),
});

// validate process.env against schema
const parsedEnv = envValidationSchema.safeParse(process.env);

if (!parsedEnv.success) {
    const formattedErrors: Record<string, string> = {};
    parsedEnv.error.issues.forEach((e) => {
        if (e.path.length > 0) {
            formattedErrors[e.path.join(".")] = e.message;
        }
    });

    console.error(
        "❌ Invalid environment variables:",
        JSON.stringify(formattedErrors, null, 2),
    );
    throw new Error("Invalid environment variables");
}

const env = parsedEnv.data;

//env config
const envConfig = {
    node_env: env.NODE_ENV,
    port: env.PORT,
    chat_db_url: env.CHAT_DB_URL,
    cors_origins: env.CORS_ORIGINS,
    rabbitmq_url: env.RABBITMQ_URL,
    redis_url: env.REDIS_URL,
};

export default envConfig;
