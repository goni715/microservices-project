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

const logout = asyncHandler(async (req, res) => {
    const response = await AuthProxyService.logout(req.user);
    res.status(200).json(response);
});

const getAllSessions = asyncHandler(async (req, res) => {
    const response = await AuthProxyService.getAllSessions(req.user);
    res.status(200).json(response);
});

const revokeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const response = await AuthProxyService.revokeSession(sessionId as string, req.user);
    res.status(200).json(response);
});


const AuthController = {
    registerUser,
    loginUser,
    logout,
    getAllSessions,
    revokeSession
}

export default AuthController;