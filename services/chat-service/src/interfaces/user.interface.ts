export interface IUser {
    _id: string;
    email: string;
    full_name: string;
    picture?: string;
    created_at: Date;
    updated_at: Date;
}