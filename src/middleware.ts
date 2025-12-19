import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	const { pathname } = request.nextUrl;

	// Protected routes require authentication
	if (pathname.startsWith("/dashboard")) {
		if (!sessionCookie) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	}

	// Redirect authenticated users away from auth pages
	if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
		if (sessionCookie) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
