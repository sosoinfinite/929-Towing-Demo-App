import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Settings</h1>
						<p className="text-muted-foreground">
							Manage your account and preferences
						</p>
					</div>

					<div className="space-y-6">
						{/* Company Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Company</CardTitle>
								<CardDescription>
									Your towing company information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="company-name">Company Name</Label>
									<Input id="company-name" placeholder="Your Towing Company" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input id="phone" type="tel" placeholder="(555) 123-4567" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="service-area">Service Area</Label>
									<Input
										id="service-area"
										placeholder="Albany, NY - Capital Region"
									/>
								</div>
							</CardContent>
						</Card>

						{/* AI Agent Settings */}
						<Card>
							<CardHeader>
								<CardTitle>AI Agent</CardTitle>
								<CardDescription>
									Configure your AI dispatcher settings
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="greeting">Greeting Message</Label>
									<textarea
										id="greeting"
										rows={3}
										placeholder="Hello, thank you for calling. How can I help you today?"
										className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Subscription */}
						<Card>
							<CardHeader>
								<CardTitle>Subscription</CardTitle>
								<CardDescription>Your current plan and billing</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Alpha Program</p>
										<p className="text-sm text-muted-foreground">
											Free for 3 months, then $49/mo
										</p>
									</div>
									<Badge variant="default">Active</Badge>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
