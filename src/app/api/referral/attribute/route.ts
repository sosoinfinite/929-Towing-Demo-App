import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { attributeSignup } from "@/lib/referral";

// Attribute a signup to a referral code (requires auth)
export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { code } = body;

	if (!code) {
		return NextResponse.json(
			{ success: false, error: "Code is required" },
			{ status: 400 },
		);
	}

	const result = await attributeSignup(session.user.id, code);

	if (!result.success) {
		return NextResponse.json(
			{ success: false, error: result.error },
			{ status: 400 },
		);
	}

	return NextResponse.json({
		success: true,
		referralId: result.referralId,
	});
}
