import { Twilio, twiml } from "twilio";

// Lazy initialization to avoid errors during build
let _twilioClient: Twilio | null = null;

export function getTwilio(): Twilio {
	if (!_twilioClient) {
		const accountSid = process.env.TWILIO_ACCOUNT_SID;
		const authToken = process.env.TWILIO_AUTH_TOKEN;

		if (!accountSid || !authToken) {
			throw new Error(
				"TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required",
			);
		}

		_twilioClient = new Twilio(accountSid, authToken);
	}
	return _twilioClient;
}

// Generate TwiML for connecting to ElevenLabs
export function generateElevenLabsStreamTwiML(agentId: string): string {
	const response = new twiml.VoiceResponse();

	// Connect to ElevenLabs via WebSocket streaming
	const connect = response.connect();
	connect.stream({
		url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`,
	});

	return response.toString();
}

// Generate TwiML for voicemail
export function generateVoicemailTwiML(companyName: string): string {
	const response = new twiml.VoiceResponse();

	response.say(
		{ voice: "Polly.Matthew" },
		`Thank you for calling ${companyName}. We are currently unavailable. Please leave a message after the beep and we will get back to you as soon as possible.`,
	);

	response.record({
		maxLength: 120,
		transcribe: true,
		playBeep: true,
	});

	response.say(
		{ voice: "Polly.Matthew" },
		"We did not receive a recording. Goodbye.",
	);

	return response.toString();
}

// Send SMS notification
export async function sendSMS(
	to: string,
	message: string,
): Promise<{ success: boolean; sid?: string; error?: string }> {
	try {
		const twilio = getTwilio();
		const from = process.env.TWILIO_PHONE_NUMBER;

		if (!from) {
			throw new Error("TWILIO_PHONE_NUMBER environment variable is required");
		}

		const result = await twilio.messages.create({
			to,
			from,
			body: message,
		});

		return { success: true, sid: result.sid };
	} catch (error) {
		console.error("Failed to send SMS:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
