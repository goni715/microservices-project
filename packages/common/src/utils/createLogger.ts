import pino from "pino";
import type { Logger, LoggerOptions } from "pino";

type TOptions = LoggerOptions & {
    name: string;
};

export const createLogger = (options: TOptions): Logger => {
    const { name, ...rest } = options;

    const transport =
        process.env.NODE_ENV === "development"
            ? {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                },
            }
            : undefined;

    return pino({
        name,
        level: process.env.LOG_LEVEL || "info",
        transport,
        ...rest,
    });
};
