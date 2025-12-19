import { IconPhone } from "@tabler/icons-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function CallsPage() {
	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Call History</h1>
						<p className="text-muted-foreground">
							View and manage your incoming calls
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Recent Calls</CardTitle>
							<CardDescription>
								All calls handled by your AI dispatcher
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex min-h-[400px] flex-col items-center justify-center text-muted-foreground">
								<div className="mb-4 rounded-full bg-muted p-4">
									<IconPhone className="h-8 w-8" />
								</div>
								<h3 className="text-lg font-medium text-foreground">
									No calls yet
								</h3>
								<p className="mt-1 max-w-sm text-center text-sm">
									Calls will appear here once your AI dispatcher handles them.
									Turn on dispatch to start receiving calls.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
