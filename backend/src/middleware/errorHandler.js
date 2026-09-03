import { ApiError } from "../utils/ApiError.js";
import env from "../config/env.js";

export function notFound(req, res, next) {
    next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} Not Found`));
}

export function errorHandler(err, req, res, _next) {
    let status = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let details = err.details;

    if (err.code === "23505") {
        status = 409;
        message = "That Value Is Already In Use";
        details = err.detail;
    } else if (err.code === "23503") {
        status = 400;
        message = "Referenced Record Does Not Exist";
    } else if (err.code === "22P02") {
        status = 400;
        message = "Invalid identifier";
    } else if (err.name === "ZodError") {
        status = 400;
        message = "Validation Failed";
        details = err.issues;
    }

    if (status >= 500) {
        console.error(`[${req.method}] ${req.originalUrl}`, err);
    }

    res.status(status).json({
        error: {
            message,
            ...(details ? { details } : {}),
            ...(env.isProd ? {} : { stack: err.stack }),
        },
    });
}
