import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "blocked"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "super_admin"])

export const users = pgTable('users', {
    id: uuid("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    picture: text(),
    status: userStatusEnum('status').default("active").notNull(),
    role: userRoleEnum('role').default('user').notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull()
})