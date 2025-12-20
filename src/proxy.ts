import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname } = request.nextUrl;

	// Protected routes require authentication
	if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
		if (!sessionCookie) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	}

	// Note: We intentionally don't redirect authenticated users away from
	// auth pages. Let the client-side AuthView handle that - it's simpler
	// and avoids race conditions with cookie clearing during sign out.

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/admin/:path*"],
};
