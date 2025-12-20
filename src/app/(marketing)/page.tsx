import {
	ArrowRight,
	Briefcase,
	Check,
	Clock,
	DollarSign,
	Mail,
	MessageSquare,
	Phone,
	Users,
	X,
	Zap,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import Script from "next/script";
import { HeroSection } from "@/components/hero-section";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
	// Redirect authenticated users to dashboard
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}
	const jsonLd = [
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "tow.center",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			url: "https://tow.center",
			image: "https://tow.center/opengraph-image.jpg",
			description:
				"AI-powered dispatch service for towing companies. Automate calls, quotes, and driver assignment 24/7.",
			offers: {
				"@type": "Offer",
				price: "49.00",
				priceCurrency: "USD",
				priceValidUntil: "2025-12-31",
				availability: "https://schema.org/InStock",
			},
			featureList: [
				"24/7 AI call answering",
				"Instant price quotes",
				"SMS job notifications",
				"Real-time dispatch",
				"Motor club email parsing",
				"2-way SMS with drivers",
				"Unified jobs dashboard",
			],
		},
		{
			"@context": "https://schema.org",
			"@type": "Organization",
			name: "tow.center",
			url: "https://tow.center",
			logo: "https://tow.center/opengraph-image.jpg",
			sameAs: [],
			contactPoint: {
				"@type": "ContactPoint",
				contactType: "customer service",
				availableLanguage: "English",
			},
		},
	];

	return (
		<>
			{/* Schema.org JSON-LD */}
			<Script
				id="json-ld"
				type="application/ld+json"
				strategy="beforeInteractive"
			>
				{JSON.stringify(jsonLd)}
			</Script>

			{/* Header */}
			<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<nav
					aria-label="Main"
					className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
				>
					<Link href="/" className="text-xl font-bold text-foreground">
						tow.center
					</Link>
					<div className="hidden items-center gap-6 sm:flex">
						<a
							href="#features"
							className="text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							Features
						</a>
						<a
							href="#pricing"
							className="text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							Pricing
						</a>
						<a
							href="#faq"
							className="text-sm font-medium text-muted-foreground hover:text-foreground"
						>
							FAQ
						</a>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/sign-in">Sign In</Link>
						</Button>
						<Button size="sm" asChild>
							<Link href="/sign-up">Join Alpha</Link>
						</Button>
					</div>
				</nav>
			</header>

			<main className="flex-1">
				{/* Hero Section with Live AI Demo */}
				<HeroSection agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID} />

				{/* Stats Bar */}
				<section className="border-y border-border/50 bg-muted/30">
					<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
							<div className="flex flex-col items-center justify-center gap-1">
								<dt className="text-4xl font-bold tracking-tight text-foreground">
									24/7
								</dt>
								<dd className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
									Availability
								</dd>
							</div>
							<div className="flex flex-col items-center justify-center gap-1">
								<dt className="text-4xl font-bold tracking-tight text-foreground">
									&lt;2s
								</dt>
								<dd className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
									Response Time
								</dd>
							</div>
							<div className="flex flex-col items-center justify-center gap-1">
								<dt className="text-4xl font-bold tracking-tight text-foreground">
									100%
								</dt>
								<dd className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
									Call Capture
								</dd>
							</div>
						</div>
					</div>
				</section>

				{/* How it Works */}
				<section className="py-20 sm:py-28 bg-background">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
								Your New AI Dispatcher
							</h2>
							<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
								Handles the busy work so you can focus on driving and safety.
							</p>
						</div>

						<div className="grid gap-12 md:grid-cols-3">
							<div className="relative flex flex-col items-center text-center">
								<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Phone className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold text-foreground">
									1. Answers Instantly
								</h3>
								<p className="mt-3 text-muted-foreground leading-relaxed">
									Never send a customer to voicemail again. The AI answers
									immediately, day or night, rain or shine.
								</p>
							</div>

							<div className="relative flex flex-col items-center text-center">
								<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<DollarSign className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold text-foreground">
									2. Quotes Your Rates
								</h3>
								<p className="mt-3 text-muted-foreground leading-relaxed">
									We upload your specific pricing (hook-up, mileage, storage).
									The AI negotiates and secures the job.
								</p>
							</div>

							<div className="relative flex flex-col items-center text-center">
								<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<MessageSquare className="h-8 w-8" />
								</div>
								<h3 className="text-xl font-bold text-foreground">
									3. Dispatches to You
								</h3>
								<p className="mt-3 text-muted-foreground leading-relaxed">
									Once the customer agrees, you get a text with location,
									vehicle info, and price. Just drive.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Pain Points Section */}
				<section
					aria-labelledby="problems-heading"
					className="border-y border-border bg-muted/30 py-16 sm:py-24"
				>
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<h2
							id="problems-heading"
							className="text-center text-3xl font-bold text-foreground sm:text-4xl"
						>
							Is Your Towing Business Bleeding Revenue?
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
							Every missed call is money in your competitor&apos;s pocket.
						</p>

						<div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
							<article className="rounded-lg border border-border bg-card p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
									<Phone className="h-6 w-6 text-destructive" />
								</div>
								<h3 className="text-xl font-semibold text-foreground">
									Missed Calls = Lost Cash
								</h3>
								<p className="mt-2 text-muted-foreground">
									You&apos;re hooking up a car on the highway. Phone rings. You
									can&apos;t answer. That caller doesn&apos;t leave a voicemail.
									You just lost $250+.
								</p>
							</article>

							<article className="rounded-lg border border-border bg-card p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
									<DollarSign className="h-6 w-6 text-destructive" />
								</div>
								<h3 className="text-xl font-semibold text-foreground">
									Dispatchers Cost $3,000+/Month
								</h3>
								<p className="mt-2 text-muted-foreground">
									Full-time dispatch staff is expensive. Add overtime, benefits,
									and sick days? The numbers don&apos;t work for small
									operators.
								</p>
							</article>

							<article className="rounded-lg border border-border bg-card p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
									<Clock className="h-6 w-6 text-destructive" />
								</div>
								<h3 className="text-xl font-semibold text-foreground">
									Answering Services Don&apos;t Get It
								</h3>
								<p className="mt-2 text-muted-foreground">
									Generic call centers don&apos;t know towing. They can&apos;t
									quote, they can&apos;t dispatch, and customers hang up
									frustrated.
								</p>
							</article>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					id="features"
					aria-labelledby="features-heading"
					className="py-16 sm:py-24"
				>
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<h2
							id="features-heading"
							className="text-center text-3xl font-bold text-foreground sm:text-4xl"
						>
							Complete Dispatch Automation
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
							tow.center handles calls, emails, and SMS so you can focus on
							driving.
						</p>

						<div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
							<Card>
								<CardHeader>
									<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Zap className="h-5 w-5 text-primary" />
									</div>
									<CardTitle>AI Voice Dispatch</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground">
									Every call answered in under 2 seconds. Natural voice AI
									collects details, quotes your rates, and dispatches the job to
									you via SMS.
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Mail className="h-5 w-5 text-primary" />
									</div>
									<CardTitle>Motor Club Email Parsing</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground">
									AI automatically parses dispatch emails from AAA, Agero,
									Urgently, Swoop, and Honk. Jobs are created instantly with all
									details extracted.
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<MessageSquare className="h-5 w-5 text-primary" />
									</div>
									<CardTitle>2-Way SMS Communication</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground">
									Drivers text &quot;OTW&quot; or &quot;arrived&quot; to update
									job status. Customers get automatic notifications. Full
									message history for every job.
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Briefcase className="h-5 w-5 text-primary" />
									</div>
									<CardTitle>Unified Jobs Dashboard</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground">
									All jobs from calls, emails, SMS, and manual entry in one
									place. Track status from pending to completed. Assign drivers
									with one click.
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Users className="h-5 w-5 text-primary" />
									</div>
									<CardTitle>Driver Management</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground">
									Add your drivers with their phone numbers. Assign jobs and
									notify them via SMS. Track who&apos;s on which job in
									real-time.
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<DollarSign className="h-5 w-5 text-primary" />
									</div>
									<CardTitle>Smart Quote Generation</CardTitle>
								</CardHeader>
								<CardContent className="text-muted-foreground">
									Automatically calculates pricing based on location, mileage,
									and vehicle type. Customers get instant quotes, you get more
									bookings.
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* How Motor Club Integration Works */}
				<section className="border-y border-border bg-muted/30 py-16 sm:py-24">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
								Motor Club Integration
							</h2>
							<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
								Stop manually copying dispatch emails. AI does it for you.
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
							<div className="flex flex-col items-center text-center">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
									1
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									Email Arrives
								</h3>
								<p className="mt-2 text-muted-foreground">
									AAA, Agero, or other motor club sends a dispatch email to your
									tow.center address
								</p>
							</div>

							<div className="flex flex-col items-center text-center">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
									2
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									AI Parses Details
								</h3>
								<p className="mt-2 text-muted-foreground">
									Customer name, phone, vehicle, pickup location, service type,
									and PO number are extracted
								</p>
							</div>

							<div className="flex flex-col items-center text-center">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
									3
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									Job Created
								</h3>
								<p className="mt-2 text-muted-foreground">
									A new job appears in your dashboard ready to be assigned to a
									driver
								</p>
							</div>

							<div className="flex flex-col items-center text-center">
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
									4
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									Driver Notified
								</h3>
								<p className="mt-2 text-muted-foreground">
									Assign a driver and they get an SMS with all job details
									instantly
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Comparison Section */}
				<section
					id="pricing"
					aria-labelledby="comparison-heading"
					className="border-y border-border bg-muted/30 py-16 sm:py-24"
				>
					<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
						<h2
							id="comparison-heading"
							className="text-center text-3xl font-bold text-foreground sm:text-4xl"
						>
							tow.center vs. Traditional Dispatch
						</h2>

						<div className="mt-12 grid gap-6 md:grid-cols-2">
							{/* Competitor Card */}
							<Card className="border-border/50 bg-card/50 opacity-80">
								<CardHeader>
									<CardTitle className="text-xl text-muted-foreground">
										Hiring a Dispatcher
									</CardTitle>
									<div className="text-3xl font-bold text-muted-foreground line-through decoration-destructive">
										$3,200/mo
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center gap-2 text-muted-foreground">
										<X className="h-5 w-5 text-destructive" />
										<span>8-hour shifts only</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<X className="h-5 w-5 text-destructive" />
										<span>Sick days & breaks</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<X className="h-5 w-5 text-destructive" />
										<span>Requires training</span>
									</div>
									<div className="flex items-center gap-2 text-muted-foreground">
										<X className="h-5 w-5 text-destructive" />
										<span>Turnover & hiring costs</span>
									</div>
								</CardContent>
							</Card>

							{/* tow.center Card */}
							<Card className="relative border-primary bg-card shadow-xl ring-2 ring-primary">
								<div className="absolute -top-4 left-0 right-0 flex justify-center">
									<Badge className="bg-primary px-4 py-1 text-sm font-bold uppercase tracking-wider text-primary-foreground">
										Best Value
									</Badge>
								</div>
								<CardHeader>
									<CardTitle className="text-xl text-foreground">
										tow.center Alpha
									</CardTitle>
									<div className="flex items-baseline gap-2">
										<span className="text-4xl font-extrabold text-foreground">
											$49/mo
										</span>
										<span className="text-sm text-muted-foreground line-through">
											$99/mo
										</span>
									</div>
									<p className="text-sm font-medium text-primary">
										Price locked for life
									</p>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center gap-2 font-medium">
										<Check className="h-5 w-5 text-primary" />
										<span>24/7 Coverage</span>
									</div>
									<div className="flex items-center gap-2 font-medium">
										<Check className="h-5 w-5 text-primary" />
										<span>Never misses a call</span>
									</div>
									<div className="flex items-center gap-2 font-medium">
										<Check className="h-5 w-5 text-primary" />
										<span>Instant setup</span>
									</div>
									<div className="flex items-center gap-2 font-medium">
										<Check className="h-5 w-5 text-primary" />
										<span>First 3 months free</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section
					id="faq"
					aria-labelledby="faq-heading"
					className="py-16 sm:py-24"
				>
					<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
						<h2
							id="faq-heading"
							className="text-center text-3xl font-bold text-foreground sm:text-4xl"
						>
							Frequently Asked Questions
						</h2>

						<div
							className="mt-12"
							itemScope
							itemType="https://schema.org/FAQPage"
						>
							<Accordion type="single" collapsible className="w-full">
								<AccordionItem
									value="item-1"
									itemScope
									itemProp="mainEntity"
									itemType="https://schema.org/Question"
								>
									<AccordionTrigger
										className="text-left text-lg"
										itemProp="name"
									>
										Will it sound like a robot?
									</AccordionTrigger>
									<AccordionContent
										itemScope
										itemProp="acceptedAnswer"
										itemType="https://schema.org/Answer"
									>
										<p itemProp="text">
											No. tow.center uses advanced voice AI that sounds natural
											and conversational. Most customers don&apos;t realize
											they&apos;re talking to an AI until the job is already
											booked. We handle accents, background noise, and even
											frustrated callers with ease.
										</p>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem
									value="item-2"
									itemScope
									itemProp="mainEntity"
									itemType="https://schema.org/Question"
								>
									<AccordionTrigger
										className="text-left text-lg"
										itemProp="name"
									>
										How do I get the job details?
									</AccordionTrigger>
									<AccordionContent
										itemScope
										itemProp="acceptedAnswer"
										itemType="https://schema.org/Answer"
									>
										<p itemProp="text">
											Immediately after each call, tow.center sends an SMS to
											your phone with the customer&apos;s name, location,
											vehicle type, and issue. You can accept or decline with
											one tap. No apps to check, no voicemails to listen to.
										</p>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem
									value="item-3"
									itemScope
									itemProp="mainEntity"
									itemType="https://schema.org/Question"
								>
									<AccordionTrigger
										className="text-left text-lg"
										itemProp="name"
									>
										What if a caller has a heavy accent?
									</AccordionTrigger>
									<AccordionContent
										itemScope
										itemProp="acceptedAnswer"
										itemType="https://schema.org/Answer"
									>
										<p itemProp="text">
											tow.center is trained on thousands of hours of real
											conversations and understands a wide range of accents
											better than most humans. If clarity is ever an issue, the
											AI knows how to politely ask for clarification.
										</p>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem
									value="item-4"
									itemScope
									itemProp="mainEntity"
									itemType="https://schema.org/Question"
								>
									<AccordionTrigger
										className="text-left text-lg"
										itemProp="name"
									>
										Can I customize the greeting and pricing?
									</AccordionTrigger>
									<AccordionContent
										itemScope
										itemProp="acceptedAnswer"
										itemType="https://schema.org/Answer"
									>
										<p itemProp="text">
											Yes. You control the greeting message, your service area,
											and your pricing structure. tow.center learns your rates
											and quotes accurately based on mileage, vehicle type, and
											time of day.
										</p>
									</AccordionContent>
								</AccordionItem>

								<AccordionItem
									value="item-5"
									itemScope
									itemProp="mainEntity"
									itemType="https://schema.org/Question"
								>
									<AccordionTrigger
										className="text-left text-lg"
										itemProp="name"
									>
										What happens after the Alpha program?
									</AccordionTrigger>
									<AccordionContent
										itemScope
										itemProp="acceptedAnswer"
										itemType="https://schema.org/Answer"
									>
										<p itemProp="text">
											Alpha members get 3 months completely free, then pay just
											$49/month locked for life. The standard price after launch
											will be $99/month. You&apos;re grandfathered in at the
											Alpha rate forever.
										</p>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</div>
					</div>
				</section>

				{/* Final CTA Section */}
				<section className="bg-primary py-16 text-primary-foreground sm:py-24">
					<div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
						<h2 className="text-3xl font-bold sm:text-4xl">
							Ready to Stop Missing Calls?
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
							Join the Alpha program today. 3 months free, then $49/mo locked
							for life. No credit card required.
						</p>
						<Button
							size="lg"
							variant="secondary"
							className="mt-8 h-14 px-8 text-lg font-bold"
							asChild
						>
							<Link href="/sign-up">
								Claim Your Alpha Spot
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="border-t border-border py-12">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<div className="text-sm text-muted-foreground">
							&copy; {new Date().getFullYear()} tow.center. All rights reserved.
						</div>
						<div className="flex gap-6 text-sm text-muted-foreground">
							<Link href="/privacy" className="hover:text-foreground">
								Privacy
							</Link>
							<Link href="/terms" className="hover:text-foreground">
								Terms
							</Link>
							<Link href="/contact" className="hover:text-foreground">
								Contact
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}
