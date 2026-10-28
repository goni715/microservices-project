import { model, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

const userSchema = new Schema<IUser>({
    _id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: (_, ret: any) => {
            ret.id = ret._id, //make id field
                delete ret._id; //delete _id
            return ret;
        }
    }
})


const UserModel = model<IUser>("User", userSchema);
export default UserModel;