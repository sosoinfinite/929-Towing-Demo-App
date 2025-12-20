"use client";

import {
	IconArrowLeft,
	IconClock,
	IconLoader2,
	IconPhone,
	IconRobot,
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

interface Call {
	id: string;
	twilioCallSid: string | null;
	callerNumber: string;
	status: string;
	duration: number | null;
	transcript: string | null;
	aiHandled: boolean;
	createdAt: string;
}

export default function CallDetailPage() {
	const params = useParams();
	const [call, setCall] = useState<Call | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!params.id) return;

		fetch(`/api/calls/${params.id}`)
			.then((res) => {
				if (!res.ok) throw new Error("Call not found");
				return res.json();
			})
			.then((data) => {
				setCall(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, [params.id]);

	const formatDuration = (seconds: number | null) => {
		if (!seconds) return "N/A";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "border-green-500/20 bg-green-500/10 text-green-600";
			case "missed":
			case "failed":
			case "no-answer":
				return "border-red-500/20 bg-red-500/10 text-red-600";
			case "busy":
				return "border-yellow-500/20 bg-yellow-500/10 text-yellow-600";
			default:
				return "";
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !call) {
		return (
			<div className="@container/main flex flex-1 flex-col gap-2">
				<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<div className="px-4 lg:px-6">
						<div className="flex min-h-[300px] flex-col items-center justify-center">
							<p className="text-muted-foreground">{error || "Call not found"}</p>
							<Button asChild variant="outline" className="mt-4">
								<Link href="/dashboard/calls">
									<IconArrowLeft className="mr-2 h-4 w-4" />
									Back to calls
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<Button asChild variant="ghost" className="mb-4 -ml-2">
							<Link href="/dashboard/calls">
								<IconArrowLeft className="mr-2 h-4 w-4" />
								Back to calls
							</Link>
						</Button>
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold">Call Details</h1>
								<p className="text-muted-foreground">
									{formatDate(call.createdAt)}
								</p>
							</div>
							<Badge className={getStatusColor(call.status)}>
								{call.status}
							</Badge>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						{/* Call Info */}
						<Card>
							<CardHeader>
								<CardTitle>Call Information</CardTitle>
								<CardDescription>Details about this call</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										<IconPhone className="h-5 w-5 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Caller</p>
										<p className="font-medium">{call.callerNumber}</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										<IconClock className="h-5 w-5 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Duration</p>
										<p className="font-medium">{formatDuration(call.duration)}</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										{call.aiHandled ? (
											<IconRobot className="h-5 w-5 text-primary" />
										) : (
											<IconUser className="h-5 w-5 text-primary" />
										)}
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Handled By</p>
										<p className="font-medium">
											{call.aiHandled ? "AI Agent" : "Human"}
										</p>
									</div>
								</div>

								{call.twilioCallSid && (
									<div className="rounded-lg border bg-muted/50 p-3">
										<p className="text-xs text-muted-foreground">Call SID</p>
										<p className="font-mono text-xs break-all">
											{call.twilioCallSid}
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Transcript */}
						<Card>
							<CardHeader>
								<CardTitle>Transcript</CardTitle>
								<CardDescription>
									Conversation transcript from this call
								</CardDescription>
							</CardHeader>
							<CardContent>
								{call.transcript ? (
									<div className="max-h-[400px] overflow-y-auto rounded-lg border bg-muted/50 p-4">
										<pre className="whitespace-pre-wrap text-sm">
											{call.transcript}
										</pre>
									</div>
								) : (
									<div className="flex min-h-[200px] flex-col items-center justify-center text-muted-foreground">
										<IconRobot className="mb-2 h-8 w-8" />
										<p className="text-sm">No transcript available</p>
										<p className="text-xs">
											Transcripts are generated for AI-handled calls
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
