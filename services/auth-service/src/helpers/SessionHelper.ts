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

    /*get all user sessions from Redis*/
    async getAllSessions(userId: string, currentSessionId: string) {
        const keys: string[] = await this.getUserActiveSessionKeys(userId);
        if (!keys || keys.length === 0) return [];

        // retrieve all session values in a single network round-trip
        const rawSessions = await redisClient.mGet(keys);

        const sessions = rawSessions
            .filter((data): data is string => Boolean(data)) // Filter out null/undefined values
            .map((data) => {
                const session: ISession = JSON.parse(data);
                return {
                    sessionId: session.sessionId,
                    revoked: session.revoked,
                    isCurrent: session.sessionId === currentSessionId,
                    createdAt: session.createdAt,
                };
            });

        //sort sessions
        return sessions.sort((a, b) => {
            //current session will be first
            if (a.isCurrent !== b.isCurrent) {
                return a.isCurrent ? -1 : 1;
            }

            //sort remaining sessions by createdAt (latest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
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