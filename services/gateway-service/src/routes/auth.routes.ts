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

export default authRouter;
