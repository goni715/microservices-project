import { AppError } from "./AppError";

export class UnprocessableError extends AppError {
    constructor(message: string) {
        super(422, message);
    }
}

