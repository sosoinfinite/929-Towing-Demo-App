import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "TowAI - 24/7 AI Dispatch Service for Towing Companies",
	description:
		"Stop missing calls and losing revenue. TowAI is the virtual dispatcher for tow trucks that quotes, schedules, and dispatches 24/7. Try it free today.",
	keywords: [
		"tow truck dispatch service",
		"AI dispatch for towing",
		"virtual dispatcher for tow companies",
		"towing answering service",
		"24/7 tow truck dispatch",
	],
	openGraph: {
		title: "TowAI - 24/7 AI Dispatch Service for Towing Companies",
		description:
			"Never miss a call. AI dispatcher for towing companies at a fraction of the cost.",
		type: "website",
	},
};

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
