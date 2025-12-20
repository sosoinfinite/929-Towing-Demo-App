import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { handleInboundSMS } from "@/lib/dispatch-agent";

// Twilio SMS Webhook - handles incoming SMS messages
export async function POST(request: NextRequest) {
	const formData = await request.formData();

	// Twilio sends data as form-urlencoded
	const messageSid = formData.get("MessageSid") as string;
	const from = formData.get("From") as string;
	const to = formData.get("To") as string;
	const body = formData.get("Body") as string;

	const pool = getPool();

	console.log(`Inbound SMS from ${from} to ${to}: ${body}`);

	// Find the company by the Twilio phone number
	const companyResult = await pool.query(
		"SELECT id, name, dispatch_active FROM company WHERE twilio_phone = $1",
		[to],
	);

	const company = companyResult.rows[0];

	if (!company) {
		console.warn(`No company found for Twilio number: ${to}`);
		// Return empty TwiML - no response
		return new NextResponse(
			'<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
			{ headers: { "Content-Type": "application/xml" } },
		);
	}

	// Generate thread ID based on phone number (for grouping conversations)
	const normalizedPhone = from.replace(/\D/g, "").slice(-10);
	const threadId = `thread_${company.id}_${normalizedPhone}`;

	// Store the inbound message
	const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

	try {
		await pool.query(
			`INSERT INTO message (id, company_id, thread_id, direction, channel, from_address, to_address, content, external_id, created_at)
       VALUES ($1, $2, $3, 'inbound', 'sms', $4, $5, $6, $7, NOW())`,
			[messageId, company.id, threadId, from, to, body, messageSid],
		);
	} catch (error) {
		console.error("Error storing inbound SMS:", error);
	}

	// Process with AI agent
	let responseText = "";

	try {
		const result = await handleInboundSMS({ from, to, body }, company.id);

		// The AI agent may have already sent responses via sendNotification tool
		// but we can also use the result.text for additional context
		console.log(`SMS AI result:`, result.text);
		console.log(`SMS AI steps:`, result.steps.length);

		// Check if the AI sent a response via the tool
		// If not, we might want to send a default response
		const sentNotification = result.steps.some((step) =>
			step.toolCalls?.some((tc) => {
				if (tc.toolName !== "sendNotification") return false;
				const input = tc.input as { to?: string } | undefined;
				return input?.to === from;
			}),
		);

		if (!sentNotification && result.text) {
			// AI didn't send via tool, use the text response
			responseText = result.text.slice(0, 160); // Keep under SMS limit
		}
	} catch (error) {
		console.error("Error processing SMS with AI:", error);
		// Send a fallback response
		responseText =
			"Thanks for your message. A dispatcher will get back to you shortly.";
	}

	// Return TwiML response
	// Note: The AI agent's sendNotification tool sends SMS directly via Twilio API
	// This TwiML response is an alternative way to reply (immediate response)
	if (responseText) {
		const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(responseText)}</Message>
</Response>`;

		// Store the outbound message
		const outboundId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		try {
			await pool.query(
				`INSERT INTO message (id, company_id, thread_id, direction, channel, from_address, to_address, content, actor_type, created_at)
         VALUES ($1, $2, $3, 'outbound', 'sms', $4, $5, $6, 'system', NOW())`,
				[outboundId, company.id, threadId, to, from, responseText],
			);
		} catch (error) {
			console.error("Error storing outbound SMS:", error);
		}

		return new NextResponse(twiml, {
			headers: { "Content-Type": "application/xml" },
		});
	}

	// No response needed (AI already responded via tool or no response required)
	return new NextResponse(
		'<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
		{ headers: { "Content-Type": "application/xml" } },
	);
}

// Helper to escape XML special characters
function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}
