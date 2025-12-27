"use client";

import { useEffect, useRef } from "react";
import { clearStoredReferral, getStoredReferralCode } from "./referral-tracker";

// This component runs once on first authenticated load to attribute the signup
export function ReferralAttribution() {
	const hasRun = useRef(false);

	useEffect(() => {
		async function attributeReferral() {
			// Only run once per session
			if (hasRun.current) return;
			hasRun.current = true;

			const code = getStoredReferralCode();
			if (!code) return;

			try {
				const response = await fetch("/api/referral/attribute", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code }),
				});

				const data = await response.json();

				if (data.success) {
					// Clear stored referral after successful attribution
					clearStoredReferral();
					console.log("[tow.center] Referral attributed:", data.referralId);
				} else {
					// Clear if already attributed or invalid
					if (
						data.error === "User already has a referral attribution" ||
						data.error === "Cannot use your own referral code"
					) {
						clearStoredReferral();
					}
					console.log("[tow.center] Referral attribution skipped:", data.error);
				}
			} catch (error) {
				console.error("[tow.center] Failed to attribute referral:", error);
			}
		}

		attributeReferral();
	}, []);

	return null;
}
