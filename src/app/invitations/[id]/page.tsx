"use client";

import { IconCheck, IconLoader2, IconX } from "@tabler/icons-react";
import type { Invitation } from "better-auth/plugins/organization";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient, useSession } from "@/lib/auth-client";

export default function InvitationPage() {
	const params = useParams();
	const router = useRouter();
	const invitationId = params.id as string;

	const { data: session, isPending: sessionLoading } = useSession();
	const [invitation, setInvitation] = useState<Invitation | null>(null);
	const [loading, setLoading] = useState(true);
	const [accepting, setAccepting] = useState(false);
	const [rejecting, setRejecting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		// Fetch invitation details
		authClient.organization
			.getInvitation({
				query: { id: invitationId },
			})
			.then((result) => {
				if (result.data) {
					setInvitation(result.data);
				} else {
					setError("Invitation not found or has expired");
				}
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to load invitation");
				setLoading(false);
			});
	}, [invitationId]);

	const handleAccept = async () => {
		setAccepting(true);
		setError(null);

		try {
			const result = await authClient.organization.acceptInvitation({
				invitationId,
			});

			if (result.error) {
				setError(result.error.message || "Failed to accept invitation");
			} else {
				setSuccess(true);
				setTimeout(() => {
					router.push("/dashboard");
				}, 2000);
			}
		} catch {
			setError("Failed to accept invitation");
		} finally {
			setAccepting(false);
		}
	};

	const handleReject = async () => {
		setRejecting(true);
		setError(null);

		try {
			await authClient.organization.rejectInvitation({
				invitationId,
			});
			router.push("/");
		} catch {
			setError("Failed to reject invitation");
		} finally {
			setRejecting(false);
		}
	};

	if (loading || sessionLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error && !invitation) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<IconX className="h-6 w-6 text-red-600" />
						</div>
						<CardTitle>Invalid Invitation</CardTitle>
						<CardDescription>{error}</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button asChild>
							<Link href="/">Go Home</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (success) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
							<IconCheck className="h-6 w-6 text-green-600" />
						</div>
						<CardTitle>Welcome to the team!</CardTitle>
						<CardDescription>
							You&apos;ve successfully joined. Redirecting to dashboard...
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle>Team Invitation</CardTitle>
						<CardDescription>
							You&apos;ve been invited to join a team as a {invitation?.role}.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-center text-sm text-muted-foreground">
							Please sign in or create an account to accept this invitation.
						</p>
						<div className="flex flex-col gap-2">
							<Button asChild>
								<Link href={`/sign-in?redirect=/invitations/${invitationId}`}>
									Sign In
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href={`/sign-up?redirect=/invitations/${invitationId}`}>
									Create Account
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Team Invitation</CardTitle>
					<CardDescription>
						You&apos;ve been invited to join a team as a {invitation?.role}.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{error && <p className="text-center text-sm text-red-500">{error}</p>}
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={handleReject}
							disabled={accepting || rejecting}
						>
							{rejecting ? (
								<IconLoader2 className="h-4 w-4 animate-spin" />
							) : (
								"Decline"
							)}
						</Button>
						<Button
							className="flex-1"
							onClick={handleAccept}
							disabled={accepting || rejecting}
						>
							{accepting ? (
								<IconLoader2 className="h-4 w-4 animate-spin" />
							) : (
								"Accept Invitation"
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
