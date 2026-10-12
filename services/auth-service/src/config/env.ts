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
    JWT_SECRET: requiredStringSchema('JWT_SECRET'),
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
    jwt_secret: env.JWT_SECRET,
};

export default envConfig;
