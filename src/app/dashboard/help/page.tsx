"use client";

import {
	IconBook,
	IconHeadset,
	IconMail,
	IconMessageCircle,
	IconPhone,
	IconQuestionMark,
	IconRobot,
	IconSettings,
} from "@tabler/icons-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const faqs = [
	{
		question: "How does the AI dispatcher work?",
		answer:
			"When dispatch is enabled, incoming calls to your tow.center number are answered by our AI agent. The AI collects caller information, understands their needs, and can dispatch your team or take messages based on your settings.",
	},
	{
		question: "What happens when I turn dispatch off?",
		answer:
			"When dispatch is disabled, calls go to voicemail. Callers can leave a message which will be transcribed and available in your call history.",
	},
	{
		question: "How do I set up my phone number?",
		answer:
			"Go to Settings and enter your company details. You'll be assigned a dedicated phone number that you can forward calls to or use as your primary dispatch line.",
	},
	{
		question: "Can I customize what the AI says?",
		answer:
			"Yes! In Settings, you can customize the greeting message and provide specific instructions for how the AI should handle calls for your business.",
	},
	{
		question: "How are call minutes calculated?",
		answer:
			"Call minutes are counted from when the AI answers until the call ends. Voicemail recordings don't count against your AI minutes.",
	},
	{
		question: "What's included in the Alpha program?",
		answer:
			"Alpha members get 3 months free, then $49/mo locked for life. This includes 100 AI minutes/month, a shared phone number, 7-day call recording, and email support.",
	},
	{
		question: "How do I invite team members?",
		answer:
			"Go to Settings and scroll to the Team section. Enter their email address and select a role (admin or member) to send an invitation.",
	},
	{
		question: "Where can I see my call transcripts?",
		answer:
			"Click on any call in your Call History to view the full transcript, caller information, and call duration.",
	},
];

const contactOptions = [
	{
		icon: IconMail,
		title: "Email Support",
		description: "Get help via email within 24 hours",
		action: "support@tow.center",
		href: "mailto:support@tow.center",
	},
	{
		icon: IconMessageCircle,
		title: "Live Chat",
		description: "Chat with our team (business hours)",
		action: "Start Chat",
		href: "#",
		comingSoon: true,
	},
	{
		icon: IconPhone,
		title: "Phone Support",
		description: "Available for Pro plan customers",
		action: "(888) TOW-HELP",
		href: "tel:+18888694357",
		comingSoon: true,
	},
];

export default function HelpPage() {
	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					<div className="mb-6">
						<h1 className="text-2xl font-bold">Help Center</h1>
						<p className="text-muted-foreground">
							Find answers and get support for tow.center
						</p>
					</div>

					<div className="space-y-6">
						{/* Quick Links */}
						<div className="grid gap-4 md:grid-cols-3">
							<Card className="cursor-pointer transition-colors hover:bg-muted/50">
								<CardContent className="flex items-center gap-4 p-6">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
										<IconRobot className="h-6 w-6 text-primary" />
									</div>
									<div>
										<h3 className="font-medium">Getting Started</h3>
										<p className="text-sm text-muted-foreground">
											Learn the basics of AI dispatch
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="cursor-pointer transition-colors hover:bg-muted/50">
								<CardContent className="flex items-center gap-4 p-6">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
										<IconSettings className="h-6 w-6 text-primary" />
									</div>
									<div>
										<h3 className="font-medium">Configuration</h3>
										<p className="text-sm text-muted-foreground">
											Customize your AI settings
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className="cursor-pointer transition-colors hover:bg-muted/50">
								<CardContent className="flex items-center gap-4 p-6">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
										<IconBook className="h-6 w-6 text-primary" />
									</div>
									<div>
										<h3 className="font-medium">Best Practices</h3>
										<p className="text-sm text-muted-foreground">
											Tips for towing dispatch
										</p>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* FAQ */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconQuestionMark className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>Frequently Asked Questions</CardTitle>
										<CardDescription>
											Common questions about tow.center
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<Accordion type="single" collapsible className="w-full">
									{faqs.map((faq, index) => (
										<AccordionItem key={index} value={`item-${index}`}>
											<AccordionTrigger className="text-left">
												{faq.question}
											</AccordionTrigger>
											<AccordionContent className="text-muted-foreground">
												{faq.answer}
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</CardContent>
						</Card>

						{/* Contact Support */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconHeadset className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>Contact Support</CardTitle>
										<CardDescription>
											Need more help? Reach out to our team
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 md:grid-cols-3">
									{contactOptions.map((option) => (
										<div
											key={option.title}
											className="flex flex-col items-center rounded-lg border p-6 text-center"
										>
											<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
												<option.icon className="h-6 w-6 text-muted-foreground" />
											</div>
											<h3 className="font-medium">{option.title}</h3>
											<p className="mb-3 text-sm text-muted-foreground">
												{option.description}
											</p>
											{option.comingSoon ? (
												<Button variant="outline" disabled>
													Coming Soon
												</Button>
											) : (
												<Button asChild variant="outline">
													<a href={option.href}>{option.action}</a>
												</Button>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* System Status */}
						<Card>
							<CardContent className="flex items-center justify-between p-6">
								<div className="flex items-center gap-3">
									<div className="h-3 w-3 rounded-full bg-green-500" />
									<div>
										<p className="font-medium">All Systems Operational</p>
										<p className="text-sm text-muted-foreground">
											AI dispatch, voice, and SMS are running normally
										</p>
									</div>
								</div>
								<Button variant="outline" asChild>
									<a
										href="https://status.tow.center"
										target="_blank"
										rel="noopener noreferrer"
									>
										View Status Page
									</a>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
