import axios from "axios";
import envConfig from "../config/env";
import { IRegisterPayload } from "../interfaces/auth.interface";


const client = axios.create({
    baseURL: envConfig.auth_service_url,
    timeout: 5000,
});

const authHeader = {
    headers: {
        'X-Internal-Token': envConfig.internal_api_token,
    },
} as const;


const registerUser = async (payload: IRegisterPayload) => {
    const response = await client.post('/register-user', payload, authHeader);
    return response.data;
}


const AuthProxyService = {
    registerUser,
}

export default AuthProxyService;