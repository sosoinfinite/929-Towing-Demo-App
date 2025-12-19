"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
		<div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-slate-900">TowAI</h1>
					<p className="text-slate-500 mt-2">Create your account</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm"
				>
					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
							{error}
						</div>
					)}

					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Name
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
								placeholder="John Doe"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
								placeholder="you@example.com"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={8}
								className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
								placeholder="At least 8 characters"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full mt-6 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? "Creating account..." : "Create account"}
					</button>

					<p className="mt-4 text-center text-sm text-slate-600">
						Already have an account?{" "}
						<a
							href="/sign-in"
							className="text-red-600 hover:text-red-700 font-medium"
						>
							Sign in
						</a>
					</p>
				</form>

				<p className="mt-6 text-center text-xs text-slate-500">
					Alpha program: Free for 3 months, then $49/mo locked for life
				</p>
			</div>
		</div>
	);
}
