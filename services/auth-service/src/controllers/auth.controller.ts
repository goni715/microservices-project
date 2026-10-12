import { asyncHandler } from "@chatapp/common";
import AuthService from "../services/auth.service";


const registerUser = asyncHandler(async (req, res) => {
    const result = await AuthService.registerUser(req.body);
    res.status(200).json({
        success: true,
        message: "User is registered successfully",
        data: result,
    });
});


const AuthController = {
    registerUser
}

export default AuthController;