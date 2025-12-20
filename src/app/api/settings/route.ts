import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Get company settings
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

	// Get company and agent config
	const companyResult = await pool.query(
		"SELECT * FROM company WHERE id = $1",
		[companyId],
	);

	const agentResult = await pool.query(
		"SELECT * FROM agent_config WHERE company_id = $1",
		[companyId],
	);

	return NextResponse.json({
		company: companyResult.rows[0] || null,
		agentConfig: agentResult.rows[0] || null,
	});
}

// Update company settings
export async function PUT(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const pool = getPool();

	// Get user's company
	const userResult = await pool.query(
		'SELECT company_id, role FROM "user" WHERE id = $1',
		[session.user.id],
	);

	const companyId = userResult.rows[0]?.company_id;
	const role = userResult.rows[0]?.role;

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	if (role !== "owner") {
		return NextResponse.json(
			{ error: "Only owners can update settings" },
			{ status: 403 },
		);
	}

	const body = await request.json();
	const { name, phone, logo, serviceArea, greetingMessage } = body;

	// Update company
	if (name || phone !== undefined || logo !== undefined || serviceArea !== undefined) {
		await pool.query(
			`UPDATE company
			 SET name = COALESCE($1, name),
			     phone = COALESCE($2, phone),
			     logo = COALESCE($3, logo),
			     service_area = COALESCE($4, service_area),
			     updated_at = NOW()
			 WHERE id = $5`,
			[name || null, phone, logo, serviceArea, companyId],
		);
	}

	// Update agent config
	if (greetingMessage !== undefined) {
		await pool.query(
			`UPDATE agent_config
			 SET greeting_message = $1, updated_at = NOW()
			 WHERE company_id = $2`,
			[greetingMessage, companyId],
		);
	}

	// Return updated data
	const companyResult = await pool.query(
		"SELECT * FROM company WHERE id = $1",
		[companyId],
	);

	const agentResult = await pool.query(
		"SELECT * FROM agent_config WHERE company_id = $1",
		[companyId],
	);

	return NextResponse.json({
		company: companyResult.rows[0] || null,
		agentConfig: agentResult.rows[0] || null,
	});
}
