"use client";

import { useState } from "react";
import { DispatchToggle } from "@/components/dispatch-toggle";
import { SectionCards } from "@/components/section-cards";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
	const [dispatchActive, setDispatchActive] = useState(false);

	const handleToggle = async (active: boolean) => {
		setDispatchActive(active);
		// TODO: Call API to update dispatch state in database
		console.log("[Dispatch] State changed to:", active);
	};

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
				<SectionCards dispatchActive={dispatchActive} />

				{/* Recent Activity Placeholder */}
				<div className="px-4 lg:px-6">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>
								Your most recent calls and dispatches will appear here
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
								<div className="text-center">
									<p className="text-lg font-medium">No activity yet</p>
									<p className="text-sm">
										Turn on AI Dispatch to start receiving calls
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
