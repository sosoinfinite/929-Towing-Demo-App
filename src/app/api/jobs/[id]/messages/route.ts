import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { sendSMS } from "@/lib/twilio";

// Get messages for a job
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

	const { id } = await params;
	const pool = getPool();

	// Get user's company
	const userResult = await pool.query(
		'SELECT company_id FROM "user" WHERE id = $1',
		[session.user.id],
	);

	const companyId = userResult.rows[0]?.company_id;

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	// Verify job belongs to company
	const jobResult = await pool.query(
		"SELECT id, customer_phone FROM job WHERE id = $1 AND company_id = $2",
		[id, companyId],
	);

	if (jobResult.rows.length === 0) {
		return NextResponse.json({ error: "Job not found" }, { status: 404 });
	}

	// Get messages for this job
	const messagesResult = await pool.query(
		`SELECT m.id, m.direction, m.channel, m.from_address, m.to_address,
		        m.subject, m.content, m.actor_type, m.created_at,
		        u.name as actor_name
		 FROM message m
		 LEFT JOIN "user" u ON u.id = m.actor_user_id
		 WHERE m.job_id = $1
		 ORDER BY m.created_at ASC`,
		[id],
	);

	return NextResponse.json({ messages: messagesResult.rows });
}

// Send a message for a job
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

	const { id } = await params;
	const pool = getPool();

	// Get user's company with Twilio phone
	const userResult = await pool.query(
		`SELECT u.company_id, c.twilio_phone
		 FROM "user" u
		 JOIN company c ON c.id = u.company_id
		 WHERE u.id = $1`,
		[session.user.id],
	);

	const { company_id: companyId, twilio_phone: twilioPhone } =
		userResult.rows[0] || {};

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	// Get job details
	const jobResult = await pool.query(
		"SELECT id, customer_phone, thread_id FROM job WHERE id = $1 AND company_id = $2",
		[id, companyId],
	);

	if (jobResult.rows.length === 0) {
		return NextResponse.json({ error: "Job not found" }, { status: 404 });
	}

	const job = jobResult.rows[0];

	try {
		const body = await request.json();
		const { content, channel = "sms", to } = body;

		if (!content) {
			return NextResponse.json(
				{ error: "Message content is required" },
				{ status: 400 },
			);
		}

		const recipient = to || job.customer_phone;

		if (!recipient) {
			return NextResponse.json(
				{ error: "No recipient phone number" },
				{ status: 400 },
			);
		}

		// Send SMS
		let externalId: string | null = null;
		if (channel === "sms") {
			const smsResult = await sendSMS(recipient, content);
			if (!smsResult.success) {
				return NextResponse.json(
					{ error: smsResult.error || "Failed to send SMS" },
					{ status: 500 },
				);
			}
			externalId = smsResult.sid || null;
		}

		// Store the message
		const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

		// Generate thread ID if not exists
		const normalizedPhone = recipient.replace(/\D/g, "").slice(-10);
		const threadId = job.thread_id || `thread_${companyId}_${normalizedPhone}`;

		await pool.query(
			`INSERT INTO message (id, company_id, job_id, thread_id, direction, channel,
			                      from_address, to_address, content, actor_type, actor_user_id,
			                      external_id, created_at)
			 VALUES ($1, $2, $3, $4, 'outbound', $5, $6, $7, $8, 'dispatcher', $9, $10, NOW())`,
			[
				messageId,
				companyId,
				id,
				threadId,
				channel,
				twilioPhone || "system",
				recipient,
				content,
				session.user.id,
				externalId,
			],
		);

		return NextResponse.json({
			success: true,
			messageId,
			externalId,
		});
	} catch (error) {
		console.error("Failed to send message:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 },
		);
	}
}
