"use client";

import {
	IconCheck,
	IconChevronRight,
	IconCreditCard,
	IconLoader2,
	IconMail,
	IconSettings,
	IconShieldLock,
	IconTrash,
	IconUserPlus,
	IconUsers,
} from "@tabler/icons-react";
import type {
	Invitation,
	Member,
	Organization,
} from "better-auth/plugins/organization";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanyForm, type CompanyFormData } from "@/components/company-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface Company {
	id: string;
	name: string;
	phone: string | null;
	logo: string | null;
	service_area: string | null;
	twilio_phone: string | null;
}

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

type SettingsTab = "general" | "team" | "billing";

export default function SettingsPage() {
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState<SettingsTab>("general");
	const [loading, setLoading] = useState(true);

	// Company state
	const [company, setCompany] = useState<Company | null>(null);
	const [companyData, setCompanyData] = useState<CompanyFormData>({
		name: "",
		phone: "",
		logo: "",
		serviceArea: "",
	});
	const [savingCompany, setSavingCompany] = useState(false);

	// AI Agent state
	const [greetingMessage, setGreetingMessage] = useState("");
	const [savingAgent, setSavingAgent] = useState(false);

	// Team state
	const [organization, setOrganization] = useState<FullOrganization | null>(
		null,
	);
	const [currentMember, setCurrentMember] = useState<MemberWithUser | null>(
		null,
	);
	const [teamLoading, setTeamLoading] = useState(true);
	const [teamRefreshKey, setTeamRefreshKey] = useState(0);

	// Invite dialog state
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
	const [inviting, setInviting] = useState(false);

	const refetchTeam = () => setTeamRefreshKey((k) => k + 1);

	const isOwner = currentMember?.role === "owner";
	const isAdmin = currentMember?.role === "admin" || isOwner;

	// Fetch company settings
	useEffect(() => {
		fetch("/api/settings")
			.then((res) => res.json())
			.then((data) => {
				if (data.company) {
					setCompany(data.company);
					setCompanyData({
						name: data.company.name || "",
						phone: data.company.phone || "",
						logo: data.company.logo || "",
						serviceArea: data.company.service_area || "",
					});
				}
				if (data.agentConfig) {
					setGreetingMessage(data.agentConfig.greeting_message || "");
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	// Fetch team data
	useEffect(() => {
		void teamRefreshKey;
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
				// No organization yet
			} finally {
				setTeamLoading(false);
			}
		};
		fetchOrganization();
	}, [teamRefreshKey]);

	const handleSaveCompany = async () => {
		setSavingCompany(true);
		try {
			const res = await fetch("/api/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: companyData.name,
					phone: companyData.phone || null,
					logo: companyData.logo || null,
					serviceArea: companyData.serviceArea || null,
				}),
			});
			if (res.ok) {
				const data = await res.json();
				setCompany(data.company);
				toast.success("Company settings saved");
			} else {
				toast.error("Failed to save company settings");
			}
		} catch {
			toast.error("Failed to save company settings");
		} finally {
			setSavingCompany(false);
		}
	};

	const handleSaveAgent = async () => {
		setSavingAgent(true);
		try {
			const res = await fetch("/api/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ greetingMessage }),
			});
			if (res.ok) {
				toast.success("AI agent settings saved");
			} else {
				toast.error("Failed to save AI settings");
			}
		} catch {
			toast.error("Failed to save AI settings");
		} finally {
			setSavingAgent(false);
		}
	};

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
				refetchTeam();
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
			refetchTeam();
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
			refetchTeam();
		} catch {
			toast.error("Failed to remove member");
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		try {
			await authClient.organization.cancelInvitation({ invitationId });
			toast.success("Invitation cancelled");
			refetchTeam();
		} catch {
			toast.error("Failed to cancel invitation");
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const navItems = [
		{ id: "general" as const, label: "General", icon: IconSettings },
		{ id: "team" as const, label: "Team", icon: IconUsers },
		{ id: "billing" as const, label: "Billing", icon: IconCreditCard },
	];

	return (
		<div className="@container/main flex flex-1 flex-col">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Settings</h1>
						<p className="text-muted-foreground">
							Manage your account and preferences
						</p>
					</div>

					<div className="flex flex-col gap-6 lg:flex-row">
						{/* Sidebar Navigation */}
						<nav className="flex gap-1 lg:w-48 lg:flex-col lg:gap-1">
							{navItems.map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => setActiveTab(item.id)}
									className={cn(
										"flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
										activeTab === item.id
											? "bg-muted text-foreground"
											: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
									)}
								>
									<item.icon className="h-4 w-4" />
									{item.label}
								</button>
							))}

							{/* Account & Security Link */}
							<Link
								href="/dashboard/account"
								className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
							>
								<span className="flex items-center gap-2">
									<IconShieldLock className="h-4 w-4" />
									Security
								</span>
								<IconChevronRight className="h-4 w-4" />
							</Link>
						</nav>

						{/* Content Area */}
						<div className="flex-1 space-y-6">
							{activeTab === "general" && (
								<>
									{/* Company Card */}
									<Card>
										<CardHeader>
											<CardTitle>Company</CardTitle>
											<CardDescription>
												Your towing company information
											</CardDescription>
										</CardHeader>
										<CardContent>
											<CompanyForm
												data={companyData}
												onChange={setCompanyData}
												showHelperText={false}
											/>
											{company?.twilio_phone && (
												<div className="mt-4 rounded-lg border bg-muted/50 p-4">
													<p className="text-sm font-medium">
														AI Dispatch Number
													</p>
													<p className="mt-1 font-mono text-lg">
														{company.twilio_phone}
													</p>
													<p className="mt-1 text-xs text-muted-foreground">
														Customers call this number to reach your AI
														dispatcher
													</p>
												</div>
											)}
										</CardContent>
										<CardFooter className="justify-end border-t pt-4">
											<Button
												onClick={handleSaveCompany}
												disabled={savingCompany}
											>
												{savingCompany ? (
													<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
												) : (
													<IconCheck className="mr-2 h-4 w-4" />
												)}
												Save Company
											</Button>
										</CardFooter>
									</Card>

									{/* AI Agent Card */}
									<Card>
										<CardHeader>
											<CardTitle>AI Agent</CardTitle>
											<CardDescription>
												Configure your AI dispatcher settings
											</CardDescription>
										</CardHeader>
										<CardContent>
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
													This message will be spoken by the AI when answering
													calls
												</p>
											</div>
										</CardContent>
										<CardFooter className="justify-end border-t pt-4">
											<Button onClick={handleSaveAgent} disabled={savingAgent}>
												{savingAgent ? (
													<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
												) : (
													<IconCheck className="mr-2 h-4 w-4" />
												)}
												Save AI Settings
											</Button>
										</CardFooter>
									</Card>
								</>
							)}

							{activeTab === "team" && (
								<Card>
									<CardHeader className="flex flex-row items-center justify-between">
										<div>
											<CardTitle>Team Members</CardTitle>
											<CardDescription>
												Manage your team and their access
											</CardDescription>
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
										{teamLoading ? (
											<div className="flex items-center justify-center py-8">
												<IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
											</div>
										) : !organization ? (
											<div className="py-8 text-center text-muted-foreground">
												<p>No organization yet.</p>
												<p className="text-sm">
													Complete onboarding to create your team.
												</p>
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
																{isOwner &&
																member.userId !== session?.user?.id ? (
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
																			<SelectItem value="owner">
																				Owner
																			</SelectItem>
																			<SelectItem value="admin">
																				Admin
																			</SelectItem>
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

												{/* Pending Invitations */}
												{organization.invitations?.filter(
													(inv) => inv.status === "pending",
												).length > 0 && (
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
							)}

							{activeTab === "billing" && (
								<Card>
									<CardHeader>
										<CardTitle>Subscription</CardTitle>
										<CardDescription>
											Your current plan and billing
										</CardDescription>
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
									<CardFooter className="border-t pt-4">
										<Button variant="outline" asChild>
											<Link href="/dashboard/billing">Manage Billing</Link>
										</Button>
									</CardFooter>
								</Card>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
