"use client";

import {
	IconCheck,
	IconCreditCard,
	IconDownload,
	IconExternalLink,
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Subscription {
	plan: string;
	status: string;
	stripe_customer_id: string | null;
}

interface Invoice {
	id: string;
	number: string | null;
	amount: number;
	currency: string;
	status: string | null;
	date: number;
	pdfUrl: string | null;
	hostedUrl: string | null;
}

export default function BillingSettingsPage() {
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [invoicesLoading, setInvoicesLoading] = useState(true);
	const [upgrading, setUpgrading] = useState<string | null>(null);
	const [openingPortal, setOpeningPortal] = useState(false);

	useEffect(() => {
		// Fetch subscription info
		fetch("/api/settings")
			.then((res) => res.json())
			.then((data) => {
				if (data.subscription) {
					setSubscription(data.subscription);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));

		// Fetch invoices
		fetch("/api/billing/invoices")
			.then((res) => res.json())
			.then((data) => {
				if (data.invoices) {
					setInvoices(data.invoices);
				}
				setInvoicesLoading(false);
			})
			.catch(() => setInvoicesLoading(false));
	}, []);

	const handleOpenPortal = async () => {
		setOpeningPortal(true);
		try {
			const res = await fetch("/api/stripe/portal", {
				method: "POST",
			});
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			} else {
				console.error("No portal URL returned");
				setOpeningPortal(false);
			}
		} catch (error) {
			console.error("Failed to open portal:", error);
			setOpeningPortal(false);
		}
	};

	const handleUpgrade = async (planId: string) => {
		setUpgrading(planId);
		try {
			const res = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ plan: planId }),
			});
			const data = await res.json();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Failed to start checkout:", error);
			setUpgrading(null);
		}
	};

	const formatAmount = (amount: number, currency: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const plans = [
		{
			id: "alpha",
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
			id: "starter",
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
			id: "pro",
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
			<div className="flex min-h-[300px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
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
						<div className="flex items-center gap-2">
							<Badge
								className={
									subscription?.status === "active" || !subscription
										? "border-green-500/20 bg-green-500/10 text-green-600"
										: ""
								}
							>
								{subscription?.status || "Active"}
							</Badge>
							{subscription?.stripe_customer_id && (
								<Button
									variant="outline"
									size="sm"
									disabled={openingPortal}
									onClick={handleOpenPortal}
								>
									{openingPortal ? (
										<>
											<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
											Opening...
										</>
									) : (
										<>
											<IconExternalLink className="mr-2 h-4 w-4" />
											Manage
										</>
									)}
								</Button>
							)}
						</div>
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
								key={plan.id}
								className={`rounded-lg border p-4 ${
									plan.current ? "border-primary bg-primary/5" : ""
								}`}
							>
								<div className="mb-4">
									<div className="flex items-center justify-between">
										<h3 className="font-semibold">{plan.name}</h3>
										{plan.current && <Badge variant="secondary">Current</Badge>}
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
									<Button
										className="mt-4 w-full"
										variant="outline"
										disabled={upgrading !== null}
										onClick={() => handleUpgrade(plan.id)}
									>
										{upgrading === plan.id ? (
											<>
												<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
												Redirecting...
											</>
										) : (
											"Upgrade"
										)}
									</Button>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Payment History */}
			<Card>
				<CardHeader>
					<CardTitle>Payment History</CardTitle>
					<CardDescription>Your recent invoices and payments</CardDescription>
				</CardHeader>
				<CardContent>
					{invoicesLoading ? (
						<div className="flex min-h-[150px] items-center justify-center">
							<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : invoices.length === 0 ? (
						<div className="flex min-h-[150px] flex-col items-center justify-center text-muted-foreground">
							<IconReceipt className="mb-2 h-8 w-8" />
							<p className="text-sm">No payment history yet</p>
							<p className="text-xs">
								Invoices will appear here after your first payment
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Invoice</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[100px]">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices.map((invoice) => (
									<TableRow key={invoice.id}>
										<TableCell>{formatDate(invoice.date)}</TableCell>
										<TableCell className="font-mono text-sm">
											{invoice.number || "-"}
										</TableCell>
										<TableCell>
											{formatAmount(invoice.amount, invoice.currency)}
										</TableCell>
										<TableCell>
											<Badge
												className={
													invoice.status === "paid"
														? "border-green-500/20 bg-green-500/10 text-green-600"
														: ""
												}
											>
												{invoice.status || "Unknown"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex gap-1">
												{invoice.pdfUrl && (
													<Button
														asChild
														variant="ghost"
														size="icon"
														className="h-8 w-8"
													>
														<a
															href={invoice.pdfUrl}
															target="_blank"
															rel="noopener noreferrer"
															title="Download PDF"
														>
															<IconDownload className="h-4 w-4" />
														</a>
													</Button>
												)}
												{invoice.hostedUrl && (
													<Button
														asChild
														variant="ghost"
														size="icon"
														className="h-8 w-8"
													>
														<a
															href={invoice.hostedUrl}
															target="_blank"
															rel="noopener noreferrer"
															title="View Invoice"
														>
															<IconExternalLink className="h-4 w-4" />
														</a>
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
