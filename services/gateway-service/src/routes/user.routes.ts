import express from "express";
import UserController from "../controllers/user.controller";


const userRouter = express.Router();

userRouter.get(
    "/all-users",
    UserController.getAllUsers,
);


export default userRouter;
