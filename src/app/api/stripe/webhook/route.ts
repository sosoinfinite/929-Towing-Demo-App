import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPool } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

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

	try {
		switch (event.type) {
			// Checkout completed - create subscription record
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const companyId = session.metadata?.companyId;
				const planId = session.metadata?.planId || "alpha";

				if (companyId && session.subscription) {
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
					console.log(`Subscription created for company ${companyId}`);
				}
				break;
			}

			// Invoice paid - subscription is active
			case "invoice.paid": {
				const invoice = event.data.object as Stripe.Invoice;
				// Get subscription ID from parent.subscription_details (new API structure)
				const subscriptionDetails = invoice.parent?.subscription_details;
				const subscriptionId =
					typeof subscriptionDetails?.subscription === "string"
						? subscriptionDetails.subscription
						: subscriptionDetails?.subscription?.id;

				if (subscriptionId) {
					await pool.query(
						`UPDATE subscription
						 SET status = 'active',
						     updated_at = NOW()
						 WHERE stripe_subscription_id = $1`,
						[subscriptionId],
					);
					console.log(`Invoice paid for subscription ${subscriptionId}`);
				}
				break;
			}

			// Invoice payment failed
			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				// Get subscription ID from parent.subscription_details (new API structure)
				const subscriptionDetails = invoice.parent?.subscription_details;
				const subscriptionId =
					typeof subscriptionDetails?.subscription === "string"
						? subscriptionDetails.subscription
						: subscriptionDetails?.subscription?.id;

				if (subscriptionId) {
					await pool.query(
						`UPDATE subscription
						 SET status = 'past_due',
						     updated_at = NOW()
						 WHERE stripe_subscription_id = $1`,
						[subscriptionId],
					);
					console.log(`Payment failed for subscription ${subscriptionId}`);
					// TODO: Send email notification to customer
				}
				break;
			}

			// Subscription updated (plan change, status change, etc.)
			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				const status = subscription.status;

				// Map Stripe status to our status
				let dbStatus: string;
				switch (status) {
					case "active":
					case "trialing":
						dbStatus = "active";
						break;
					case "past_due":
						dbStatus = "past_due";
						break;
					case "canceled":
					case "unpaid":
						dbStatus = "cancelled";
						break;
					default:
						dbStatus = status;
				}

				// Get plan from price metadata if available
				const priceId = subscription.items.data[0]?.price.id;
				let planId: string | undefined;

				if (priceId) {
					const price = await stripe.prices.retrieve(priceId);
					planId = (price.metadata?.plan_id as string) || undefined;
				}

				await pool.query(
					`UPDATE subscription
					 SET status = $1,
					     ${planId ? "plan = $3," : ""}
					     updated_at = NOW()
					 WHERE stripe_subscription_id = $2`,
					planId
						? [dbStatus, subscription.id, planId]
						: [dbStatus, subscription.id],
				);
				console.log(`Subscription ${subscription.id} updated to ${dbStatus}`);
				break;
			}

			// Subscription cancelled
			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;

				await pool.query(
					`UPDATE subscription
					 SET status = 'cancelled',
					     updated_at = NOW()
					 WHERE stripe_subscription_id = $1`,
					[subscription.id],
				);
				console.log(`Subscription ${subscription.id} cancelled`);
				break;
			}

			// Customer updated (email change, etc.)
			case "customer.updated": {
				const customer = event.data.object as Stripe.Customer;
				// Could update user email if it changed
				console.log(`Customer ${customer.id} updated`);
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}
	} catch (error) {
		console.error(`Error processing webhook ${event.type}:`, error);
		// Return 200 to acknowledge receipt even if processing fails
		// This prevents Stripe from retrying immediately
	}

	return NextResponse.json({ received: true });
}
