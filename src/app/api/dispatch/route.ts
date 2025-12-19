import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Get dispatch status
export async function GET() {
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

	const companyResult = await pool.query(
		"SELECT dispatch_active FROM company WHERE id = $1",
		[companyId],
	);

	return NextResponse.json({
		dispatchActive: companyResult.rows[0]?.dispatch_active ?? false,
	});
}

// Toggle dispatch status
export async function POST() {
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

	// Toggle dispatch_active
	const result = await pool.query(
		`UPDATE company
		 SET dispatch_active = NOT dispatch_active, updated_at = NOW()
		 WHERE id = $1
		 RETURNING dispatch_active`,
		[companyId],
	);

	return NextResponse.json({
		dispatchActive: result.rows[0]?.dispatch_active ?? false,
	});
}
