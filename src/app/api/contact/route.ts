import { type NextRequest, NextResponse } from "next/server";
import { FROM_EMAIL, getResend } from "@/lib/email";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email, company, message } = body;

		if (!name || !email || !message) {
			return NextResponse.json(
				{ error: "Name, email, and message are required" },
				{ status: 400 },
			);
		}

		const resend = getResend();

		// Send notification email to support
		await resend.emails.send({
			from: FROM_EMAIL,
			to: "hookups@tow.center",
			replyTo: email,
			subject: `Contact Form: ${company ? `${company} - ` : ""}${name}`,
			html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #111; margin-bottom: 20px;">New Contact Form Submission</h2>

  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 120px;">Name:</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Email:</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
        <a href="mailto:${escapeHtml(email)}" style="color: #0066cc;">${escapeHtml(email)}</a>
      </td>
    </tr>
    ${
			company
				? `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">Company:</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${escapeHtml(company)}</td>
    </tr>
    `
				: ""
		}
  </table>

  <h3 style="color: #111; margin-top: 24px; margin-bottom: 12px;">Message:</h3>
  <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(message)}</div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <p style="font-size: 12px; color: #666;">
    This message was sent from the tow.center contact form.<br>
    Reply directly to this email to respond to ${escapeHtml(name)}.
  </p>
</body>
</html>
			`,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Contact form error:", error);
		return NextResponse.json(
			{ error: "Failed to send message" },
			{ status: 500 },
		);
	}
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
