import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    let db = "unknown";

    try {
        await pool.query("SELECT 1");
        db = "connected";
    } catch (err) {
        db = "disconnected";
    }

    res.json({
        status: "ok",
        uptime: process.uptime(),
        db,
        timestamp: new Date().toISOString(),
    });
});

export default router;
