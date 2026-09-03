import { Pool } from "@neondatabase/serverless";
import env from "./env.js";
import { SCHEMA_SQL } from "./schema.js";

// Database configuration
export const pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
});

// Pool error handling
pool.on("error", (err) => {
    console.error("Postgres Pool Error:", err.message);
});

// Basic query functions
export async function query(text, params) {
    return pool.query(text, params);
}

export async function queryOne(text, params) {
    const { rows } = await pool.query(text, params);
    return rows[0] || null;
}

// Transaction helper
export async function withTransaction(fn) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export async function connectDB() {
    const { rows } = await pool.query("SELECT current_database() AS db");
    await pool.query(SCHEMA_SQL);
    console.log(`Postgres Connected: ${rows[0].db} (Schema Ready)`);
}
