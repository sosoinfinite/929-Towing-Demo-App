import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// List all calls across all companies (admin only)
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { searchParams } = new URL(request.url);
	const page = Number.parseInt(searchParams.get("page") || "1", 10);
	const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
	const offset = (page - 1) * limit;

	const pool = getPool();

	// Get total count
	const countResult = await pool.query("SELECT COUNT(*)::int as count FROM call");
	const total = countResult.rows[0].count;

	// Get paginated calls with company info
	const result = await pool.query(
		`SELECT
			c.id,
			c.caller_number,
			c.status,
			c.duration,
			c.ai_handled,
			c.created_at,
			c.transcript,
			co.name as company_name,
			co.id as company_id
		FROM call c
		LEFT JOIN company co ON c.company_id = co.id
		ORDER BY c.created_at DESC
		LIMIT $1 OFFSET $2`,
		[limit, offset],
	);

	return NextResponse.json({
		calls: result.rows,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
}
