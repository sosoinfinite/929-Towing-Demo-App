"use client";

import {
	IconBriefcase,
	IconChevronRight,
	IconFilter,
	IconPlus,
} from "@tabler/icons-react";
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
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
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

interface Job {
	id: string;
	source: string;
	status: string;
	customer_name: string | null;
	customer_phone: string;
	service_type: string | null;
	pickup_location: string;
	motor_club: string | null;
	driver_name: string | null;
	created_at: string;
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

const statusColors: Record<string, string> = {
	pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	assigned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	en_route: "bg-purple-500/10 text-purple-600 border-purple-500/20",
	arrived: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
	completed: "bg-green-500/10 text-green-600 border-green-500/20",
	cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const sourceLabels: Record<string, string> = {
	email: "Email",
	sms: "SMS",
	phone: "Phone",
	manual: "Manual",
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

export default function JobsPage() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [pagination, setPagination] = useState<Pagination | null>(null);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		const params = new URLSearchParams({ page: String(page), limit: "20" });
		if (statusFilter) {
			params.set("status", statusFilter);
		}

		fetch(`/api/jobs?${params}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.jobs) {
					setJobs(data.jobs);
					setPagination(data.pagination);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [page, statusFilter]);

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const formatStatus = (status: string) => {
		return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
	};

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold">Jobs</h1>
							<p className="text-muted-foreground">
								Manage dispatch jobs from all sources
							</p>
						</div>
						<Button asChild>
							<Link href="/dashboard/jobs/new">
								<IconPlus className="mr-2 h-4 w-4" />
								New Job
							</Link>
						</Button>
					</div>

					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>All Jobs</CardTitle>
									<CardDescription>
										Jobs from email dispatches, SMS, and manual entry
									</CardDescription>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											<IconFilter className="mr-2 h-4 w-4" />
											Filter
											{statusFilter && (
												<Badge variant="secondary" className="ml-2">
													{formatStatus(statusFilter)}
												</Badge>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuCheckboxItem
											checked={statusFilter === null}
											onCheckedChange={() => setStatusFilter(null)}
										>
											All
										</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem
											checked={statusFilter === "pending"}
											onCheckedChange={() => setStatusFilter("pending")}
										>
											Pending
										</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem
											checked={statusFilter === "assigned"}
											onCheckedChange={() => setStatusFilter("assigned")}
										>
											Assigned
										</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem
											checked={statusFilter === "en_route"}
											onCheckedChange={() => setStatusFilter("en_route")}
										>
											En Route
										</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem
											checked={statusFilter === "completed"}
											onCheckedChange={() => setStatusFilter("completed")}
										>
											Completed
										</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem
											checked={statusFilter === "cancelled"}
											onCheckedChange={() => setStatusFilter("cancelled")}
										>
											Cancelled
										</DropdownMenuCheckboxItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
									Loading...
								</div>
							) : jobs.length === 0 ? (
								<div className="flex min-h-[400px] flex-col items-center justify-center text-muted-foreground">
									<div className="mb-4 rounded-full bg-muted p-4">
										<IconBriefcase className="h-8 w-8" />
									</div>
									<h3 className="text-lg font-medium text-foreground">
										No jobs yet
									</h3>
									<p className="mt-1 max-w-sm text-center text-sm">
										Jobs will appear here when created from email dispatches,
										SMS messages, or manual entry.
									</p>
									<Button asChild className="mt-4">
										<Link href="/dashboard/jobs/new">
											<IconPlus className="mr-2 h-4 w-4" />
											Create First Job
										</Link>
									</Button>
								</div>
							) : (
								<>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Date</TableHead>
												<TableHead>Source</TableHead>
												<TableHead>Customer</TableHead>
												<TableHead>Service</TableHead>
												<TableHead>Location</TableHead>
												<TableHead>Driver</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="w-[50px]" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{jobs.map((job) => (
												<TableRow
													key={job.id}
													className="cursor-pointer hover:bg-muted/50"
												>
													<TableCell className="whitespace-nowrap">
														{formatDate(job.created_at)}
													</TableCell>
													<TableCell>
														<Badge variant="outline">
															{sourceLabels[job.source] || job.source}
														</Badge>
													</TableCell>
													<TableCell>
														<div>
															<div className="font-medium">
																{job.customer_name || "Unknown"}
															</div>
															<div className="text-sm text-muted-foreground font-mono">
																{job.customer_phone}
															</div>
														</div>
													</TableCell>
													<TableCell>
														{job.service_type
															? serviceLabels[job.service_type] ||
																job.service_type
															: "-"}
													</TableCell>
													<TableCell className="max-w-[200px] truncate">
														{job.pickup_location}
													</TableCell>
													<TableCell>
														{job.driver_name || (
															<span className="text-muted-foreground">
																Unassigned
															</span>
														)}
													</TableCell>
													<TableCell>
														<Badge
															className={statusColors[job.status] || "bg-muted"}
														>
															{formatStatus(job.status)}
														</Badge>
													</TableCell>
													<TableCell>
														<Button asChild variant="ghost" size="icon">
															<Link href={`/dashboard/jobs/${job.id}`}>
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
												{pagination.total} jobs
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
