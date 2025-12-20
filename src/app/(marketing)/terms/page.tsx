import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms of Service - tow.center",
	description:
		"Terms of service for tow.center AI dispatch service. Read our terms and conditions.",
};

export default function TermsPage() {
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
				<h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
				<p className="mb-8 text-muted-foreground">
					Last updated: December 20, 2025
				</p>

				<div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
					<section>
						<h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
						<p className="text-muted-foreground">
							By accessing or using tow.center (&quot;Service&quot;), you agree
							to be bound by these Terms of Service. If you do not agree to
							these terms, do not use the Service.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">2. Description of Service</h2>
						<p className="text-muted-foreground">
							tow.center provides an AI-powered dispatch service for towing
							companies. The Service includes:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>AI-powered call answering and dispatch</li>
							<li>Call recording and transcription</li>
							<li>SMS notifications to your team</li>
							<li>Dashboard for managing calls and settings</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">3. Account Registration</h2>
						<p className="text-muted-foreground">
							To use the Service, you must create an account and provide
							accurate information. You are responsible for:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>
								Maintaining the confidentiality of your account credentials
							</li>
							<li>All activities that occur under your account</li>
							<li>Notifying us immediately of any unauthorized access</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">
							4. Subscription and Payment
						</h2>
						<p className="text-muted-foreground">
							The Service is offered on a subscription basis:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>
								<strong>Alpha Plan:</strong> Free for 3 months, then $49/month
								locked for life for early adopters.
							</li>
							<li>
								<strong>Starter Plan:</strong> $99/month with 500 AI minutes.
							</li>
							<li>
								<strong>Pro Plan:</strong> $199/month with unlimited AI minutes.
							</li>
						</ul>
						<p className="mt-4 text-muted-foreground">
							Payments are processed through Stripe. Subscriptions renew
							automatically unless cancelled. You may cancel at any time through
							your account settings.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">5. Acceptable Use</h2>
						<p className="text-muted-foreground">You agree not to:</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>
								Use the Service for any illegal purpose or in violation of any
								laws
							</li>
							<li>Interfere with or disrupt the Service or servers</li>
							<li>
								Attempt to gain unauthorized access to any part of the Service
							</li>
							<li>Use the Service to make harassing or fraudulent calls</li>
							<li>Resell or redistribute the Service without authorization</li>
							<li>Use automated systems to abuse the Service</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">6. AI Service Limitations</h2>
						<p className="text-muted-foreground">
							Our AI dispatch service is designed to assist with call handling
							but:
						</p>
						<ul className="list-disc space-y-2 pl-6 text-muted-foreground">
							<li>
								May not perfectly understand all caller requests or accents
							</li>
							<li>Should not be relied upon for emergency situations</li>
							<li>May occasionally provide inaccurate transcriptions</li>
							<li>
								Is not a replacement for human judgment in complex situations
							</li>
						</ul>
						<p className="mt-4 text-muted-foreground">
							You remain responsible for verifying dispatch information and
							ensuring appropriate response to all calls.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">7. Intellectual Property</h2>
						<p className="text-muted-foreground">
							The Service, including its original content, features, and
							functionality, is owned by tow.center and is protected by
							intellectual property laws. You may not copy, modify, or
							distribute any part of the Service without our written consent.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">
							8. Limitation of Liability
						</h2>
						<p className="text-muted-foreground">
							TO THE MAXIMUM EXTENT PERMITTED BY LAW, TOW.CENTER SHALL NOT BE
							LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
							PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
							DATA, OR BUSINESS OPPORTUNITIES.
						</p>
						<p className="mt-4 text-muted-foreground">
							Our total liability for any claims arising from the Service shall
							not exceed the amount you paid us in the 12 months preceding the
							claim.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">9. Indemnification</h2>
						<p className="text-muted-foreground">
							You agree to indemnify and hold harmless tow.center and its
							affiliates from any claims, damages, or expenses arising from your
							use of the Service or violation of these Terms.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">10. Service Availability</h2>
						<p className="text-muted-foreground">
							We strive for 99.9% uptime but do not guarantee uninterrupted
							service. We may modify or discontinue the Service at any time with
							reasonable notice. Scheduled maintenance will be communicated in
							advance when possible.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">11. Termination</h2>
						<p className="text-muted-foreground">
							We may terminate or suspend your account immediately, without
							prior notice, if you breach these Terms. Upon termination, your
							right to use the Service will cease immediately. You may export
							your data before termination by contacting support.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">12. Changes to Terms</h2>
						<p className="text-muted-foreground">
							We reserve the right to modify these Terms at any time. We will
							provide notice of material changes via email or through the
							Service. Continued use of the Service after changes constitutes
							acceptance of the new Terms.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">13. Governing Law</h2>
						<p className="text-muted-foreground">
							These Terms shall be governed by and construed in accordance with
							the laws of the United States, without regard to conflict of law
							provisions.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">14. Contact</h2>
						<p className="text-muted-foreground">
							For questions about these Terms, please contact us at:
						</p>
						<p className="mt-2 text-muted-foreground">
							Email:{" "}
							<a
								href="mailto:hookups@tow.center"
								className="text-primary hover:underline"
							>
								hookups@tow.center
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
