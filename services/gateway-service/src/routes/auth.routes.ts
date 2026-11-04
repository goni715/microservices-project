import express from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { USER_ROLES } from "@chatapp/common";


const authRouter = express.Router();

authRouter.post(
    "/register-user",
    AuthController.registerUser,
);

authRouter.post(
    "/login-user",
    AuthController.loginUser,
);

authRouter.post(
    "/login-admin",
    AuthController.loginAdmin,
);

authRouter.post(
    "/logout",
    authMiddleware(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    AuthController.logout,
);

authRouter.post(
    "/logout-all",
    authMiddleware(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    AuthController.logoutFromAll,
);

authRouter.get(
    "/all-sessions",
    authMiddleware(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    AuthController.getAllSessions,
);

authRouter.patch(
    "/revoke-session/:sessionId",
    authMiddleware(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    AuthController.revokeSession,
);

authRouter.post(
    "/forgot-password/send-otp",
    AuthController.forgotPasswordSendOtp,
);

export default authRouter;
