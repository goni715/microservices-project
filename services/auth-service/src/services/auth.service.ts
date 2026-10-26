import { eq } from "drizzle-orm";
import db from "../db";
import { users } from "../db/schema";
import { ConflictError, makeHash, NotFoundError, UnprocessableError } from "@chatapp/common";
import { checkPassword, hashPassword } from "../helpers/PasswordHelper";
import { ILogin, IRegisterPayload } from "../interfaces/auth.interface";
import { createToken, TJwtExpiresIn } from "../helpers/JwtHelper";
import { Secret } from "jsonwebtoken";
import envConfig from "../config/env";
import { publishUserRegistered } from "../messaging/event.publisher";
import crypto from 'crypto';
import sessionHelper from "../helpers/SessionHelper";

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

    //hashing password & generate ID
    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    //insert user
    await db.insert(users).values({
        id: userId,
        full_name,
        email,
        password: hashedPassword,
    })

    //publish user registered event
    await publishUserRegistered({
        id: userId,
        email,
        full_name,
        created_at: new Date().toISOString()
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

    //generate session id
    const sessionId = crypto.randomUUID();

    const sessionTTLSeconds = isRememberMe
        ? envConfig.session.session_ttl_remember_seconds
        : envConfig.session.session_ttl_seconds;

    //create refreshToken
    const refreshToken = createToken(
        {
            userId: String(exisitingUser.id),
            email,
            sessionId
        },
        envConfig.jwt.jwt_refresh_secret as Secret,
        isRememberMe
            ? (envConfig.jwt.jwt_refresh_expires_in_remember as TJwtExpiresIn)
            : (envConfig.jwt.jwt_refresh_expires_in as TJwtExpiresIn),
    );


    // check session limit
    const activeSessionKeys = await sessionHelper.getUserActiveSessionKeys(String(exisitingUser.id));

    // delete all old sessions if more than max_sessions 
    if (activeSessionKeys.length >= envConfig.max_sessions) {
        await sessionHelper.deleteAllSessions(String(exisitingUser.id));
    }

    //generate refreshTokenHash
    const refreshTokenHash = makeHash(refreshToken);

    await sessionHelper.createSession(
        {
            userId: String(exisitingUser.id),
            sessionId,
            refreshTokenHash,
            revoked: false,
            createdAt: new Date().toISOString(),
        },
        sessionTTLSeconds
    );

    //create accessToken
    const accessToken = createToken(
        {
            userId: String(exisitingUser.id),
            email,
            sessionId
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

/*=============== logout user ===================*/
const logout = async (userId: string, sessionId: string) => {
    await sessionHelper.deleteSession(userId, sessionId);
    return null;
}

/*=============== logout from all devices ===================*/
const logoutFromAll = async (userId: string) => {
    await sessionHelper.deleteAllSessions(userId);
    return null;
}

/*=============== get all sessions ===================*/
const getAllSessions = async (userId: string, currentSessionId: string) => {
    const sessions = await sessionHelper.getAllSessions(userId, currentSessionId);
    return sessions;
}

/*=============== revoke session ===================*/
const revokeSession = async (userId: string, sessionId: string) => {
    const session = await sessionHelper.getSingleSession(userId, sessionId);
    if (!session) {
        throw new NotFoundError("Session not found");
    }

    await sessionHelper.deleteSession(userId, sessionId);
    return null;
}

const AuthService = {
    registerUser,
    loginUser,
    logout,
    logoutFromAll,
    getAllSessions,
    revokeSession
}

export default AuthService;