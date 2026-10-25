import { redisClient } from "@chatapp/common";
import { ISession } from "../interfaces/auth.interface";

class SessionHelper {
    /*create and store a new session in Redis with expiration*/
    async createSession(
        session: ISession,
        expiresInSeconds: number,
    ): Promise<void> {
        //generate key
        const key = `session:${session.userId}:${session.sessionId}`;
        const value = JSON.stringify(session);

        // store in redis
        await redisClient.set(key, value, { EX: expiresInSeconds } as any);
    }

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

    /*get user active session keys from Redis*/
    async getUserActiveSessionKeys(userId: string) {
        // session:userId:*
        return await redisClient.keys(`session:${userId}:*`);
    };

    /*delete a single session*/
    async deleteSession(userId: string, sessionId: string) {
        const key = `session:${userId}:${sessionId}`;
        await redisClient.del(key);
    };

    /*delete all user sessions*/
    async deleteAllSessions(userId: string) {
        const keys = await this.getUserActiveSessionKeys(userId);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    };


}
const sessionHelper = new SessionHelper();
export default sessionHelper;