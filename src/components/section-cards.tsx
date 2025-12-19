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
}

export function SectionCards({ dispatchActive = false }: SectionCardsProps) {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Calls Today</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						0
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconPhone className="size-3" />
							No calls yet
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Waiting for first call
					</div>
					<div className="text-muted-foreground">
						Turn on dispatch to start receiving calls
					</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Revenue This Week</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						$0.00
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp className="size-3" />
							--
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						No revenue tracked yet
					</div>
					<div className="text-muted-foreground">
						Revenue will appear after completed calls
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
						--
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp className="size-3" />
							N/A
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">No data yet</div>
					<div className="text-muted-foreground">
						Success rate calculated after 10+ calls
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
