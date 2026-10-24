import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import { asyncHandler, ForbiddenError, UnauthorizedError } from "@chatapp/common";
import envConfig from "../config/env";
import { verifyToken } from "../helpers/JwtHelper";
import sessionHelper from "../helpers/SessionHelper";

export type TUserRole = "user" | "super_admin";

export interface IAuthUser {
    userId: string;
    sessionId: string;
    email?: string;
    role: TUserRole;
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
            throw new UnauthorizedError("You are not authorized. Authorization header missing.");
        }

        // Bearer prefix check & extract token
        let token: string = authHeader;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1] ?? "";
        }

        token = token.trim();

        if (!token) {
            throw new UnauthorizedError("You are not authorized. Authentication token missing.");
        }

        // Verify token
        let decoded: any;
        try {
            decoded = verifyToken(token, envConfig.jwt_access_secret as Secret);
        } catch {
            throw new UnauthorizedError(
                "You are not authorized. Invalid or expired authentication token.",
            );
        }

        if (!decoded || typeof decoded !== "object") {
            throw new UnauthorizedError("You are not authorized. Invalid token payload.");
        }

        // Extract user and session info (support snake_case from auth-service and camelCase)
        const userId = (decoded.user_id || decoded.userId || decoded.id || decoded.sub) as string;
        const sessionId = (decoded.session_id || decoded.sessionId) as string;
        const email = decoded.email as string | undefined;
        const role = (decoded.role || "user") as TUserRole;

        if (!userId || !sessionId) {
            throw new UnauthorizedError(
                "You are not authorized. Incomplete token payload.",
            );
        }

        // Check session in Redis
        const session = await sessionHelper.getSingleSession(userId, sessionId);

        if (!session) {
            throw new UnauthorizedError(
                "You are not authorized. Session expired. Please login again.",
            );
        }

        if (session.revoked) {
            throw new UnauthorizedError(
                "You are not authorized. Session has been revoked. Please login again.",
            );
        }

        // Verify user ownership
        if (session.user_id && String(session.user_id) !== String(userId)) {
            throw new UnauthorizedError(
                "You are not authorized. Invalid session.",
            );
        }

        // Check user role
        if (roles.length > 0 && !roles.includes(role)) {
            throw new ForbiddenError(
                `You do not have permission to access this resource. Please provide ${roles
                    .map((r) => `'${r}'`)
                    .join(" or ")} token.`,
            );
        }

        // Set standard headers for forwarding to downstream microservices
        req.headers["x-user-id"] = userId;
        req.headers["x-session-id"] = sessionId;
        if (email) req.headers["x-user-email"] = email;
        req.headers["x-user-role"] = role;

        // Maintain existing header keys for compatibility
        req.headers.userId = userId;
        req.headers.sessionId = sessionId;
        if (email) req.headers.email = email;
        req.headers.role = role;

        // Set req.user for internal handler usage
        req.user = {
            userId,
            sessionId,
            email,
            role,
        };

        next();
    });

export default authMiddleware;
