"use client";

import {
	IconArrowLeft,
	IconCheck,
	IconLoader2,
	IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NewCallPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const [formData, setFormData] = useState({
		caller_number: "",
		caller_name: "",
		status: "completed",
		duration_minutes: "",
		duration_seconds: "",
		notes: "",
		location: "",
		vehicle_info: "",
		service_type: "tow",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Calculate duration in seconds
		const duration =
			(Number(formData.duration_minutes) || 0) * 60 +
			(Number(formData.duration_seconds) || 0);

		// Build transcript/notes
		const transcriptParts = [];
		if (formData.caller_name) {
			transcriptParts.push(`Caller: ${formData.caller_name}`);
		}
		if (formData.service_type) {
			transcriptParts.push(`Service: ${formData.service_type}`);
		}
		if (formData.vehicle_info) {
			transcriptParts.push(`Vehicle: ${formData.vehicle_info}`);
		}
		if (formData.location) {
			transcriptParts.push(`Location: ${formData.location}`);
		}
		if (formData.notes) {
			transcriptParts.push(`Notes: ${formData.notes}`);
		}

		try {
			const res = await fetch("/api/calls", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					caller_number: formData.caller_number || "Manual Entry",
					status: formData.status,
					duration,
					transcript: transcriptParts.join("\n"),
					ai_handled: false,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to create call");
			}

			setSuccess(true);
			setTimeout(() => {
				router.push("/dashboard/calls");
			}, 1500);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create call");
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<div className="flex min-h-[400px] flex-col items-center justify-center px-4">
						<div className="mb-4 rounded-full bg-green-500/10 p-4">
							<IconCheck className="h-8 w-8 text-green-600" />
						</div>
						<h2 className="text-xl font-semibold">Call Created</h2>
						<p className="text-muted-foreground">
							Redirecting to call history...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<Button asChild variant="ghost" size="sm" className="mb-2">
							<Link href="/dashboard/calls">
								<IconArrowLeft className="mr-2 h-4 w-4" />
								Back to Calls
							</Link>
						</Button>
						<h1 className="text-2xl font-bold">Quick Create</h1>
						<p className="text-muted-foreground">
							Manually log a call when AI dispatch is off
						</p>
					</div>

					<Card className="max-w-2xl">
						<CardHeader>
							<div className="flex items-center gap-2">
								<IconPhone className="h-5 w-5 text-muted-foreground" />
								<div>
									<CardTitle>New Call Entry</CardTitle>
									<CardDescription>
										Record details from a call you handled manually
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								{error && (
									<div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
										{error}
									</div>
								)}

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="caller_number">Phone Number</Label>
										<Input
											id="caller_number"
											type="tel"
											placeholder="(555) 123-4567"
											value={formData.caller_number}
											onChange={(e) =>
												setFormData({
													...formData,
													caller_number: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="caller_name">Caller Name</Label>
										<Input
											id="caller_name"
											placeholder="John Smith"
											value={formData.caller_name}
											onChange={(e) =>
												setFormData({
													...formData,
													caller_name: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="status">Call Status</Label>
										<Select
											value={formData.status}
											onValueChange={(value) =>
												setFormData({ ...formData, status: value })
											}
										>
											<SelectTrigger id="status">
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="completed">Completed</SelectItem>
												<SelectItem value="dispatched">Dispatched</SelectItem>
												<SelectItem value="scheduled">Scheduled</SelectItem>
												<SelectItem value="cancelled">Cancelled</SelectItem>
												<SelectItem value="missed">Missed</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Call Duration</Label>
										<div className="flex gap-2">
											<div className="flex-1">
												<Input
													type="number"
													min="0"
													placeholder="0"
													value={formData.duration_minutes}
													onChange={(e) =>
														setFormData({
															...formData,
															duration_minutes: e.target.value,
														})
													}
												/>
												<span className="mt-1 text-xs text-muted-foreground">
													Minutes
												</span>
											</div>
											<div className="flex-1">
												<Input
													type="number"
													min="0"
													max="59"
													placeholder="0"
													value={formData.duration_seconds}
													onChange={(e) =>
														setFormData({
															...formData,
															duration_seconds: e.target.value,
														})
													}
												/>
												<span className="mt-1 text-xs text-muted-foreground">
													Seconds
												</span>
											</div>
										</div>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="service_type">Service Type</Label>
										<Select
											value={formData.service_type}
											onValueChange={(value) =>
												setFormData({ ...formData, service_type: value })
											}
										>
											<SelectTrigger id="service_type">
												<SelectValue placeholder="Select service" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="tow">Towing</SelectItem>
												<SelectItem value="jumpstart">Jump Start</SelectItem>
												<SelectItem value="lockout">Lockout</SelectItem>
												<SelectItem value="tire">Tire Change</SelectItem>
												<SelectItem value="fuel">Fuel Delivery</SelectItem>
												<SelectItem value="winch">Winch Out</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="vehicle_info">Vehicle Info</Label>
										<Input
											id="vehicle_info"
											placeholder="2020 Honda Civic, Blue"
											value={formData.vehicle_info}
											onChange={(e) =>
												setFormData({
													...formData,
													vehicle_info: e.target.value,
												})
											}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="location">Pickup Location</Label>
									<Input
										id="location"
										placeholder="123 Main St, City, State"
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="notes">Notes</Label>
									<Textarea
										id="notes"
										placeholder="Additional details about the call..."
										rows={3}
										value={formData.notes}
										onChange={(e) =>
											setFormData({ ...formData, notes: e.target.value })
										}
									/>
								</div>

								<div className="flex gap-3">
									<Button type="submit" disabled={loading}>
										{loading ? (
											<>
												<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating...
											</>
										) : (
											"Create Call"
										)}
									</Button>
									<Button type="button" variant="outline" asChild>
										<Link href="/dashboard/calls">Cancel</Link>
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
