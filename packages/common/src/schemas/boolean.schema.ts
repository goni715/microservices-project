import z from "zod";

export const booleanSchema = (name: string) => z.boolean({
    error: (issue) =>
        issue.input === undefined
            ? `${name} is required`
            : `${name} must be boolean value`,
})
