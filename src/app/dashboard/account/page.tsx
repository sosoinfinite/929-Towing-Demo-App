"use client";

import { IconCheck, IconLoader2, IconMail } from "@tabler/icons-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";

export default function AccountPage() {
	const { data: session, isPending } = useSession();
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// Initialize name from session when it loads
	if (session?.user?.name && !name && !saving) {
		setName(session.user.name);
	}

	const handleSave = async () => {
		if (!name.trim()) return;

		setSaving(true);
		setSaved(false);

		try {
			await authClient.updateUser({
				name: name.trim(),
			});
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} finally {
			setSaving(false);
		}
	};

	if (isPending) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const user = session?.user;
	const initials = user?.name
		? user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: user?.email?.slice(0, 2).toUpperCase() || "??";

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Account</h1>
						<p className="text-muted-foreground">
							Manage your profile and preferences
						</p>
					</div>

					<div className="space-y-6">
						{/* Profile Card */}
						<Card>
							<CardHeader>
								<CardTitle>Profile</CardTitle>
								<CardDescription>
									Your personal information and avatar
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center gap-4">
									<Avatar className="h-20 w-20">
										<AvatarImage src={user?.image || undefined} />
										<AvatarFallback className="text-lg">{initials}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{user?.name || "No name set"}</p>
										<p className="text-sm text-muted-foreground">{user?.email}</p>
									</div>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Display Name</Label>
										<Input
											id="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Your name"
										/>
									</div>

									<Button onClick={handleSave} disabled={saving || !name.trim()}>
										{saving ? (
											<>
												<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
												Saving...
											</>
										) : saved ? (
											<>
												<IconCheck className="mr-2 h-4 w-4" />
												Saved
											</>
										) : (
											"Save Changes"
										)}
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Email Verification */}
						<Card>
							<CardHeader>
								<CardTitle>Email</CardTitle>
								<CardDescription>Your email address and verification status</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between rounded-lg border p-4">
									<div className="flex items-center gap-3">
										<IconMail className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="font-medium">{user?.email}</p>
											<p className="text-sm text-muted-foreground">Primary email</p>
										</div>
									</div>
									{user?.emailVerified ? (
										<Badge className="border-green-500/20 bg-green-500/10 text-green-600">
											Verified
										</Badge>
									) : (
										<Badge variant="secondary">Unverified</Badge>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Account Info */}
						<Card>
							<CardHeader>
								<CardTitle>Account Details</CardTitle>
								<CardDescription>Account creation and session info</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center justify-between rounded-lg border p-3">
										<p className="text-sm">Account ID</p>
										<code className="text-xs text-muted-foreground">{user?.id}</code>
									</div>
									<div className="flex items-center justify-between rounded-lg border p-3">
										<p className="text-sm">Created</p>
										<p className="text-sm text-muted-foreground">
											{user?.createdAt
												? new Date(user.createdAt).toLocaleDateString()
												: "Unknown"}
										</p>
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
