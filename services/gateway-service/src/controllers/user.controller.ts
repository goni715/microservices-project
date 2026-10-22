import { asyncHandler } from "@chatapp/common";
import UserProxyService from "../services/user.proxy.service";

const getAllUsers = asyncHandler(async (req, res) => {
    const response = await UserProxyService.getAllUsers();
    res.status(200).json(response);
});


const UserController = {
    getAllUsers,
}

export default UserController;