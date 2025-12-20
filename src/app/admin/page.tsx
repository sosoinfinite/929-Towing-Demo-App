import { IconBuilding, IconPhone, IconUsers } from "@tabler/icons-react";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";

export default async function AdminPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const pool = getPool();

	// Get counts
	const companyCount = await pool.query(
		"SELECT COUNT(*)::int as count FROM company",
	);
	const userCount = await pool.query(
		'SELECT COUNT(*)::int as count FROM "user"',
	);
	const callCount = await pool.query("SELECT COUNT(*)::int as count FROM call");

	const stats = [
		{
			title: "Total Companies",
			value: companyCount.rows[0].count,
			icon: IconBuilding,
			href: "/admin/companies",
		},
		{
			title: "Total Users",
			value: userCount.rows[0].count,
			icon: IconUsers,
			href: "/admin/users",
		},
		{
			title: "Total Calls",
			value: callCount.rows[0].count,
			icon: IconPhone,
			href: "/admin/calls",
		},
	];

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Admin Dashboard</h1>
						<p className="text-muted-foreground">
							Welcome back, {session?.user.name}
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						{stats.map((stat) => (
							<Link key={stat.title} href={stat.href}>
								<Card className="hover:bg-muted/50 transition-colors cursor-pointer">
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">
											{stat.title}
										</CardTitle>
										<stat.icon className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{stat.value}</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
