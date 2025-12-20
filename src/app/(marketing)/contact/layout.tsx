import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Contact Us",
	description:
		"Get in touch with tow.center. Questions about AI dispatch for your towing company? We're here to help.",
	openGraph: {
		title: "Contact tow.center",
		description:
			"Have questions about AI-powered towing dispatch? Contact our team.",
	},
};

export default function ContactLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
