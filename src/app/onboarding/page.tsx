"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CompanyForm, type CompanyFormData } from "@/components/company-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function OnboardingPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<CompanyFormData>({
		name: "",
		phone: "",
		logo: "",
		serviceArea: "",
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/company", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: formData.name,
					phone: formData.phone,
					logo: formData.logo,
					serviceArea: formData.serviceArea,
				}),
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
		<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<Card className="w-full max-w-lg">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Set Up Your Company</CardTitle>
					<CardDescription>
						Tell us about your towing business to get started with AI dispatch
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<CompanyForm
							data={formData}
							onChange={setFormData}
							disabled={loading}
						/>

						{error && (
							<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={loading || !formData.name}
						>
							{loading ? "Setting up..." : "Start Using AI Dispatch"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
