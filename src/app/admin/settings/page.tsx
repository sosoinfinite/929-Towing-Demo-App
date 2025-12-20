import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";

export default async function AdminSettingsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user || !(await isAdmin(session.user.id))) {
		redirect("/dashboard");
	}

	// Check which integrations are configured
	const integrations = [
		{
			name: "Database (Neon)",
			configured: !!process.env.DATABASE_URL,
			envVar: "DATABASE_URL",
		},
		{
			name: "Resend (Email)",
			configured: !!process.env.RESEND_API_KEY,
			envVar: "RESEND_API_KEY",
		},
		{
			name: "Twilio (Voice/SMS)",
			configured: !!process.env.TWILIO_ACCOUNT_SID,
			envVar: "TWILIO_ACCOUNT_SID",
		},
		{
			name: "ElevenLabs (AI Voice)",
			configured: !!process.env.ELEVENLABS_API_KEY,
			envVar: "ELEVENLABS_API_KEY",
		},
		{
			name: "Stripe (Billing)",
			configured: !!process.env.STRIPE_SECRET_KEY,
			envVar: "STRIPE_SECRET_KEY",
		},
	];

	const adminIds = process.env.ADMIN_USER_ID
		? process.env.ADMIN_USER_ID.split(",").map((id) => id.trim())
		: [];

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Platform Settings</h1>
						<p className="text-muted-foreground">
							System configuration and integrations
						</p>
					</div>

					<div className="space-y-6">
						{/* Integration Status */}
						<Card>
							<CardHeader>
								<CardTitle>Integrations</CardTitle>
								<CardDescription>
									Status of third-party service integrations
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{integrations.map((integration) => (
										<div
											key={integration.name}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div>
												<p className="font-medium">{integration.name}</p>
												<p className="text-xs text-muted-foreground">
													{integration.envVar}
												</p>
											</div>
											{integration.configured ? (
												<Badge className="border-green-500/20 bg-green-500/10 text-green-600">
													Configured
												</Badge>
											) : (
												<Badge variant="secondary">Not configured</Badge>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Admin Users */}
						<Card>
							<CardHeader>
								<CardTitle>Admin Users</CardTitle>
								<CardDescription>
									Users with platform admin access (via ADMIN_USER_ID env var)
								</CardDescription>
							</CardHeader>
							<CardContent>
								{adminIds.length > 0 ? (
									<div className="space-y-2">
										{adminIds.map((id) => (
											<div
												key={id}
												className="flex items-center justify-between rounded-lg border p-3"
											>
												<code className="text-sm">{id}</code>
												<Badge>Admin</Badge>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										No admin user IDs configured
									</p>
								)}
							</CardContent>
						</Card>

						{/* Environment */}
						<Card>
							<CardHeader>
								<CardTitle>Environment</CardTitle>
								<CardDescription>Current deployment environment</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center justify-between rounded-lg border p-3">
										<p className="font-medium">Node Environment</p>
										<Badge variant="outline">
											{process.env.NODE_ENV || "development"}
										</Badge>
									</div>
									<div className="flex items-center justify-between rounded-lg border p-3">
										<p className="font-medium">Base URL</p>
										<code className="text-sm text-muted-foreground">
											{process.env.NEXT_PUBLIC_BASE_URL || "Not set"}
										</code>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
