#!/usr/bin/env bun

import { Pool } from "@neondatabase/serverless";
import { APP_SCHEMA } from "../src/lib/db";

async function migrate() {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		console.error("DATABASE_URL environment variable is required");
		process.exit(1);
	}

	const pool = new Pool({ connectionString });

	console.log("Running app schema migration...");

	try {
		await pool.query(APP_SCHEMA);
		console.log("Migration completed successfully!");

		// Verify tables exist
		const result = await pool.query(`
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name IN ('company', 'call', 'subscription', 'agent_config')
			ORDER BY table_name;
		`);

		console.log(
			"Created tables:",
			result.rows.map((r) => r.table_name),
		);
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

migrate();
