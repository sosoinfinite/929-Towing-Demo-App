"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconCheck, IconUser, IconX } from "@tabler/icons-react";
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

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	email_verified: boolean;
	banned: boolean;
	created_at: string;
	company_name: string | null;
	company_id: string | null;
}

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/admin/users")
			.then((res) => res.json())
			.then((data) => {
				setUsers(data.users || []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Users</h1>
						<p className="text-muted-foreground">
							Manage all registered users
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>All Users</CardTitle>
							<CardDescription>
								View and manage user accounts
							</CardDescription>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
									Loading...
								</div>
							) : users.length === 0 ? (
								<div className="flex min-h-[200px] flex-col items-center justify-center text-muted-foreground">
									<div className="mb-4 rounded-full bg-muted p-4">
										<IconUser className="h-8 w-8" />
									</div>
									<h3 className="text-lg font-medium text-foreground">
										No users yet
									</h3>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>User</TableHead>
											<TableHead>Company</TableHead>
											<TableHead>Role</TableHead>
											<TableHead>Verified</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Joined</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{users.map((user) => (
											<TableRow key={user.id}>
												<TableCell>
													<div>
														<p className="font-medium">{user.name}</p>
														<p className="text-sm text-muted-foreground">
															{user.email}
														</p>
													</div>
												</TableCell>
												<TableCell>
													{user.company_name ? (
														<Link
															href={`/admin/companies/${user.company_id}`}
															className="hover:underline"
														>
															{user.company_name}
														</Link>
													) : (
														<span className="text-muted-foreground">—</span>
													)}
												</TableCell>
												<TableCell>
													<Badge variant="outline">{user.role || "user"}</Badge>
												</TableCell>
												<TableCell>
													{user.email_verified ? (
														<IconCheck className="h-4 w-4 text-green-500" />
													) : (
														<IconX className="h-4 w-4 text-muted-foreground" />
													)}
												</TableCell>
												<TableCell>
													{user.banned ? (
														<Badge variant="destructive">Banned</Badge>
													) : (
														<Badge className="bg-green-500/10 text-green-600 border-green-500/20">
															Active
														</Badge>
													)}
												</TableCell>
												<TableCell>
													{new Date(user.created_at).toLocaleDateString()}
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
