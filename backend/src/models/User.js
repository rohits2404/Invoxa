import bcrypt from "bcrypt";
import { query, queryOne } from "../config/db.js";

export const PUBLIC_COLS = "id, name, email, created_at, updated_at";

export function hashPassword(plain) {
    return bcrypt.hash(plain, 12);
}

export function comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}

export async function findByEmail(email) {
    return queryOne("SELECT * FROM users WHERE email = $1", [email]);
}

export async function findById(id) {
    return queryOne(`SELECT ${PUBLIC_COLS} FROM users WHERE id = $1`, [id]);
}

export async function findByIdWithHash(id) {
    return queryOne("SELECT * FROM users WHERE id = $1", [id]);
}

export async function create({ name, email, passwordHash }) {
    return queryOne(
        `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING ${PUBLIC_COLS};
    `,
        [name, email, passwordHash],
    );
}

export async function updateName(id, name) {
    return queryOne(
        `
      UPDATE users SET name = $2, updated_at = now()
      WHERE id = $1
      RETURNING ${PUBLIC_COLS};
    `,
        [id, name],
    );
}

export async function updatePassword(id, passwordHash) {
    await query(
        `
      UPDATE users SET password_hash = $2, updated_at = now()
      WHERE id = $1;
    `,
        [id, passwordHash],
    );
}
