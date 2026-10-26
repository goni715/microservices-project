import express from "express";
import AuthController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";


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
    "/logout",
    authMiddleware(),
    AuthController.logout,
);

authRouter.post(
    "/logout-all",
    authMiddleware(),
    AuthController.logoutFromAll,
);

authRouter.get(
    "/all-sessions",
    authMiddleware(),
    AuthController.getAllSessions,
);

authRouter.patch(
    "/revoke-session/:sessionId",
    authMiddleware(),
    AuthController.revokeSession,
);

export default authRouter;
