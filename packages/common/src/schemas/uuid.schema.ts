import { isUUID } from "../utils";
import { requiredStringSchema } from "./required.schema";

export const uuidSchema = (name: string) => {
    return requiredStringSchema(name).refine((id) => isUUID(id), {
        message: `${name} must be a valid UUID`,
    });
}


