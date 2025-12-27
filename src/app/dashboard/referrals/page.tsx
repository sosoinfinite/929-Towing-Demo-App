"use client";

import {
	Check,
	Copy,
	DollarSign,
	MousePointer,
	Share2,
	TrendingUp,
	UserPlus,
	Users,
} from "lucide-react";
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

interface ReferralStats {
	code: string | null;
	referralUrl: string | null;
	clicks: number;
	signups: number;
	conversions: number;
	total_earned_cents: number;
	balance: {
		available: number;
		pending: number;
	};
}

interface Referral {
	id: string;
	status: string;
	first_click_at: string;
	signup_at: string | null;
	subscription_started_at: string | null;
	reward_credited_at: string | null;
	reward_earned_cents: number;
	company_name: string | null;
}

interface Transaction {
	id: string;
	type: string;
	amount_cents: number;
	description: string;
	created_at: string;
}

export default function ReferralsPage() {
	const [stats, setStats] = useState<ReferralStats | null>(null);
	const [referrals, setReferrals] = useState<Referral[]>([]);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);
	const [generating, setGenerating] = useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				const [statsRes, referralsRes, creditsRes] = await Promise.all([
					fetch("/api/referral/me"),
					fetch("/api/referral/referrals"),
					fetch("/api/referral/credits"),
				]);

				const statsData = await statsRes.json();
				const referralsData = await referralsRes.json();
				const creditsData = await creditsRes.json();

				setStats(statsData);
				setReferrals(referralsData.referrals || []);
				setTransactions(creditsData.transactions || []);
			} catch (error) {
				console.error("Failed to fetch referral data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	async function generateCode() {
		setGenerating(true);
		try {
			const response = await fetch("/api/referral/generate-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});
			const data = await response.json();
			if (data.success) {
				setStats((prev) =>
					prev
						? { ...prev, code: data.code, referralUrl: data.referralUrl }
						: null,
				);
			}
		} catch (error) {
			console.error("Failed to generate code:", error);
		} finally {
			setGenerating(false);
		}
	}

	function copyToClipboard() {
		if (stats?.referralUrl) {
			navigator.clipboard.writeText(stats.referralUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}

	function formatCurrency(cents: number) {
		return `$${(cents / 100).toFixed(2)}`;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}

	function getStatusBadge(status: string) {
		const variants: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
			clicked: { label: "Clicked", variant: "outline" },
			signed_up: { label: "Signed Up", variant: "secondary" },
			company_created: { label: "Company Created", variant: "secondary" },
			subscribed: { label: "Subscribed", variant: "default" },
			credited: { label: "Credited", variant: "default" },
		};
		const config = variants[status] || { label: status, variant: "outline" as const };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	}

	if (loading) {
		return (
			<div className="flex-1 p-6">
				<div className="animate-pulse space-y-6">
					<div className="h-8 w-48 bg-muted rounded" />
					<div className="grid gap-4 md:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="h-32 bg-muted rounded-lg" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
					<p className="text-muted-foreground">
						Earn $50 for every customer you refer
					</p>
				</div>
			</div>

			{/* Referral Link Card */}
			<Card className="border-primary/20 bg-primary/5">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Share2 className="h-5 w-5 text-primary" />
						Your Referral Link
					</CardTitle>
					<CardDescription>
						Share this link and earn $50 for each customer who subscribes
					</CardDescription>
				</CardHeader>
				<CardContent>
					{stats?.code ? (
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
							<div className="flex-1 rounded-lg border bg-background px-4 py-3 font-mono text-sm">
								{stats.referralUrl}
							</div>
							<Button onClick={copyToClipboard} className="shrink-0">
								{copied ? (
									<>
										<Check className="mr-2 h-4 w-4" />
										Copied!
									</>
								) : (
									<>
										<Copy className="mr-2 h-4 w-4" />
										Copy Link
									</>
								)}
							</Button>
						</div>
					) : (
						<Button onClick={generateCode} disabled={generating}>
							{generating ? "Generating..." : "Generate Your Referral Code"}
						</Button>
					)}
				</CardContent>
			</Card>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
						<MousePointer className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.clicks || 0}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Sign Ups</CardTitle>
						<UserPlus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.signups || 0}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Conversions</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.conversions || 0}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Available Balance
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary">
							{formatCurrency(stats?.balance.available || 0)}
						</div>
						{(stats?.balance.pending || 0) > 0 && (
							<p className="text-xs text-muted-foreground">
								+{formatCurrency(stats.balance.pending)} pending
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Referrals Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Referral History
					</CardTitle>
					<CardDescription>
						Track the status of people you&apos;ve referred
					</CardDescription>
				</CardHeader>
				<CardContent>
					{referrals.length === 0 ? (
						<div className="py-12 text-center text-muted-foreground">
							<Users className="mx-auto mb-4 h-12 w-12 opacity-20" />
							<p>No referrals yet</p>
							<p className="text-sm">
								Share your link to start earning rewards
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Company</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>First Click</TableHead>
									<TableHead>Signed Up</TableHead>
									<TableHead className="text-right">Reward</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{referrals.map((referral) => (
									<TableRow key={referral.id}>
										<TableCell className="font-medium">
											{referral.company_name || "—"}
										</TableCell>
										<TableCell>{getStatusBadge(referral.status)}</TableCell>
										<TableCell>
											{formatDate(referral.first_click_at)}
										</TableCell>
										<TableCell>
											{referral.signup_at
												? formatDate(referral.signup_at)
												: "—"}
										</TableCell>
										<TableCell className="text-right font-medium">
											{referral.reward_earned_cents > 0
												? formatCurrency(referral.reward_earned_cents)
												: "—"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Transaction History */}
			{transactions.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5" />
							Credit History
						</CardTitle>
						<CardDescription>
							All credit transactions for your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.map((tx) => (
									<TableRow key={tx.id}>
										<TableCell>{formatDate(tx.created_at)}</TableCell>
										<TableCell>{tx.description}</TableCell>
										<TableCell>
											<Badge variant="outline" className="capitalize">
												{tx.type}
											</Badge>
										</TableCell>
										<TableCell
											className={`text-right font-medium ${tx.amount_cents >= 0 ? "text-primary" : "text-destructive"}`}
										>
											{tx.amount_cents >= 0 ? "+" : ""}
											{formatCurrency(tx.amount_cents)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
