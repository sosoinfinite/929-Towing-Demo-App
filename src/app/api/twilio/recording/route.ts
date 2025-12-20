import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Twilio Recording Callback - called after voicemail recording completes
export async function POST(request: NextRequest) {
	const formData = await request.formData();
	const url = new URL(request.url);
	const callId = url.searchParams.get("callId");

	// Recording URL available via formData.get("RecordingUrl") if needed later
	const recordingDuration = formData.get("RecordingDuration") as string;

	if (!callId) {
		return NextResponse.json({ error: "Missing callId" }, { status: 400 });
	}

	const pool = getPool();

	// Update the call with recording info
	await pool.query(
		`UPDATE call SET
			status = 'voicemail',
			duration = $1,
			updated_at = NOW()
		WHERE id = $2`,
		[Number.parseInt(recordingDuration, 10) || 0, callId],
	);

	// Continue the call flow - hang up after recording
	const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for your message. Goodbye.</Say>
  <Hangup/>
</Response>`;

	return new NextResponse(twiml, {
		headers: { "Content-Type": "application/xml" },
	});
}
