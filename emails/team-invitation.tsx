import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface TeamInvitationEmailProps {
	inviterName?: string;
	organizationName: string;
	inviteLink: string;
	role?: string;
}

export default function TeamInvitationEmail({
	inviterName = "Someone",
	organizationName,
	inviteLink,
	role = "member",
}: TeamInvitationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>
				You&apos;ve been invited to join {organizationName} on tow.center
			</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>tow.center</Heading>
					<Text style={paragraph}>
						<strong>{inviterName}</strong> has invited you to join{" "}
						<strong>{organizationName}</strong> on tow.center as a {role}.
					</Text>
					<Text style={paragraph}>
						tow.center is an AI-powered dispatch system for towing companies.
						Accept the invitation below to get started.
					</Text>
					<Section style={buttonContainer}>
						<Button style={button} href={inviteLink}>
							Accept Invitation
						</Button>
					</Section>
					<Text style={paragraph}>
						Or copy and paste this URL into your browser:
					</Text>
					<Text style={link}>{inviteLink}</Text>
					<Hr style={hr} />
					<Text style={footer}>
						This invitation expires in 7 days. If you didn&apos;t expect this
						invitation, you can safely ignore this email.
					</Text>
					<Text style={footer}>
						&copy; {new Date().getFullYear()} tow.center. All rights reserved.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "40px 20px",
	marginBottom: "64px",
	borderRadius: "8px",
};

const heading = {
	fontSize: "24px",
	fontWeight: "bold",
	textAlign: "center" as const,
	margin: "0 0 30px",
	color: "#1a1a1a",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
	color: "#374151",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: "#16a34a",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "14px 28px",
};

const link = {
	fontSize: "14px",
	color: "#6b7280",
	wordBreak: "break-all" as const,
};

const hr = {
	borderColor: "#e5e7eb",
	margin: "32px 0",
};

const footer = {
	fontSize: "12px",
	color: "#9ca3af",
	textAlign: "center" as const,
	margin: "0",
};
