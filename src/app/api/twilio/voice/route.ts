import { type NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import {
	generateElevenLabsStreamTwiML,
	generateVoicemailTwiML,
} from "@/lib/twilio";

// Twilio incoming voice webhook
export async function POST(request: NextRequest) {
	const formData = await request.formData();
	const calledNumber = formData.get("Called") as string;
	const callerNumber = formData.get("From") as string;
	const callSid = formData.get("CallSid") as string;

	const pool = getPool();

	// Find company by Twilio phone number
	const companyResult = await pool.query(
		`SELECT c.id, c.name, c.dispatch_active, c.phone, ac.elevenlabs_agent_id
		 FROM company c
		 LEFT JOIN agent_config ac ON ac.company_id = c.id
		 WHERE c.twilio_phone = $1`,
		[calledNumber],
	);

	const company = companyResult.rows[0];

	// If no company found, use default voicemail
	if (!company) {
		console.warn(`No company found for Twilio number: ${calledNumber}`);
		return new NextResponse(generateVoicemailTwiML("this business"), {
			headers: { "Content-Type": "application/xml" },
		});
	}

	// Log the incoming call
	await pool.query(
		`INSERT INTO call (id, company_id, twilio_call_sid, caller_number, status, ai_handled)
		 VALUES ($1, $2, $3, $4, 'in-progress', $5)`,
		[
			crypto.randomUUID(),
			company.id,
			callSid,
			callerNumber,
			company.dispatch_active,
		],
	);

	// If dispatch is off, send to voicemail
	if (!company.dispatch_active) {
		return new NextResponse(generateVoicemailTwiML(company.name), {
			headers: { "Content-Type": "application/xml" },
		});
	}

	// Get agent ID (use company's or fall back to default)
	const agentId =
		company.elevenlabs_agent_id || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

	if (!agentId) {
		console.error("No ElevenLabs agent ID configured");
		return new NextResponse(generateVoicemailTwiML(company.name), {
			headers: { "Content-Type": "application/xml" },
		});
	}

	// Connect to ElevenLabs AI
	const twiml = generateElevenLabsStreamTwiML(agentId);

	return new NextResponse(twiml, {
		headers: { "Content-Type": "application/xml" },
	});
}
