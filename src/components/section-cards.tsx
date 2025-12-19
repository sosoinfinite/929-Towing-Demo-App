import { IconPhone, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface SectionCardsProps {
	dispatchActive?: boolean;
	callsToday?: number;
	revenueThisWeek?: number;
	successRate?: number;
}

export function SectionCards({
	dispatchActive = false,
	callsToday = 0,
	revenueThisWeek = 0,
	successRate = 0,
}: SectionCardsProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Calls Today</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{callsToday}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconPhone className="size-3" />
							{callsToday === 0
								? "No calls yet"
								: `${callsToday} call${callsToday === 1 ? "" : "s"}`}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{callsToday === 0
							? "Waiting for first call"
							: "Calls handled today"}
					</div>
					<div className="text-muted-foreground">
						{callsToday === 0
							? "Turn on dispatch to start receiving calls"
							: "AI is handling your calls"}
					</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Revenue This Week</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{formatCurrency(revenueThisWeek)}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp className="size-3" />
							{revenueThisWeek > 0 ? "Est." : "--"}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{revenueThisWeek > 0
							? "Estimated from calls"
							: "No revenue tracked yet"}
					</div>
					<div className="text-muted-foreground">
						{revenueThisWeek > 0
							? "Based on avg $150/job"
							: "Revenue will appear after completed calls"}
					</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Dispatch Status</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{dispatchActive ? "ACTIVE" : "OFF"}
					</CardTitle>
					<CardAction>
						<Badge variant={dispatchActive ? "default" : "secondary"}>
							{dispatchActive ? "Online" : "Offline"}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{dispatchActive ? "AI is answering calls" : "AI is not active"}
					</div>
					<div className="text-muted-foreground">
						{dispatchActive
							? "Calls are being handled automatically"
							: "Toggle dispatch on to start"}
					</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>AI Success Rate</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{successRate > 0 ? `${successRate}%` : "--"}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp className="size-3" />
							{successRate > 0 ? "This month" : "N/A"}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{successRate > 0 ? "Calls handled by AI" : "No data yet"}
					</div>
					<div className="text-muted-foreground">
						{successRate > 0
							? "Percentage of AI-handled calls"
							: "Success rate calculated after 10+ calls"}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
