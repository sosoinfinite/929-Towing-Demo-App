import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPool } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

type StripeSubscription = Stripe.Subscription;

export async function POST(request: NextRequest) {
	const body = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}

	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		console.error("STRIPE_WEBHOOK_SECRET not configured");
		return NextResponse.json(
			{ error: "Webhook not configured" },
			{ status: 500 },
		);
	}

	const stripe = getStripe();
	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		console.error("Webhook signature verification failed:", err);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	const pool = getPool();

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			const companyId = session.metadata?.companyId;
			const planId = session.metadata?.planId || "alpha";

			if (companyId && session.subscription) {
				// Create or update subscription record
				await pool.query(
					`INSERT INTO subscription (id, company_id, stripe_customer_id, stripe_subscription_id, plan, status)
					 VALUES ($1, $2, $3, $4, $5, 'active')
					 ON CONFLICT (company_id) DO UPDATE SET
					   stripe_customer_id = $3,
					   stripe_subscription_id = $4,
					   plan = $5,
					   status = 'active',
					   updated_at = NOW()`,
					[
						crypto.randomUUID(),
						companyId,
						session.customer as string,
						session.subscription as string,
						planId,
					],
				);
			}
			break;
		}

		case "customer.subscription.updated": {
			const subscription = event.data.object as StripeSubscription;
			const status = subscription.status;

			// Note: current_period_end is now on subscription items, not subscription
			await pool.query(
				`UPDATE subscription
				 SET status = $1,
				     updated_at = NOW()
				 WHERE stripe_subscription_id = $2`,
				[
					status === "active" || status === "trialing" ? "active" : status,
					subscription.id,
				],
			);
			break;
		}

		case "customer.subscription.deleted": {
			const subscription = event.data.object as StripeSubscription;

			await pool.query(
				`UPDATE subscription
				 SET status = 'cancelled',
				     updated_at = NOW()
				 WHERE stripe_subscription_id = $1`,
				[subscription.id],
			);
			break;
		}
	}

	return NextResponse.json({ received: true });
}
