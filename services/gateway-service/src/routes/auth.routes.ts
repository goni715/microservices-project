import express from "express";
import AuthController from "../controllers/auth.controller";
import { validationMiddleware } from "@chatapp/common";
import { registerUserValidationSchema } from "../validation/auth.validation";


const authRouter = express.Router();

authRouter.post(
    "/register-user",
    validationMiddleware(registerUserValidationSchema),
    AuthController.registerUser,
);



export default authRouter;
