import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getStripe, PLANS, type PlanId } from "@/lib/stripe";

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

	const stripe = getStripe();

	// Check if price exists, create if not
	let priceId = process.env.STRIPE_PRICE_ID;

	if (!priceId) {
		// Create a product and price on the fly (for development)
		const product = await stripe.products.create({
			name: `tow.center ${plan.name} Plan`,
			description: plan.features.join(", "),
		});

		const price = await stripe.prices.create({
			product: product.id,
			unit_amount: plan.price,
			currency: "usd",
			recurring: { interval: "month" },
		});

		priceId = price.id;
	}

	// Create checkout session
	const checkoutSession = await stripe.checkout.sessions.create({
		mode: "subscription",
		payment_method_types: ["card"],
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
		customer_email: session.user.email,
		metadata: {
			companyId,
			userId: session.user.id,
			planId,
		},
		success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?billing=success`,
		cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?billing=cancelled`,
	});

	return NextResponse.json({ url: checkoutSession.url });
}
