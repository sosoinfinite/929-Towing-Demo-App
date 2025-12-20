"use client";

import {
	IconCheck,
	IconMail,
	IconMailOpened,
	IconRefresh,
	IconSend,
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
import { Input } from "@/components/ui/input";
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

interface Message {
	id: string;
	lead_id: string;
	direction: "inbound" | "outbound";
	from_email: string;
	to_email: string;
	subject: string | null;
	body: string;
	created_at: string;
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
	const [messages, setMessages] = useState<Message[]>([]);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [notes, setNotes] = useState("");
	const [replySubject, setReplySubject] = useState("");
	const [replyMessage, setReplyMessage] = useState("");
	const [sending, setSending] = useState(false);

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

	const fetchMessages = async (leadId: string) => {
		setLoadingMessages(true);
		try {
			const res = await fetch(`/api/admin/leads/${leadId}/messages`);
			const data = await res.json();
			setMessages(data.messages || []);
		} catch {
			setMessages([]);
		}
		setLoadingMessages(false);
	};

	useEffect(() => {
		fetchLeads();
	}, []);

	const openLead = (lead: Lead) => {
		setSelectedLead(lead);
		setNotes(lead.notes || "");
		setReplySubject(`Re: ${lead.subject || "Your inquiry"}`);
		setReplyMessage("");
		fetchMessages(lead.id);
	};

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
		fetchLeads();
	};

	const sendReply = async () => {
		if (!selectedLead || !replyMessage.trim()) return;
		setSending(true);
		try {
			const res = await fetch(
				`/api/admin/leads/${selectedLead.id}/messages`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						subject: replySubject,
						message: replyMessage,
					}),
				},
			);
			if (res.ok) {
				setReplyMessage("");
				fetchMessages(selectedLead.id);
				fetchLeads(); // Refresh to update status
			}
		} catch (error) {
			console.error("Error sending reply:", error);
		}
		setSending(false);
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
								Inbound emails to hookups@tow.center
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
								Click on a lead to view conversation and reply
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
										hookups@tow.center
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
														onClick={() => openLead(lead)}
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
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>
							{selectedLead?.from_name || selectedLead?.from_email}
						</DialogTitle>
						<DialogDescription className="flex items-center gap-2">
							{selectedLead?.from_email}
							{selectedLead && (
								<Badge className={statusColors[selectedLead.status]}>
									{selectedLead.status}
								</Badge>
							)}
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-hidden flex flex-col gap-4">
						{/* Conversation Thread */}
						<div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] max-h-[300px] border rounded-md p-3">
							{loadingMessages ? (
								<div className="text-center text-muted-foreground py-4">
									Loading messages...
								</div>
							) : messages.length === 0 ? (
								<div className="text-center text-muted-foreground py-4">
									No messages yet
								</div>
							) : (
								messages.map((msg) => (
									<div
										key={msg.id}
										className={`rounded-lg p-3 ${
											msg.direction === "inbound"
												? "bg-muted"
												: "bg-primary/10 ml-8"
										}`}
									>
										<div className="flex items-center justify-between mb-1">
											<span className="text-xs font-medium">
												{msg.direction === "inbound" ? "From" : "To"}:{" "}
												{msg.direction === "inbound"
													? msg.from_email
													: msg.to_email}
											</span>
											<span className="text-xs text-muted-foreground">
												{formatDate(msg.created_at)}
											</span>
										</div>
										{msg.subject && (
											<div className="text-xs text-muted-foreground mb-1">
												Subject: {msg.subject}
											</div>
										)}
										<div className="text-sm whitespace-pre-wrap">
											{msg.body}
										</div>
									</div>
								))
							)}
						</div>

						{/* Reply Section */}
						<div className="space-y-2 border-t pt-3">
							<Input
								value={replySubject}
								onChange={(e) => setReplySubject(e.target.value)}
								placeholder="Subject"
								className="text-sm"
							/>
							<Textarea
								value={replyMessage}
								onChange={(e) => setReplyMessage(e.target.value)}
								placeholder="Type your reply..."
								rows={4}
							/>
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-2">
									<Input
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										placeholder="Internal notes..."
										className="text-sm w-64"
									/>
									<Button variant="outline" size="sm" onClick={saveNotes}>
										Save Notes
									</Button>
								</div>
								<Button
									onClick={sendReply}
									disabled={sending || !replyMessage.trim()}
								>
									<IconSend className="mr-2 h-4 w-4" />
									{sending ? "Sending..." : "Send Reply"}
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
