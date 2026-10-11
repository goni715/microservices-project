import z from "zod";

export const enumSchema = (name: string, enumValues: string[]) => z.string({
    error: (issue) =>
        issue.input === undefined
            ? `${name} is required`
            : `${name} must be a string`,
})
    .refine((val) => enumValues.includes(val), {
        message: `${name} must be ${enumValues.map((type) => `'${type}'`).join(" or ")}`,
    })
