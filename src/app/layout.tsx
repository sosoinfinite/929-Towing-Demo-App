import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "tow.center - AI-Powered Towing Dispatch",
		template: "%s | tow.center",
	},
	description: "Never miss a call. AI dispatcher for towing companies.",
	metadataBase: new URL("https://tow.center"),
	openGraph: {
		type: "website",
		locale: "en_US",
		siteName: "tow.center",
		images: [
			{
				url: "/opengraph-image.jpg",
				width: 1200,
				height: 630,
				alt: "tow.center - AI Dispatcher for Towing Companies",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		images: [
			{
				url: "/twitter-image.jpg",
				width: 1200,
				height: 630,
				alt: "tow.center - AI Dispatcher for Towing Companies",
			},
		],
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
