import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { globalErrorHandler, notFound } from "@chatapp/common";
import envConfig from "./config/env";


const app: Application = express();

app.set("trust proxy", true);
app.use(
    cors({
        origin: envConfig.cors_origins
            ? envConfig.cors_origins.split(",").map((origin) => origin.trim())
            : [
                "http://localhost:3000",
                "http://localhost:3001",
            ],
        credentials: true,
    }),
);


app.use(cookieParser());

app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
    res.send(`Gateway Backend server is running !`);
});

//custom middleware implementation
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//global error-handling middleware
app.use(globalErrorHandler);

//route not found
app.use(notFound);


export default app;
