"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await signIn.email({
				email,
				password,
			});

			if (result.error) {
				setError(result.error.message || "Failed to sign in");
			} else {
				router.push("/dashboard");
				router.refresh();
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-foreground">tow.center</h1>
					<p className="mt-2 text-muted-foreground">Sign in to your account</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="rounded-lg border border-border bg-card p-8 shadow-sm"
				>
					{error && (
						<div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
							{error}
						</div>
					)}

					<div className="space-y-4">
						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								placeholder="you@example.com"
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder="Enter your password"
								className="mt-1"
							/>
						</div>
					</div>

					<Button
						type="submit"
						disabled={loading}
						className="mt-6 w-full"
						size="lg"
					>
						{loading ? "Signing in..." : "Sign in"}
					</Button>

					<p className="mt-4 text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							href="/sign-up"
							className="font-medium text-primary hover:text-primary/80"
						>
							Sign up
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
