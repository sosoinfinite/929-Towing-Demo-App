"use client";

import {
	IconLoader2,
	IconMail,
	IconTrash,
	IconUserPlus,
} from "@tabler/icons-react";
import type {
	Invitation,
	Member,
	Organization,
} from "better-auth/plugins/organization";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient, useSession } from "@/lib/auth-client";

interface MemberWithUser extends Member {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

interface FullOrganization extends Organization {
	members: MemberWithUser[];
	invitations: Invitation[];
}

export default function TeamSettingsPage() {
	const { data: session } = useSession();
	const [organization, setOrganization] = useState<FullOrganization | null>(
		null,
	);
	const [currentMember, setCurrentMember] = useState<MemberWithUser | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [refreshKey, setRefreshKey] = useState(0);

	// Invite dialog state
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
	const [inviting, setInviting] = useState(false);

	const refetch = () => setRefreshKey((k) => k + 1);
	const isOwner = currentMember?.role === "owner";
	const isAdmin = currentMember?.role === "admin" || isOwner;

	useEffect(() => {
		void refreshKey;
		const fetchData = async () => {
			try {
				const [orgResult, memberResult] = await Promise.all([
					authClient.organization.getFullOrganization(),
					authClient.organization.getActiveMember(),
				]);
				if (orgResult.data) {
					setOrganization(orgResult.data as FullOrganization);
				}
				if (memberResult.data) {
					setCurrentMember(memberResult.data as MemberWithUser);
				}
			} catch {
				// No organization yet
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [refreshKey]);

	const handleInvite = async () => {
		if (!inviteEmail.trim()) return;
		setInviting(true);
		try {
			const result = await authClient.organization.inviteMember({
				email: inviteEmail.trim(),
				role: inviteRole,
			});
			if (result.error) {
				toast.error(result.error.message || "Failed to send invitation");
			} else {
				toast.success(`Invitation sent to ${inviteEmail}`);
				setInviteEmail("");
				setInviteRole("member");
				setInviteOpen(false);
				refetch();
			}
		} catch {
			toast.error("Failed to send invitation");
		} finally {
			setInviting(false);
		}
	};

	const handleUpdateRole = async (memberId: string, newRole: string) => {
		try {
			await authClient.organization.updateMemberRole({
				memberId,
				role: newRole,
			});
			toast.success("Role updated");
			refetch();
		} catch {
			toast.error("Failed to update role");
		}
	};

	const handleRemoveMember = async (memberEmail: string) => {
		if (!confirm("Are you sure you want to remove this team member?")) return;
		try {
			await authClient.organization.removeMember({
				memberIdOrEmail: memberEmail,
			});
			toast.success("Member removed");
			refetch();
		} catch {
			toast.error("Failed to remove member");
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		try {
			await authClient.organization.cancelInvitation({ invitationId });
			toast.success("Invitation cancelled");
			refetch();
		} catch {
			toast.error("Failed to cancel invitation");
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[300px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>Manage your team and their access</CardDescription>
				</div>
				{isAdmin && (
					<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<IconUserPlus className="mr-2 h-4 w-4" />
								Invite
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invite Team Member</DialogTitle>
								<DialogDescription>
									Send an email invitation to join your team
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="invite-email">Email</Label>
									<Input
										id="invite-email"
										type="email"
										placeholder="colleague@example.com"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="invite-role">Role</Label>
									<Select
										value={inviteRole}
										onValueChange={(v) =>
											setInviteRole(v as "admin" | "member")
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="member">Member</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button
									onClick={handleInvite}
									disabled={inviting || !inviteEmail.trim()}
								>
									{inviting ? (
										<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<IconMail className="mr-2 h-4 w-4" />
									)}
									Send Invitation
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</CardHeader>
			<CardContent>
				{!organization ? (
					<div className="py-8 text-center text-muted-foreground">
						<p>No organization yet.</p>
						<p className="text-sm">Complete onboarding to create your team.</p>
					</div>
				) : (
					<div className="space-y-4">
						{/* Members */}
						<div className="space-y-2">
							{organization.members.map((member) => (
								<div
									key={member.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
											{member.user.name?.[0]?.toUpperCase() ||
												member.user.email[0]?.toUpperCase()}
										</div>
										<div>
											<p className="text-sm font-medium">
												{member.user.name || member.user.email}
												{member.userId === session?.user?.id && (
													<span className="ml-2 text-xs text-muted-foreground">
														(you)
													</span>
												)}
											</p>
											<p className="text-xs text-muted-foreground">
												{member.user.email}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{isOwner && member.userId !== session?.user?.id ? (
											<Select
												value={member.role}
												onValueChange={(value) =>
													handleUpdateRole(member.id, value)
												}
											>
												<SelectTrigger className="w-24">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="owner">Owner</SelectItem>
													<SelectItem value="admin">Admin</SelectItem>
													<SelectItem value="member">Member</SelectItem>
												</SelectContent>
											</Select>
										) : (
											<Badge
												variant={
													member.role === "owner" ? "default" : "secondary"
												}
											>
												{member.role}
											</Badge>
										)}
										{isOwner && member.userId !== session?.user?.id && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-muted-foreground hover:text-destructive"
												onClick={() => handleRemoveMember(member.user.email)}
											>
												<IconTrash className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>
							))}
						</div>

						{/* Pending Invitations */}
						{organization.invitations?.filter((inv) => inv.status === "pending")
							.length > 0 && (
							<div className="space-y-2 border-t pt-4">
								<p className="text-sm font-medium text-muted-foreground">
									Pending Invitations
								</p>
								{organization.invitations
									.filter((inv) => inv.status === "pending")
									.map((invitation) => (
										<div
											key={invitation.id}
											className="flex items-center justify-between rounded-lg border border-dashed p-3"
										>
											<div className="flex items-center gap-3">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
													<IconMail className="h-4 w-4" />
												</div>
												<div>
													<p className="text-sm font-medium">
														{invitation.email}
													</p>
													<p className="text-xs text-muted-foreground">
														Invited as {invitation.role}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<Badge variant="outline">Pending</Badge>
												{isAdmin && (
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-muted-foreground hover:text-destructive"
														onClick={() =>
															handleCancelInvitation(invitation.id)
														}
													>
														<IconTrash className="h-4 w-4" />
													</Button>
												)}
											</div>
										</div>
									))}
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
