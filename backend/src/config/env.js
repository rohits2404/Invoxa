import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});

const required = ["DATABASE_URL", "JWT_SECRET"];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
}

export default {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 8000,

    databaseUrl: process.env.DATABASE_URL,

    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",

    cookieName: process.env.COOKIE_NAME || "auth_token",

    clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),

    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",

    isProd: process.env.NODE_ENV === "production",
};
