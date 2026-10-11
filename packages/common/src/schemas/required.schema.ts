import z from "zod";

export const requiredStringSchema = (name: string) => z.string({
    error: (issue) =>
        issue.input === undefined
            ? `${name} is required`
            : `${name} must be a string`,
}).trim()

export const requiredNumberSchema = (name: string) => z.number({
    error: (issue) =>
        issue.input === undefined
            ? `${name} is required`
            : `${name} must be a number`,
})
