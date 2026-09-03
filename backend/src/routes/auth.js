import express from "express";
import { z } from "zod";

import env from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken, cookieOptions } from "../utils/jwt.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import {
    findByEmail,
    findByIdWithHash,
    updateName,
    create,
    hashPassword,
    comparePassword,
    updatePassword,
} from "../models/User.js";
import { ensureUser, update } from "../models/Settings.js";

const router = express.Router();

const registerSchema = z.object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
    companyName: z.string().trim().max(120).optional(),
    address: z.string().trim().max(400).optional(),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(128),
});

const profileSchema = z.object({
    name: z.string().trim().min(1).max(80),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(8).max(128),
});

function issueSession(res, user) {
    const token = signToken({ sub: user.id });
    res.cookie(env.cookieName, token, cookieOptions);
}

router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    asyncHandler(async (req, res) => {
        const { name, email, password, companyName, address } = req.body;

        const existing = await findByEmail(email);

        if (existing) {
            throw ApiError.conflict("Email Already Registered");
        }

        const passwordHash = await hashPassword(password);

        const user = await create({
            name,
            email,
            passwordHash,
        });

        await ensureUser(user.id);

        if (companyName || address) {
            await update(user.id, {
                company_name: companyName || "",
                address: address || "",
                email,
            });
        }

        issueSession(res, user);

        res.status(201).json({ user });
    }),
);

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        const record = await findByEmail(email);

        if (!record) {
            throw ApiError.unauthorized("Invalid Credentials");
        }

        const ok = await comparePassword(password, record.password_hash);

        if (!ok) {
            throw ApiError.unauthorized("Invalid Credentials");
        }

        const user = {
            id: record.id,
            email: record.email,
            name: record.name,
            created_at: record.created_at,
            updated_at: record.updated_at,
        };

        issueSession(res, user);

        res.json({ user });
    }),
);

router.post("/logout", (req, res) => {
    res.clearCookie(env.cookieName, {
        ...cookieOptions,
        maxAge: 0,
    });

    res.json({ ok: true });
});

router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
        res.json({ user: req.user });
    }),
);

router.patch(
    "/profile",
    requireAuth,
    validate(profileSchema),
    asyncHandler(async (req, res) => {
        const user = await updateName(req.user.id, req.body.name);
        res.json({ user });
    }),
);

router.patch(
    "/password",
    authLimiter,
    requireAuth,
    validate(passwordSchema),
    asyncHandler(async (req, res) => {
        const record = await findByIdWithHash(req.user.id);
        if (!record) throw ApiError.unauthorized("Session No Longer Valid");

        const ok = await comparePassword(
            req.body.currentPassword,
            record.password_hash,
        );
        if (!ok) throw ApiError.unauthorized("Current Password Is Incorrect");

        const passwordHash = await hashPassword(req.body.newPassword);
        await updatePassword(req.user.id, passwordHash);
        res.json({ ok: true });
    }),
);

export default router;
