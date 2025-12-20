import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	MapPin,
	Phone,
	Clock,
	CheckCircle,
	ArrowRight,
	Building2,
} from "lucide-react";
import { METROS, getMetroBySlug, formatPopulation } from "@/lib/metros";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
	return METROS.map((metro) => ({
		slug: metro.slug,
	}));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const metro = getMetroBySlug(slug);

	if (!metro) {
		return {
			title: "Service Area Not Found",
		};
	}

	const title = `AI Towing Dispatch in ${metro.metro}, ${metro.state}`;
	const description = `24/7 AI-powered towing dispatch for ${metro.cities.join(", ")} and surrounding areas. Never miss a call with tow.center's intelligent answering service.`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

export default async function MetroPage({ params }: Props) {
	const { slug } = await params;
	const metro = getMetroBySlug(slug);

	if (!metro) {
		notFound();
	}

	const benefits = [
		{
			title: "24/7 Coverage",
			description: `Never miss a towing call in ${metro.cities[0]} or surrounding areas, even at 3 AM.`,
		},
		{
			title: "Local Knowledge",
			description: `Our AI is trained on ${metro.metro} geography, highways, and common pickup locations.`,
		},
		{
			title: "Instant Response",
			description:
				"Callers get immediate service instead of voicemail, increasing your capture rate.",
		},
		{
			title: "Cost Effective",
			description:
				"Fraction of the cost of a full-time dispatcher, with better availability.",
		},
	];

	const features = [
		"Answers calls in under 2 seconds",
		"Collects vehicle info, location, and contact details",
		"Sends instant SMS notifications to your team",
		"Records and transcribes every call",
		"Integrates with your existing phone number",
		"No hardware or software to install",
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/" className="text-xl font-bold">
						tow.center
					</Link>
					<nav className="flex items-center gap-6">
						<Link
							href="/service-areas"
							className="text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							Service Areas
						</Link>
						<Link
							href="/sign-in"
							className="text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							Sign In
						</Link>
						<Link
							href="/sign-up"
							className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
						>
							Get Started
						</Link>
					</nav>
				</div>
			</header>

			{/* Breadcrumb */}
			<div className="border-b bg-muted/30">
				<div className="container mx-auto px-4 py-3">
					<nav className="flex items-center gap-2 text-sm text-muted-foreground">
						<Link href="/" className="hover:text-foreground">
							Home
						</Link>
						<span>/</span>
						<Link href="/service-areas" className="hover:text-foreground">
							Service Areas
						</Link>
						<span>/</span>
						<span className="text-foreground">{metro.metro}</span>
					</nav>
				</div>
			</div>

			{/* Hero */}
			<section className="py-16 md:py-24">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl">
						<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
							<MapPin className="h-4 w-4" />
							<span>{metro.region}</span>
							<span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
								{metro.state}
							</span>
						</div>
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
							AI Towing Dispatch in{" "}
							<span className="text-primary">{metro.metro}</span>
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							{metro.description ||
								`Professional AI-powered dispatch services for towing companies in ${metro.cities.join(", ")} and the greater ${metro.metro} area. Serving a population of ${formatPopulation(metro.population)}.`}
						</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<Link
								href="/sign-up"
								className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
							>
								Start Free Trial
								<ArrowRight className="h-5 w-5" />
							</Link>
							<Link
								href="/contact"
								className="inline-flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-lg font-medium hover:bg-muted transition-colors"
							>
								<Phone className="h-5 w-5" />
								Talk to Sales
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Cities Served */}
			<section className="py-12 bg-muted/30">
				<div className="container mx-auto px-4">
					<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<Building2 className="h-5 w-5 text-primary" />
						Cities We Serve in {metro.metro}
					</h2>
					<div className="flex flex-wrap gap-2">
						{metro.cities.map((city) => (
							<span
								key={city}
								className="px-4 py-2 bg-background border rounded-full text-sm"
							>
								{city}, {metro.state}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* Benefits */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">
						Why Towing Companies in {metro.cities[0]} Choose Us
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						{benefits.map((benefit) => (
							<div key={benefit.title} className="flex gap-4">
								<div className="flex-shrink-0">
									<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
										<CheckCircle className="h-5 w-5 text-primary" />
									</div>
								</div>
								<div>
									<h3 className="font-semibold text-lg mb-2">
										{benefit.title}
									</h3>
									<p className="text-muted-foreground">{benefit.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-16 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto">
						<h2 className="text-3xl font-bold text-center mb-4">
							What You Get
						</h2>
						<p className="text-center text-muted-foreground mb-12">
							Everything you need to never miss another towing call in the{" "}
							{metro.metro} area.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{features.map((feature) => (
								<div
									key={feature}
									className="flex items-center gap-3 p-4 bg-background rounded-lg border"
								>
									<CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
									<span>{feature}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Pricing CTA */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-2xl mx-auto text-center">
						<div className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-4">
							<Clock className="h-4 w-4" />
							Limited Time Offer
						</div>
						<h2 className="text-3xl font-bold mb-4">
							Alpha Program: 3 Months Free
						</h2>
						<p className="text-muted-foreground mb-8">
							Be one of the first towing companies in {metro.metro} to use
							AI-powered dispatch. Get 3 months free, then just $49/month locked
							in for life.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/sign-up"
								className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
							>
								Claim Your Spot
								<ArrowRight className="h-5 w-5" />
							</Link>
						</div>
						<p className="text-sm text-muted-foreground mt-4">
							No credit card required to start
						</p>
					</div>
				</div>
			</section>

			{/* Other Areas */}
			<section className="py-12 border-t">
				<div className="container mx-auto px-4">
					<h3 className="text-lg font-semibold mb-4">
						Other Service Areas in {metro.region}
					</h3>
					<div className="flex flex-wrap gap-2">
						{METROS.filter(
							(m) => m.region === metro.region && m.slug !== metro.slug,
						)
							.slice(0, 6)
							.map((m) => (
								<Link
									key={m.slug}
									href={`/service-areas/${m.slug}`}
									className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm transition-colors"
								>
									{m.metro}
								</Link>
							))}
						<Link
							href="/service-areas"
							className="px-4 py-2 text-primary text-sm hover:underline"
						>
							View all areas →
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-8 border-t">
				<div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
					<p>
						&copy; {new Date().getFullYear()} tow.center. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
