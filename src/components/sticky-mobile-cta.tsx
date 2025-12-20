"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function StickyMobileCTA() {
	const { scrollYProgress } = useScroll();
	// Show after scrolling past the hero (around 10% of page)
	const opacity = useTransform(scrollYProgress, [0.05, 0.1], [0, 1]);
	const y = useTransform(scrollYProgress, [0.05, 0.1], [100, 0]);

	return (
		<motion.div
			style={{ opacity, y }}
			className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-lg border-t border-border md:hidden"
		>
			<div className="flex items-center justify-between gap-4">
				<div className="flex-1 min-w-0">
					<p className="font-semibold text-sm text-foreground truncate">
						3 months free, then $49/mo
					</p>
					<p className="text-xs text-muted-foreground">No credit card needed</p>
				</div>
				<Button size="sm" className="shrink-0 font-semibold" asChild>
					<Link href="/sign-up">
						<Sparkles className="mr-1.5 h-4 w-4" />
						Start Free
						<ArrowRight className="ml-1.5 h-4 w-4" />
					</Link>
				</Button>
			</div>
		</motion.div>
	);
}
