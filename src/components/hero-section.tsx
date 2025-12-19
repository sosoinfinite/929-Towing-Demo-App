"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIDemo } from "./ai-demo";

interface HeroSectionProps {
	agentId?: string;
}

export function HeroSection({ agentId }: HeroSectionProps) {
	return (
		<section
			aria-labelledby="hero-heading"
			className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
		>
			<div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
				{/* Left: Copy - Shows second on mobile, first on desktop */}
				<div className="order-2 lg:order-1 text-center lg:text-left">
					<Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
						Alpha Access: 3 Months Free
					</Badge>

					<h1
						id="hero-heading"
						className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl"
					>
						Stop Losing <span className="text-primary">$300 Tows</span> While
						You&apos;re on a Hook
					</h1>

					<p className="mt-6 text-base text-muted-foreground sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0">
						TowAI answers the phone instantly, quotes prices based on{" "}
						<em>your</em> rates, and texts you the job details. Never let a call
						go to voicemail again.
					</p>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
						<Button
							size="lg"
							className="h-12 px-6 text-base font-semibold sm:h-14 sm:px-8 sm:text-lg"
							asChild
						>
							<Link href="/sign-up">
								Start Free Trial
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-12 px-6 text-base sm:h-14 sm:px-8 sm:text-lg"
							asChild
						>
							<a href="#pricing">See Pricing</a>
						</Button>
					</div>

					<p className="mt-4 text-sm text-muted-foreground">
						No credit card required. Then $49/mo locked for life.
					</p>
				</div>

				{/* Right: Live AI Demo - Shows first on mobile */}
				<div className="order-1 lg:order-2 flex justify-center lg:justify-end">
					<div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-border/50 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm">
						<AIDemo agentId={agentId} />

						{/* Footer hint */}
						<div className="border-t border-border bg-muted/30 px-4 py-3">
							<p className="text-center text-xs text-muted-foreground">
								Try it: &quot;I need a tow from Main St to Joe&apos;s Auto&quot;
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
