import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "tow.center - 24/7 AI Dispatch Service for Towing Companies",
	description:
		"Stop missing calls and losing revenue. tow.center is the virtual dispatcher for tow trucks that quotes, schedules, and dispatches 24/7. Try it free today.",
	keywords: [
		"tow truck dispatch service",
		"AI dispatch for towing",
		"virtual dispatcher for tow companies",
		"towing answering service",
		"24/7 tow truck dispatch",
		"AI answering service",
		"tow truck software",
		"dispatch automation",
	],
	openGraph: {
		title: "tow.center - 24/7 AI Dispatch Service for Towing Companies",
		description:
			"Never miss a call. AI dispatcher for towing companies at a fraction of the cost.",
		type: "website",
		url: "https://tow.center",
	},
	twitter: {
		card: "summary_large_image",
		title: "tow.center - 24/7 AI Dispatch for Towing",
		description:
			"Stop missing $300 tows. AI dispatcher that answers calls, quotes prices, and texts you job details 24/7.",
	},
};

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
