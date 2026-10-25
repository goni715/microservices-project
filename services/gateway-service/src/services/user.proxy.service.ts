import envConfig from "../config/env";
import { createProxyClient, getProxyHeaders } from "../helpers/proxyClient";

const client = createProxyClient(envConfig.user_service_url)


/*=========== get all users ============*/
const getAllUsers = async () => {
    try {
        const response = await client.get('/all-users', getProxyHeaders());
        return response.data;
    } catch (error: any) {
        throw error;
    }
};


const UserProxyService = {
    getAllUsers,
};

export default UserProxyService;