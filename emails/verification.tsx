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

interface VerificationEmailProps {
	name?: string;
	verificationUrl: string;
}

export default function VerificationEmail({
	name = "there",
	verificationUrl,
}: VerificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Verify your tow.center account</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>tow.center</Heading>
					<Text style={paragraph}>Hey {name},</Text>
					<Text style={paragraph}>
						Welcome to tow.center! Click the button below to verify your email
						and activate your account.
					</Text>
					<Section style={buttonContainer}>
						<Button style={button} href={verificationUrl}>
							Verify Email
						</Button>
					</Section>
					<Text style={paragraph}>
						Or copy and paste this URL into your browser:
					</Text>
					<Text style={link}>{verificationUrl}</Text>
					<Hr style={hr} />
					<Text style={footer}>
						This link expires in 24 hours. If you didn&apos;t create an account
						with tow.center, you can safely ignore this email.
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
