"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await signUp.email({
				email,
				password,
				name,
			});

			if (result.error) {
				setError(result.error.message || "Failed to create account");
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
					<h1 className="text-3xl font-bold text-foreground">TowAI</h1>
					<p className="mt-2 text-muted-foreground">Create your account</p>
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
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								placeholder="John Doe"
								className="mt-1"
							/>
						</div>

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
								minLength={8}
								placeholder="At least 8 characters"
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
						{loading ? "Creating account..." : "Create account"}
					</Button>

					<p className="mt-4 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/sign-in"
							className="font-medium text-primary hover:text-primary/80"
						>
							Sign in
						</Link>
					</p>
				</form>

				<p className="mt-6 text-center text-xs text-muted-foreground">
					Alpha program: Free for 3 months, then $49/mo locked for life
				</p>
			</div>
		</div>
	);
}
