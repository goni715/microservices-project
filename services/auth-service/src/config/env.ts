import { requiredStringSchema } from "@chatapp/common";
import dotenv from "dotenv";
import path from "path";
import z from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

//schema validation
const envValidationSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default('development'),
    PORT: requiredStringSchema('PORT').transform((val) => Number(val)).default(4001),
    AUTH_DB_URL: requiredStringSchema('AUTH_DB_URL'),
    BCRPYT_SALT_ROUNDS: requiredStringSchema('BCRPYT_SALT_ROUNDS').transform((val) => Number(val)),
    MAX_SESSIONS: requiredStringSchema('MAX_SESSIONS').transform((val) => Number(val)).default(5),
    CORS_ORIGINS: requiredStringSchema('CORS_ORIGINS'),

    RABBITMQ_URL: requiredStringSchema('RABBITMQ_URL'),
    REDIS_URL: requiredStringSchema('REDIS_URL'),
    // JWT
    JWT_ACCESS_SECRET: requiredStringSchema('JWT_ACCESS_SECRET'),
    JWT_REFRESH_SECRET: requiredStringSchema('JWT_REFRESH_SECRET'),
    JWT_ACCESS_EXPIRES_IN: requiredStringSchema('JWT_ACCESS_EXPIRES_IN'),
    JWT_REFRESH_EXPIRES_IN: requiredStringSchema('JWT_REFRESH_EXPIRES_IN'),
    JWT_REFRESH_EXPIRES_IN_REMEMBER: requiredStringSchema('JWT_REFRESH_EXPIRES_IN_REMEMBER'),

    // Refresh Token
    REFRESH_TOKEN_COOKIE_MAX_AGE: requiredStringSchema('REFRESH_TOKEN_COOKIE_MAX_AGE'),
    REFRESH_TOKEN_COOKIE_MAX_AGE_REMEMBER: requiredStringSchema('REFRESH_TOKEN_COOKIE_MAX_AGE_REMEMBER'),

    REFRESH_TOKEN_TTL_SECONDS: requiredStringSchema('REFRESH_TOKEN_TTL_SECONDS').transform((val) => Number(val)),
    REFRESH_TOKEN_TTL_REMEMBER_SECONDS: requiredStringSchema('REFRESH_TOKEN_TTL_REMEMBER_SECONDS').transform((val) => Number(val)),
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
    auth_db_url: env.AUTH_DB_URL,
    bcrypt_salt_rounds: env.BCRPYT_SALT_ROUNDS,
    max_sessions: env.MAX_SESSIONS,
    cors_origins: env.CORS_ORIGINS,
    rabbitmq_url: env.RABBITMQ_URL,
    redis_url: env.REDIS_URL,
    jwt: {
        jwt_access_secret: env.JWT_ACCESS_SECRET,
        jwt_refresh_secret: env.JWT_REFRESH_SECRET,
        jwt_access_expires_in: env.JWT_ACCESS_EXPIRES_IN,
        jwt_refresh_expires_in: env.JWT_REFRESH_EXPIRES_IN,
        jwt_refresh_expires_in_remember: env.JWT_REFRESH_EXPIRES_IN_REMEMBER,
    },
    refreshToken: {
        refresh_token_cookie_max_age: Number(env.REFRESH_TOKEN_COOKIE_MAX_AGE),
        refresh_token_cookie_max_age_remember: Number(env.REFRESH_TOKEN_COOKIE_MAX_AGE_REMEMBER),
        refresh_token_ttl_seconds: Number(env.REFRESH_TOKEN_TTL_SECONDS),
        refresh_token_ttl_remember_seconds: Number(env.REFRESH_TOKEN_TTL_REMEMBER_SECONDS),
    },
};

export default envConfig;
