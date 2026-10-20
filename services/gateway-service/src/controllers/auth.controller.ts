import { asyncHandler } from "@chatapp/common";
import AuthProxyService from "../services/auth.proxy.service";

const registerUser = asyncHandler(async (req, res) => {
    const response = await AuthProxyService.registerUser(req.body);
    res.status(201).json(response);
});

const loginUser = asyncHandler(async (req, res) => {
    const response = await AuthProxyService.loginUser(req.body);
    res.status(200).json(response);
});




const AuthController = {
    registerUser,
    loginUser
}

export default AuthController;