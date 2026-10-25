import axios, { CreateAxiosDefaults } from "axios";
import envConfig from "../config/env";
import { IAuthUser } from "../middlewares/auth.middleware";

// generate internal service headers with optional forwarded user context
export const getProxyHeaders = (user?: IAuthUser) => ({
    headers: {
        "X-Internal-Token": envConfig.internal_api_token,
        ...(user && {
            "x-user-id": user.userId,
            "x-session-id": user.sessionId,
            "x-user-email": user.email,
        }),
    },
});

// create reusable Axios client with built-in error interceptor
export const createProxyClient = (baseURL: string, options?: CreateAxiosDefaults) => {
    const client = axios.create({
        baseURL,
        timeout: 5000,
        ...options,
    });

    // global response interceptor to preserve downstream microservice errors
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.data) {
                const downstreamError = error.response.data;
                const customError: any = new Error(downstreamError.message);
                customError.statusCode = error.response.status;
                customError.errors = downstreamError.errors; // Validation errors (e.g. Zod)
                customError.error = downstreamError.error;   // Generic error details
                return Promise.reject(customError);
            }

            // Fallback for network failures or downstream service unavailability
            const fallbackError: any = new Error(error.message || "Something went wrong");
            fallbackError.statusCode = 500;
            fallbackError.error = { message: error.message };
            return Promise.reject(fallbackError);
        }
    );

    return client;
};
