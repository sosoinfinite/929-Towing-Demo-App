import { type NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/referral";

// Track a referral link click (public endpoint)
export async function POST(request: NextRequest) {
	const body = await request.json();
	const { code } = body;

	if (!code) {
		return NextResponse.json(
			{ success: false, error: "Code is required" },
			{ status: 400 },
		);
	}

	const result = await trackClick(code);

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
