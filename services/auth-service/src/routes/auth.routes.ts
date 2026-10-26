import express from "express";
import AuthController from "../controllers/auth.controller";
import { validationMiddleware } from "@chatapp/common";
import { loginUserValidationSchema, registerUserValidationSchema, revokeSessionValidationSchema } from "../validation/auth.validation";


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

router.post(
    "/logout-all",
    AuthController.logoutFromAll,
);

router.get(
    "/all-sessions",
    AuthController.getAllSessions,
);

router.patch(
    "/revoke-session/:sessionId",
    validationMiddleware(revokeSessionValidationSchema),
    AuthController.revokeSession,
);


export default router;
