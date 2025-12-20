"use client";

import { IconCheck, IconChevronRight, IconPhone, IconX } from "@tabler/icons-react";
import Link from "next/link";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Call {
	id: string;
	caller_number: string;
	status: string;
	duration: number;
	ai_handled: boolean;
	created_at: string;
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export default function CallsPage() {
	const [calls, setCalls] = useState<Call[]>([]);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);

	useEffect(() => {
		setLoading(true);
		fetch(`/api/calls?page=${page}&limit=20`)
			.then((res) => res.json())
			.then((data) => {
				if (data.calls) {
					setCalls(data.calls);
					setPagination(data.pagination);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [page]);

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
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
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Call History</h1>
						<p className="text-muted-foreground">
							View and manage your incoming calls
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Recent Calls</CardTitle>
							<CardDescription>
								All calls handled by your AI dispatcher
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
									Loading...
								</div>
							) : calls.length === 0 ? (
								<div className="flex min-h-[400px] flex-col items-center justify-center text-muted-foreground">
									<div className="mb-4 rounded-full bg-muted p-4">
										<IconPhone className="h-8 w-8" />
									</div>
									<h3 className="text-lg font-medium text-foreground">
										No calls yet
									</h3>
									<p className="mt-1 max-w-sm text-center text-sm">
										Calls will appear here once your AI dispatcher handles them.
										Turn on dispatch to start receiving calls.
									</p>
								</div>
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Date & Time</TableHead>
												<TableHead>Caller</TableHead>
												<TableHead>Duration</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>AI Handled</TableHead>
												<TableHead className="w-[50px]" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{calls.map((call) => (
												<TableRow key={call.id} className="cursor-pointer hover:bg-muted/50">
													<TableCell>{formatDate(call.created_at)}</TableCell>
													<TableCell className="font-mono">
														{call.caller_number}
													</TableCell>
													<TableCell>{formatDuration(call.duration)}</TableCell>
													<TableCell>
														<Badge variant="outline">{call.status}</Badge>
													</TableCell>
													<TableCell>
														{call.ai_handled ? (
															<Badge className="bg-green-500/10 text-green-600 border-green-500/20">
																<IconCheck className="mr-1 h-3 w-3" />
																Yes
															</Badge>
														) : (
															<Badge variant="secondary">
																<IconX className="mr-1 h-3 w-3" />
																No
															</Badge>
														)}
													</TableCell>
													<TableCell>
														<Button asChild variant="ghost" size="icon">
															<Link href={`/dashboard/calls/${call.id}`}>
																<IconChevronRight className="h-4 w-4" />
															</Link>
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>

									{/* Pagination */}
									{pagination && pagination.totalPages > 1 && (
										<div className="mt-4 flex items-center justify-between">
											<p className="text-sm text-muted-foreground">
												Showing {(page - 1) * pagination.limit + 1} to{" "}
												{Math.min(page * pagination.limit, pagination.total)} of{" "}
												{pagination.total} calls
											</p>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													disabled={page <= 1}
													onClick={() => setPage((p) => p - 1)}
												>
													Previous
												</Button>
												<Button
													variant="outline"
													size="sm"
													disabled={page >= pagination.totalPages}
													onClick={() => setPage((p) => p + 1)}
												>
													Next
												</Button>
											</div>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
