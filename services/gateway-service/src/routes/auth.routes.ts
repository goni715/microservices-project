import express from "express";
import AuthController from "../controllers/auth.controller";
import { validationMiddleware } from "@chatapp/common";
import { loginUserValidationSchema, registerUserValidationSchema } from "../validation/auth.validation";


const authRouter = express.Router();

authRouter.post(
    "/register-user",
    validationMiddleware(registerUserValidationSchema),
    AuthController.registerUser,
);

authRouter.post(
    "/login-user",
    validationMiddleware(loginUserValidationSchema),
    AuthController.loginUser,
);

export default authRouter;
