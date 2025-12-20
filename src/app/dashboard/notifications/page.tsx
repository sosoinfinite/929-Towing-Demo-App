"use client";

import {
	IconBell,
	IconCheck,
	IconLoader2,
	IconMail,
	IconPhone,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationSettings {
	emailNewCalls: boolean;
	emailMissedCalls: boolean;
	emailWeeklySummary: boolean;
	smsNewCalls: boolean;
	smsMissedCalls: boolean;
}

export default function NotificationsPage() {
	const [settings, setSettings] = useState<NotificationSettings>({
		emailNewCalls: true,
		emailMissedCalls: true,
		emailWeeklySummary: false,
		smsNewCalls: false,
		smsMissedCalls: true,
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		fetch("/api/notifications")
			.then((res) => res.json())
			.then((data) => {
				setSettings(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const updateSetting = async (key: keyof NotificationSettings) => {
		const newSettings = {
			...settings,
			[key]: !settings[key],
		};
		setSettings(newSettings);
		setSaving(true);
		setSaved(false);

		try {
			await fetch("/api/notifications", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newSettings),
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch (error) {
			console.error("Failed to save preferences:", error);
			// Revert on error
			setSettings(settings);
		} finally {
			setSaving(false);
		}
	};

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
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold">Notifications</h1>
								<p className="text-muted-foreground">
									Manage how you receive alerts and updates
								</p>
							</div>
							{(saving || saved) && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									{saving ? (
										<>
											<IconLoader2 className="h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<IconCheck className="h-4 w-4 text-green-600" />
											Saved
										</>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="space-y-6">
						{/* Email Notifications */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconMail className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>Email Notifications</CardTitle>
										<CardDescription>Receive updates via email</CardDescription>
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
										onCheckedChange={() => updateSetting("emailNewCalls")}
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
										onCheckedChange={() => updateSetting("emailMissedCalls")}
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
										onCheckedChange={() => updateSetting("emailWeeklySummary")}
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
										onCheckedChange={() => updateSetting("smsNewCalls")}
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
										onCheckedChange={() => updateSetting("smsMissedCalls")}
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
					</div>
				</div>
			</div>
		</div>
	);
}
