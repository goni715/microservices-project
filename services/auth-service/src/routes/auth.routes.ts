import express from "express";
import AuthController from "../controllers/auth.controller";
import validationMiddleware from "@chatapp/common/dist/middlewares/validationMiddleware";
import { registerUserValidationSchema } from "../validation/auth.validation";


const router = express.Router();

router.post(
    "/register-user",
    validationMiddleware(registerUserValidationSchema),
    AuthController.registerUser,
);


export default router;
