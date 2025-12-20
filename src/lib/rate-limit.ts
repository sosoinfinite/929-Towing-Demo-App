import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client - will be undefined if env vars not set
const redis =
	process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
		? new Redis({
				url: process.env.UPSTASH_REDIS_REST_URL,
				token: process.env.UPSTASH_REDIS_REST_TOKEN,
			})
		: null;

// Rate limiters for different auth operations
// These follow Better Auth's recommended defaults

// Login attempts: 5 per 15 minutes per identifier
export const loginLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(5, "15 m"),
			prefix: "ratelimit:login",
			analytics: true,
		})
	: null;

// OTP send: 3 per 15 minutes per phone/email
export const otpSendLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(3, "15 m"),
			prefix: "ratelimit:otp-send",
			analytics: true,
		})
	: null;

// OTP verify: 5 attempts per code
export const otpVerifyLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(5, "5 m"),
			prefix: "ratelimit:otp-verify",
			analytics: true,
		})
	: null;

// Magic link: 3 per 15 minutes per email
export const magicLinkLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(3, "15 m"),
			prefix: "ratelimit:magic-link",
			analytics: true,
		})
	: null;

// Sign up: 5 per hour per IP
export const signUpLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(5, "1 h"),
			prefix: "ratelimit:signup",
			analytics: true,
		})
	: null;

// Password reset: 3 per 30 minutes per email
export const passwordResetLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(3, "30 m"),
			prefix: "ratelimit:password-reset",
			analytics: true,
		})
	: null;

// General API rate limit: 100 requests per minute per IP
export const generalLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(100, "1 m"),
			prefix: "ratelimit:general",
			analytics: true,
		})
	: null;

// Helper to check rate limit and return appropriate response
export async function checkRateLimit(
	limiter: Ratelimit | null,
	identifier: string,
): Promise<{ success: boolean; remaining?: number; reset?: number }> {
	if (!limiter) {
		// If no Redis configured, allow all requests (dev mode)
		return { success: true };
	}

	const result = await limiter.limit(identifier);
	return {
		success: result.success,
		remaining: result.remaining,
		reset: result.reset,
	};
}

// Helper to get client IP from request
export function getClientIP(request: Request): string {
	// Check various headers that might contain the real IP
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	const realIP = request.headers.get("x-real-ip");
	if (realIP) {
		return realIP;
	}

	// Vercel-specific header
	const vercelIP = request.headers.get("x-vercel-forwarded-for");
	if (vercelIP) {
		return vercelIP.split(",")[0].trim();
	}

	// Fallback
	return "unknown";
}

// Create rate limit exceeded response
export function rateLimitResponse(reset?: number): Response {
	return new Response(
		JSON.stringify({
			error: "Too many requests. Please try again later.",
			retryAfter: reset ? Math.ceil((reset - Date.now()) / 1000) : 60,
		}),
		{
			status: 429,
			headers: {
				"Content-Type": "application/json",
				"Retry-After": reset
					? Math.ceil((reset - Date.now()) / 1000).toString()
					: "60",
			},
		},
	);
}
