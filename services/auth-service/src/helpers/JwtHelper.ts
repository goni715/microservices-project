import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export type TJwtExpiresIn = number | `${number}${"s" | "m" | "h" | "d"}`;

type TJwtPayload = {
    user_id: string;
    email: string;
    session_id: string;
};

class JwtHelper {
    //createToken
    createToken(
        payload: TJwtPayload,
        secretKey: Secret,
        expiresIn: TJwtExpiresIn,
    ) {
        const options: SignOptions = {
            algorithm: "HS256",
            expiresIn, // This can be a number (e.g., 3600) or a string (e.g., "1h", "1m", "1d")
        };

        const token = jwt.sign(payload, secretKey, options);
        return token;
    }

    //verifyToken
    verifyToken(token: string, secretKey: Secret) {
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        return decoded;
    }
}

export const { createToken, verifyToken } = new JwtHelper();
