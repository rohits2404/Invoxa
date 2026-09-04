import express from "express";
import { z } from "zod";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { query, queryOne } from "../config/db.js";

const router = express.Router();
router.use(requireAuth);

const uuid = z.string().uuid("Invalid id");
const idParam = z.object({ id: uuid });

const itemSchema = z.object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(500).optional(),
    rate: z.coerce.number().min(0).max(100000000).default(0),
    unit: z.string().trim().max(24).optional(),
});

router.get(
    "/",
    asyncHandler(async (req, res) => {
        const { rows } = await query(
            `SELECT * FROM catalog_items WHERE user_id = $1 ORDER BY name ASC`,
            [req.user.id],
        );

        res.json({ items: rows.map((r) => ({ ...r, rate: Number(r.rate) })) });
    }),
);

router.post(
    "/",
    validate(itemSchema),
    asyncHandler(async (req, res) => {
        const b = req.body;
        const item = await queryOne(
            `INSERT INTO catalog_items (user_id, name, description, rate, unit)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, b.name, b.description || "", b.rate, b.unit || ""],
        );
        res.status(201).json({ item: { ...item, rate: Number(item.rate) } });
    }),
);

router.patch(
    "/:id",
    validate(idParam, "params"),
    validate(itemSchema.partial()),
    asyncHandler(async (req, res) => {
        const fields = ["name", "description", "rate", "unit"];
        const sets = [];
        const values = [req.params.id, req.user.id];
        let paramIndex = 3;

        for (const f of fields) {
            if (req.body[f] !== undefined) {
                values.push(req.body[f]);
                sets.push(`${f} = $${paramIndex}`);
                paramIndex++;
            }
        }

        if (!sets.length) {
            throw ApiError.badRequest("No fields to update");
        }

        const item = await queryOne(
            `UPDATE catalog_items SET ${sets.join(", ")}, updated_at = now() 
       WHERE id = $1 AND user_id = $2 RETURNING *`,
            values,
        );

        if (!item) throw ApiError.notFound("Item not found");
        res.json({ item: { ...item, rate: Number(item.rate) } });
    }),
);

router.delete(
    "/:id",
    validate(idParam, "params"),
    asyncHandler(async (req, res) => {
        const r = await query(
            `DELETE FROM catalog_items WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id],
        );
        if (!r.rowCount) throw ApiError.notFound("Item not found");
        res.json({ ok: true });
    }),
);

export default router;
