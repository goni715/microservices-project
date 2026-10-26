import { isObjectId } from "../utils";
import { requiredStringSchema } from "./required.schema";

export const objectIdSchema = (name: string) => {
    return requiredStringSchema(name).refine((id) => isObjectId(id), {
        message: `${name} must be a valid ObjectId`,
    });
}


