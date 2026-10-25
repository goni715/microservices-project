
export interface IRegisterPayload {
    full_name: string;
    email: string;
    password: string;
}

export interface ILogin {
    email: string;
    password: string;
    isRememberMe: boolean;
}

export interface ISession {
    sessionId: string;
    userId: string;
    refreshTokenHash: string;
    revoked: boolean;
    createdAt: string;
}
