"use client";

import {
	IconBook,
	IconBriefcase,
	IconHeadset,
	IconMail,
	IconMessage,
	IconMessageCircle,
	IconPhone,
	IconQuestionMark,
	IconRobot,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
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
			"When dispatch is enabled, incoming calls to your tow.center number are answered by our AI agent. The AI collects caller information, understands their needs, quotes your rates, and sends you the job details via SMS. You can accept or decline with one tap.",
	},
	{
		question: "What happens when I turn dispatch off?",
		answer:
			"When dispatch is disabled, calls go to voicemail. Callers can leave a message which will be transcribed and available in your call history.",
	},
	{
		question: "How do I receive motor club dispatch emails?",
		answer:
			"Forward your motor club emails (AAA, Agero, Urgently, Swoop, Honk) to dispatch@tow.center. Our AI automatically parses the email and creates a job in your dashboard with all details extracted - customer info, vehicle, location, and PO number.",
	},
	{
		question: "How does 2-way SMS work with drivers?",
		answer:
			"When you assign a driver to a job, they receive an SMS with all the details. Drivers can text back status updates: 'OTW' (on the way), 'arrived', or 'done' and the job status updates automatically. Customers can also be notified of driver ETA.",
	},
	{
		question: "What's in the Jobs dashboard?",
		answer:
			"The Jobs dashboard shows all jobs from calls, emails, SMS, and manual entry in one place. You can filter by status, view job details, send SMS messages, and track the full communication history for each job.",
	},
	{
		question: "How do I set up my phone number?",
		answer:
			"Go to Settings and enter your company details. You'll be assigned a dedicated phone number that you can forward calls to or use as your primary dispatch line.",
	},
	{
		question: "Can I customize what the AI says?",
		answer:
			"Yes! In Settings, you can customize the greeting message and provide specific instructions for how the AI should handle calls for your business. You can also set your service area and pricing.",
	},
	{
		question: "How are call minutes calculated?",
		answer:
			"Call minutes are counted from when the AI answers until the call ends. Voicemail recordings don't count against your AI minutes. SMS messages are included in your plan at no extra charge.",
	},
	{
		question: "How do I add drivers to my account?",
		answer:
			"Go to Settings and add driver profiles with their name and phone number. Once added, you can assign jobs to drivers and they'll receive SMS notifications automatically.",
	},
	{
		question: "What's included in the Alpha program?",
		answer:
			"Alpha members get 3 months free, then $49/mo locked for life. This includes 100 AI minutes/month, unlimited SMS, motor club email parsing, a shared phone number, 7-day call recording, and email support.",
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

const quickLinks = [
	{
		icon: IconRobot,
		title: "AI Voice Dispatch",
		description: "24/7 call answering with natural voice AI",
		href: "/dashboard",
	},
	{
		icon: IconBriefcase,
		title: "Jobs Dashboard",
		description: "Manage all jobs in one place",
		href: "/dashboard/jobs",
	},
	{
		icon: IconMail,
		title: "Email Integration",
		description: "Motor club email parsing",
		href: "/dashboard/jobs",
	},
	{
		icon: IconMessage,
		title: "SMS Messaging",
		description: "2-way communication with drivers",
		href: "/dashboard/jobs",
	},
	{
		icon: IconSettings,
		title: "Settings",
		description: "Configure your account",
		href: "/dashboard/settings",
	},
	{
		icon: IconUsers,
		title: "Team Management",
		description: "Add drivers and team members",
		href: "/dashboard/settings",
	},
];

const guides = [
	{
		title: "Getting Started",
		items: [
			"Enable dispatch from the main dashboard",
			"Configure your greeting in Settings",
			"Add your pricing information",
			"Test with a call to your tow.center number",
		],
	},
	{
		title: "Motor Club Setup",
		items: [
			"Forward dispatch emails to dispatch@tow.center",
			"Jobs appear automatically in your dashboard",
			"Assign drivers with one click",
			"Track job status from pending to complete",
		],
	},
	{
		title: "Driver SMS Updates",
		items: [
			"Add drivers in Settings with their phone numbers",
			"Assign a driver to send them the job details",
			"Drivers text 'OTW' when en route",
			"Drivers text 'arrived' or 'done' to update status",
		],
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
							Find answers and learn how to get the most out of tow.center
						</p>
					</div>

					<div className="space-y-6">
						{/* Quick Links */}
						<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
							{quickLinks.map((link) => (
								<Link key={link.title} href={link.href}>
									<Card className="cursor-pointer transition-colors hover:bg-muted/50 h-full">
										<CardContent className="flex flex-col items-center gap-2 p-4 text-center">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
												<link.icon className="h-5 w-5 text-primary" />
											</div>
											<h3 className="font-medium text-sm">{link.title}</h3>
											<p className="text-xs text-muted-foreground">
												{link.description}
											</p>
										</CardContent>
									</Card>
								</Link>
							))}
						</div>

						{/* Quick Start Guides */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<IconBook className="h-5 w-5 text-muted-foreground" />
									<div>
										<CardTitle>Quick Start Guides</CardTitle>
										<CardDescription>
											Get up and running in minutes
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid gap-6 md:grid-cols-3">
									{guides.map((guide) => (
										<div key={guide.title} className="space-y-3">
											<h3 className="font-semibold text-foreground">
												{guide.title}
											</h3>
											<ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
												{guide.items.map((item) => (
													<li key={item}>{item}</li>
												))}
											</ol>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

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
									{faqs.map((faq) => (
										<AccordionItem key={faq.question} value={faq.question}>
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
											AI dispatch, voice, SMS, and email are running normally
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
