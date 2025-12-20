"use client";

import {
	IconArrowRight,
	IconBuilding,
	IconLoader2,
	IconMapPin,
	IconPhone,
	IconSparkles,
	IconTruck,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CompanyForm, type CompanyFormData } from "@/components/company-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
		<div className="min-h-screen w-full lg:grid lg:grid-cols-2">
			{/* Left Side: Form */}
			<div className="flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					{/* Header */}
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">
							Welcome to <span className="text-primary">tow.center</span>
						</h1>
						<p className="text-muted-foreground">
							Let&apos;s configure your dispatch center. This takes less than 2
							minutes.
						</p>
					</div>

					{/* Form */}
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
							size="lg"
							className="w-full"
							disabled={loading || !formData.name}
						>
							{loading ? (
								<>
									<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
									Setting up...
								</>
							) : (
								<>
									Start Using AI Dispatch
									<IconArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</form>

					<p className="text-center text-xs text-muted-foreground">
						By continuing, you agree to our Terms of Service and Privacy Policy
					</p>
				</div>
			</div>

			{/* Right Side: Visual Preview */}
			<div className="relative hidden flex-col items-center justify-center overflow-hidden bg-muted p-12 lg:flex">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-5">
					<svg
						className="h-full w-full"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<defs>
							<pattern
								id="grid"
								width="32"
								height="32"
								patternUnits="userSpaceOnUse"
							>
								<circle cx="16" cy="16" r="1" fill="currentColor" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid)" />
					</svg>
				</div>

				{/* Content */}
				<div className="relative z-10 space-y-8">
					{/* Feature Headline */}
					<div className="text-center">
						<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
							<IconSparkles className="h-4 w-4" />
							AI-Powered Dispatch
						</div>
						<h2 className="text-2xl font-bold tracking-tight">
							Your calls, handled intelligently
						</h2>
						<p className="mt-2 text-muted-foreground">
							See what happens when a customer calls your line
						</p>
					</div>

					{/* Mock Dispatch Card */}
					<Card className="w-full max-w-sm shadow-lg">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
										<IconTruck className="h-4 w-4 text-primary" />
									</div>
									<div>
										<p className="text-sm font-medium">Incoming Job</p>
										<p className="text-xs text-muted-foreground">
											AI Dispatched • Just now
										</p>
									</div>
								</div>
								<Badge variant="destructive" className="text-xs">
									Urgent
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="rounded-lg bg-muted p-3">
								<p className="text-sm font-medium">2019 Honda Accord</p>
								<p className="text-xs text-muted-foreground">
									Flat tire • Won&apos;t start
								</p>
							</div>
							<div className="flex items-start gap-2 text-sm">
								<IconMapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
								<div>
									<p className="font-medium">I-87 Northbound, Mile 142</p>
									<p className="text-xs text-muted-foreground">
										4.2 miles away • ~8 min ETA
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<IconPhone className="h-4 w-4 text-muted-foreground" />
								<p>(555) 123-4567</p>
							</div>
							<div className="flex gap-2 pt-2">
								<Button size="sm" className="flex-1">
									Accept Job
								</Button>
								<Button size="sm" variant="outline" className="flex-1">
									Reassign
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Feature Points */}
					<div className="grid grid-cols-2 gap-4 text-center text-sm">
						<div className="space-y-1">
							<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background">
								<IconPhone className="h-5 w-5 text-primary" />
							</div>
							<p className="font-medium">24/7 Call Handling</p>
						</div>
						<div className="space-y-1">
							<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background">
								<IconBuilding className="h-5 w-5 text-primary" />
							</div>
							<p className="font-medium">Multi-location</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
