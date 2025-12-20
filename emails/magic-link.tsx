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

interface MagicLinkEmailProps {
	name?: string;
	magicLinkUrl: string;
}

export default function MagicLinkEmail({
	name = "there",
	magicLinkUrl,
}: MagicLinkEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Sign in to tow.center</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>tow.center</Heading>
					<Text style={paragraph}>Hey {name},</Text>
					<Text style={paragraph}>
						Click the button below to sign in to your tow.center account. No
						password needed.
					</Text>
					<Section style={buttonContainer}>
						<Button style={button} href={magicLinkUrl}>
							Sign In to tow.center
						</Button>
					</Section>
					<Text style={paragraph}>
						Or copy and paste this URL into your browser:
					</Text>
					<Text style={link}>{magicLinkUrl}</Text>
					<Hr style={hr} />
					<Text style={footer}>
						This link expires in 5 minutes. If you didn&apos;t request this
						sign-in link, you can safely ignore this email.
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
	backgroundColor: "#000000",
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
