import express from "express";
import AuthController from "../controllers/auth.controller";


const authRouter = express.Router();

authRouter.post(
    "/register-user",
    AuthController.registerUser,
);

authRouter.post(
    "/login-user",
    AuthController.loginUser,
);

export default authRouter;
