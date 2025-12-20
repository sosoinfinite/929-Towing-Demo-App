"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIDemo } from "./ai-demo";

// Spring animation config for premium feel
const springTransition = {
	type: "spring" as const,
	stiffness: 400,
	damping: 17,
};

const buttonVariants = {
	initial: { scale: 1 },
	hover: { scale: 1.03, transition: springTransition },
	tap: { scale: 0.97, transition: springTransition },
};

interface HeroSectionProps {
	agentId?: string;
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: "easeOut" as const },
	},
};

const floatVariants = {
	animate: {
		y: [0, -10, 0],
		transition: {
			duration: 5,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut" as const,
		},
	},
};

export function HeroSection({ agentId }: HeroSectionProps) {
	return (
		<section
			aria-labelledby="hero-heading"
			className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-24"
		>
			{/* Background glow */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-[120px]" />
			</div>

			<motion.div
				className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Left: Copy */}
				<div className="order-2 lg:order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
					<motion.div variants={itemVariants}>
						<Badge
							variant="secondary"
							className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/10 text-primary"
						>
							Alpha Access: 3 Months Free
						</Badge>
					</motion.div>

					<motion.h1
						id="hero-heading"
						variants={itemVariants}
						className="max-w-2xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl [text-wrap:balance]"
					>
						Stop Losing{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300">
							$300 Tows
						</span>{" "}
						While You&apos;re on a Hook
					</motion.h1>

					<motion.p
						variants={itemVariants}
						className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
					>
						tow.center is the AI dispatcher that never sleeps. It answers calls
						instantly, quotes using <strong>your rates</strong>, and texts you
						the job details.
					</motion.p>

					<motion.div
						variants={itemVariants}
						className="mt-10 flex flex-col w-full sm:w-auto gap-4 sm:flex-row"
					>
						<motion.div
							variants={buttonVariants}
							initial="initial"
							whileHover="hover"
							whileTap="tap"
						>
							<Button
								size="lg"
								className="group relative h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 sm:h-14 sm:px-10 sm:text-lg overflow-hidden"
								asChild
							>
								<Link href="/sign-up">
									<span className="relative z-10 flex items-center">
										<Sparkles className="mr-2 h-5 w-5 opacity-80" />
										Start Free Trial
										<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
									</span>
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary"
										initial={{ x: "-100%" }}
										whileHover={{ x: "0%" }}
										transition={{ duration: 0.3 }}
									/>
								</Link>
							</Button>
						</motion.div>
						<motion.div
							variants={buttonVariants}
							initial="initial"
							whileHover="hover"
							whileTap="tap"
						>
							<Button
								variant="outline"
								size="lg"
								className="h-12 px-8 text-base sm:h-14 sm:px-10 sm:text-lg border-2 hover:bg-accent/50"
								asChild
							>
								<a href="#pricing">See Pricing</a>
							</Button>
						</motion.div>
					</motion.div>

					<motion.div
						variants={itemVariants}
						className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground"
					>
						<div className="flex items-center gap-1.5">
							<CheckCircle2 className="h-4 w-4 text-primary" />
							<span>No credit card required</span>
						</div>
						<div className="flex items-center gap-1.5">
							<CheckCircle2 className="h-4 w-4 text-primary" />
							<span>Setup in 5 minutes</span>
						</div>
						<div className="flex items-center gap-1.5">
							<CheckCircle2 className="h-4 w-4 text-primary" />
							<span>$49/mo locked for life</span>
						</div>
					</motion.div>
				</div>

				{/* Right: Live AI Demo */}
				<motion.div
					variants={itemVariants}
					className="order-1 lg:order-2 relative flex justify-center lg:justify-end"
				>
					{/* Glow effect behind demo */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-[80px] rounded-full -z-10" />

					<motion.div
						variants={floatVariants}
						animate="animate"
						className="relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-border/50 bg-card shadow-2xl"
					>
						<AIDemo agentId={agentId} />

						{/* Footer hint */}
						<div className="border-t border-border bg-muted/30 px-4 py-3">
							<p className="text-center text-xs text-muted-foreground">
								Try it: &quot;I need a tow from Main St to Joe&apos;s Auto&quot;
							</p>
						</div>
					</motion.div>
				</motion.div>
			</motion.div>
		</section>
	);
}
