import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 15,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req, res) => req.user?.id || ipKeyGenerator(req, res),
    message: {
        error: {
            message: "Too Many AI Requests — Please Wait A Minute And Retry.",
        },
    },
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req, res) => ipKeyGenerator(req, res),
    message: {
        error: {
            message: "Too Many Auth Attempts — Please Wait And Retry.",
        },
    },
});
