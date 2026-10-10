import { AppError } from "./AppError";

export class GoneError extends AppError {
    constructor(message: string) {
        super(410, message);
    }
}

