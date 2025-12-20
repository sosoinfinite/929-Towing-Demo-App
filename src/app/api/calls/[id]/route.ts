import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// GET single call by ID
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

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

	// Get the call - only if it belongs to user's company
	const result = await pool.query(
		`SELECT
			id,
			twilio_call_sid as "twilioCallSid",
			caller_number as "callerNumber",
			status,
			duration,
			transcript,
			ai_handled as "aiHandled",
			created_at as "createdAt"
		FROM call
		WHERE id = $1 AND company_id = $2`,
		[id, companyId],
	);

	if (result.rows.length === 0) {
		return NextResponse.json({ error: "Call not found" }, { status: 404 });
	}

	return NextResponse.json(result.rows[0]);
}
