"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export default function MagicLinkPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/">
						<h1 className="text-3xl font-bold text-foreground">tow.center</h1>
					</Link>
					<p className="mt-2 text-muted-foreground">
						Sign in with a magic link
					</p>
				</div>

				<AuthView view="MAGIC_LINK" />

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Prefer a password?{" "}
					<Link
						href="/sign-in"
						className="font-medium text-primary hover:text-primary/80"
					>
						Sign in with email
					</Link>
				</p>
			</div>
		</div>
	);
}
