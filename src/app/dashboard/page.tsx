"use client";

import { useEffect, useState } from "react";
import { DispatchToggle } from "@/components/dispatch-toggle";
import { SectionCards } from "@/components/section-cards";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface Stats {
	callsToday: number;
	callsThisWeek: number;
	successRate: number;
	estimatedRevenue: number;
}

interface Call {
	id: string;
	caller_number: string;
	status: string;
	duration: number;
	ai_handled: boolean;
	created_at: string;
}

export default function DashboardPage() {
	const [dispatchActive, setDispatchActive] = useState(false);
	const [stats, setStats] = useState<Stats | null>(null);
	const [recentCalls, setRecentCalls] = useState<Call[]>([]);
	const [hasCompany, setHasCompany] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);

	// Fetch initial data
	useEffect(() => {
		async function fetchData() {
			try {
				// Check if user has a company
				const companyRes = await fetch("/api/company");
				const companyData = await companyRes.json();
				setHasCompany(!!companyData.company);

				if (!companyData.company) {
					setLoading(false);
					return;
				}

				// Fetch dispatch state
				const dispatchRes = await fetch("/api/dispatch");
				const dispatchData = await dispatchRes.json();
				setDispatchActive(dispatchData.dispatchActive ?? false);

				// Fetch stats
				const statsRes = await fetch("/api/stats");
				const statsData = await statsRes.json();
				if (!statsData.error) {
					setStats(statsData);
				}

				// Fetch recent calls
				const callsRes = await fetch("/api/calls?limit=5");
				const callsData = await callsRes.json();
				if (!callsData.error) {
					setRecentCalls(callsData.calls || []);
				}
			} catch (error) {
				console.error("Failed to fetch dashboard data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const handleToggle = async (active: boolean) => {
		setDispatchActive(active);

		try {
			const res = await fetch("/api/dispatch", { method: "POST" });
			const data = await res.json();
			setDispatchActive(data.dispatchActive ?? active);
		} catch (error) {
			console.error("Failed to toggle dispatch:", error);
			setDispatchActive(!active);
		}
	};

	if (loading) {
		return (
			<div className="@container/main flex flex-1 flex-col items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (hasCompany === false) {
		return (
			<div className="@container/main flex flex-1 flex-col items-center justify-center p-4">
				<Card className="max-w-md w-full">
					<CardHeader className="text-center">
						<CardTitle>Welcome to tow.center</CardTitle>
						<CardDescription>
							Set up your company to start using AI dispatch
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<a
							href="/onboarding"
							className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
						>
							Set Up Your Company
						</a>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				{/* Dispatch Toggle - Hero Section */}
				<div className="px-4 lg:px-6">
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="text-2xl">AI Dispatch Control</CardTitle>
							<CardDescription>
								Toggle your AI dispatcher on or off. When active, all incoming
								calls will be handled by your AI assistant.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex justify-center pb-8">
							<DispatchToggle
								initialActive={dispatchActive}
								onToggle={handleToggle}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Stats Cards */}
				<SectionCards
					dispatchActive={dispatchActive}
					callsToday={stats?.callsToday ?? 0}
					revenueThisWeek={stats?.estimatedRevenue ?? 0}
					successRate={stats?.successRate ?? 0}
				/>

				{/* Recent Activity */}
				<div className="px-4 lg:px-6">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>
								Your most recent calls and dispatches
							</CardDescription>
						</CardHeader>
						<CardContent>
							{recentCalls.length === 0 ? (
								<div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
									<div className="text-center">
										<p className="text-lg font-medium">No activity yet</p>
										<p className="text-sm">
											Turn on AI Dispatch to start receiving calls
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									{recentCalls.map((call) => (
										<div
											key={call.id}
											className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
										>
											<div className="flex flex-col">
												<span className="font-medium">
													{call.caller_number || "Unknown"}
												</span>
												<span className="text-sm text-muted-foreground">
													{new Date(call.created_at).toLocaleString()}
												</span>
											</div>
											<div className="flex items-center gap-2">
												{call.ai_handled && (
													<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
														AI Handled
													</span>
												)}
												<span className="text-sm text-muted-foreground">
													{call.duration ? `${call.duration}s` : "--"}
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
