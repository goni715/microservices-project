import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
    constructor(message: string) {
        super(401, message);
    }
}

