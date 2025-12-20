"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { Calculator, DollarSign, Phone, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function AnimatedNumber({ value }: { value: number }) {
	const spring = useSpring(0, { stiffness: 100, damping: 30 });

	useEffect(() => {
		spring.set(value);
	}, [value, spring]);

	const display = useTransform(spring, (latest) =>
		Math.round(latest).toLocaleString(),
	);

	return <motion.span>{display}</motion.span>;
}

export function ROICalculator() {
	const [missedCalls, setMissedCalls] = useState(5);
	const [avgTowValue, setAvgTowValue] = useState(175);
	const [conversionRate, setConversionRate] = useState(60);

	// Calculate lost revenue
	const dailyLoss = missedCalls * avgTowValue * (conversionRate / 100);
	const monthlyLoss = dailyLoss * 30;
	const yearlyLoss = monthlyLoss * 12;

	// tow.center cost
	const monthlyCost = 49;
	const netSavings = monthlyLoss - monthlyCost;
	const roi = ((netSavings / monthlyCost) * 100).toFixed(0);

	return (
		<section className="py-16 sm:py-24 bg-background">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-full bg-destructive/10 text-destructive">
							<Calculator className="h-5 w-5" />
							<span className="font-medium">Revenue Calculator</span>
						</div>
						<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
							How Much Are Missed Calls Costing You?
						</h2>
						<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
							Adjust the sliders to see how much revenue you're losing every
							month from unanswered calls.
						</p>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Card className="border-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-xl">
								<TrendingUp className="h-5 w-5 text-primary" />
								Lost Revenue Calculator
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-8">
							{/* Sliders */}
							<div className="grid gap-8 md:grid-cols-3">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-muted-foreground" />
											Missed Calls/Day
										</Label>
										<span className="text-lg font-bold text-foreground">
											{missedCalls}
										</span>
									</div>
									<Slider
										value={[missedCalls]}
										onValueChange={([v]) => setMissedCalls(v)}
										min={1}
										max={20}
										step={1}
										className="[&_[role=slider]]:bg-primary"
									/>
									<p className="text-xs text-muted-foreground">
										Average for solo operators: 3-8
									</p>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="flex items-center gap-2">
											<DollarSign className="h-4 w-4 text-muted-foreground" />
											Avg Tow Value
										</Label>
										<span className="text-lg font-bold text-foreground">
											${avgTowValue}
										</span>
									</div>
									<Slider
										value={[avgTowValue]}
										onValueChange={([v]) => setAvgTowValue(v)}
										min={75}
										max={500}
										step={25}
										className="[&_[role=slider]]:bg-primary"
									/>
									<p className="text-xs text-muted-foreground">
										Light-duty average: $125-$250
									</p>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<Label className="flex items-center gap-2">
											<TrendingUp className="h-4 w-4 text-muted-foreground" />
											Conversion Rate
										</Label>
										<span className="text-lg font-bold text-foreground">
											{conversionRate}%
										</span>
									</div>
									<Slider
										value={[conversionRate]}
										onValueChange={([v]) => setConversionRate(v)}
										min={30}
										max={90}
										step={5}
										className="[&_[role=slider]]:bg-primary"
									/>
									<p className="text-xs text-muted-foreground">
										% of calls that would become jobs
									</p>
								</div>
							</div>

							{/* Results */}
							<div className="border-t pt-8">
								<div className="grid gap-6 sm:grid-cols-3">
									<div className="text-center p-4 rounded-xl bg-destructive/5 border border-destructive/20">
										<p className="text-sm font-medium text-destructive mb-1">
											Monthly Loss
										</p>
										<p className="text-3xl font-bold text-destructive">
											$<AnimatedNumber value={monthlyLoss} />
										</p>
									</div>
									<div className="text-center p-4 rounded-xl bg-destructive/5 border border-destructive/20">
										<p className="text-sm font-medium text-destructive mb-1">
											Yearly Loss
										</p>
										<p className="text-3xl font-bold text-destructive">
											$<AnimatedNumber value={yearlyLoss} />
										</p>
									</div>
									<div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
										<p className="text-sm font-medium text-primary mb-1">
											Net Savings with tow.center
										</p>
										<p className="text-3xl font-bold text-primary">
											$<AnimatedNumber value={netSavings} />
											<span className="text-lg">/mo</span>
										</p>
									</div>
								</div>

								<motion.div
									className="mt-6 text-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-green-500/10 border border-primary/20"
									initial={{ scale: 0.95, opacity: 0 }}
									whileInView={{ scale: 1, opacity: 1 }}
									viewport={{ once: true }}
									transition={{ delay: 0.4 }}
								>
									<p className="text-lg font-semibold text-foreground">
										At $49/mo, tow.center delivers a{" "}
										<span className="text-primary font-bold">{roi}x ROI</span>
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										Stop losing money while you're on a hook
									</p>
								</motion.div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</section>
	);
}
