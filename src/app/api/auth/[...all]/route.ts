import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import {
	checkRateLimit,
	getClientIP,
	loginLimiter,
	magicLinkLimiter,
	otpSendLimiter,
	passwordResetLimiter,
	rateLimitResponse,
	signUpLimiter,
} from "@/lib/rate-limit";

// Wrap the auth handler with rate limiting
async function handleWithRateLimit(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const pathname = url.pathname;
	const ip = getClientIP(request);

	// Apply rate limiting based on the auth endpoint
	// Only apply to POST requests (mutations)
	if (request.method === "POST") {
		let rateLimitResult: {
			success: boolean;
			remaining?: number;
			reset?: number;
		} = { success: true };

		// Sign in with email/password
		if (pathname.includes("/sign-in/email")) {
			// Try to get email from request body for more precise limiting
			try {
				const clonedRequest = request.clone();
				const body = await clonedRequest.json();
				const identifier = body.email ? `${ip}:${body.email}` : ip;
				rateLimitResult = await checkRateLimit(loginLimiter, identifier);
			} catch {
				rateLimitResult = await checkRateLimit(loginLimiter, ip);
			}
		}

		// Sign up
		else if (pathname.includes("/sign-up")) {
			rateLimitResult = await checkRateLimit(signUpLimiter, ip);
		}

		// Magic link
		else if (pathname.includes("/magic-link")) {
			try {
				const clonedRequest = request.clone();
				const body = await clonedRequest.json();
				const identifier = body.email ? `${ip}:${body.email}` : ip;
				rateLimitResult = await checkRateLimit(magicLinkLimiter, identifier);
			} catch {
				rateLimitResult = await checkRateLimit(magicLinkLimiter, ip);
			}
		}

		// Phone OTP send
		else if (pathname.includes("/phone-number/send")) {
			try {
				const clonedRequest = request.clone();
				const body = await clonedRequest.json();
				const identifier = body.phoneNumber ? `${ip}:${body.phoneNumber}` : ip;
				rateLimitResult = await checkRateLimit(otpSendLimiter, identifier);
			} catch {
				rateLimitResult = await checkRateLimit(otpSendLimiter, ip);
			}
		}

		// Password reset
		else if (pathname.includes("/forget-password")) {
			try {
				const clonedRequest = request.clone();
				const body = await clonedRequest.json();
				const identifier = body.email ? `${ip}:${body.email}` : ip;
				rateLimitResult = await checkRateLimit(
					passwordResetLimiter,
					identifier,
				);
			} catch {
				rateLimitResult = await checkRateLimit(passwordResetLimiter, ip);
			}
		}

		// Check if rate limited
		if (!rateLimitResult.success) {
			return rateLimitResponse(rateLimitResult.reset);
		}
	}

	// Call the original auth handler
	return auth.handler(request);
}

// Create Next.js handler with rate limiting
const { GET: originalGET } = toNextJsHandler(auth.handler);

export async function GET(request: Request) {
	return originalGET(request);
}

export async function POST(request: Request) {
	return handleWithRateLimit(request);
}
