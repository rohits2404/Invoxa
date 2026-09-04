import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import clientsRouter from "./routes/clients.js";

const app = express();

app.set("trust proxy", 1);

app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use(cookieParser());

if (!env.isProd) {
    app.use(morgan("dev"));
}

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/clients", clientsRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
    try {
        await connectDB();

        app.listen(env.port, () => {
            console.log(
                `Server Listening On http://localhost:${env.port} (${env.nodeEnv})`,
            );
        });
    } catch (err) {
        console.error("Failed To Start Server:", err.message);
        process.exit(1);
    }
}

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});

start();

export default app;
