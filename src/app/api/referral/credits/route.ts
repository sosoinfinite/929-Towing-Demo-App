import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getCreditBalance } from "@/lib/referral";

// Get user's credit transaction history
export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const pool = getPool();

	// Get balance summary
	const balance = await getCreditBalance(session.user.id);

	// Get transaction history
	const transactionsResult = await pool.query(
		`SELECT id, type, amount_cents, description, created_at
		 FROM referral_credit
		 WHERE user_id = $1
		 ORDER BY created_at DESC
		 LIMIT 50`,
		[session.user.id],
	);

	return NextResponse.json({
		balance,
		transactions: transactionsResult.rows,
	});
}
