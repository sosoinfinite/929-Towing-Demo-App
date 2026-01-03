import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface JobCreatedEmailProps {
	customerName?: string;
	serviceType: string;
	pickupLocation: string;
	vehicleInfo?: string;
	companyName: string;
	companyPhone?: string;
}

export default function JobCreatedEmail({
	customerName = "there",
	serviceType,
	pickupLocation,
	vehicleInfo,
	companyName,
	companyPhone,
}: JobCreatedEmailProps) {
	const serviceLabel =
		{
			tow: "Towing Service",
			jumpstart: "Jump Start",
			lockout: "Lockout Service",
			tire: "Tire Change",
			fuel: "Fuel Delivery",
			winch: "Winch Out",
			other: "Roadside Assistance",
		}[serviceType] || serviceType;

	return (
		<Html>
			<Head />
			<Preview>Your service request has been received - {companyName}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>{companyName}</Heading>
					<Text style={paragraph}>Hey {customerName},</Text>
					<Text style={paragraph}>
						Your service request has been received and is being processed.
						We&apos;ll dispatch a driver to you shortly.
					</Text>
					<Section style={detailsBox}>
						<Text style={detailsHeading}>Service Details</Text>
						<Text style={detailRow}>
							<strong>Service:</strong> {serviceLabel}
						</Text>
						<Text style={detailRow}>
							<strong>Location:</strong> {pickupLocation}
						</Text>
						{vehicleInfo && (
							<Text style={detailRow}>
								<strong>Vehicle:</strong> {vehicleInfo}
							</Text>
						)}
					</Section>
					<Text style={paragraph}>
						You&apos;ll receive updates as your service progresses. If you need
						to reach us, please call {companyPhone || "our dispatch line"}.
					</Text>
					<Hr style={hr} />
					<Text style={footer}>
						&copy; {new Date().getFullYear()} {companyName}. Powered by
						tow.center
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

const detailsBox = {
	backgroundColor: "#f9fafb",
	borderRadius: "8px",
	padding: "20px",
	margin: "24px 0",
};

const detailsHeading = {
	fontSize: "14px",
	fontWeight: "600",
	color: "#6b7280",
	textTransform: "uppercase" as const,
	letterSpacing: "0.05em",
	margin: "0 0 12px",
};

const detailRow = {
	fontSize: "15px",
	lineHeight: "24px",
	color: "#374151",
	margin: "4px 0",
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
