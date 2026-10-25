import express from "express";
import UserController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";


const userRouter = express.Router();

userRouter.get(
    "/all-users",
    authMiddleware(),
    UserController.getAllUsers,
);


export default userRouter;
