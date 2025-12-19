import { Resend } from "resend";

// Resend is initialized lazily to avoid build errors when API key is missing
let _resend: Resend | null = null;

export function getResend(): Resend {
	if (!_resend) {
		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) {
			throw new Error("RESEND_API_KEY environment variable is required");
		}
		_resend = new Resend(apiKey);
	}
	return _resend;
}

export const FROM_EMAIL = "tow.center <noreply@tow.center>";
