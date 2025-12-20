"use client";

import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanyForm, type CompanyFormData } from "@/components/company-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Company {
	id: string;
	name: string;
	phone: string | null;
	logo: string | null;
	service_area: string | null;
	twilio_phone: string | null;
}

export default function GeneralSettingsPage() {
	const [loading, setLoading] = useState(true);

	// Company state
	const [company, setCompany] = useState<Company | null>(null);
	const [companyData, setCompanyData] = useState<CompanyFormData>({
		name: "",
		phone: "",
		logo: "",
		serviceArea: "",
	});
	const [savingCompany, setSavingCompany] = useState(false);

	// AI Agent state
	const [greetingMessage, setGreetingMessage] = useState("");
	const [savingAgent, setSavingAgent] = useState(false);

	useEffect(() => {
		fetch("/api/settings")
			.then((res) => res.json())
			.then((data) => {
				if (data.company) {
					setCompany(data.company);
					setCompanyData({
						name: data.company.name || "",
						phone: data.company.phone || "",
						logo: data.company.logo || "",
						serviceArea: data.company.service_area || "",
					});
				}
				if (data.agentConfig) {
					setGreetingMessage(data.agentConfig.greeting_message || "");
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const handleSaveCompany = async () => {
		setSavingCompany(true);
		try {
			const res = await fetch("/api/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: companyData.name,
					phone: companyData.phone || null,
					logo: companyData.logo || null,
					serviceArea: companyData.serviceArea || null,
				}),
			});
			if (res.ok) {
				const data = await res.json();
				setCompany(data.company);
				toast.success("Company settings saved");
			} else {
				toast.error("Failed to save company settings");
			}
		} catch {
			toast.error("Failed to save company settings");
		} finally {
			setSavingCompany(false);
		}
	};

	const handleSaveAgent = async () => {
		setSavingAgent(true);
		try {
			const res = await fetch("/api/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ greetingMessage }),
			});
			if (res.ok) {
				toast.success("AI agent settings saved");
			} else {
				toast.error("Failed to save AI settings");
			}
		} catch {
			toast.error("Failed to save AI settings");
		} finally {
			setSavingAgent(false);
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
			{/* Company Card */}
			<Card>
				<CardHeader>
					<CardTitle>Company</CardTitle>
					<CardDescription>Your towing company information</CardDescription>
				</CardHeader>
				<CardContent>
					<CompanyForm
						data={companyData}
						onChange={setCompanyData}
						showHelperText={false}
					/>
					{company?.twilio_phone && (
						<div className="mt-4 rounded-lg border bg-muted/50 p-4">
							<p className="text-sm font-medium">AI Dispatch Number</p>
							<p className="mt-1 font-mono text-lg">{company.twilio_phone}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Customers call this number to reach your AI dispatcher
							</p>
						</div>
					)}
				</CardContent>
				<CardFooter className="justify-end border-t pt-4">
					<Button onClick={handleSaveCompany} disabled={savingCompany}>
						{savingCompany ? (
							<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<IconCheck className="mr-2 h-4 w-4" />
						)}
						Save Company
					</Button>
				</CardFooter>
			</Card>

			{/* AI Agent Card */}
			<Card>
				<CardHeader>
					<CardTitle>AI Agent</CardTitle>
					<CardDescription>
						Configure your AI dispatcher settings
					</CardDescription>
				</CardHeader>
				<CardContent>
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
							This message will be spoken by the AI when answering calls
						</p>
					</div>
				</CardContent>
				<CardFooter className="justify-end border-t pt-4">
					<Button onClick={handleSaveAgent} disabled={savingAgent}>
						{savingAgent ? (
							<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<IconCheck className="mr-2 h-4 w-4" />
						)}
						Save AI Settings
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
