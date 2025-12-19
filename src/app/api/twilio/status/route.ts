import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { sendSMS } from "@/lib/twilio";

// Twilio call status callback
export async function POST(request: NextRequest) {
	const formData = await request.formData();
	const callSid = formData.get("CallSid") as string;
	const callStatus = formData.get("CallStatus") as string;
	const callDuration = formData.get("CallDuration") as string;
	const callerNumber = formData.get("From") as string;

	const pool = getPool();

	// Update call record
	const callResult = await pool.query(
		`UPDATE call
		 SET status = $1,
		     duration = $2
		 WHERE twilio_call_sid = $3
		 RETURNING company_id, ai_handled`,
		[callStatus, callDuration ? Number.parseInt(callDuration, 10) : 0, callSid],
	);

	const call = callResult.rows[0];

	if (!call) {
		console.warn(`No call record found for CallSid: ${callSid}`);
		return NextResponse.json({ received: true });
	}

	// If call was completed and AI handled it, send SMS notification
	if (callStatus === "completed" && call.ai_handled) {
		// Get company phone number
		const companyResult = await pool.query(
			"SELECT name, phone FROM company WHERE id = $1",
			[call.company_id],
		);

		const company = companyResult.rows[0];

		if (company?.phone) {
			const duration = callDuration
				? `${Math.floor(Number.parseInt(callDuration, 10) / 60)}m ${Number.parseInt(callDuration, 10) % 60}s`
				: "unknown";

			const message = `[tow.center] New call received!\n\nFrom: ${callerNumber}\nDuration: ${duration}\n\nCheck your dashboard for details.`;

			await sendSMS(company.phone, message);
		}
	}

	return NextResponse.json({ received: true });
}
