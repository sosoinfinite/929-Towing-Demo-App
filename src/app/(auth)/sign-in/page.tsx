"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export default function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/">
						<h1 className="text-3xl font-bold text-foreground">tow.center</h1>
					</Link>
					<p className="mt-2 text-muted-foreground">Sign in to your account</p>
				</div>

				<AuthView view="SIGN_IN" />

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						href="/sign-up"
						className="font-medium text-primary hover:text-primary/80"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
