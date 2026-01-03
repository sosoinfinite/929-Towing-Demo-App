import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { FROM_EMAIL_SALES, getResend, REPLY_TO_SALES } from "@/lib/resend";

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!(await isAdmin(session.user.id))) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await request.json();
	const { to, subject, message } = body;

	if (!to || !message) {
		return NextResponse.json(
			{ error: "To and message are required" },
			{ status: 400 },
		);
	}

	const resend = getResend();

	try {
		const result = await resend.emails.send({
			from: FROM_EMAIL_SALES,
			to,
			subject: subject || "Message from tow.center",
			text: message,
			replyTo: REPLY_TO_SALES,
		});

		return NextResponse.json({
			success: true,
			emailId: result.data?.id,
		});
	} catch (error) {
		console.error("Error sending email:", error);
		return NextResponse.json(
			{ error: "Failed to send email" },
			{ status: 500 },
		);
	}
}
