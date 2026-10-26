import { Types } from "mongoose"

export const isObjectId = (id: string) => {
    return Types.ObjectId.isValid(id) //true or false
}
