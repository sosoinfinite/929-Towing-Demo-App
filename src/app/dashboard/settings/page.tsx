"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Company {
	id: string;
	name: string;
	phone: string | null;
	service_area: string | null;
	twilio_phone: string | null;
}

export default function SettingsPage() {
	const [company, setCompany] = useState<Company | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [serviceArea, setServiceArea] = useState("");
	const [greetingMessage, setGreetingMessage] = useState("");

	useEffect(() => {
		fetch("/api/settings")
			.then((res) => res.json())
			.then((data) => {
				if (data.company) {
					setCompany(data.company);
					setName(data.company.name || "");
					setPhone(data.company.phone || "");
					setServiceArea(data.company.service_area || "");
				}
				if (data.agentConfig) {
					setGreetingMessage(data.agentConfig.greeting_message || "");
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);

		try {
			const res = await fetch("/api/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					phone: phone || null,
					serviceArea: serviceArea || null,
					greetingMessage,
				}),
			});

			if (res.ok) {
				const data = await res.json();
				setCompany(data.company);
				setSaved(true);
				setTimeout(() => setSaved(false), 2000);
			}
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
									<Input
										id="company-name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your Towing Company"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="(555) 123-4567"
									/>
									<p className="text-xs text-muted-foreground">
										This is where you&apos;ll receive SMS notifications about
										new calls
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="service-area">Service Area</Label>
									<Input
										id="service-area"
										value={serviceArea}
										onChange={(e) => setServiceArea(e.target.value)}
										placeholder="Albany, NY - Capital Region"
									/>
								</div>
								{company?.twilio_phone && (
									<div className="rounded-lg border bg-muted/50 p-4">
										<p className="text-sm font-medium">
											Your AI Dispatch Number
										</p>
										<p className="mt-1 font-mono text-lg">
											{company.twilio_phone}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											Customers call this number to reach your AI dispatcher
										</p>
									</div>
								)}
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
									<Textarea
										id="greeting"
										rows={3}
										value={greetingMessage}
										onChange={(e) => setGreetingMessage(e.target.value)}
										placeholder="Hello, thank you for calling. How can I help you today?"
									/>
									<p className="text-xs text-muted-foreground">
										This is what the AI will say when answering calls
									</p>
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
											Free for 3 months, then $49/mo locked for life
										</p>
									</div>
									<Badge variant="default">Active</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Save Button */}
						<Button onClick={handleSave} disabled={saving} className="w-full">
							{saving ? (
								<>
									<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : saved ? (
								<>
									<IconCheck className="mr-2 h-4 w-4" />
									Saved
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
