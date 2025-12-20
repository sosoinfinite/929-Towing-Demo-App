"use client";

import {
	IconCheck,
	IconChevronRight,
	IconLoader2,
	IconMail,
	IconShieldLock,
	IconTrash,
	IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import type {
	Invitation,
	Member,
	Organization,
} from "better-auth/plugins/organization";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient, useSession } from "@/lib/auth-client";

interface Company {
	id: string;
	name: string;
	phone: string | null;
	logo: string | null;
	service_area: string | null;
	twilio_phone: string | null;
}

// Extended types for organization data with nested user info
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

export default function SettingsPage() {
	const { data: session } = useSession();
	const [company, setCompany] = useState<Company | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [logo, setLogo] = useState("");
	const [serviceArea, setServiceArea] = useState("");
	const [greetingMessage, setGreetingMessage] = useState("");

	// Team state
	const [organization, setOrganization] = useState<FullOrganization | null>(
		null,
	);
	const [currentMember, setCurrentMember] = useState<MemberWithUser | null>(
		null,
	);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
	const [inviting, setInviting] = useState(false);
	const [inviteError, setInviteError] = useState<string | null>(null);
	const [teamLoading, setTeamLoading] = useState(true);
	const [teamRefreshKey, setTeamRefreshKey] = useState(0);

	const refetchTeam = () => setTeamRefreshKey((k) => k + 1);

	// Fetch company settings
	useEffect(() => {
		fetch("/api/settings")
			.then((res) => res.json())
			.then((data) => {
				if (data.company) {
					setCompany(data.company);
					setName(data.company.name || "");
					setPhone(data.company.phone || "");
					setLogo(data.company.logo || "");
					setServiceArea(data.company.service_area || "");
				}
				if (data.agentConfig) {
					setGreetingMessage(data.agentConfig.greeting_message || "");
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	// Fetch organization/team data - depends on teamRefreshKey to trigger refetch
	useEffect(() => {
		void teamRefreshKey; // Explicitly consume to trigger refetch when changed
		const fetchOrganization = async () => {
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
				// No organization yet - that's fine
			} finally {
				setTeamLoading(false);
			}
		};

		fetchOrganization();
	}, [teamRefreshKey]);

	const handleInvite = async () => {
		if (!inviteEmail.trim()) return;

		setInviting(true);
		setInviteError(null);

		try {
			const result = await authClient.organization.inviteMember({
				email: inviteEmail.trim(),
				role: inviteRole,
			});

			if (result.error) {
				setInviteError(result.error.message || "Failed to send invitation");
			} else {
				setInviteEmail("");
				setInviteRole("member");
				refetchTeam();
			}
		} catch {
			setInviteError("Failed to send invitation");
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
			refetchTeam();
		} catch {
			// Handle error silently
		}
	};

	const handleRemoveMember = async (memberIdOrEmail: string) => {
		if (!confirm("Are you sure you want to remove this team member?")) return;

		try {
			await authClient.organization.removeMember({
				memberIdOrEmail,
			});
			refetchTeam();
		} catch {
			// Handle error silently
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		try {
			await authClient.organization.cancelInvitation({
				invitationId,
			});
			refetchTeam();
		} catch {
			// Handle error silently
		}
	};

	const isOwner = currentMember?.role === "owner";
	const isAdmin = currentMember?.role === "admin" || isOwner;

	const handleSave = async () => {
		setSaving(true);
		setSaved(false);

		try {
			const res = await fetch("/api/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					phone: phone || null,
					logo: logo || null,
					serviceArea: serviceArea || null,
					greetingMessage,
				}),
			});

			if (res.ok) {
				const data = await res.json();
				setCompany(data.company);
				setSaved(true);
				setTimeout(() => setSaved(false), 2000);
			}
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Settings</h1>
						<p className="text-muted-foreground">
							Manage your account and preferences
						</p>
					</div>

					<div className="space-y-6">
						{/* Account & Security Link */}
						<Link href="/dashboard/account">
							<Card className="transition-colors hover:bg-muted/50">
								<CardContent className="flex items-center justify-between p-4">
									<div className="flex items-center gap-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<IconShieldLock className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium">Account & Security</p>
											<p className="text-sm text-muted-foreground">
												Profile, password, passkeys, two-factor authentication
											</p>
										</div>
									</div>
									<IconChevronRight className="h-5 w-5 text-muted-foreground" />
								</CardContent>
							</Card>
						</Link>

						{/* Company Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Company</CardTitle>
								<CardDescription>
									Your towing company information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="company-name">Company Name</Label>
									<Input
										id="company-name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Your Towing Company"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone Number</Label>
									<Input
										id="phone"
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="(555) 123-4567"
									/>
									<p className="text-xs text-muted-foreground">
										This is where you&apos;ll receive SMS notifications about
										new calls
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="logo">Company Logo URL</Label>
									<Input
										id="logo"
										type="url"
										value={logo}
										onChange={(e) => setLogo(e.target.value)}
										placeholder="https://example.com/logo.png"
									/>
									<p className="text-xs text-muted-foreground">
										Your logo will appear in the dashboard sidebar
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="service-area">Service Area</Label>
									<Input
										id="service-area"
										value={serviceArea}
										onChange={(e) => setServiceArea(e.target.value)}
										placeholder="Albany, NY - Capital Region"
									/>
								</div>
								{company?.twilio_phone && (
									<div className="rounded-lg border bg-muted/50 p-4">
										<p className="text-sm font-medium">
											Your AI Dispatch Number
										</p>
										<p className="mt-1 font-mono text-lg">
											{company.twilio_phone}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											Customers call this number to reach your AI dispatcher
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* AI Agent Settings */}
						<Card>
							<CardHeader>
								<CardTitle>AI Agent</CardTitle>
								<CardDescription>
									Configure your AI dispatcher settings
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="greeting">Greeting Message</Label>
									<Textarea
										id="greeting"
										rows={3}
										value={greetingMessage}
										onChange={(e) => setGreetingMessage(e.target.value)}
										placeholder="Hello, thank you for calling. How can I help you today?"
									/>
									<p className="text-xs text-muted-foreground">
										This is what the AI will say when answering calls
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Team Management */}
						<Card>
							<CardHeader>
								<CardTitle>Team</CardTitle>
								<CardDescription>
									Manage your team members and their access
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{teamLoading ? (
									<div className="flex items-center justify-center py-8">
										<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								) : !organization ? (
									<div className="text-center py-8 text-muted-foreground">
										<p>No organization yet.</p>
										<p className="text-sm">
											Complete onboarding to create your team.
										</p>
									</div>
								) : (
									<>
										{/* Current Members */}
										<div className="space-y-3">
											<Label>Members</Label>
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
															{isOwner &&
															member.userId !== session?.user?.id ? (
																<Select
																	value={member.role}
																	onValueChange={(value) =>
																		handleUpdateRole(member.id, value)
																	}
																>
																	<SelectTrigger className="w-[100px]">
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="owner">Owner</SelectItem>
																		<SelectItem value="admin">Admin</SelectItem>
																		<SelectItem value="member">
																			Member
																		</SelectItem>
																	</SelectContent>
																</Select>
															) : (
																<Badge
																	variant={
																		member.role === "owner"
																			? "default"
																			: "secondary"
																	}
																>
																	{member.role}
																</Badge>
															)}
															{isOwner &&
																member.userId !== session?.user?.id && (
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-8 w-8 text-muted-foreground hover:text-destructive"
																		onClick={() =>
																			handleRemoveMember(member.user.email)
																		}
																	>
																		<IconTrash className="h-4 w-4" />
																	</Button>
																)}
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Pending Invitations */}
										{organization.invitations &&
											organization.invitations.filter(
												(inv) => inv.status === "pending",
											).length > 0 && (
												<div className="space-y-3">
													<Label>Pending Invitations</Label>
													<div className="space-y-2">
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
												</div>
											)}

										{/* Invite New Member */}
										{isAdmin && (
											<div className="space-y-3 border-t pt-4">
												<Label>Invite Team Member</Label>
												<div className="flex gap-2">
													<Input
														type="email"
														placeholder="email@example.com"
														value={inviteEmail}
														onChange={(e) => setInviteEmail(e.target.value)}
														className="flex-1"
													/>
													<Select
														value={inviteRole}
														onValueChange={(v) =>
															setInviteRole(v as "admin" | "member")
														}
													>
														<SelectTrigger className="w-[100px]">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="admin">Admin</SelectItem>
															<SelectItem value="member">Member</SelectItem>
														</SelectContent>
													</Select>
													<Button
														onClick={handleInvite}
														disabled={inviting || !inviteEmail.trim()}
													>
														{inviting ? (
															<IconLoader2 className="h-4 w-4 animate-spin" />
														) : (
															<IconUserPlus className="h-4 w-4" />
														)}
													</Button>
												</div>
												{inviteError && (
													<p className="text-sm text-destructive">
														{inviteError}
													</p>
												)}
												<p className="text-xs text-muted-foreground">
													An email invitation will be sent to join your team
												</p>
											</div>
										)}
									</>
								)}
							</CardContent>
						</Card>

						{/* Subscription */}
						<Card>
							<CardHeader>
								<CardTitle>Subscription</CardTitle>
								<CardDescription>Your current plan and billing</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Alpha Program</p>
										<p className="text-sm text-muted-foreground">
											Free for 3 months, then $49/mo locked for life
										</p>
									</div>
									<Badge variant="default">Active</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Save Button */}
						<Button onClick={handleSave} disabled={saving} className="w-full">
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
				</div>
			</div>
		</div>
	);
}
