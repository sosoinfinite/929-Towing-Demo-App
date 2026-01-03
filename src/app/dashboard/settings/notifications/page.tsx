"use client";

import {
	IconBell,
	IconCheck,
	IconLoader2,
	IconMail,
	IconPhone,
	IconTruck,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

type JobUpdatesChannel = "email" | "sms" | "both" | "none";

interface NotificationSettings {
	emailNewCalls: boolean;
	emailMissedCalls: boolean;
	emailWeeklySummary: boolean;
	smsNewCalls: boolean;
	smsMissedCalls: boolean;
	jobUpdatesChannel: JobUpdatesChannel;
}

export default function NotificationsSettingsPage() {
	const [settings, setSettings] = useState<NotificationSettings>({
		emailNewCalls: true,
		emailMissedCalls: true,
		emailWeeklySummary: false,
		smsNewCalls: false,
		smsMissedCalls: true,
		jobUpdatesChannel: "sms",
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

	const updateSetting = async (
		key: keyof NotificationSettings,
		value?: boolean | JobUpdatesChannel,
	) => {
		const newValue = value !== undefined ? value : !settings[key];
		const newSettings = {
			...settings,
			[key]: newValue,
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
			<div className="flex min-h-[300px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{(saving || saved) && (
				<div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
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

			{/* Job Updates Channel */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<IconTruck className="h-5 w-5 text-muted-foreground" />
						<div>
							<CardTitle>Job Status Updates</CardTitle>
							<CardDescription>
								Choose how to receive updates about job status changes
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<RadioGroup
						value={settings.jobUpdatesChannel}
						onValueChange={(value) =>
							updateSetting("jobUpdatesChannel", value as JobUpdatesChannel)
						}
						className="space-y-3"
					>
						<div className="flex items-center space-x-3 rounded-lg border p-4">
							<RadioGroupItem value="sms" id="channel-sms" />
							<Label htmlFor="channel-sms" className="flex-1 cursor-pointer">
								<div className="font-medium">SMS only</div>
								<div className="text-sm text-muted-foreground">
									Receive job updates via text message
								</div>
							</Label>
						</div>
						<div className="flex items-center space-x-3 rounded-lg border p-4">
							<RadioGroupItem value="email" id="channel-email" />
							<Label htmlFor="channel-email" className="flex-1 cursor-pointer">
								<div className="font-medium">Email only</div>
								<div className="text-sm text-muted-foreground">
									Receive job updates via email
								</div>
							</Label>
						</div>
						<div className="flex items-center space-x-3 rounded-lg border p-4">
							<RadioGroupItem value="both" id="channel-both" />
							<Label htmlFor="channel-both" className="flex-1 cursor-pointer">
								<div className="font-medium">Both email and SMS</div>
								<div className="text-sm text-muted-foreground">
									Receive job updates via both channels
								</div>
							</Label>
						</div>
						<div className="flex items-center space-x-3 rounded-lg border p-4">
							<RadioGroupItem value="none" id="channel-none" />
							<Label htmlFor="channel-none" className="flex-1 cursor-pointer">
								<div className="font-medium">No notifications</div>
								<div className="text-sm text-muted-foreground">
									Don&apos;t send job status updates
								</div>
							</Label>
						</div>
					</RadioGroup>
				</CardContent>
			</Card>

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
	);
}
