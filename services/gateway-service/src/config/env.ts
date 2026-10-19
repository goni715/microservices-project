import { requiredStringSchema } from "@chatapp/common";
import dotenv from "dotenv";
import path from "path";
import z from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

//schema validation
const envValidationSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default('development'),
    PORT: requiredStringSchema('PORT').transform((val) => Number(val)).default(4001),
    CORS_ORIGINS: requiredStringSchema('CORS_ORIGINS'),
    AUTH_SERVICE_URL: requiredStringSchema('AUTH_SERVICE_URL'),
    USER_SERVICE_URL: requiredStringSchema('USER_SERVICE_URL'),
    JWT_ACCESS_SECRET: requiredStringSchema('JWT_ACCESS_SECRET'),
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
    cors_origins: env.CORS_ORIGINS,
};

export default envConfig;
