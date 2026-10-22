import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import envConfig from "../config/env";
import * as schema from "./schema";

const pool = new Pool({
    connectionString: envConfig.user_db_url,
});

const db = drizzle({ client: pool, schema });

export default db;