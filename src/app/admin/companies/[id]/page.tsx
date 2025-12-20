"use client";

import {
	IconArrowLeft,
	IconCheck,
	IconLoader2,
	IconPhone,
	IconUser,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Company {
	id: string;
	name: string;
	phone: string | null;
	twilio_phone: string | null;
	dispatch_active: boolean;
	service_area: string | null;
	created_at: string;
	user_count: number;
	call_count: number;
}

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

interface Call {
	id: string;
	caller_number: string;
	status: string;
	duration: number;
	ai_handled: boolean;
	created_at: string;
}

export default function AdminCompanyEditPage() {
	const params = useParams();
	const router = useRouter();
	const companyId = params.id as string;

	const [company, setCompany] = useState<Company | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [calls, setCalls] = useState<Call[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [serviceArea, setServiceArea] = useState("");
	const [twilioPhone, setTwilioPhone] = useState("");
	const [dispatchActive, setDispatchActive] = useState(false);

	useEffect(() => {
		fetch(`/api/admin/companies/${companyId}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.company) {
					setCompany(data.company);
					setName(data.company.name || "");
					setPhone(data.company.phone || "");
					setServiceArea(data.company.service_area || "");
					setTwilioPhone(data.company.twilio_phone || "");
					setDispatchActive(data.company.dispatch_active || false);
				}
				setUsers(data.users || []);
				setCalls(data.recentCalls || []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [companyId]);

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);

		try {
			const res = await fetch(`/api/admin/companies/${companyId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					phone: phone || null,
					serviceArea: serviceArea || null,
					twilioPhone: twilioPhone || null,
					dispatchActive,
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

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!company) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center">
				<h2 className="text-xl font-bold">Company not found</h2>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => router.back()}
				>
					Go back
				</Button>
			</div>
		);
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<Button
						variant="ghost"
						size="sm"
						className="mb-4"
						onClick={() => router.back()}
					>
						<IconArrowLeft className="mr-2 h-4 w-4" />
						Back to Companies
					</Button>

					<div className="mb-6">
						<h1 className="text-2xl font-bold">{company.name}</h1>
						<p className="text-muted-foreground">Edit company details</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						{/* Company Details */}
						<Card>
							<CardHeader>
								<CardTitle>Company Details</CardTitle>
								<CardDescription>
									Update company information and assign Twilio number
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Company Name</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="phone">Contact Phone</Label>
									<Input
										id="phone"
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="(555) 123-4567"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="serviceArea">Service Area</Label>
									<Input
										id="serviceArea"
										value={serviceArea}
										onChange={(e) => setServiceArea(e.target.value)}
										placeholder="Albany, NY - Capital Region"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="twilioPhone">Twilio Phone Number</Label>
									<Input
										id="twilioPhone"
										type="tel"
										value={twilioPhone}
										onChange={(e) => setTwilioPhone(e.target.value)}
										placeholder="+15551234567"
									/>
									<p className="text-xs text-muted-foreground">
										The Twilio number customers call to reach the AI dispatcher
									</p>
								</div>

								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<Label>Dispatch Active</Label>
										<p className="text-sm text-muted-foreground">
											Toggle AI dispatcher on/off for this company
										</p>
									</div>
									<Switch
										checked={dispatchActive}
										onCheckedChange={setDispatchActive}
									/>
								</div>

								<Button
									onClick={handleSave}
									disabled={saving}
									className="w-full"
								>
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
							</CardContent>
						</Card>

						{/* Users */}
						<Card>
							<CardHeader>
								<CardTitle>Linked Users</CardTitle>
								<CardDescription>
									Users associated with this company
								</CardDescription>
							</CardHeader>
							<CardContent>
								{users.length === 0 ? (
									<div className="flex min-h-[100px] flex-col items-center justify-center text-muted-foreground">
										<IconUser className="mb-2 h-6 w-6" />
										<p className="text-sm">No users linked</p>
									</div>
								) : (
									<div className="space-y-3">
										{users.map((user) => (
											<div
												key={user.id}
												className="flex items-center justify-between rounded-lg border p-3"
											>
												<div>
													<p className="font-medium">{user.name}</p>
													<p className="text-sm text-muted-foreground">
														{user.email}
													</p>
												</div>
												<Badge variant="outline">{user.role}</Badge>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Recent Calls */}
					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Recent Calls</CardTitle>
							<CardDescription>Last 10 calls for this company</CardDescription>
						</CardHeader>
						<CardContent>
							{calls.length === 0 ? (
								<div className="flex min-h-[100px] flex-col items-center justify-center text-muted-foreground">
									<IconPhone className="mb-2 h-6 w-6" />
									<p className="text-sm">No calls yet</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>Caller</TableHead>
											<TableHead>Duration</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>AI Handled</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{calls.map((call) => (
											<TableRow key={call.id}>
												<TableCell>
													{new Date(call.created_at).toLocaleString()}
												</TableCell>
												<TableCell className="font-mono">
													{call.caller_number}
												</TableCell>
												<TableCell>{formatDuration(call.duration)}</TableCell>
												<TableCell>
													<Badge variant="outline">{call.status}</Badge>
												</TableCell>
												<TableCell>
													{call.ai_handled ? (
														<Badge className="bg-green-500/10 text-green-600">
															Yes
														</Badge>
													) : (
														<Badge variant="secondary">No</Badge>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
