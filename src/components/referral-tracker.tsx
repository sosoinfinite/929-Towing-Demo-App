"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const REFERRAL_STORAGE_KEY = "tow_referral_code";
const REFERRAL_EXPIRY_DAYS = 30;

interface StoredReferral {
	code: string;
	referrerName: string;
	storedAt: number;
}

export function useReferralCode() {
	const [referral, setReferral] = useState<StoredReferral | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as StoredReferral;
				// Check if expired
				const expiresAt =
					parsed.storedAt + REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
				if (Date.now() < expiresAt) {
					setReferral(parsed);
				} else {
					localStorage.removeItem(REFERRAL_STORAGE_KEY);
				}
			} catch {
				localStorage.removeItem(REFERRAL_STORAGE_KEY);
			}
		}
	}, []);

	return referral;
}

export function ReferralTracker() {
	const searchParams = useSearchParams();
	const refCode = searchParams.get("ref");

	useEffect(() => {
		async function trackReferral(code: string) {
			// Check if we already have this code stored
			const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as StoredReferral;
					if (parsed.code === code) {
						// Already tracking this code
						return;
					}
				} catch {
					// Invalid stored data, continue
				}
			}

			// Validate the code
			const validateResponse = await fetch(
				`/api/referral/validate?code=${encodeURIComponent(code)}`,
			);

			if (!validateResponse.ok) {
				return;
			}

			const data = await validateResponse.json();

			if (!data.valid) {
				return;
			}

			// Store the referral info
			const referralData: StoredReferral = {
				code: data.code,
				referrerName: data.referrerName,
				storedAt: Date.now(),
			};

			localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralData));

			// Track the click (fire and forget)
			fetch("/api/referral/track-click", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code }),
			}).catch(() => {
				// Ignore errors - click tracking is best-effort
			});
		}

		if (refCode) {
			trackReferral(refCode);
		}
	}, [refCode]);

	// This component doesn't render anything
	return null;
}

// Helper to get stored referral code (for use in non-hook contexts)
export function getStoredReferralCode(): string | null {
	if (typeof window === "undefined") return null;

	const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
	if (!stored) return null;

	try {
		const parsed = JSON.parse(stored) as StoredReferral;
		const expiresAt =
			parsed.storedAt + REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
		if (Date.now() < expiresAt) {
			return parsed.code;
		}
		localStorage.removeItem(REFERRAL_STORAGE_KEY);
		return null;
	} catch {
		localStorage.removeItem(REFERRAL_STORAGE_KEY);
		return null;
	}
}

// Clear stored referral (after successful attribution)
export function clearStoredReferral() {
	if (typeof window !== "undefined") {
		localStorage.removeItem(REFERRAL_STORAGE_KEY);
	}
}
