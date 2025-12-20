import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { sendSMS } from "@/lib/twilio";

// Assign a driver to a job
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

	// Get user's company
	const userResult = await pool.query(
		'SELECT company_id FROM "user" WHERE id = $1',
		[session.user.id],
	);

	const companyId = userResult.rows[0]?.company_id;

	if (!companyId) {
		return NextResponse.json({ error: "No company found" }, { status: 404 });
	}

	try {
		const body = await request.json();
		const { driver_id, notify = true } = body;

		if (!driver_id) {
			return NextResponse.json(
				{ error: "driver_id is required" },
				{ status: 400 },
			);
		}

		// Verify driver belongs to company
		const driverResult = await pool.query(
			`SELECT dp.id, dp.phone, u.id as user_id, u.name
			 FROM driver_profile dp
			 JOIN "user" u ON u.id = dp.user_id
			 WHERE dp.user_id = $1 AND dp.company_id = $2`,
			[driver_id, companyId],
		);

		if (driverResult.rows.length === 0) {
			return NextResponse.json({ error: "Driver not found" }, { status: 404 });
		}

		const driver = driverResult.rows[0];

		// Get job and verify it belongs to company
		const jobResult = await pool.query(
			`SELECT id, customer_name, customer_phone, service_type, pickup_location, dropoff_location
			 FROM job WHERE id = $1 AND company_id = $2`,
			[id, companyId],
		);

		if (jobResult.rows.length === 0) {
			return NextResponse.json({ error: "Job not found" }, { status: 404 });
		}

		const job = jobResult.rows[0];

		// Update job with assignment
		await pool.query(
			`UPDATE job SET assigned_driver_id = $1, assigned_at = NOW(), status = 'assigned', updated_at = NOW()
			 WHERE id = $2 AND company_id = $3`,
			[driver_id, id, companyId],
		);

		// Notify driver via SMS if requested
		if (notify && driver.phone) {
			const message = `New job assigned: ${job.service_type || "Service"} at ${job.pickup_location}${job.dropoff_location ? ` → ${job.dropoff_location}` : ""}. Customer: ${job.customer_name || "N/A"} ${job.customer_phone || ""}. Reply OTW when en route.`;

			const smsResult = await sendSMS(driver.phone, message);

			if (smsResult.success) {
				// Store the notification message
				const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
				const normalizedPhone = driver.phone.replace(/\D/g, "").slice(-10);
				const threadId = `thread_${companyId}_${normalizedPhone}`;

				await pool.query(
					`INSERT INTO message (id, company_id, job_id, thread_id, direction, channel,
					                      from_address, to_address, content, actor_type, created_at)
					 VALUES ($1, $2, $3, $4, 'outbound', 'sms', 'system', $5, $6, 'system', NOW())`,
					[messageId, companyId, id, threadId, driver.phone, message],
				);
			}
		}

		return NextResponse.json({
			success: true,
			job_id: id,
			driver: {
				id: driver.user_id,
				name: driver.name,
				phone: driver.phone,
			},
		});
	} catch (error) {
		console.error("Failed to assign driver:", error);
		return NextResponse.json(
			{ error: "Failed to assign driver" },
			{ status: 500 },
		);
	}
}
