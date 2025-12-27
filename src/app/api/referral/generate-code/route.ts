import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { generateCode, getUserCode, getReferralUrl } from "@/lib/referral";

// Generate a referral code for the current user
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

	// Check if user already has a code
	const existingCode = await getUserCode(session.user.id, companyId);

	if (existingCode) {
		return NextResponse.json({
			success: true,
			code: existingCode.code,
			referralUrl: getReferralUrl(existingCode.code),
			isNew: false,
		});
	}

	// Parse optional prefix from request
	const body = await request.json().catch(() => ({}));
	const prefix = body.prefix as string | undefined;

	const result = await generateCode(session.user.id, {
		prefix,
		companyId,
		referrerType: companyId ? "customer" : "affiliate",
	});

	if (!result.success) {
		return NextResponse.json(
			{ success: false, error: result.error },
			{ status: 400 },
		);
	}

	return NextResponse.json({
		success: true,
		code: result.code,
		referralUrl: getReferralUrl(result.code),
		isNew: true,
	});
}
