import { mysqlTable, varchar, timestamp, text, mysqlEnum } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    email: varchar({ length: 255 }).notNull().unique(),
    full_name: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    picture: text(),
    status: mysqlEnum("status", ["active", "blocked"]).default("active").notNull(), 
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow().onUpdateNow().notNull(),
});
