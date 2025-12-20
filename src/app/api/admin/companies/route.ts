import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// List all companies (admin only)
export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const pool = getPool();

	const result = await pool.query(`
		SELECT
			c.*,
			COUNT(DISTINCT u.id)::int as user_count,
			COUNT(DISTINCT call.id)::int as call_count
		FROM company c
		LEFT JOIN "user" u ON u.company_id = c.id
		LEFT JOIN call ON call.company_id = c.id
		GROUP BY c.id
		ORDER BY c.created_at DESC
	`);

	return NextResponse.json({ companies: result.rows });
}
