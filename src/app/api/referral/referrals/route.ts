import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Get list of referrals made by the current user
export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const pool = getPool();

	// Get user's referral code
	const codeResult = await pool.query(
		"SELECT id FROM referral_code WHERE user_id = $1",
		[session.user.id],
	);

	if (codeResult.rows.length === 0) {
		return NextResponse.json({ referrals: [] });
	}

	// Get referrals for this code
	const referralsResult = await pool.query(
		`SELECT
			r.id,
			r.status,
			r.first_click_at,
			r.signup_at,
			r.subscription_started_at,
			r.reward_credited_at,
			r.reward_earned_cents,
			c.name as company_name
		 FROM referral r
		 LEFT JOIN company c ON c.id = r.referred_company_id
		 WHERE r.referral_code_id = $1
		 ORDER BY r.created_at DESC
		 LIMIT 50`,
		[codeResult.rows[0].id],
	);

	return NextResponse.json({
		referrals: referralsResult.rows,
	});
}
