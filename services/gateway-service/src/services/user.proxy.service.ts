import axios from "axios";
import envConfig from "../config/env";

const client = axios.create({
    baseURL: envConfig.user_service_url,
    timeout: 5000,
});

// response interceptor to handle errors globally for all user requests
client.interceptors.response.use(
    (response) => response,
    (error) => {

        // forward the original error payload directly from the user service
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

const userHeader = {
    headers: {
        'X-Internal-Token': envConfig.internal_api_token,
    },
} as const;


/*=========== get all users ============*/
const getAllUsers = async () => {
    try {
        const response = await client.get('/all-users', userHeader);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};


const UserProxyService = {
    getAllUsers,
};

export default UserProxyService;