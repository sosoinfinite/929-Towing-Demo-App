import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getUserCode } from "@/lib/referral";

// Get current user's company
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
		return NextResponse.json({ company: null });
	}

	const companyResult = await pool.query(
		"SELECT * FROM company WHERE id = $1",
		[companyId],
	);

	return NextResponse.json({ company: companyResult.rows[0] || null });
}

// Create a new company and link to user
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const pool = getPool();

	// Check if user already has a company
	const userResult = await pool.query(
		'SELECT company_id FROM "user" WHERE id = $1',
		[session.user.id],
	);

	if (userResult.rows[0]?.company_id) {
		return NextResponse.json(
			{ error: "User already has a company" },
			{ status: 400 },
		);
	}

	const body = await request.json();
	const { name, phone, logo, serviceArea } = body;

	if (!name) {
		return NextResponse.json(
			{ error: "Company name is required" },
			{ status: 400 },
		);
	}

	const companyId = crypto.randomUUID();

	// Create company
	await pool.query(
		`INSERT INTO company (id, name, phone, logo, service_area, dispatch_active)
		 VALUES ($1, $2, $3, $4, $5, false)`,
		[companyId, name, phone || null, logo || null, serviceArea || null],
	);

	// Link user to company and set as owner
	await pool.query(
		'UPDATE "user" SET company_id = $1, role = $2 WHERE id = $3',
		[companyId, "owner", session.user.id],
	);

	// Create default agent config
	await pool.query(
		`INSERT INTO agent_config (id, company_id, elevenlabs_agent_id, greeting_message, dispatcher_name)
		 VALUES ($1, $2, $3, $4, $5)`,
		[
			crypto.randomUUID(),
			companyId,
			process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || null,
			`Thanks for calling ${name} 24/7 Dispatch. This is Brian. To get a truck to you as quickly as possible, are you in a safe location right now?`,
			"Brian",
		],
	);

	// Link referral attribution to this company (if user was referred)
	const referralResult = await pool.query(
		`SELECT id FROM referral
		 WHERE referred_user_id = $1 AND status = 'signed_up'`,
		[session.user.id],
	);

	if (referralResult.rows[0]) {
		await pool.query(
			`UPDATE referral
			 SET referred_company_id = $1,
			     company_created_at = NOW(),
			     status = 'company_created',
			     updated_at = NOW()
			 WHERE id = $2`,
			[companyId, referralResult.rows[0].id],
		);
	}

	// Auto-generate referral code for this new company owner
	await getUserCode(session.user.id, companyId);

	const companyResult = await pool.query(
		"SELECT * FROM company WHERE id = $1",
		[companyId],
	);

	return NextResponse.json({ company: companyResult.rows[0] }, { status: 201 });
}
