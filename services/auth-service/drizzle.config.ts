import { defineConfig } from "drizzle-kit";
import envConfig from "./src/config/env";


export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        url: envConfig.auth_db_url
    },
});
