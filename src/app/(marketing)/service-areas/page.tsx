import { ArrowRight, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { formatPopulation, getMetrosByRegion, METROS } from "@/lib/metros";

export const metadata: Metadata = {
	title: "Service Areas - AI Towing Dispatch Coverage",
	description:
		"tow.center provides AI-powered towing dispatch services across major metropolitan areas in the United States. Find coverage in your area.",
	openGraph: {
		title: "Service Areas | tow.center",
		description:
			"AI-powered towing dispatch services across 36+ major US metropolitan areas.",
	},
};

export default function ServiceAreasPage() {
	const metrosByRegion = getMetrosByRegion();
	const regions = Object.keys(metrosByRegion);

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
							className="text-sm font-medium text-primary"
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

			{/* Hero */}
			<section className="py-16 md:py-24 bg-muted/30">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
						AI Towing Dispatch
						<br />
						<span className="text-primary">Across America</span>
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
						tow.center serves towing companies in {METROS.length} major
						metropolitan areas. Our AI dispatcher never sleeps, ensuring you
						capture every call 24/7.
					</p>
					<div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							<span>{METROS.length} Metro Areas</span>
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							<span>
								{formatPopulation(
									METROS.reduce((sum, m) => sum + m.population, 0),
								)}{" "}
								Population Served
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Regions */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					{regions.map((region) => (
						<div key={region} className="mb-12 last:mb-0">
							<h2 className="text-2xl font-bold mb-6 pb-2 border-b">
								{region}
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{metrosByRegion[region].map((metro) => (
									<Link
										key={metro.slug}
										href={`/service-areas/${metro.slug}`}
										className="group block p-6 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all"
									>
										<div className="flex items-start justify-between">
											<div>
												<h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
													{metro.metro}
												</h3>
												<p className="text-sm text-muted-foreground mt-1">
													{metro.cities.slice(0, 3).join(", ")}
													{metro.cities.length > 3 && " +more"}
												</p>
											</div>
											<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
										</div>
										<div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
											<span className="px-2 py-1 bg-muted rounded">
												{metro.state}
											</span>
											<span>{formatPopulation(metro.population)} pop.</span>
										</div>
									</Link>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="py-16 bg-primary text-primary-foreground">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl font-bold mb-4">Don&apos;t See Your Area?</h2>
					<p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
						We&apos;re expanding rapidly. Contact us to discuss bringing
						AI-powered dispatch to your region.
					</p>
					<Link
						href="/contact"
						className="inline-flex items-center gap-2 rounded-md bg-background text-foreground px-6 py-3 font-medium hover:bg-background/90 transition-colors"
					>
						Contact Us
						<ArrowRight className="h-4 w-4" />
					</Link>
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
