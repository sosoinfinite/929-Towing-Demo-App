"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import Link from "next/link";

export default function ResetPasswordPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/">
						<h1 className="text-3xl font-bold text-foreground">tow.center</h1>
					</Link>
					<p className="mt-2 text-muted-foreground">Create new password</p>
				</div>

				<AuthView view="RESET_PASSWORD" />

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Remember your password?{" "}
					<Link
						href="/sign-in"
						className="font-medium text-primary hover:text-primary/80"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
