import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// GET invoices from Stripe
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
		return NextResponse.json({ invoices: [] });
	}

	// Get subscription with Stripe customer ID
	const subResult = await pool.query(
		"SELECT stripe_customer_id FROM subscription WHERE company_id = $1",
		[companyId],
	);

	const stripeCustomerId = subResult.rows[0]?.stripe_customer_id;

	if (!stripeCustomerId) {
		return NextResponse.json({ invoices: [] });
	}

	try {
		const stripe = getStripe();

		// Fetch invoices from Stripe
		const invoices = await stripe.invoices.list({
			customer: stripeCustomerId,
			limit: 12, // Last 12 invoices
		});

		// Map to simplified format
		const formattedInvoices = invoices.data.map((invoice) => ({
			id: invoice.id,
			number: invoice.number,
			amount: invoice.amount_paid,
			currency: invoice.currency,
			status: invoice.status,
			date: invoice.created,
			pdfUrl: invoice.invoice_pdf,
			hostedUrl: invoice.hosted_invoice_url,
		}));

		return NextResponse.json({ invoices: formattedInvoices });
	} catch (error) {
		console.error("Failed to fetch invoices:", error);
		return NextResponse.json({ invoices: [] });
	}
}
