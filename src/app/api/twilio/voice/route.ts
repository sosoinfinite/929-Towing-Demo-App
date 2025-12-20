import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// Twilio Voice Webhook - handles incoming calls
export async function POST(request: NextRequest) {
	const formData = await request.formData();

	// Twilio sends data as form-urlencoded
	const callSid = formData.get("CallSid") as string;
	const from = formData.get("From") as string;
	const to = formData.get("To") as string;
	const callStatus = formData.get("CallStatus") as string;

	const pool = getPool();

	// Find the company by the Twilio phone number being called
	const companyResult = await pool.query(
		"SELECT id, name, dispatch_active FROM company WHERE twilio_phone = $1",
		[to],
	);

	const company = companyResult.rows[0];

	if (!company) {
		// No company found for this number - return basic voicemail
		const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, this number is not currently in service. Please try again later.</Say>
  <Hangup/>
</Response>`;

		return new NextResponse(twiml, {
			headers: { "Content-Type": "application/xml" },
		});
	}

	// Log the incoming call
	const callId = crypto.randomUUID();
	await pool.query(
		`INSERT INTO call (id, company_id, twilio_call_sid, caller_number, status, ai_handled, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
		[callId, company.id, callSid, from, callStatus, company.dispatch_active],
	);

	if (!company.dispatch_active) {
		// Dispatch is off - send to voicemail
		const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling ${company.name}. We're currently unavailable. Please leave a message after the beep and we'll get back to you as soon as possible.</Say>
  <Record maxLength="120" action="/api/twilio/recording?callId=${callId}" transcribe="true" transcribeCallback="/api/twilio/transcription?callId=${callId}"/>
  <Say voice="alice">We did not receive a recording. Goodbye.</Say>
</Response>`;

		return new NextResponse(twiml, {
			headers: { "Content-Type": "application/xml" },
		});
	}

	// Dispatch is active - connect to ElevenLabs AI agent
	const elevenLabsAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

	if (!elevenLabsAgentId) {
		// Fallback if no agent configured
		const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling ${company.name}. Our AI dispatcher is currently being configured. Please call back shortly.</Say>
  <Hangup/>
</Response>`;

		return new NextResponse(twiml, {
			headers: { "Content-Type": "application/xml" },
		});
	}

	// Connect to ElevenLabs Conversational AI via WebSocket stream
	const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${elevenLabsAgentId}">
      <Parameter name="caller_number" value="${from}"/>
      <Parameter name="company_name" value="${company.name}"/>
      <Parameter name="call_id" value="${callId}"/>
    </Stream>
  </Connect>
</Response>`;

	return new NextResponse(twiml, {
		headers: { "Content-Type": "application/xml" },
	});
}
