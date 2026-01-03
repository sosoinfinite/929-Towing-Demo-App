import { Resend } from "resend";

// Resend is initialized lazily to avoid build errors when API key is missing
let _resend: Resend | null = null;

export function getResend(): Resend {
	if (!_resend) {
		const apiKey = process.env.RESEND_API_KEY;
		if (!apiKey) {
			throw new Error("RESEND_API_KEY environment variable is required");
		}
		_resend = new Resend(apiKey);
	}
	return _resend;
}

// ============================================
// EMAIL SENDER ADDRESSES
// Centralized configuration for all outbound emails
// Note: All addresses must be verified in Resend dashboard
// ============================================

/** Default sender for system/auth emails (verification, password reset, etc.) */
export const FROM_EMAIL = "tow.center <noreply@tow.center>";

/** Sender for sales/lead communications and marketing */
export const FROM_EMAIL_SALES = "tow.center Sales <hookups@tow.center>";

/** Sender for job/dispatch notifications to customers */
export const FROM_EMAIL_DISPATCH = "tow.center Dispatch <dispatch@tow.center>";

/** Sender for support communications */
export const FROM_EMAIL_SUPPORT = "tow.center Support <support@tow.center>";

/** Reply-to address for sales emails */
export const REPLY_TO_SALES = "hookups@tow.center";

/** Reply-to address for dispatch emails */
export const REPLY_TO_DISPATCH = "dispatch@tow.center";

// Audience configuration from environment
export const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

// Segment IDs
export const SEGMENT_CUSTOMERS = process.env.RESEND_SEGMENT_CUSTOMERS;
export const SEGMENT_DRIVERS = process.env.RESEND_SEGMENT_DRIVERS;
export const SEGMENT_OWNERS = process.env.RESEND_SEGMENT_OWNERS;
export const SEGMENT_LEADS = process.env.RESEND_SEGMENT_LEADS;

// Topic IDs
export const TOPIC_JOB_UPDATES = process.env.RESEND_TOPIC_JOB_UPDATES;
export const TOPIC_MARKETING = process.env.RESEND_TOPIC_MARKETING;
export const TOPIC_WEEKLY_DIGEST = process.env.RESEND_TOPIC_WEEKLY_DIGEST;

// Contact roles for property tagging
export type ContactRole =
	| "customer"
	| "driver"
	| "owner"
	| "admin"
	| "dispatch"
	| "member";
export type ContactSource = "job" | "signup" | "lead" | "invite" | "driver_add";

interface CreateContactOptions {
	email: string;
	firstName?: string;
	lastName?: string;
	role: ContactRole;
	companyId?: string;
	source: ContactSource;
	subscribeToJobUpdates?: boolean;
	subscribeToMarketing?: boolean;
}

/**
 * Creates a contact in the Resend Audience with proper properties, segments, and topics.
 * Handles duplicates gracefully.
 */
export async function createContact({
	email,
	firstName,
	lastName,
	role,
	companyId,
	source,
	subscribeToJobUpdates = true,
	subscribeToMarketing = false,
}: CreateContactOptions): Promise<{
	data?: { id: string };
	exists: boolean;
	error: Error | null;
}> {
	if (!RESEND_AUDIENCE_ID) {
		console.warn(
			"[Resend] RESEND_AUDIENCE_ID not configured, skipping contact creation",
		);
		return { exists: false, error: null };
	}

	const resend = getResend();

	// Build segments based on role
	const segments: { id: string }[] = [];
	if (role === "customer" && SEGMENT_CUSTOMERS) {
		segments.push({ id: SEGMENT_CUSTOMERS });
	} else if (role === "driver" && SEGMENT_DRIVERS) {
		segments.push({ id: SEGMENT_DRIVERS });
	} else if (role === "owner" && SEGMENT_OWNERS) {
		segments.push({ id: SEGMENT_OWNERS });
	}
	if (source === "lead" && SEGMENT_LEADS) {
		segments.push({ id: SEGMENT_LEADS });
	}

	// Build topics based on preferences
	const topics: { id: string; subscription: "opt_in" | "opt_out" }[] = [];
	if (TOPIC_JOB_UPDATES) {
		topics.push({
			id: TOPIC_JOB_UPDATES,
			subscription: subscribeToJobUpdates ? "opt_in" : "opt_out",
		});
	}
	if (TOPIC_MARKETING) {
		topics.push({
			id: TOPIC_MARKETING,
			subscription: subscribeToMarketing ? "opt_in" : "opt_out",
		});
	}

	// Build properties for filtering
	const properties: Record<string, string> = {
		role,
		source,
	};
	if (companyId) {
		properties.company = companyId;
	}

	try {
		const { data, error } = await resend.contacts.create({
			audienceId: RESEND_AUDIENCE_ID,
			email,
			firstName: firstName || undefined,
			lastName: lastName || undefined,
			unsubscribed: false,
			properties,
			...(segments.length > 0 && { segments }),
			...(topics.length > 0 && { topics }),
		});

		if (error) {
			// Handle duplicate contact gracefully
			if (error.message?.includes("already exists")) {
				return { exists: true, error: null };
			}
			console.error("[Resend] Failed to create contact:", error);
			return { exists: false, error: error as Error };
		}

		return { data, exists: false, error: null };
	} catch (err) {
		console.error("[Resend] Error creating contact:", err);
		return { exists: false, error: err as Error };
	}
}

/**
 * Updates a contact's topic subscriptions (for notification preferences sync)
 */
export async function updateContactTopics(
	email: string,
	topics: { jobUpdates?: boolean; marketing?: boolean; weeklyDigest?: boolean },
): Promise<{ success: boolean; error: Error | null }> {
	if (!RESEND_AUDIENCE_ID) {
		console.warn(
			"[Resend] RESEND_AUDIENCE_ID not configured, skipping topic update",
		);
		return { success: false, error: null };
	}

	const resend = getResend();

	const topicUpdates: { id: string; subscription: "opt_in" | "opt_out" }[] = [];

	if (topics.jobUpdates !== undefined && TOPIC_JOB_UPDATES) {
		topicUpdates.push({
			id: TOPIC_JOB_UPDATES,
			subscription: topics.jobUpdates ? "opt_in" : "opt_out",
		});
	}
	if (topics.marketing !== undefined && TOPIC_MARKETING) {
		topicUpdates.push({
			id: TOPIC_MARKETING,
			subscription: topics.marketing ? "opt_in" : "opt_out",
		});
	}
	if (topics.weeklyDigest !== undefined && TOPIC_WEEKLY_DIGEST) {
		topicUpdates.push({
			id: TOPIC_WEEKLY_DIGEST,
			subscription: topics.weeklyDigest ? "opt_in" : "opt_out",
		});
	}

	if (topicUpdates.length === 0) {
		return { success: true, error: null };
	}

	try {
		const { error } = await resend.contacts.update({
			audienceId: RESEND_AUDIENCE_ID,
			email,
			topics: topicUpdates,
		});

		if (error) {
			console.error("[Resend] Failed to update contact topics:", error);
			return { success: false, error: error as Error };
		}

		return { success: true, error: null };
	} catch (err) {
		console.error("[Resend] Error updating contact topics:", err);
		return { success: false, error: err as Error };
	}
}

/**
 * Checks if a contact exists in the audience
 */
export async function contactExists(email: string): Promise<boolean> {
	if (!RESEND_AUDIENCE_ID) {
		return false;
	}

	try {
		const resend = getResend();
		const { data } = await resend.contacts.get({
			audienceId: RESEND_AUDIENCE_ID,
			email,
		});
		return !!data;
	} catch {
		return false;
	}
}

/**
 * Updates contact properties (role, company_id, etc.)
 */
export async function updateContactProperties(
	email: string,
	properties: Record<string, string>,
): Promise<{ success: boolean; error: Error | null }> {
	if (!RESEND_AUDIENCE_ID) {
		console.warn(
			"[Resend] RESEND_AUDIENCE_ID not configured, skipping property update",
		);
		return { success: false, error: null };
	}

	const resend = getResend();

	try {
		const { error } = await resend.contacts.update({
			audienceId: RESEND_AUDIENCE_ID,
			email,
			properties,
		});

		if (error) {
			console.error("[Resend] Failed to update contact properties:", error);
			return { success: false, error: error as Error };
		}

		return { success: true, error: null };
	} catch (err) {
		console.error("[Resend] Error updating contact properties:", err);
		return { success: false, error: err as Error };
	}
}

/**
 * Adds a contact to a segment
 */
export async function addContactToSegment(
	email: string,
	segmentId: string,
): Promise<{ success: boolean; error: Error | null }> {
	if (!RESEND_AUDIENCE_ID) {
		return { success: false, error: null };
	}

	const resend = getResend();

	try {
		const { error } = await resend.contacts.update({
			audienceId: RESEND_AUDIENCE_ID,
			email,
			segments: [{ id: segmentId }],
		});

		if (error) {
			console.error("[Resend] Failed to add contact to segment:", error);
			return { success: false, error: error as Error };
		}

		return { success: true, error: null };
	} catch (err) {
		console.error("[Resend] Error adding contact to segment:", err);
		return { success: false, error: err as Error };
	}
}
