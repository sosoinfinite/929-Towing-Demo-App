import { Pool } from "@neondatabase/serverless";
import { APP_SCHEMA } from "../src/lib/db";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
	await pool.query(APP_SCHEMA);
	console.log("All app tables created successfully");
} catch (err) {
	console.error("Error:", err);
	process.exit(1);
}

process.exit(0);
