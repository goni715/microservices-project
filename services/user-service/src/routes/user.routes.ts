import express from "express";
import UserController from "../controllers/user.controller";


const router = express.Router();

router.get(
    "/all-users",
    UserController.getAllUsers,
);



export default router;
