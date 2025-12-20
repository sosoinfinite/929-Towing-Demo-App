import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy Policy - tow.center",
	description:
		"Privacy policy for tow.center AI dispatch service. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
				<h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
				<p className="mb-8 text-muted-foreground">
					Last updated: December 20, 2025
				</p>

				<div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
					<section>
						<h2 className="text-xl font-semibold">1. Introduction</h2>
						<p className="text-muted-foreground">
							tow.center (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
							operates the tow.center AI dispatch service. This Privacy Policy
							explains how we collect, use, disclose, and safeguard your
							information when you use our service.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">2. Information We Collect</h2>
						<p className="text-muted-foreground">
							We collect information you provide directly to us, including:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>
								<strong>Account Information:</strong> Name, email address, phone
								number, and company details when you register.
							</li>
							<li>
								<strong>Call Data:</strong> Phone numbers of callers, call
								duration, call recordings, and transcripts for dispatch
								purposes.
							</li>
							<li>
								<strong>Payment Information:</strong> Billing details processed
								securely through Stripe.
							</li>
							<li>
								<strong>Usage Data:</strong> How you interact with our service,
								including features used and preferences.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">
							3. How We Use Your Information
						</h2>
						<p className="text-muted-foreground">
							We use collected information to:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>Provide and maintain our AI dispatch service</li>
							<li>Process calls and dispatch requests on your behalf</li>
							<li>Send you service-related notifications and updates</li>
							<li>Process payments and send invoices</li>
							<li>Improve our AI models and service quality</li>
							<li>Respond to your requests and support inquiries</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">
							4. Call Recording and AI Processing
						</h2>
						<p className="text-muted-foreground">
							When you enable our AI dispatch service, incoming calls are
							processed by our AI system powered by ElevenLabs. Call recordings
							are stored for the duration specified in your plan (7-90 days
							depending on tier) and are used to:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>Generate transcripts for your records</li>
							<li>Extract caller information for dispatch</li>
							<li>Improve AI response quality</li>
						</ul>
						<p className="mt-4 text-muted-foreground">
							You may request deletion of recordings at any time by contacting
							support.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">5. Data Sharing</h2>
						<p className="text-muted-foreground">
							We do not sell your personal information. We share data only with:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>
								<strong>Service Providers:</strong> Twilio (telephony),
								ElevenLabs (AI voice), Stripe (payments), and Neon (database
								hosting).
							</li>
							<li>
								<strong>Legal Requirements:</strong> When required by law or to
								protect our rights.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">6. Data Security</h2>
						<p className="text-muted-foreground">
							We implement industry-standard security measures including
							encryption in transit (TLS) and at rest, secure authentication,
							and regular security audits. However, no method of transmission
							over the Internet is 100% secure.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">7. Your Rights</h2>
						<p className="text-muted-foreground">You have the right to:</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>Access your personal data</li>
							<li>Request correction of inaccurate data</li>
							<li>Request deletion of your data</li>
							<li>Export your data in a portable format</li>
							<li>Opt out of marketing communications</li>
						</ul>
						<p className="mt-4 text-muted-foreground">
							To exercise these rights, contact us at{" "}
							<a
								href="mailto:privacy@tow.center"
								className="text-primary hover:underline"
							>
								privacy@tow.center
							</a>
							.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">8. Data Retention</h2>
						<p className="text-muted-foreground">
							We retain your account information for as long as your account is
							active. Call recordings are retained according to your plan tier.
							After account deletion, we may retain certain data for legal
							compliance purposes for up to 7 years.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
						<p className="text-muted-foreground">
							We may update this Privacy Policy from time to time. We will
							notify you of any material changes by posting the new policy on
							this page and updating the &quot;Last updated&quot; date.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">10. Contact Us</h2>
						<p className="text-muted-foreground">
							If you have questions about this Privacy Policy, please contact us
							at:
						</p>
						<p className="mt-2 text-muted-foreground">
							Email:{" "}
							<a
								href="mailto:privacy@tow.center"
								className="text-primary hover:underline"
							>
								privacy@tow.center
							</a>
						</p>
					</section>
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
