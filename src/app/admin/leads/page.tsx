"use client";

import {
	IconCheck,
	IconMail,
	IconMailOpened,
	IconRefresh,
	IconX,
} from "@tabler/icons-react";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

interface Lead {
	id: string;
	email_id: string | null;
	from_email: string;
	from_name: string | null;
	subject: string | null;
	body_preview: string | null;
	text_body: string | null;
	html_body: string | null;
	status: string;
	notes: string | null;
	assigned_to: string | null;
	assigned_to_name: string | null;
	created_at: string;
	updated_at: string;
}

interface Stats {
	new: number;
	contacted: number;
	qualified: number;
	converted: number;
	rejected: number;
	total: number;
}

const statusColors: Record<string, string> = {
	new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	contacted: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	qualified: "bg-purple-500/10 text-purple-600 border-purple-500/20",
	converted: "bg-green-500/10 text-green-600 border-green-500/20",
	rejected: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function AdminLeadsPage() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [stats, setStats] = useState<Stats>({
		new: 0,
		contacted: 0,
		qualified: 0,
		converted: 0,
		rejected: 0,
		total: 0,
	});
	const [loading, setLoading] = useState(true);
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
	const [notes, setNotes] = useState("");

	const fetchLeads = () => {
		setLoading(true);
		fetch("/api/admin/leads")
			.then((res) => res.json())
			.then((data) => {
				setLeads(data.leads || []);
				setStats(data.stats || stats);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	};

	useEffect(() => {
		fetchLeads();
	}, []);

	const updateStatus = async (leadId: string, newStatus: string) => {
		await fetch("/api/admin/leads", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: leadId, status: newStatus }),
		});
		fetchLeads();
	};

	const saveNotes = async () => {
		if (!selectedLead) return;
		await fetch("/api/admin/leads", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: selectedLead.id, notes }),
		});
		setSelectedLead(null);
		fetchLeads();
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">Sales Leads</h1>
							<p className="text-muted-foreground">
								Inbound emails to hookups@support.center
							</p>
						</div>
						<Button variant="outline" size="sm" onClick={fetchLeads}>
							<IconRefresh className="mr-2 h-4 w-4" />
							Refresh
						</Button>
					</div>

					{/* Stats Cards */}
					<div className="mb-6 grid gap-4 md:grid-cols-5">
						<Card>
							<CardContent className="pt-6">
								<div className="text-2xl font-bold text-blue-600">
									{stats.new}
								</div>
								<p className="text-xs text-muted-foreground">New</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-2xl font-bold text-yellow-600">
									{stats.contacted}
								</div>
								<p className="text-xs text-muted-foreground">Contacted</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-2xl font-bold text-purple-600">
									{stats.qualified}
								</div>
								<p className="text-xs text-muted-foreground">Qualified</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-2xl font-bold text-green-600">
									{stats.converted}
								</div>
								<p className="text-xs text-muted-foreground">Converted</p>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="text-2xl font-bold text-red-600">
									{stats.rejected}
								</div>
								<p className="text-xs text-muted-foreground">Rejected</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>All Leads</CardTitle>
							<CardDescription>
								Click on a lead to view full email and add notes
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
									Loading...
								</div>
							) : leads.length === 0 ? (
								<div className="flex min-h-[200px] flex-col items-center justify-center text-muted-foreground">
									<div className="mb-4 rounded-full bg-muted p-4">
										<IconMail className="h-8 w-8" />
									</div>
									<h3 className="text-lg font-medium text-foreground">
										No leads yet
									</h3>
									<p className="mt-1 text-center text-sm">
										Leads will appear here when emails are sent to
										hookups@support.center
									</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Date</TableHead>
											<TableHead>From</TableHead>
											<TableHead>Subject</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{leads.map((lead) => (
											<TableRow key={lead.id}>
												<TableCell className="whitespace-nowrap">
													{formatDate(lead.created_at)}
												</TableCell>
												<TableCell>
													<button
														type="button"
														className="text-left hover:underline"
														onClick={() => {
															setSelectedLead(lead);
															setNotes(lead.notes || "");
														}}
													>
														<div className="font-medium">
															{lead.from_name || lead.from_email}
														</div>
														{lead.from_name && (
															<div className="text-xs text-muted-foreground">
																{lead.from_email}
															</div>
														)}
													</button>
												</TableCell>
												<TableCell className="max-w-[300px] truncate">
													{lead.subject || "(no subject)"}
												</TableCell>
												<TableCell>
													<Badge className={statusColors[lead.status]}>
														{lead.status}
													</Badge>
												</TableCell>
												<TableCell>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="outline" size="sm">
																Update Status
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuItem
																onClick={() => updateStatus(lead.id, "new")}
															>
																<IconMail className="mr-2 h-4 w-4" />
																New
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	updateStatus(lead.id, "contacted")
																}
															>
																<IconMailOpened className="mr-2 h-4 w-4" />
																Contacted
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	updateStatus(lead.id, "qualified")
																}
															>
																<IconCheck className="mr-2 h-4 w-4" />
																Qualified
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	updateStatus(lead.id, "converted")
																}
															>
																<IconCheck className="mr-2 h-4 w-4 text-green-600" />
																Converted
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() =>
																	updateStatus(lead.id, "rejected")
																}
															>
																<IconX className="mr-2 h-4 w-4 text-red-600" />
																Rejected
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
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

			{/* Lead Detail Dialog */}
			<Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{selectedLead?.from_name || selectedLead?.from_email}
						</DialogTitle>
						<DialogDescription>{selectedLead?.from_email}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Subject
							</h4>
							<p>{selectedLead?.subject || "(no subject)"}</p>
						</div>
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								Message
							</h4>
							<div className="mt-1 max-h-[300px] overflow-y-auto rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
								{selectedLead?.text_body ||
									selectedLead?.body_preview ||
									"(no content)"}
							</div>
						</div>
						<div>
							<h4 className="mb-2 text-sm font-medium text-muted-foreground">
								Notes
							</h4>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Add notes about this lead..."
								rows={3}
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setSelectedLead(null)}>
								Cancel
							</Button>
							<Button onClick={saveNotes}>Save Notes</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
