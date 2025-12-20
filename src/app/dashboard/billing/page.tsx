"use client";

import {
	IconCheck,
	IconCreditCard,
	IconLoader2,
	IconReceipt,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface Subscription {
	plan: string;
	status: string;
	stripe_customer_id: string | null;
}

export default function BillingPage() {
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch subscription info from settings API
		fetch("/api/settings")
			.then((res) => res.json())
			.then((data) => {
				if (data.subscription) {
					setSubscription(data.subscription);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const plans = [
		{
			name: "Alpha",
			price: "Free",
			description: "3 months free, then $49/mo locked for life",
			features: [
				"100 AI minutes/month",
				"Shared phone number",
				"7-day call recording",
				"Email support",
			],
			current: subscription?.plan === "alpha" || !subscription,
		},
		{
			name: "Starter",
			price: "$99/mo",
			description: "For growing towing companies",
			features: [
				"500 AI minutes/month",
				"Dedicated phone number",
				"30-day call recording",
				"Priority support",
			],
			current: subscription?.plan === "starter",
		},
		{
			name: "Pro",
			price: "$199/mo",
			description: "For high-volume operations",
			features: [
				"Unlimited AI minutes",
				"Dedicated phone number",
				"90-day call recording",
				"24/7 priority support",
				"Custom AI training",
			],
			current: subscription?.plan === "pro",
		},
	];

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Billing</h1>
						<p className="text-muted-foreground">
							Manage your subscription and payment methods
						</p>
					</div>

					<div className="space-y-6">
						{/* Current Plan */}
						<Card>
							<CardHeader>
								<CardTitle>Current Plan</CardTitle>
								<CardDescription>
									Your active subscription and billing status
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<IconCreditCard className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium">
												{subscription?.plan
													? subscription.plan.charAt(0).toUpperCase() +
														subscription.plan.slice(1)
													: "Alpha"}{" "}
												Plan
											</p>
											<p className="text-sm text-muted-foreground">
												{subscription?.plan === "alpha" || !subscription?.plan
													? "Free for 3 months, then $49/mo"
													: subscription?.plan === "starter"
														? "$99/month"
														: "$199/month"}
											</p>
										</div>
									</div>
									<Badge
										className={
											subscription?.status === "active" || !subscription
												? "border-green-500/20 bg-green-500/10 text-green-600"
												: ""
										}
									>
										{subscription?.status || "Active"}
									</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Plans */}
						<Card>
							<CardHeader>
								<CardTitle>Available Plans</CardTitle>
								<CardDescription>
									Choose the plan that best fits your needs
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 md:grid-cols-3">
									{plans.map((plan) => (
										<div
											key={plan.name}
											className={`rounded-lg border p-4 ${
												plan.current ? "border-primary bg-primary/5" : ""
											}`}
										>
											<div className="mb-4">
												<div className="flex items-center justify-between">
													<h3 className="font-semibold">{plan.name}</h3>
													{plan.current && (
														<Badge variant="secondary">Current</Badge>
													)}
												</div>
												<p className="text-2xl font-bold">{plan.price}</p>
												<p className="text-sm text-muted-foreground">
													{plan.description}
												</p>
											</div>
											<ul className="space-y-2">
												{plan.features.map((feature) => (
													<li
														key={feature}
														className="flex items-center gap-2 text-sm"
													>
														<IconCheck className="h-4 w-4 text-green-600" />
														{feature}
													</li>
												))}
											</ul>
											{!plan.current && (
												<Button className="mt-4 w-full" variant="outline">
													Upgrade
												</Button>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Payment History Placeholder */}
						<Card>
							<CardHeader>
								<CardTitle>Payment History</CardTitle>
								<CardDescription>Your recent invoices and payments</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex min-h-[150px] flex-col items-center justify-center text-muted-foreground">
									<IconReceipt className="mb-2 h-8 w-8" />
									<p className="text-sm">No payment history yet</p>
									<p className="text-xs">
										Invoices will appear here after your first payment
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
