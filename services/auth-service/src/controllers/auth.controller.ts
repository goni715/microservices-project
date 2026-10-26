import { asyncHandler } from "@chatapp/common";
import AuthService from "../services/auth.service";
import envConfig from "../config/env";


const registerUser = asyncHandler(async (req, res) => {
    const result = await AuthService.registerUser(req.body);
    res.status(201).json({
        success: true,
        message: "User is registered successfully",
        data: result,
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, ...rest } = await AuthService.loginUser(req.body);

    const refreshTokenMaxAge = req.body.isRememberMe
        ? envConfig.refreshToken.refresh_token_cookie_max_age_remember
        : envConfig.refreshToken.refresh_token_cookie_max_age;

    //set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: envConfig.node_env === "production",
        maxAge: refreshTokenMaxAge,
        sameSite: envConfig.node_env === "production" ? "none" : "lax", // strict: Prevents CSRF attacks
        path: "/",
    });

    res.status(200).json({
        success: true,
        message: "Login successfull",
        data: {
            accessToken,
            refreshToken,
            ...rest,
        },
    });
});

const logout = asyncHandler(async (req, res) => {
    const userId = req.headers['x-user-id'];
    const sessionId = req.headers['x-session-id'];
    const result = await AuthService.logout(userId as string, sessionId as string);

    //clear refresh token cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: envConfig.node_env === "production",
        sameSite: envConfig.node_env === "production" ? "none" : "lax", // strict: Prevents CSRF attacks
        path: "/",
    });

    res.status(200).json({
        success: true,
        message: "Logout successfull",
        data: result,
    });
})


const logoutFromAll = asyncHandler(async (req, res) => {
    const userId = req.headers['x-user-id'];
    const result = await AuthService.logoutFromAll(userId as string);

    //clear refresh token cookie
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: envConfig.node_env === "production",
        sameSite: envConfig.node_env === "production" ? "none" : "lax", // strict: Prevents CSRF attacks
        path: "/",
    });

    res.status(200).json({
        success: true,
        message: "Logout from all devices successfully",
        data: result,
    });
})


const getAllSessions = asyncHandler(async (req, res) => {
    const userId = req.headers['x-user-id'];
    const currentSessionId = req.headers['x-session-id'];
    const result = await AuthService.getAllSessions(userId as string, currentSessionId as string);

    res.status(200).json({
        success: true,
        message: "Sessions are retrieved successfully",
        data: result,
    });
})

const revokeSession = asyncHandler(async (req, res) => {
    const userId = req.headers['x-user-id'];
    const { sessionId } = req.params;
    const result = await AuthService.revokeSession(userId as string, sessionId as string);

    res.status(200).json({
        success: true,
        message: "Session is revoked successfully",
        data: result,
    });
})


const AuthController = {
    registerUser,
    loginUser,
    logout,
    logoutFromAll,
    getAllSessions,
    revokeSession
}

export default AuthController;