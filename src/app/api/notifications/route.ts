import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { updateContactTopics } from "@/lib/resend";

type JobUpdatesChannel = "email" | "sms" | "both" | "none";

interface NotificationPreferences {
	emailNewCalls: boolean;
	emailMissedCalls: boolean;
	emailWeeklySummary: boolean;
	smsNewCalls: boolean;
	smsMissedCalls: boolean;
	jobUpdatesChannel: JobUpdatesChannel;
}

// GET notification preferences
export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const pool = getPool();

	// Try to get existing preferences
	const result = await pool.query(
		`SELECT
			email_new_calls as "emailNewCalls",
			email_missed_calls as "emailMissedCalls",
			email_weekly_summary as "emailWeeklySummary",
			sms_new_calls as "smsNewCalls",
			sms_missed_calls as "smsMissedCalls",
			job_updates_channel as "jobUpdatesChannel"
		FROM notification_preferences
		WHERE user_id = $1`,
		[session.user.id],
	);

	if (result.rows.length === 0) {
		// Return defaults if no preferences exist
		return NextResponse.json({
			emailNewCalls: true,
			emailMissedCalls: true,
			emailWeeklySummary: false,
			smsNewCalls: false,
			smsMissedCalls: true,
			jobUpdatesChannel: "sms",
		});
	}

	return NextResponse.json(result.rows[0]);
}

// PUT/update notification preferences
export async function PUT(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = (await request.json()) as NotificationPreferences;
	const pool = getPool();

	const jobUpdatesChannel = body.jobUpdatesChannel ?? "sms";

	// Upsert preferences
	await pool.query(
		`INSERT INTO notification_preferences (
			id, user_id, email_new_calls, email_missed_calls, email_weekly_summary, sms_new_calls, sms_missed_calls, job_updates_channel, updated_at
		) VALUES (
			gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW()
		)
		ON CONFLICT (user_id) DO UPDATE SET
			email_new_calls = $2,
			email_missed_calls = $3,
			email_weekly_summary = $4,
			sms_new_calls = $5,
			sms_missed_calls = $6,
			job_updates_channel = $7,
			updated_at = NOW()`,
		[
			session.user.id,
			body.emailNewCalls ?? true,
			body.emailMissedCalls ?? true,
			body.emailWeeklySummary ?? false,
			body.smsNewCalls ?? false,
			body.smsMissedCalls ?? true,
			jobUpdatesChannel,
		],
	);

	// Sync job updates preference to Resend topics
	// If channel includes email, opt-in to job-updates topic; otherwise opt-out
	const wantsJobEmails =
		jobUpdatesChannel === "email" || jobUpdatesChannel === "both";
	const wantsWeeklyDigest = body.emailWeeklySummary ?? false;

	updateContactTopics(session.user.email, {
		jobUpdates: wantsJobEmails,
		weeklyDigest: wantsWeeklyDigest,
	}).catch((err) => {
		console.error("[Notifications] Failed to sync Resend topics:", err);
	});

	return NextResponse.json({ success: true });
}
