import { eq } from "drizzle-orm";
import db from "../db";
import { users } from "../db/schema";
import { ConflictError, NotFoundError, UnprocessableError } from "@chatapp/common";
import { checkPassword, hashPassword } from "../helpers/PasswordHelper";
import { ILogin, IRegisterPayload } from "../interfaces/auth.interface";
import { createToken, TJwtExpiresIn } from "../helpers/JwtHelper";
import { Secret } from "jsonwebtoken";
import envConfig from "../config/env";

/*=============== register user ===================*/
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

/*=============== login user ===================*/
const loginUser = async (payload: ILogin) => {
    const { email, password, isRememberMe } = payload;
    //check user
    const exisitingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
    })

    if (!exisitingUser) {
        throw new NotFoundError(`No account found for this email address.`);
    }

    //check password
    const isPasswordMatch = await checkPassword(password, exisitingUser.password);
    if (!isPasswordMatch) {
        throw new UnprocessableError("The password you've entered is incorrect.");
    }

    //create refreshToken
    const refreshToken = createToken(
        {
            userId: String(exisitingUser.id),
            email
        },
        envConfig.jwt.jwt_refresh_secret as Secret,
        isRememberMe
            ? (envConfig.jwt.jwt_refresh_expires_in_remember as TJwtExpiresIn)
            : (envConfig.jwt.jwt_refresh_expires_in as TJwtExpiresIn),
    );

    //create accessToken
    const accessToken = createToken(
        {
            userId: String(exisitingUser.id),
            email
        },
        envConfig.jwt.jwt_access_secret as Secret,
        envConfig.jwt.jwt_access_expires_in as TJwtExpiresIn,
    );


    return {
        accessToken,
        refreshToken,
        full_name: exisitingUser.full_name,
        email: exisitingUser.email
    }
}

const AuthService = {
    registerUser,
    loginUser
}

export default AuthService;