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

interface DriverEnRouteEmailProps {
	customerName?: string;
	driverName: string;
	serviceType: string;
	pickupLocation: string;
	estimatedArrival?: string;
	companyName: string;
	companyPhone?: string;
}

export default function DriverEnRouteEmail({
	customerName = "there",
	driverName,
	serviceType,
	pickupLocation,
	estimatedArrival,
	companyName,
	companyPhone,
}: DriverEnRouteEmailProps) {
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
			<Preview>Your driver is on the way! - {companyName}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={heading}>{companyName}</Heading>
					<Section style={statusBadge}>
						<Text style={statusText}>Driver En Route</Text>
					</Section>
					<Text style={paragraph}>Hey {customerName},</Text>
					<Text style={paragraph}>
						<strong>{driverName}</strong> is now on the way to your location.
						Please make sure you&apos;re accessible and ready for service.
					</Text>
					<Section style={detailsBox}>
						<Text style={detailsHeading}>Service Details</Text>
						<Text style={detailRow}>
							<strong>Driver:</strong> {driverName}
						</Text>
						{estimatedArrival && (
							<Text style={detailRow}>
								<strong>ETA:</strong> {estimatedArrival}
							</Text>
						)}
						<Text style={detailRow}>
							<strong>Service:</strong> {serviceLabel}
						</Text>
						<Text style={detailRow}>
							<strong>Location:</strong> {pickupLocation}
						</Text>
					</Section>
					<Text style={tipsHeading}>While you wait:</Text>
					<Text style={tipItem}>Stay in a safe location away from traffic</Text>
					<Text style={tipItem}>
						Turn on hazard lights if your vehicle is on the road
					</Text>
					<Text style={tipItem}>Have your keys ready for the driver</Text>
					<Text style={paragraph}>
						If you need to reach us, please call{" "}
						{companyPhone || "our dispatch line"}.
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
	margin: "0 0 20px",
	color: "#1a1a1a",
};

const statusBadge = {
	textAlign: "center" as const,
	marginBottom: "24px",
};

const statusText = {
	display: "inline-block",
	backgroundColor: "#fef3c7",
	color: "#d97706",
	fontSize: "14px",
	fontWeight: "600",
	padding: "8px 16px",
	borderRadius: "9999px",
	margin: "0",
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

const tipsHeading = {
	fontSize: "14px",
	fontWeight: "600",
	color: "#374151",
	margin: "24px 0 8px",
};

const tipItem = {
	fontSize: "14px",
	lineHeight: "22px",
	color: "#6b7280",
	margin: "4px 0",
	paddingLeft: "16px",
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
