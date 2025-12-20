"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export default function TwoFactorPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/">
						<h1 className="text-3xl font-bold text-foreground">tow.center</h1>
					</Link>
					<p className="mt-2 text-muted-foreground">
						Enter your verification code
					</p>
				</div>

				<AuthView view="TWO_FACTOR" />

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Having trouble?{" "}
					<Link
						href="/sign-in"
						className="font-medium text-primary hover:text-primary/80"
					>
						Try another method
					</Link>
				</p>
			</div>
		</div>
	);
}
