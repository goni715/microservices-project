import express from "express";
import UserController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { USER_ROLES } from "@chatapp/common";


const userRouter = express.Router();

userRouter.get(
    "/all-users",
    authMiddleware(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    UserController.getAllUsers,
);


export default userRouter;
