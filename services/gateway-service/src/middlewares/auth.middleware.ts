import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import { asyncHandler, UnauthorizedError } from "@chatapp/common";
import envConfig from "../config/env";
import { verifyToken } from "../helpers/JwtHelper";
import sessionHelper from "../helpers/SessionHelper";

export type TUserRole = "user" | "super_admin";

export interface IAuthUser {
    userId: string;
    sessionId: string;
    email: string;
    role?: TUserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: IAuthUser;
        }
    }
}

const authMiddleware = (...roles: TUserRole[]) =>
    asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError("You are not authorized.");
        }

        // "Bearer " prefix check & extract token safely
        if (!authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("You are not authorized.");
        }

        const token = authHeader.replace(/^Bearer\s+/i, "").trim();

        if (!token) {
            throw new UnauthorizedError("You are not authorized.");
        }

        // Verify token
        let decoded: any;
        try {
            decoded = verifyToken(token, envConfig.jwt_access_secret as Secret);
        } catch {
            throw new UnauthorizedError("You are not authorized.");
        }

        // extract user info
        const userId = decoded?.userId as string;
        const sessionId = decoded?.sessionId as string;
        const email = decoded?.email as string;
        //const role = decoded.role;

        if (!userId || !sessionId) {
            throw new UnauthorizedError(
                "You are not authorized.",
            );
        }

        // check session in Redis
        const session = await sessionHelper.getSingleSession(userId, sessionId);

        if (!session) {
            throw new UnauthorizedError(
                "You are not authorized. Session expired.",
            );
        }

        // check user role
        // if (roles.length > 0 && !roles.includes(role)) {
        //     throw new UnauthorizedError("You are not authorized.");
        // }

        // set standard headers for forwarding to downstream microservices
        req.headers["x-user-id"] = userId;
        req.headers["x-session-id"] = sessionId;
        req.headers["x-user-email"] = email;
        //req.headers["x-user-role"] = role;

        // set req.user for internal handler usage
        req.user = {
            userId: userId,
            sessionId,
            email,
        };

        next();
    });

export default authMiddleware;