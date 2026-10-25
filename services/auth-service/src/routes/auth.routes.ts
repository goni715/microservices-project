import express from "express";
import AuthController from "../controllers/auth.controller";
import { validationMiddleware } from "@chatapp/common";
import { loginUserValidationSchema, registerUserValidationSchema } from "../validation/auth.validation";


const router = express.Router();

router.post(
    "/register-user",
    validationMiddleware(registerUserValidationSchema),
    AuthController.registerUser,
);

router.post(
    "/login-user",
    validationMiddleware(loginUserValidationSchema),
    AuthController.loginUser,
);

router.post(
    "/logout",
    AuthController.logout,
);


export default router;
