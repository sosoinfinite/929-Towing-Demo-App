import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { FROM_EMAIL_SALES, getResend, REPLY_TO_SALES } from "@/lib/resend";

// Get messages for a lead
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const pool = getPool();

	const result = await pool.query(
		`SELECT * FROM lead_message WHERE lead_id = $1 ORDER BY created_at ASC`,
		[id],
	);

	return NextResponse.json({ messages: result.rows });
}

// Send a reply to a lead
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const body = await request.json();
	const { subject, message } = body;

	if (!message) {
		return NextResponse.json({ error: "Message required" }, { status: 400 });
	}

	const pool = getPool();

	// Get the lead
	const leadResult = await pool.query(`SELECT * FROM lead WHERE id = $1`, [id]);
	const lead = leadResult.rows[0];

	if (!lead) {
		return NextResponse.json({ error: "Lead not found" }, { status: 404 });
	}

	// Send email via Resend
	const resend = getResend();
	const emailSubject = subject || `Re: ${lead.subject || "Your inquiry"}`;

	try {
		const emailResult = await resend.emails.send({
			from: FROM_EMAIL_SALES,
			to: lead.from_email,
			subject: emailSubject,
			text: message,
			replyTo: REPLY_TO_SALES,
		});

		// Store the sent message
		const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		await pool.query(
			`INSERT INTO lead_message (id, lead_id, direction, from_email, to_email, subject, body, resend_id, created_at)
			 VALUES ($1, $2, 'outbound', $3, $4, $5, $6, $7, NOW())`,
			[
				messageId,
				id,
				"hookups@tow.center",
				lead.from_email,
				emailSubject,
				message,
				emailResult.data?.id || null,
			],
		);

		// Update lead status to contacted if it was new
		if (lead.status === "new") {
			await pool.query(
				`UPDATE lead SET status = 'contacted', updated_at = NOW() WHERE id = $1`,
				[id],
			);
		}

		return NextResponse.json({
			success: true,
			messageId,
			resendId: emailResult.data?.id,
		});
	} catch (error) {
		console.error("Error sending email:", error);
		return NextResponse.json(
			{ error: "Failed to send email" },
			{ status: 500 },
		);
	}
}
