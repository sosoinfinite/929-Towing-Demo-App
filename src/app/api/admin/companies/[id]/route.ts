import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Get single company (admin only)
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const pool = getPool();

	// Get company with user and call counts
	const result = await pool.query(
		`
		SELECT
			c.*,
			COUNT(DISTINCT u.id)::int as user_count,
			COUNT(DISTINCT call.id)::int as call_count
		FROM company c
		LEFT JOIN "user" u ON u.company_id = c.id
		LEFT JOIN call ON call.company_id = c.id
		WHERE c.id = $1
		GROUP BY c.id
	`,
		[id],
	);

	if (result.rows.length === 0) {
		return NextResponse.json({ error: "Company not found" }, { status: 404 });
	}

	// Get associated users
	const usersResult = await pool.query(
		`SELECT id, name, email, role FROM "user" WHERE company_id = $1`,
		[id],
	);

	// Get recent calls
	const callsResult = await pool.query(
		`SELECT * FROM call WHERE company_id = $1 ORDER BY created_at DESC LIMIT 10`,
		[id],
	);

	return NextResponse.json({
		company: result.rows[0],
		users: usersResult.rows,
		recentCalls: callsResult.rows,
	});
}

// Update company (admin only)
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const body = await request.json();
	const { name, phone, serviceArea, twilioPhone, dispatchActive } = body;

	const pool = getPool();

	// Check company exists
	const existingResult = await pool.query(
		"SELECT id FROM company WHERE id = $1",
		[id],
	);

	if (existingResult.rows.length === 0) {
		return NextResponse.json({ error: "Company not found" }, { status: 404 });
	}

	// Build update query dynamically
	const updates: string[] = [];
	const values: (string | boolean | null)[] = [];
	let paramIndex = 1;

	if (name !== undefined) {
		updates.push(`name = $${paramIndex++}`);
		values.push(name);
	}
	if (phone !== undefined) {
		updates.push(`phone = $${paramIndex++}`);
		values.push(phone);
	}
	if (serviceArea !== undefined) {
		updates.push(`service_area = $${paramIndex++}`);
		values.push(serviceArea);
	}
	if (twilioPhone !== undefined) {
		updates.push(`twilio_phone = $${paramIndex++}`);
		values.push(twilioPhone);
	}
	if (dispatchActive !== undefined) {
		updates.push(`dispatch_active = $${paramIndex++}`);
		values.push(dispatchActive);
	}

	if (updates.length === 0) {
		return NextResponse.json(
			{ error: "No fields to update" },
			{ status: 400 },
		);
	}

	values.push(id);

	await pool.query(
		`UPDATE company SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
		values,
	);

	// Return updated company
	const result = await pool.query("SELECT * FROM company WHERE id = $1", [id]);

	return NextResponse.json({ company: result.rows[0] });
}
