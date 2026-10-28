import { model, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema<IUser>(
    {
        _id: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        full_name: {
            type: String,
            required: true,
            trim: true,
        },
        picture: {
            type: String,
            required: false,
            default: null
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
        versionKey: false,
        toJSON: {
            transform: (_, ret: any) => {
                ret.id = ret._id; //make id
                delete ret._id; //delete _id
                return ret;
            },
        },
    }
);

const UserModel = model<IUser>("User", userSchema);
export default UserModel;