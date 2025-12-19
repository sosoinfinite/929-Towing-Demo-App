"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OnboardingPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;
		const phone = formData.get("phone") as string;
		const serviceArea = formData.get("serviceArea") as string;

		try {
			const res = await fetch("/api/company", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, phone, serviceArea }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to create company");
			}

			router.push("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
			<Card className="w-full max-w-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Set Up Your Company</CardTitle>
					<CardDescription>
						Tell us about your towing business to get started with AI dispatch
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">Company Name *</Label>
							<Input
								id="name"
								name="name"
								placeholder="e.g., 929 Towing"
								required
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Business Phone</Label>
							<Input
								id="phone"
								name="phone"
								type="tel"
								placeholder="(555) 123-4567"
								disabled={loading}
							/>
							<p className="text-sm text-muted-foreground">
								This is where we'll send job notifications via SMS
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="serviceArea">Service Area</Label>
							<Textarea
								id="serviceArea"
								name="serviceArea"
								placeholder="e.g., Dallas-Fort Worth metro area, 50 mile radius from downtown"
								rows={3}
								disabled={loading}
							/>
							<p className="text-sm text-muted-foreground">
								Describe the areas you serve - the AI will use this to screen
								calls
							</p>
						</div>

						{error && (
							<div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Setting up..." : "Start Using AI Dispatch"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
