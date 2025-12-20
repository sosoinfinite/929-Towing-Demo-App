import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname, searchParams } = request.nextUrl;

	// Protected routes require authentication
	if (pathname.startsWith("/dashboard")) {
		if (!sessionCookie) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	}

	// Redirect authenticated users away from auth pages
	// Skip if user just signed out (cookie might not be cleared yet)
	if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
		const justSignedOut = searchParams.get("signedOut") === "true";
		if (sessionCookie && !justSignedOut) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
