import Stripe from "stripe";

// Lazy initialization to avoid errors during build
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
	if (!_stripe) {
		if (!process.env.STRIPE_SECRET_KEY) {
			throw new Error("STRIPE_SECRET_KEY environment variable is required");
		}
		_stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
	}
	return _stripe;
}

// Plan configuration with Stripe price IDs
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
		getPriceId: () => process.env.STRIPE_PRICE_ALPHA,
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
		getPriceId: () => process.env.STRIPE_PRICE_STARTER,
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
		getPriceId: () => process.env.STRIPE_PRICE_PRO,
	},
} as const;

export type PlanId = keyof typeof PLANS;

// Create a Stripe Customer Portal session
export async function createPortalSession(
	customerId: string,
	returnUrl: string,
) {
	const stripe = getStripe();
	const session = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: returnUrl,
	});
	return session;
}

// Get or create a Stripe customer for a user
export async function getOrCreateCustomer(
	email: string,
	metadata?: { userId?: string; companyId?: string },
) {
	const stripe = getStripe();

	// Search for existing customer
	const customers = await stripe.customers.list({
		email,
		limit: 1,
	});

	if (customers.data.length > 0) {
		return customers.data[0];
	}

	// Create new customer
	return stripe.customers.create({
		email,
		metadata: metadata || {},
	});
}
