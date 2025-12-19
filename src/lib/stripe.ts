import Stripe from "stripe";

// Lazy initialization to avoid errors during build
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
	if (!_stripe) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("STRIPE_SECRET_KEY environment variable is required");
		}
		_stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
			apiVersion: "2025-12-15.clover",
		});
	}
	return _stripe;
}

// Plan pricing
export const PLANS = {
	alpha: {
		name: "Alpha",
		price: 4900, // $49/mo in cents
		trialDays: 90, // 3 months free
		features: [
			"500 AI minutes/month",
			"Dedicated phone number",
			"SMS notifications",
			"Dashboard access",
		],
	},
	starter: {
		name: "Starter",
		price: 9900, // $99/mo
		trialDays: 0,
		features: [
			"500 AI minutes/month",
			"Dedicated phone number",
			"30-day call recording",
			"Priority support",
		],
	},
	pro: {
		name: "Pro",
		price: 19900, // $199/mo
		trialDays: 0,
		features: [
			"Unlimited AI minutes",
			"Dedicated phone number",
			"90-day call recording",
			"White-glove setup",
		],
	},
} as const;

export type PlanId = keyof typeof PLANS;
