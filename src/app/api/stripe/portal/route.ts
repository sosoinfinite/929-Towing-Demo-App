import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { createPortalSession } from "@/lib/stripe";

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

	// Get subscription with Stripe customer ID
	const subResult = await pool.query(
		"SELECT stripe_customer_id FROM subscription WHERE company_id = $1",
		[companyId],
	);

	const customerId = subResult.rows[0]?.stripe_customer_id;

	if (!customerId) {
		return NextResponse.json(
			{ error: "No subscription found" },
			{ status: 404 },
		);
	}

	try {
		const portalSession = await createPortalSession(
			customerId,
			`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
		);

		return NextResponse.json({ url: portalSession.url });
	} catch (error) {
		console.error("Failed to create portal session:", error);
		return NextResponse.json(
			{ error: "Failed to create portal session" },
			{ status: 500 },
		);
	}
}
