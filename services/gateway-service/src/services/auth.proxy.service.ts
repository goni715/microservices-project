import axios from "axios";
import envConfig from "../config/env";
import { ILogin, IRegisterPayload } from "../interfaces/auth.interface";
import { IAuthUser } from "../middlewares/auth.middleware";

const client = axios.create({
    baseURL: envConfig.auth_service_url,
    timeout: 5000,
});

// response interceptor to handle errors globally for all auth requests
client.interceptors.response.use(
    (response) => response,
    (error) => {

        // forward the original error payload directly from the auth service
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }

        // fallback for network errors or service unavailability
        return Promise.reject({
            success: false,
            message: error.message || "Something went wrong.",
            error: {
                message: error.message
            },
        });
    }
);


const getHeaders = (user?: IAuthUser) => ({
    headers: {
        'X-Internal-Token': envConfig.internal_api_token,
        ...(user && {
            'x-user-id': user.userId,
            'x-session-id': user.sessionId,
            'x-user-email': user.email,
        }),
    },
});


/*=========== register user ============*/
const registerUser = async (payload: IRegisterPayload) => {
    try {
        const response = await client.post('/register-user', payload, getHeaders());
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

/*=========== login user ============*/
const loginUser = async (payload: ILogin) => {
    try {
        const response = await client.post('/login-user', payload, getHeaders());
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

/*=========== logout user ============*/
const logout = async (user?: IAuthUser) => {
    try {
        const response = await client.post('/logout', {}, getHeaders(user));
        return response.data;
    } catch (error: any) {
        throw error;
    }
};



const AuthProxyService = {
    registerUser,
    loginUser,
    logout
};

export default AuthProxyService;