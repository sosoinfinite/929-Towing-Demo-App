import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";
import { Providers } from "./providers";

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
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
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
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "tow.center",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	themeColor: "#f97316",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
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
				<ServiceWorkerRegister />
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
