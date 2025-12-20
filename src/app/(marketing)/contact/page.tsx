"use client";

import {
	IconCheck,
	IconLoader2,
	IconMail,
	IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		company: "",
		message: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!res.ok) {
				throw new Error("Failed to send message");
			}

			setSuccess(true);
			setFormData({ name: "", email: "", company: "", message: "" });
		} catch {
			setError("Failed to send message. Please try emailing us directly.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border">
				<nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
					<Link href="/" className="text-xl font-bold">
						tow.center
					</Link>
					<Link
						href="/"
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						Back to Home
					</Link>
				</nav>
			</header>

			{/* Content */}
			<main className="mx-auto max-w-4xl px-4 py-12">
				<h1 className="mb-2 text-3xl font-bold">Contact Us</h1>
				<p className="mb-8 text-muted-foreground">
					Have questions about tow.center? We&apos;d love to hear from you.
				</p>

				<div className="grid gap-12 md:grid-cols-2">
					{/* Contact Info */}
					<div className="space-y-8">
						<div>
							<h2 className="mb-4 text-xl font-semibold">Get in Touch</h2>
							<p className="text-muted-foreground">
								Whether you&apos;re curious about our AI dispatch service, need
								help with setup, or want to discuss custom solutions for your
								towing business, we&apos;re here to help.
							</p>
						</div>

						<div className="space-y-4">
							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
									<IconMail className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-medium">Email</h3>
									<a
										href="mailto:support@tow.center"
										className="text-muted-foreground hover:text-primary"
									>
										support@tow.center
									</a>
									<p className="mt-1 text-sm text-muted-foreground">
										We respond within 24 hours
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
									<IconPhone className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-medium">Phone</h3>
									<p className="text-muted-foreground">Coming soon</p>
									<p className="mt-1 text-sm text-muted-foreground">
										For now, please use email or the form
									</p>
								</div>
							</div>
						</div>

						<div className="rounded-lg border border-border bg-muted/30 p-6">
							<h3 className="mb-2 font-medium">Office Hours</h3>
							<p className="text-sm text-muted-foreground">
								Monday - Friday: 9am - 6pm EST
							</p>
							<p className="text-sm text-muted-foreground">
								Weekend: Email support only
							</p>
						</div>
					</div>

					{/* Contact Form */}
					<div>
						{success ? (
							<div className="flex flex-col items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 p-8 text-center">
								<div className="mb-4 rounded-full bg-green-500/20 p-3">
									<IconCheck className="h-6 w-6 text-green-600" />
								</div>
								<h3 className="mb-2 text-lg font-medium">Message Sent!</h3>
								<p className="text-muted-foreground">
									Thanks for reaching out. We&apos;ll get back to you within 24
									hours.
								</p>
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => setSuccess(false)}
								>
									Send Another Message
								</Button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-6">
								{error && (
									<div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
										{error}
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="name">Name *</Label>
									<Input
										id="name"
										required
										placeholder="John Smith"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										type="email"
										required
										placeholder="john@example.com"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="company">Company Name</Label>
									<Input
										id="company"
										placeholder="Your Towing Company"
										value={formData.company}
										onChange={(e) =>
											setFormData({ ...formData, company: e.target.value })
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="message">Message *</Label>
									<Textarea
										id="message"
										required
										rows={5}
										placeholder="Tell us how we can help..."
										value={formData.message}
										onChange={(e) =>
											setFormData({ ...formData, message: e.target.value })
										}
									/>
								</div>

								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? (
										<>
											<IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
											Sending...
										</>
									) : (
										"Send Message"
									)}
								</Button>

								<p className="text-center text-xs text-muted-foreground">
									By submitting this form, you agree to our{" "}
									<Link
										href="/privacy"
										className="underline hover:text-foreground"
									>
										Privacy Policy
									</Link>
									.
								</p>
							</form>
						)}
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border py-8">
				<div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
					<p>
						&copy; {new Date().getFullYear()} tow.center. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
