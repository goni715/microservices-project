import { asyncHandler } from "@chatapp/common";
import AuthProxyService from "../services/auth.proxy.service";

const registerUser = asyncHandler(async (req, res) => {
    const response = await AuthProxyService.registerUser();
    res.status(201).json(response);
});




const AuthController = {
    registerUser,
}

export default AuthController;