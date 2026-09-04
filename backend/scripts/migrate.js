import { pool } from "../src/config/db.js";
import { SCHEMA_SQL } from "../src/config/schema.js";

(async () => {
    try {
        await pool.query(SCHEMA_SQL);
        console.log("Schema Applied.");
    } catch (err) {
        console.error("✗ Migration Failed:", err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
