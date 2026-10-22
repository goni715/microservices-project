import express from "express";
import { globalErrorHandler, notFound } from "@chatapp/common";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import envConfig from "./config/env";
import router from "./routes/user.routes";


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
    res.send(`User Backend server is running !`);
});

//custom middleware implementation
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//application routes
app.use("/api/v1/user", router);

//global error-handling middleware
app.use(globalErrorHandler);

//route not found
app.use(notFound);


export default app;
