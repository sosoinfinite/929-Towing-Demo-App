import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getUserStats, getReferralUrl } from "@/lib/referral";

// Get current user's referral code and stats
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

	const stats = await getUserStats(session.user.id);

	return NextResponse.json({
		...stats,
		referralUrl: stats.code ? getReferralUrl(stats.code) : null,
		companyId,
	});
}
