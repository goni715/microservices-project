import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { globalErrorHandler, notFound } from "@chatapp/common";
import router from "./routes/auth.routes";


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

//application routes
app.use("/api/v1/auth", router);

//global error-handling middleware
app.use(globalErrorHandler);

//route not found
app.use(notFound);


export default app;
