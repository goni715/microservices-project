import { eq } from "drizzle-orm";
import db from "./";
import envConfig from "../config/env";
import { users } from "./schema";
import logger from "../utils/logger";
import { hashPassword } from "../helpers/PasswordHelper";
import { USER_ROLES } from "@chatapp/common";
import { publishUserRegistered } from "../messaging/event.publisher";


const seedSuperAdmin = async () => {
    try {
        const superAdminEmail = envConfig.super_admin.email;

        //check super_admin is already existed
        const existSuperAdmin = await db.query.users.findFirst({
            where: eq(users.email, superAdminEmail),
        })

        if (existSuperAdmin) {
            logger.info("Super admin already exists. Skipping seeding.");
            return;
        }

        // make userId & hash password
        const userId = crypto.randomUUID();
        const hashedPassword = await hashPassword(envConfig.super_admin.password);

        //insert super_admin
        await db.insert(users).values({
            id: userId,
            full_name: envConfig.super_admin.full_name,
            email: superAdminEmail,
            password: hashedPassword,
            role: USER_ROLES.SUPER_ADMIN
        });

        //publish user registered event
        await publishUserRegistered({
            id: userId,
            full_name: envConfig.super_admin.full_name,
            email: superAdminEmail,
            role: USER_ROLES.SUPER_ADMIN,
            created_at: new Date().toISOString()
        });

        logger.info("Super admin seeded and event published successfully!");

    } catch (error) {
        logger.error({ error }, "Error seeding super admin");
    }
}

export default seedSuperAdmin;