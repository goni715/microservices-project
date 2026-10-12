import { requiredStringSchema } from "@chatapp/common";
import z from "zod";

export const fullNameRegex = /^[A-Za-z\s'.-]+$/;
export const phoneRegex = /^\+?\d{1,14}$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

export const fullNameZodSchema = requiredStringSchema('full_name')
    .regex(fullNameRegex, {
        message:
            "Full name can only contain letters, spaces, apostrophes, hyphens, and dots.",
    });

export const emailZodSchema = z.email({
    error: (issue) =>
        issue.input === undefined ? "email is required" : "Invalid email address",
});

export const passwordZodSchema = requiredStringSchema('password')
    .min(6, "Password must be at least 6 characters long")
    .max(60, "Password must not exceed 60 characters")
    .regex(
        passwordRegex,
        "Password must contain at least one letter and one number",
    )

export const registerUserValidationSchema = z.object({
    body: z.object({
        full_name: fullNameZodSchema,
        email: emailZodSchema,
        password: passwordZodSchema,
    })
})