"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient, signIn } from "@/lib/auth-client";

export default function SignInPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [otp, setOtp] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleEmailSubmit = async (e: React.FormEvent) => {
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

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await authClient.phoneNumber.sendOtp({
				phoneNumber,
			});

			if (result.error) {
				setError(result.error.message || "Failed to send code");
			} else {
				setOtpSent(true);
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = await authClient.phoneNumber.verify({
				phoneNumber,
				code: otp,
			});

			if (result.error) {
				setError(result.error.message || "Invalid code");
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

				<div className="rounded-lg border border-border bg-card p-8 shadow-sm">
					{error && (
						<div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
							{error}
						</div>
					)}

					<Tabs defaultValue="email" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="email">Email</TabsTrigger>
							<TabsTrigger value="phone">Phone</TabsTrigger>
						</TabsList>

						<TabsContent value="email">
							<form onSubmit={handleEmailSubmit} className="space-y-4">
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

								<Button
									type="submit"
									disabled={loading}
									className="w-full"
									size="lg"
								>
									{loading ? "Signing in..." : "Sign in"}
								</Button>
							</form>
						</TabsContent>

						<TabsContent value="phone">
							{!otpSent ? (
								<form onSubmit={handleSendOtp} className="space-y-4">
									<div>
										<Label htmlFor="phone">Phone Number</Label>
										<Input
											id="phone"
											type="tel"
											value={phoneNumber}
											onChange={(e) => setPhoneNumber(e.target.value)}
											required
											placeholder="+1 555 123 4567"
											className="mt-1"
										/>
										<p className="mt-1 text-xs text-muted-foreground">
											Include country code (e.g., +1 for US)
										</p>
									</div>

									<Button
										type="submit"
										disabled={loading}
										className="w-full"
										size="lg"
									>
										{loading ? "Sending..." : "Send verification code"}
									</Button>
								</form>
							) : (
								<form onSubmit={handleVerifyOtp} className="space-y-4">
									<div>
										<Label htmlFor="otp">Verification Code</Label>
										<Input
											id="otp"
											type="text"
											value={otp}
											onChange={(e) => setOtp(e.target.value)}
											required
											placeholder="123456"
											className="mt-1"
											maxLength={6}
										/>
										<p className="mt-1 text-xs text-muted-foreground">
											Enter the 6-digit code sent to {phoneNumber}
										</p>
									</div>

									<Button
										type="submit"
										disabled={loading}
										className="w-full"
										size="lg"
									>
										{loading ? "Verifying..." : "Verify code"}
									</Button>

									<Button
										type="button"
										variant="ghost"
										className="w-full"
										onClick={() => {
											setOtpSent(false);
											setOtp("");
										}}
									>
										Use different number
									</Button>
								</form>
							)}
						</TabsContent>
					</Tabs>

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
		</div>
	);
}
