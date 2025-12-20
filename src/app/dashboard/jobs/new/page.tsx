"use client";

import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
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

export default function NewJobPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		customer_name: "",
		customer_phone: "",
		customer_email: "",
		service_type: "",
		vehicle_info: "",
		pickup_location: "",
		dropoff_location: "",
		motor_club: "",
		po_number: "",
		notes: "",
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (!formData.customer_phone || !formData.pickup_location) {
			setError("Customer phone and pickup location are required");
			setLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/jobs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (data.error) {
				setError(data.error);
				setLoading(false);
				return;
			}

			if (data.id) {
				router.push(`/dashboard/jobs/${data.id}`);
			}
		} catch {
			setError("Failed to create job");
			setLoading(false);
		}
	};

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<Button asChild variant="ghost" size="sm" className="mb-4">
						<Link href="/dashboard/jobs">
							<IconArrowLeft className="mr-2 h-4 w-4" />
							Back to Jobs
						</Link>
					</Button>

					<div className="mb-6">
						<h1 className="text-2xl font-bold">New Job</h1>
						<p className="text-muted-foreground">
							Create a new dispatch job manually
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="grid gap-6 lg:grid-cols-2">
							{/* Customer Information */}
							<Card>
								<CardHeader>
									<CardTitle>Customer Information</CardTitle>
									<CardDescription>
										Contact details for the customer
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="customer_name">Customer Name</Label>
										<Input
											id="customer_name"
											name="customer_name"
											placeholder="John Doe"
											value={formData.customer_name}
											onChange={handleChange}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="customer_phone">
											Phone Number <span className="text-destructive">*</span>
										</Label>
										<Input
											id="customer_phone"
											name="customer_phone"
											type="tel"
											placeholder="(555) 123-4567"
											value={formData.customer_phone}
											onChange={handleChange}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="customer_email">Email</Label>
										<Input
											id="customer_email"
											name="customer_email"
											type="email"
											placeholder="john@example.com"
											value={formData.customer_email}
											onChange={handleChange}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Service Information */}
							<Card>
								<CardHeader>
									<CardTitle>Service Information</CardTitle>
									<CardDescription>
										Details about the requested service
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="service_type">Service Type</Label>
										<Select
											value={formData.service_type}
											onValueChange={(value) =>
												setFormData((prev) => ({
													...prev,
													service_type: value,
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select service type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="tow">Tow</SelectItem>
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
										<Label htmlFor="vehicle_info">Vehicle Information</Label>
										<Input
											id="vehicle_info"
											name="vehicle_info"
											placeholder="2020 Toyota Camry, Silver"
											value={formData.vehicle_info}
											onChange={handleChange}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Location Information */}
							<Card>
								<CardHeader>
									<CardTitle>Location</CardTitle>
									<CardDescription>
										Pickup and dropoff addresses
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="pickup_location">
											Pickup Location{" "}
											<span className="text-destructive">*</span>
										</Label>
										<Textarea
											id="pickup_location"
											name="pickup_location"
											placeholder="123 Main St, Albany, NY 12203"
											value={formData.pickup_location}
											onChange={handleChange}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="dropoff_location">Dropoff Location</Label>
										<Textarea
											id="dropoff_location"
											name="dropoff_location"
											placeholder="456 Oak Ave, Schenectady, NY 12345"
											value={formData.dropoff_location}
											onChange={handleChange}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Additional Information */}
							<Card>
								<CardHeader>
									<CardTitle>Additional Details</CardTitle>
									<CardDescription>
										Motor club and reference information
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="motor_club">Motor Club</Label>
										<Select
											value={formData.motor_club}
											onValueChange={(value) =>
												setFormData((prev) => ({ ...prev, motor_club: value }))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select motor club" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="aaa">AAA</SelectItem>
												<SelectItem value="agero">Agero</SelectItem>
												<SelectItem value="urgently">Urgently</SelectItem>
												<SelectItem value="swoop">Swoop</SelectItem>
												<SelectItem value="honk">Honk</SelectItem>
												<SelectItem value="other">Other</SelectItem>
												<SelectItem value="none">None (Direct)</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="po_number">PO / Reference Number</Label>
										<Input
											id="po_number"
											name="po_number"
											placeholder="PO-123456"
											value={formData.po_number}
											onChange={handleChange}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="notes">Notes</Label>
										<Textarea
											id="notes"
											name="notes"
											placeholder="Additional instructions or notes..."
											value={formData.notes}
											onChange={handleChange}
											rows={4}
										/>
									</div>
								</CardContent>
							</Card>
						</div>

						{error && (
							<div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
								{error}
							</div>
						)}

						<div className="mt-6 flex justify-end gap-4">
							<Button type="button" variant="outline" asChild>
								<Link href="/dashboard/jobs">Cancel</Link>
							</Button>
							<Button type="submit" disabled={loading}>
								{loading && (
									<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Create Job
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
