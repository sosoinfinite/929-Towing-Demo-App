"use client";

import {
	IconCheck,
	IconKey,
	IconLoader2,
	IconMail,
	IconX,
} from "@tabler/icons-react";
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

	// Password change state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordSaving, setPasswordSaving] = useState(false);
	const [passwordSaved, setPasswordSaved] = useState(false);
	const [passwordError, setPasswordError] = useState("");

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

	const handlePasswordChange = async () => {
		setPasswordError("");

		if (newPassword !== confirmPassword) {
			setPasswordError("New passwords do not match");
			return;
		}

		if (newPassword.length < 8) {
			setPasswordError("Password must be at least 8 characters");
			return;
		}

		setPasswordSaving(true);
		setPasswordSaved(false);

		try {
			const result = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: true,
			});

			if (result.error) {
				setPasswordError(result.error.message || "Failed to change password");
			} else {
				setPasswordSaved(true);
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
				setTimeout(() => setPasswordSaved(false), 2000);
			}
		} catch {
			setPasswordError("An unexpected error occurred");
		} finally {
			setPasswordSaving(false);
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

						{/* Password Change */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconKey className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>Change Password</CardTitle>
										<CardDescription>Update your account password</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{passwordError && (
									<div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
										<IconX className="h-4 w-4" />
										{passwordError}
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="current-password">Current Password</Label>
									<Input
										id="current-password"
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										placeholder="Enter current password"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="new-password">New Password</Label>
									<Input
										id="new-password"
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="At least 8 characters"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirm-password">Confirm New Password</Label>
									<Input
										id="confirm-password"
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Confirm new password"
									/>
								</div>

								<Button
									onClick={handlePasswordChange}
									disabled={
										passwordSaving ||
										!currentPassword ||
										!newPassword ||
										!confirmPassword
									}
								>
									{passwordSaving ? (
										<>
											<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
											Changing...
										</>
									) : passwordSaved ? (
										<>
											<IconCheck className="mr-2 h-4 w-4" />
											Password Changed
										</>
									) : (
										"Change Password"
									)}
								</Button>
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
