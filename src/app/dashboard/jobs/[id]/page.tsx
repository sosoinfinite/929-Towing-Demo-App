"use client";

import {
	IconArrowLeft,
	IconCar,
	IconCheck,
	IconLoader2,
	IconMapPin,
	IconMessage,
	IconPhone,
	IconSend,
	IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Job {
	id: string;
	source: string;
	status: string;
	customer_name: string | null;
	customer_phone: string;
	customer_email: string | null;
	service_type: string | null;
	vehicle_info: string | null;
	pickup_location: string;
	dropoff_location: string | null;
	motor_club: string | null;
	po_number: string | null;
	notes: string | null;
	driver_name: string | null;
	driver_email: string | null;
	assigned_driver_id: string | null;
	assigned_at: string | null;
	created_at: string;
	updated_at: string;
}

interface Message {
	id: string;
	direction: string;
	channel: string;
	from_address: string;
	to_address: string;
	content: string;
	actor_type: string | null;
	actor_name: string | null;
	created_at: string;
}

const statusColors: Record<string, string> = {
	pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	assigned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	en_route: "bg-purple-500/10 text-purple-600 border-purple-500/20",
	arrived: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
	completed: "bg-green-500/10 text-green-600 border-green-500/20",
	cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const serviceLabels: Record<string, string> = {
	tow: "Tow",
	jumpstart: "Jump Start",
	lockout: "Lockout",
	tire: "Tire Change",
	fuel: "Fuel Delivery",
	winch: "Winch Out",
	other: "Other",
};

export default function JobDetailPage() {
	const params = useParams();
	const id = params.id as string;

	const [job, setJob] = useState<Job | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(true);
	const [newMessage, setNewMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		Promise.all([
			fetch(`/api/jobs/${id}`).then((res) => res.json()),
			fetch(`/api/jobs/${id}/messages`).then((res) => res.json()),
		])
			.then(([jobData, messagesData]) => {
				if (jobData.job) {
					setJob(jobData.job);
				}
				if (messagesData.messages) {
					setMessages(messagesData.messages);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [id]);

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const formatTime = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const formatStatus = (status: string) => {
		return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
	};

	const updateStatus = async (newStatus: string) => {
		setUpdating(true);
		try {
			const res = await fetch(`/api/jobs/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});
			const data = await res.json();
			if (data.job) {
				setJob(data.job);
			}
		} catch (error) {
			console.error("Failed to update status:", error);
		}
		setUpdating(false);
	};

	const sendMessage = async () => {
		if (!newMessage.trim() || !job?.customer_phone) return;

		setSending(true);
		try {
			const res = await fetch(`/api/jobs/${id}/messages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: newMessage, channel: "sms" }),
			});
			const data = await res.json();
			if (data.success) {
				// Refresh messages
				const messagesRes = await fetch(`/api/jobs/${id}/messages`);
				const messagesData = await messagesRes.json();
				if (messagesData.messages) {
					setMessages(messagesData.messages);
				}
				setNewMessage("");
			}
		} catch (error) {
			console.error("Failed to send message:", error);
		}
		setSending(false);
	};

	if (loading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!job) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4">
				<p className="text-muted-foreground">Job not found</p>
				<Button asChild variant="outline">
					<Link href="/dashboard/jobs">Back to Jobs</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					{/* Header */}
					<div className="mb-6">
						<Button asChild variant="ghost" size="sm" className="mb-4">
							<Link href="/dashboard/jobs">
								<IconArrowLeft className="mr-2 h-4 w-4" />
								Back to Jobs
							</Link>
						</Button>
						<div className="flex items-center justify-between">
							<div>
								<div className="flex items-center gap-3">
									<h1 className="text-2xl font-bold">
										{job.customer_name || "Unknown Customer"}
									</h1>
									<Badge className={statusColors[job.status] || "bg-muted"}>
										{formatStatus(job.status)}
									</Badge>
								</div>
								<p className="text-muted-foreground">
									Created {formatDate(job.created_at)}
								</p>
							</div>
							<Select
								value={job.status}
								onValueChange={updateStatus}
								disabled={updating}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Update status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="assigned">Assigned</SelectItem>
									<SelectItem value="en_route">En Route</SelectItem>
									<SelectItem value="arrived">Arrived</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						{/* Job Details */}
						<div className="lg:col-span-2 space-y-6">
							{/* Customer & Service Info */}
							<Card>
								<CardHeader>
									<CardTitle>Job Details</CardTitle>
								</CardHeader>
								<CardContent className="grid gap-6 sm:grid-cols-2">
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<IconUser className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-sm text-muted-foreground">
													Customer
												</p>
												<p className="font-medium">
													{job.customer_name || "Unknown"}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<IconPhone className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-sm text-muted-foreground">Phone</p>
												<p className="font-medium font-mono">
													{job.customer_phone}
												</p>
											</div>
										</div>
										{job.service_type && (
											<div className="flex items-start gap-3">
												<IconCar className="h-5 w-5 text-muted-foreground mt-0.5" />
												<div>
													<p className="text-sm text-muted-foreground">
														Service
													</p>
													<p className="font-medium">
														{serviceLabels[job.service_type] ||
															job.service_type}
													</p>
												</div>
											</div>
										)}
										{job.vehicle_info && (
											<div className="flex items-start gap-3">
												<IconCar className="h-5 w-5 text-muted-foreground mt-0.5" />
												<div>
													<p className="text-sm text-muted-foreground">
														Vehicle
													</p>
													<p className="font-medium">{job.vehicle_info}</p>
												</div>
											</div>
										)}
									</div>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<IconMapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
											<div>
												<p className="text-sm text-muted-foreground">Pickup</p>
												<p className="font-medium">{job.pickup_location}</p>
											</div>
										</div>
										{job.dropoff_location && (
											<div className="flex items-start gap-3">
												<IconMapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
												<div>
													<p className="text-sm text-muted-foreground">
														Dropoff
													</p>
													<p className="font-medium">{job.dropoff_location}</p>
												</div>
											</div>
										)}
										{job.motor_club && (
											<div>
												<p className="text-sm text-muted-foreground">
													Motor Club
												</p>
												<p className="font-medium">{job.motor_club}</p>
											</div>
										)}
										{job.po_number && (
											<div>
												<p className="text-sm text-muted-foreground">
													PO Number
												</p>
												<p className="font-medium font-mono">{job.po_number}</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Notes */}
							{job.notes && (
								<Card>
									<CardHeader>
										<CardTitle>Notes</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="whitespace-pre-wrap">{job.notes}</p>
									</CardContent>
								</Card>
							)}

							{/* Message Thread */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<IconMessage className="h-5 w-5" />
										Messages
									</CardTitle>
									<CardDescription>
										SMS communication with customer
									</CardDescription>
								</CardHeader>
								<CardContent>
									{messages.length === 0 ? (
										<p className="text-center text-muted-foreground py-8">
											No messages yet
										</p>
									) : (
										<div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
											{messages.map((msg) => (
												<div
													key={msg.id}
													className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
												>
													<div
														className={`max-w-[80%] rounded-lg px-4 py-2 ${
															msg.direction === "outbound"
																? "bg-primary text-primary-foreground"
																: "bg-muted"
														}`}
													>
														<p className="text-sm">{msg.content}</p>
														<p
															className={`text-xs mt-1 ${msg.direction === "outbound" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
														>
															{formatTime(msg.created_at)}
															{msg.actor_name && ` · ${msg.actor_name}`}
														</p>
													</div>
												</div>
											))}
										</div>
									)}

									{/* Send Message */}
									<div className="flex gap-2">
										<Input
											placeholder="Type a message..."
											value={newMessage}
											onChange={(e) => setNewMessage(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													sendMessage();
												}
											}}
											disabled={sending}
										/>
										<Button
											onClick={sendMessage}
											disabled={sending || !newMessage.trim()}
										>
											{sending ? (
												<IconLoader2 className="h-4 w-4 animate-spin" />
											) : (
												<IconSend className="h-4 w-4" />
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Driver Assignment */}
							<Card>
								<CardHeader>
									<CardTitle>Driver</CardTitle>
								</CardHeader>
								<CardContent>
									{job.assigned_driver_id ? (
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
													<IconUser className="h-5 w-5 text-primary" />
												</div>
												<div>
													<p className="font-medium">{job.driver_name}</p>
													{job.driver_email && (
														<p className="text-sm text-muted-foreground">
															{job.driver_email}
														</p>
													)}
												</div>
											</div>
											{job.assigned_at && (
												<p className="text-sm text-muted-foreground">
													Assigned {formatDate(job.assigned_at)}
												</p>
											)}
										</div>
									) : (
										<div className="text-center py-4">
											<p className="text-muted-foreground mb-3">
												No driver assigned
											</p>
											<Button variant="outline" size="sm" disabled>
												Assign Driver
											</Button>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Quick Actions */}
							<Card>
								<CardHeader>
									<CardTitle>Quick Actions</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									{job.status === "pending" && (
										<Button
											className="w-full"
											variant="outline"
											onClick={() => updateStatus("assigned")}
											disabled={updating}
										>
											<IconCheck className="mr-2 h-4 w-4" />
											Mark Assigned
										</Button>
									)}
									{job.status === "assigned" && (
										<Button
											className="w-full"
											variant="outline"
											onClick={() => updateStatus("en_route")}
											disabled={updating}
										>
											<IconCar className="mr-2 h-4 w-4" />
											Mark En Route
										</Button>
									)}
									{job.status === "en_route" && (
										<Button
											className="w-full"
											variant="outline"
											onClick={() => updateStatus("arrived")}
											disabled={updating}
										>
											<IconMapPin className="mr-2 h-4 w-4" />
											Mark Arrived
										</Button>
									)}
									{(job.status === "arrived" || job.status === "en_route") && (
										<Button
											className="w-full"
											onClick={() => updateStatus("completed")}
											disabled={updating}
										>
											<IconCheck className="mr-2 h-4 w-4" />
											Mark Completed
										</Button>
									)}
									{job.status !== "cancelled" && job.status !== "completed" && (
										<Button
											className="w-full"
											variant="destructive"
											onClick={() => updateStatus("cancelled")}
											disabled={updating}
										>
											Cancel Job
										</Button>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
