import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { sendSMS } from "@/lib/twilio";

// Twilio call status callback
// ElevenLabs handles call routing natively - this logs completed calls and sends SMS
export async function POST(request: NextRequest) {
	const formData = await request.formData();
	const callSid = formData.get("CallSid") as string;
	const callStatus = formData.get("CallStatus") as string;
	const callDuration = formData.get("CallDuration") as string;
	const callerNumber = formData.get("From") as string;
	const calledNumber = formData.get("To") as string;

	// Only process completed calls
	if (callStatus !== "completed") {
		return NextResponse.json({ received: true });
	}

	const pool = getPool();

	// Find company by Twilio phone number
	const companyResult = await pool.query(
		"SELECT id, name, phone, dispatch_active FROM company WHERE twilio_phone = $1",
		[calledNumber],
	);

	const company = companyResult.rows[0];

	if (!company) {
		console.warn(`No company found for Twilio number: ${calledNumber}`);
		return NextResponse.json({ received: true });
	}

	const duration = callDuration ? Number.parseInt(callDuration, 10) : 0;

	// Log the call
	await pool.query(
		`INSERT INTO call (id, company_id, twilio_call_sid, caller_number, status, duration, ai_handled)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 ON CONFLICT (twilio_call_sid) DO UPDATE SET
		   status = $5,
		   duration = $6`,
		[
			crypto.randomUUID(),
			company.id,
			callSid,
			callerNumber,
			callStatus,
			duration,
			company.dispatch_active, // AI handled if dispatch was active
		],
	);

	// Send SMS notification to company
	if (company.phone && company.dispatch_active) {
		const durationStr =
			duration > 0
				? `${Math.floor(duration / 60)}m ${duration % 60}s`
				: "unknown";

		const message = `[tow.center] New call completed!\n\nFrom: ${callerNumber}\nDuration: ${durationStr}\n\nCheck your dashboard for details.`;

		await sendSMS(company.phone, message);
	}

	return NextResponse.json({ received: true });
}
