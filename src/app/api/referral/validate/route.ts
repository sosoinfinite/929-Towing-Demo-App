import { type NextRequest, NextResponse } from "next/server";
import { validateCode } from "@/lib/referral";

// Validate a referral code (public endpoint)
export async function GET(request: NextRequest) {
	const code = request.nextUrl.searchParams.get("code");

	if (!code) {
		return NextResponse.json(
			{ valid: false, error: "Code is required" },
			{ status: 400 },
		);
	}

	const result = await validateCode(code);

	if (!result.valid) {
		return NextResponse.json(
			{ valid: false, error: result.error },
			{ status: 404 },
		);
	}

	// Return minimal info for privacy
	return NextResponse.json({
		valid: true,
		referrerName: result.referrerName,
		code: result.referralCode.code,
	});
}
