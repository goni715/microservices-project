import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    email: varchar({ length: 255 }).notNull().unique(),
    full_name: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow().onUpdateNow().notNull(),
});