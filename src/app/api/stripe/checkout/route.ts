import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import {
	getOrCreateCustomer,
	getStripe,
	PLANS,
	type PlanId,
} from "@/lib/stripe";

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

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	// Parse request
	const body = await request.json();
	const planId = (body.plan || "alpha") as PlanId;
	const plan = PLANS[planId];

	if (!plan) {
		return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
	}

	// Get price ID from environment
	const priceId = plan.getPriceId();

	if (!priceId) {
		console.error(
			`Missing STRIPE_PRICE_${planId.toUpperCase()} environment variable`,
		);
		return NextResponse.json({ error: "Plan not configured" }, { status: 500 });
	}

	const stripe = getStripe();

	// Get or create Stripe customer
	const customer = await getOrCreateCustomer(session.user.email, {
		userId: session.user.id,
		companyId,
	});

	// Create checkout session
	const checkoutSession = await stripe.checkout.sessions.create({
		mode: "subscription",
		customer: customer.id,
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		subscription_data: {
			trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
			metadata: {
				companyId,
				planId,
			},
		},
		metadata: {
			companyId,
			userId: session.user.id,
			planId,
		},
		success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?success=true`,
		cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?cancelled=true`,
		// Allow promotion codes
		allow_promotion_codes: true,
		// Collect billing address for tax purposes
		billing_address_collection: "auto",
		// Enable automatic tax if configured
		automatic_tax: { enabled: false },
	});

	return NextResponse.json({ url: checkoutSession.url });
}
