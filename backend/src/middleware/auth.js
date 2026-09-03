import env from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
    try {
        const token = req.cookies[env.cookieName];
        if (!token) throw ApiError.unauthorized();

        const payload = verifyToken(token);
        const user = await User.findById(payload.sub);

        if (!user) throw ApiError.unauthorized("Session No Longer Valid");

        req.user = user;
        next();
    } catch (err) {
        if (
            err.name === "JsonWebTokenError" ||
            err.name === "TokenExpiredError"
        ) {
            return next(ApiError.unauthorized("Invalid Or Expired Session"));
        }
        next(err);
    }
}
