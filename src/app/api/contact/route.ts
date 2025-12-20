import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email, company, message } = body;

		if (!name || !email || !message) {
			return NextResponse.json(
				{ error: "Name, email, and message are required" },
				{ status: 400 },
			);
		}

		const pool = getPool();

		// Create lead directly
		const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const subject = `Contact Form: ${company ? `${company} - ` : ""}${name}`;

		await pool.query(
			`INSERT INTO lead (id, from_email, from_name, subject, body_preview, status, created_at)
			 VALUES ($1, $2, $3, $4, $5, 'new', NOW())`,
			[leadId, email, name, subject, message.slice(0, 500)],
		);

		// Store the message in lead_message for conversation history
		const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		await pool.query(
			`INSERT INTO lead_message (id, lead_id, direction, from_email, to_email, subject, body, created_at)
			 VALUES ($1, $2, 'inbound', $3, $4, $5, $6, NOW())`,
			[messageId, leadId, email, "hookups@tow.center", subject, message],
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Contact form error:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 },
		);
	}
}
