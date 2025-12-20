/**
 * Setup Stripe products and prices for tow.center
 * Run with: bun scripts/setup-stripe.ts
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is required");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
	{
		id: "alpha",
		name: "Alpha",
		description: "Early adopter plan with 3 months free trial",
		price: 4900, // $49/month
		trialDays: 90,
		features: [
			"500 AI minutes/month",
			"Dedicated phone number",
			"SMS notifications",
			"Dashboard access",
		],
	},
	{
		id: "starter",
		name: "Starter",
		description: "For growing towing businesses",
		price: 9900, // $99/month
		trialDays: 0,
		features: [
			"500 AI minutes/month",
			"Dedicated phone number",
			"30-day call recording",
			"Priority support",
		],
	},
	{
		id: "pro",
		name: "Pro",
		description: "For high-volume operations",
		price: 19900, // $199/month
		trialDays: 0,
		features: [
			"Unlimited AI minutes",
			"Dedicated phone number",
			"90-day call recording",
			"White-glove setup",
		],
	},
];

async function setup() {
	console.log("Setting up Stripe products and prices...\n");

	const priceIds: Record<string, string> = {};

	for (const plan of plans) {
		console.log(`Creating ${plan.name} plan...`);

		// Check if product already exists
		const existingProducts = await stripe.products.search({
			query: `metadata['plan_id']:'${plan.id}'`,
		});

		let product: Stripe.Product;

		if (existingProducts.data.length > 0) {
			product = existingProducts.data[0];
			console.log(`  Product exists: ${product.id}`);

			// Update product
			product = await stripe.products.update(product.id, {
				name: `tow.center ${plan.name}`,
				description: plan.description,
				metadata: {
					plan_id: plan.id,
					features: JSON.stringify(plan.features),
				},
			});
		} else {
			// Create product
			product = await stripe.products.create({
				name: `tow.center ${plan.name}`,
				description: plan.description,
				metadata: {
					plan_id: plan.id,
					features: JSON.stringify(plan.features),
				},
			});
			console.log(`  Created product: ${product.id}`);
		}

		// Check for existing active price
		const existingPrices = await stripe.prices.list({
			product: product.id,
			active: true,
		});

		let price: Stripe.Price;

		const matchingPrice = existingPrices.data.find(
			(p) =>
				p.unit_amount === plan.price &&
				p.recurring?.interval === "month" &&
				p.currency === "usd",
		);

		if (matchingPrice) {
			price = matchingPrice;
			console.log(`  Price exists: ${price.id}`);
		} else {
			// Create price
			price = await stripe.prices.create({
				product: product.id,
				unit_amount: plan.price,
				currency: "usd",
				recurring: { interval: "month" },
				metadata: {
					plan_id: plan.id,
					trial_days: String(plan.trialDays),
				},
			});
			console.log(`  Created price: ${price.id}`);
		}

		priceIds[plan.id] = price.id;
	}

	console.log("\n✓ Setup complete!\n");
	console.log("Add these to your .env.local:\n");
	console.log(`STRIPE_PRICE_ALPHA=${priceIds.alpha}`);
	console.log(`STRIPE_PRICE_STARTER=${priceIds.starter}`);
	console.log(`STRIPE_PRICE_PRO=${priceIds.pro}`);
}

setup().catch(console.error);
