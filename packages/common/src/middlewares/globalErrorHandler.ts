/* eslint-disable @typescript-eslint/no-unused-vars */

import { ErrorRequestHandler } from "express";
import multer from "multer";

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Image size must not exceed 5 MB",
            });
        }
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        error: {
            message
        }
    });
}

