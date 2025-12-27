"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { Check, Gift, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReferralCode } from "@/components/referral-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
	const storedReferral = useReferralCode();
	const [showCodeInput, setShowCodeInput] = useState(false);
	const [manualCode, setManualCode] = useState("");
	const [manualReferrer, setManualReferrer] = useState<string | null>(null);
	const [validatingCode, setValidatingCode] = useState(false);
	const [codeError, setCodeError] = useState<string | null>(null);

	const referrerName = manualReferrer || storedReferral?.referrerName;
	const hasReferral = !!referrerName;

	async function handleValidateCode() {
		if (!manualCode.trim()) return;

		setValidatingCode(true);
		setCodeError(null);

		try {
			const response = await fetch(
				`/api/referral/validate?code=${encodeURIComponent(manualCode.trim())}`,
			);
			const data = await response.json();

			if (data.valid) {
				setManualReferrer(data.referrerName);
				// Store in localStorage for attribution after signup
				localStorage.setItem(
					"tow_referral_code",
					JSON.stringify({
						code: data.code,
						referrerName: data.referrerName,
						storedAt: Date.now(),
					}),
				);
				setShowCodeInput(false);
			} else {
				setCodeError(data.error || "Invalid code");
			}
		} catch {
			setCodeError("Failed to validate code");
		} finally {
			setValidatingCode(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<Link href="/">
						<h1 className="text-3xl font-bold text-foreground">tow.center</h1>
					</Link>
				</div>

				{/* Referral Banner */}
				{hasReferral && (
					<div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<Gift className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1">
								<p className="font-medium text-foreground">
									Referred by {referrerName}
								</p>
								<p className="text-sm text-muted-foreground">
									<Check className="mr-1 inline h-3.5 w-3.5 text-primary" />
									20% off your first month!
								</p>
							</div>
							<Badge variant="secondary" className="bg-primary/10 text-primary">
								Applied
							</Badge>
						</div>
					</div>
				)}

				{/* Manual Code Entry */}
				{!hasReferral && !showCodeInput && (
					<button
						type="button"
						onClick={() => setShowCodeInput(true)}
						className="mb-4 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<Tag className="h-4 w-4" />
						Have a referral code?
					</button>
				)}

				{!hasReferral && showCodeInput && (
					<div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
						<p className="mb-3 text-sm font-medium text-foreground">
							Enter referral code
						</p>
						<div className="flex gap-2">
							<Input
								placeholder="e.g., 929T-A3F2"
								value={manualCode}
								onChange={(e) => {
									setManualCode(e.target.value.toUpperCase());
									setCodeError(null);
								}}
								className="flex-1 uppercase"
							/>
							<Button
								onClick={handleValidateCode}
								disabled={validatingCode || !manualCode.trim()}
								size="sm"
							>
								{validatingCode ? "..." : "Apply"}
							</Button>
						</div>
						{codeError && (
							<p className="mt-2 text-sm text-destructive">{codeError}</p>
						)}
						<button
							type="button"
							onClick={() => {
								setShowCodeInput(false);
								setManualCode("");
								setCodeError(null);
							}}
							className="mt-2 text-xs text-muted-foreground hover:text-foreground"
						>
							Cancel
						</button>
					</div>
				)}

				<AuthView view="SIGN_UP" />

				<p className="mt-6 text-center text-xs text-muted-foreground">
					Alpha program: Free for 3 months, then $49/mo locked for life
					{hasReferral && (
						<span className="block mt-1 text-primary">
							+ 20% off first month with referral discount
						</span>
					)}
				</p>
			</div>
		</div>
	);
}
