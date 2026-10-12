import { eq } from "drizzle-orm";
import db from "../db";
import { users } from "../db/schema";
import { ConflictError } from "@chatapp/common";
import { hashPassword } from "../helpers/PasswordHelper";
import { IRegisterPayload } from "../interfaces/auth.interface";


const registerUser = async (payload: IRegisterPayload) => {
    const { full_name, email, password } = payload;
    //check user
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (existingUser) {
        throw new ConflictError("An account with this email already exists.");
    }

    //hashing password
    const hashedPassword = await hashPassword(password);

    //insert user
    await db.insert(users).values({
        full_name,
        email,
        password: hashedPassword,
    });

    return {
        full_name,
        email,
    };
}


const AuthService = {
    registerUser
}

export default AuthService;