import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export type TJwtExpiresIn = number | `${number}${"s" | "m" | "h" | "d"}`;

class JwtHelper {

    //verifyToken
    verifyToken(token: string, secretKey: Secret) {
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        return decoded;
    }
}

export const { verifyToken } = new JwtHelper();
