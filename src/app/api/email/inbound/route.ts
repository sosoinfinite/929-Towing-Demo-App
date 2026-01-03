import { type NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getPool } from "@/lib/db";
import { parseDispatchEmail } from "@/lib/dispatch-agent";
import {
	addContactToSegment,
	createContact,
	SEGMENT_LEADS,
} from "@/lib/resend";

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
	const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

	if (!webhookSecret) {
		console.error("RESEND_WEBHOOK_SECRET not configured");
		return NextResponse.json(
			{ error: "Webhook not configured" },
			{ status: 500 },
		);
	}

	// Get raw body for signature verification (must be string, not parsed JSON)
	const body = await request.text();

	// Verify signature using Svix
	const svixHeaders = {
		"svix-id": request.headers.get("svix-id") || "",
		"svix-timestamp": request.headers.get("svix-timestamp") || "",
		"svix-signature": request.headers.get("svix-signature") || "",
	};

	let event: ResendEmailReceivedEvent;
	try {
		const wh = new Webhook(webhookSecret);
		event = wh.verify(body, svixHeaders) as ResendEmailReceivedEvent;
	} catch (error) {
		console.error("Invalid webhook signature:", error);
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
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
		} else if (toAddress.toLowerCase().includes("hookups@")) {
			// Sales lead email - create a lead record
			console.log(
				`Sales lead email received from ${data.from}: ${data.subject}`,
			);

			try {
				const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

				// Extract name from email address if possible (e.g., "John Doe <john@example.com>")
				const fromMatch = data.from.match(/^(.+?)\s*<(.+)>$/);
				const fromName = fromMatch ? fromMatch[1].trim() : null;
				const fromEmail = fromMatch ? fromMatch[2] : data.from;

				// Create body preview (first 500 chars)
				const bodyPreview = (data.text || data.html || "").slice(0, 500);

				await pool.query(
					`INSERT INTO lead (id, email_id, from_email, from_name, subject, body_preview, status, created_at)
					 VALUES ($1, $2, $3, $4, $5, $6, 'new', NOW())`,
					[leadId, emailId, fromEmail, fromName, data.subject, bodyPreview],
				);

				// Store the inbound email as a lead_message for conversation history
				const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
				await pool.query(
					`INSERT INTO lead_message (id, lead_id, direction, from_email, to_email, subject, body, created_at)
					 VALUES ($1, $2, 'inbound', $3, $4, $5, $6, NOW())`,
					[
						messageId,
						leadId,
						fromEmail,
						toAddress,
						data.subject || "(no subject)",
						data.text || data.html || "",
					],
				);

				// Mark email as processed
				await pool.query(
					"UPDATE inbound_email SET processed = true WHERE id = $1",
					[emailId],
				);

				// Create Resend contact for the lead
				createContact({
					email: fromEmail,
					firstName: fromName?.split(" ")[0],
					lastName: fromName?.split(" ").slice(1).join(" "),
					role: "customer",
					source: "lead",
					subscribeToJobUpdates: false,
					subscribeToMarketing: false, // Opt-out by default for leads
				})
					.then(({ exists }) => {
						if (exists && SEGMENT_LEADS) {
							// Contact exists, make sure they're in the leads segment
							addContactToSegment(fromEmail, SEGMENT_LEADS);
						}
					})
					.catch((err) => {
						console.error("[Resend] Failed to create lead contact:", err);
					});

				console.log(`Created sales lead: ${leadId} with message: ${messageId}`);
			} catch (leadError) {
				console.error("Error creating sales lead:", leadError);
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
