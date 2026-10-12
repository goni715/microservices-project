import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import envConfig from "../config/env";
import * as schema from "./schema";

const connectionPool = mysql.createPool(envConfig.auth_db_url);

const db = drizzle(connectionPool, { schema, mode: "default" });

export default db;
