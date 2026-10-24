import { redisClient } from "@chatapp/common";
import { ISession } from "../interfaces/auth.interface";

class SessionHelper {
    /*get stored session from Redis*/
    async getSingleSession(
        userId: string,
        sessionId: string
    ) {

        const key = `session:${userId}:${sessionId}`;
        const data = await redisClient.get(key);

        if (!data) return null;
        return JSON.parse(data) as ISession;
    };

}
const sessionHelper = new SessionHelper();
export default sessionHelper;