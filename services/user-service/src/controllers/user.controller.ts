import { asyncHandler } from "@chatapp/common";
import UserService from "../services/user.service";


const getAllUsers = asyncHandler(async (req, res) => {
    const result = await UserService.getAllUsers();
    res.status(200).json({
        success: true,
        message: "Users are retrieved successfully",
        data: result,
    });
});

const UserController = {
    getAllUsers
}

export default UserController;