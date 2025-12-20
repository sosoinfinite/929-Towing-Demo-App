"use client";

import { IconBell, IconCheck, IconMail, IconPhone } from "@tabler/icons-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NotificationsPage() {
	const [settings, setSettings] = useState({
		emailNewCalls: true,
		emailMissedCalls: true,
		emailWeeklySummary: false,
		smsNewCalls: false,
		smsMissedCalls: true,
	});

	const toggleSetting = (key: keyof typeof settings) => {
		setSettings((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Notifications</h1>
						<p className="text-muted-foreground">
							Manage how you receive alerts and updates
						</p>
					</div>

					<div className="space-y-6">
						{/* Email Notifications */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconMail className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>Email Notifications</CardTitle>
										<CardDescription>
											Receive updates via email
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<Label htmlFor="email-new-calls">New call alerts</Label>
										<p className="text-sm text-muted-foreground">
											Get notified when a new call is received
										</p>
									</div>
									<Switch
										id="email-new-calls"
										checked={settings.emailNewCalls}
										onCheckedChange={() => toggleSetting("emailNewCalls")}
									/>
								</div>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<Label htmlFor="email-missed-calls">Missed call alerts</Label>
										<p className="text-sm text-muted-foreground">
											Get notified when a call is missed or fails
										</p>
									</div>
									<Switch
										id="email-missed-calls"
										checked={settings.emailMissedCalls}
										onCheckedChange={() => toggleSetting("emailMissedCalls")}
									/>
								</div>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<Label htmlFor="email-weekly">Weekly summary</Label>
										<p className="text-sm text-muted-foreground">
											Receive a weekly report of call activity
										</p>
									</div>
									<Switch
										id="email-weekly"
										checked={settings.emailWeeklySummary}
										onCheckedChange={() => toggleSetting("emailWeeklySummary")}
									/>
								</div>
							</CardContent>
						</Card>

						{/* SMS Notifications */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconPhone className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>SMS Notifications</CardTitle>
										<CardDescription>Receive alerts via text message</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<Label htmlFor="sms-new-calls">New call alerts</Label>
										<p className="text-sm text-muted-foreground">
											Get a text when a new call is received
										</p>
									</div>
									<Switch
										id="sms-new-calls"
										checked={settings.smsNewCalls}
										onCheckedChange={() => toggleSetting("smsNewCalls")}
									/>
								</div>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<Label htmlFor="sms-missed-calls">Missed call alerts</Label>
										<p className="text-sm text-muted-foreground">
											Get a text when a call is missed
										</p>
									</div>
									<Switch
										id="sms-missed-calls"
										checked={settings.smsMissedCalls}
										onCheckedChange={() => toggleSetting("smsMissedCalls")}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Activity */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconBell className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>Recent Activity</CardTitle>
										<CardDescription>
											Your recent notification history
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex min-h-[150px] flex-col items-center justify-center text-muted-foreground">
									<IconCheck className="mb-2 h-8 w-8" />
									<p className="text-sm">All caught up!</p>
									<p className="text-xs">No new notifications</p>
								</div>
							</CardContent>
						</Card>

						<p className="text-center text-xs text-muted-foreground">
							Note: Notification preferences will be saved automatically in a
							future update.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
