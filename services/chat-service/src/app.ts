import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
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


app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
    res.send(`Chat Backend server is running !`);
});

//custom middleware implementation
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());



//route not found
app.use(notFound);

//global error-handling middleware
app.use(globalErrorHandler);


export default app;
