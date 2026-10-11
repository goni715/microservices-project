import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { globalErrorHandler, notFound } from "@chatapp/common";


const app: Application = express();

app.set("trust proxy", true);
app.use(cors());


app.use(cookieParser());

app.use(morgan("dev"));

app.get("/", (req: Request, res: Response) => {
    res.send(`Auth Backend server is running !`);
});

//custom middleware implementation
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//route not found
app.use(notFound);

// global error-handling middleware
app.use(globalErrorHandler);

export default app;
