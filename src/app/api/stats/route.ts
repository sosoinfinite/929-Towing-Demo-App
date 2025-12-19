import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

// Get dashboard stats
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

	// Get calls today
	const todayResult = await pool.query(
		`SELECT COUNT(*) as count FROM call
		 WHERE company_id = $1
		 AND created_at >= CURRENT_DATE`,
		[companyId],
	);

	// Get calls this week
	const weekResult = await pool.query(
		`SELECT COUNT(*) as count FROM call
		 WHERE company_id = $1
		 AND created_at >= DATE_TRUNC('week', CURRENT_DATE)`,
		[companyId],
	);

	// Get AI-handled rate
	const aiResult = await pool.query(
		`SELECT
		   COUNT(*) FILTER (WHERE ai_handled = true) as ai_handled,
		   COUNT(*) as total
		 FROM call
		 WHERE company_id = $1
		 AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
		[companyId],
	);

	const aiHandled = Number(aiResult.rows[0]?.ai_handled || 0);
	const totalCalls = Number(aiResult.rows[0]?.total || 0);
	const successRate =
		totalCalls > 0 ? Math.round((aiHandled / totalCalls) * 100) : 0;

	// Estimate revenue (assuming $150 avg per successful call)
	const avgJobValue = 150;
	const weekCalls = Number(weekResult.rows[0]?.count || 0);
	const estimatedRevenue = weekCalls * avgJobValue;

	return NextResponse.json({
		callsToday: Number(todayResult.rows[0]?.count || 0),
		callsThisWeek: weekCalls,
		successRate,
		estimatedRevenue,
	});
}
