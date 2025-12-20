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
				</div>

				<AuthView view="SIGN_IN" />
			</div>
		</div>
	);
}
