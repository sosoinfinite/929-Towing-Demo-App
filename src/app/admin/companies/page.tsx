"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	IconBuilding,
	IconCheck,
	IconPhone,
	IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
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

export default function AdminCompaniesPage() {
	const [companies, setCompanies] = useState<Company[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/admin/companies")
			.then((res) => res.json())
			.then((data) => {
				setCompanies(data.companies || []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Companies</h1>
						<p className="text-muted-foreground">
							Manage all registered companies
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>All Companies</CardTitle>
							<CardDescription>
								Click on a company to edit details and assign Twilio numbers
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
									Loading...
								</div>
							) : companies.length === 0 ? (
								<div className="flex min-h-[200px] flex-col items-center justify-center text-muted-foreground">
									<div className="mb-4 rounded-full bg-muted p-4">
										<IconBuilding className="h-8 w-8" />
									</div>
									<h3 className="text-lg font-medium text-foreground">
										No companies yet
									</h3>
									<p className="mt-1 text-center text-sm">
										Companies will appear here once users sign up
									</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Company</TableHead>
											<TableHead>Phone</TableHead>
											<TableHead>Twilio Number</TableHead>
											<TableHead>Dispatch</TableHead>
											<TableHead className="text-right">Users</TableHead>
											<TableHead className="text-right">Calls</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{companies.map((company) => (
											<TableRow key={company.id}>
												<TableCell>
													<Link
														href={`/admin/companies/${company.id}`}
														className="font-medium hover:underline"
													>
														{company.name}
													</Link>
													{company.service_area && (
														<p className="text-xs text-muted-foreground">
															{company.service_area}
														</p>
													)}
												</TableCell>
												<TableCell>
													{company.phone || (
														<span className="text-muted-foreground">—</span>
													)}
												</TableCell>
												<TableCell>
													{company.twilio_phone ? (
														<Badge variant="outline" className="font-mono">
															<IconPhone className="mr-1 h-3 w-3" />
															{company.twilio_phone}
														</Badge>
													) : (
														<Badge variant="secondary">Not assigned</Badge>
													)}
												</TableCell>
												<TableCell>
													{company.dispatch_active ? (
														<Badge className="bg-green-500/10 text-green-600 border-green-500/20">
															<IconCheck className="mr-1 h-3 w-3" />
															Active
														</Badge>
													) : (
														<Badge variant="secondary">
															<IconX className="mr-1 h-3 w-3" />
															Off
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-right">
													{company.user_count}
												</TableCell>
												<TableCell className="text-right">
													{company.call_count}
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
