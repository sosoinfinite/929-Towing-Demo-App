import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Get call history
export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const pool = getPool();

	// Get user's company
	const userResult = await pool.query(
		'SELECT company_id FROM "user" WHERE id = $1',
		[session.user.id],
	);

	const companyId = userResult.rows[0]?.company_id;

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	// Parse pagination params
	const searchParams = request.nextUrl.searchParams;
	const page = Number(searchParams.get("page")) || 1;
	const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
	const offset = (page - 1) * limit;

	// Get total count
	const countResult = await pool.query(
		"SELECT COUNT(*) as count FROM call WHERE company_id = $1",
		[companyId],
	);
	const total = Number(countResult.rows[0]?.count || 0);

	// Get calls
	const callsResult = await pool.query(
		`SELECT id, caller_number, status, duration, ai_handled, created_at
		 FROM call
		 WHERE company_id = $1
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`,
		[companyId, limit, offset],
	);

	return NextResponse.json({
		calls: callsResult.rows,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
}
