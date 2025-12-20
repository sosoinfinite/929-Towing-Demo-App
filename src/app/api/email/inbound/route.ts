import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { parseDispatchEmail } from "@/lib/dispatch-agent";

// Resend webhook event types
interface ResendEmailReceivedEvent {
	type: "email.received";
	created_at: string;
	data: {
		email_id: string;
		from: string;
		to: string[];
		subject: string;
		text?: string;
		html?: string;
		attachments?: Array<{
			filename: string;
			content_type: string;
			size: number;
		}>;
	};
}

// Verify Resend webhook signature
function verifyResendSignature(
	payload: string,
	signature: string | null,
	secret: string,
): boolean {
	if (!signature) return false;

	// Resend uses Svix for webhooks - signature format: "v1,timestamp,signature"
	// For simplicity, we'll do a basic HMAC verification
	// In production, consider using the Svix SDK
	try {
		const parts = signature.split(",");
		if (parts.length < 2) return false;

		const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
		const sig = parts.find((p) => p.startsWith("v1="))?.slice(3);

		if (!timestamp || !sig) return false;

		// Check timestamp is within 5 minutes
		const timestampMs = Number.parseInt(timestamp, 10) * 1000;
		const now = Date.now();
		if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
			console.warn("Webhook timestamp too old");
			return false;
		}

		// Verify signature
		const signedPayload = `${timestamp}.${payload}`;
		const expectedSig = crypto
			.createHmac("sha256", secret)
			.update(signedPayload)
			.digest("base64");

		return crypto.timingSafeEqual(
			Buffer.from(sig, "base64"),
			Buffer.from(expectedSig, "base64"),
		);
	} catch (error) {
		console.error("Signature verification error:", error);
		return false;
	}
}

// Get company by email address pattern
async function getCompanyForEmail(toAddress: string): Promise<string | null> {
	// For now, we route dispatch@ emails to a default company
	// In production, you'd match against company.twilio_phone or a company email domain

	// Check if this is a dispatch email
	if (toAddress.toLowerCase().startsWith("dispatch@")) {
		// Get the first company (for MVP) or implement company-specific routing
		const pool = getPool();
		const result = await pool.query(
			"SELECT id FROM company ORDER BY created_at LIMIT 1",
		);
		return result.rows[0]?.id || null;
	}

	return null;
}

export async function POST(request: NextRequest) {
	const webhookSecret = process.env.RESEND_SIGNING_SECRET;

	if (!webhookSecret) {
		console.error("RESEND_SIGNING_SECRET not configured");
		return NextResponse.json(
			{ error: "Webhook not configured" },
			{ status: 500 },
		);
	}

	// Get raw body for signature verification
	const body = await request.text();
	const signature = request.headers.get("svix-signature");

	// Verify signature (relaxed for development - enable in production)
	const isValid =
		process.env.NODE_ENV === "development" ||
		verifyResendSignature(body, signature, webhookSecret);

	if (!isValid && process.env.NODE_ENV === "production") {
		console.error("Invalid webhook signature");
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	let event: ResendEmailReceivedEvent;
	try {
		event = JSON.parse(body);
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	// Only process email.received events
	if (event.type !== "email.received") {
		console.log(`Ignoring event type: ${event.type}`);
		return NextResponse.json({ received: true });
	}

	const { data } = event;
	const pool = getPool();

	try {
		// Store raw email
		const emailId = `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const toAddress = data.to[0] || "";

		await pool.query(
			`INSERT INTO inbound_email (id, resend_id, from_address, to_address, subject, text_body, html_body, processed, received_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())
       ON CONFLICT (resend_id) DO NOTHING`,
			[
				emailId,
				data.email_id,
				data.from,
				toAddress,
				data.subject,
				data.text || "",
				data.html || "",
			],
		);

		console.log(`Stored inbound email: ${emailId} from ${data.from}`);

		// Route based on destination address
		if (toAddress.toLowerCase().includes("dispatch@")) {
			// This is a dispatch email - process with AI
			const companyId = await getCompanyForEmail(toAddress);

			if (companyId) {
				console.log(`Processing dispatch email for company ${companyId}`);

				try {
					const result = await parseDispatchEmail(
						{
							from: data.from,
							subject: data.subject || "(no subject)",
							body: data.text || data.html || "",
						},
						companyId,
					);

					// Mark email as processed
					await pool.query(
						"UPDATE inbound_email SET processed = true WHERE id = $1",
						[emailId],
					);

					console.log(`Dispatch email processed:`, result.text);
				} catch (parseError) {
					console.error("Error parsing dispatch email:", parseError);
					// Don't fail the webhook - we stored the email for manual review
				}
			} else {
				console.warn("No company found for dispatch email routing");
			}
		} else if (toAddress.toLowerCase().includes("support@")) {
			// Support email - just log, don't auto-process
			console.log(`Support email received from ${data.from}: ${data.subject}`);
			// Could notify support team here
		} else {
			console.log(`Unknown email destination: ${toAddress}`);
		}
	} catch (error) {
		console.error("Error processing inbound email:", error);
		// Return 200 to acknowledge receipt even if processing fails
		// This prevents Resend from retrying
	}

	return NextResponse.json({ received: true });
}
