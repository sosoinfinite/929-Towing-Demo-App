import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Create a manual call entry
export async function POST(request: NextRequest) {
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

	try {
		const body = await request.json();
		const { caller_number, status, duration, transcript, ai_handled } = body;

		// Generate a unique ID
		const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		await pool.query(
			`INSERT INTO call (id, company_id, caller_number, status, duration, transcript, ai_handled, created_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
			[
				id,
				companyId,
				caller_number || "Unknown",
				status || "completed",
				duration || 0,
				transcript || null,
				ai_handled ?? false,
			],
		);

		return NextResponse.json({ success: true, id });
	} catch (error) {
		console.error("Failed to create call:", error);
		return NextResponse.json(
			{ error: "Failed to create call" },
			{ status: 500 },
		);
	}
}

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
