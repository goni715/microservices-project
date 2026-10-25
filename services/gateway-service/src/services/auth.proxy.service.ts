import envConfig from "../config/env";
import { ILogin, IRegisterPayload } from "../interfaces/auth.interface";
import { IAuthUser } from "../middlewares/auth.middleware";
import { createProxyClient, getProxyHeaders } from "../helpers/proxyClient";

const client = createProxyClient(envConfig.auth_service_url)



/*=========== register user ============*/
const registerUser = async (payload: IRegisterPayload) => {
    try {
        const response = await client.post('/register-user', payload, getProxyHeaders());
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

/*=========== login user ============*/
const loginUser = async (payload: ILogin) => {
    try {
        const response = await client.post('/login-user', payload, getProxyHeaders());
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

/*=========== logout user ============*/
const logout = async (user?: IAuthUser) => {
    try {
        const response = await client.post('/logout', {}, getProxyHeaders(user));
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

/*=========== get all sessions ============*/
const getAllSessions = async (user?: IAuthUser) => {
    try {
        const response = await client.post('/all-sessions', {}, getProxyHeaders(user));
        return response.data;
    } catch (error: any) {
        throw error;
    }
}


const AuthProxyService = {
    registerUser,
    loginUser,
    logout,
    getAllSessions
};

export default AuthProxyService;