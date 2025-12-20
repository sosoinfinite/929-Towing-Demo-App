import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Twilio Transcription Callback - called when voicemail transcription is ready
export async function POST(request: NextRequest) {
	const formData = await request.formData();
	const url = new URL(request.url);
	const callId = url.searchParams.get("callId");

	const transcriptionText = formData.get("TranscriptionText") as string;
	const transcriptionStatus = formData.get("TranscriptionStatus") as string;

	if (!callId) {
		return NextResponse.json({ error: "Missing callId" }, { status: 400 });
	}

	// Only update if transcription was successful
	if (transcriptionStatus === "completed" && transcriptionText) {
		const pool = getPool();

		await pool.query(
			`UPDATE call SET
				transcript = $1,
				updated_at = NOW()
			WHERE id = $2`,
			[transcriptionText, callId],
		);
	}

	return NextResponse.json({ success: true });
}
