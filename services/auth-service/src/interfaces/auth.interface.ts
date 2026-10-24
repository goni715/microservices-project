
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
    session_id: string;
    user_id: string;
    refresh_token_hash: string;
    revoked: boolean;
    created_at: string;
}
