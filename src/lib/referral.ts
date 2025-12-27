import { getPool } from "./db";

// Types for referral system
export type ReferrerType = "customer" | "affiliate" | "partner";
export type ReferralStatus =
	| "clicked"
	| "signed_up"
	| "company_created"
	| "subscribed"
	| "credited";
export type CreditType =
	| "earned"
	| "redeemed"
	| "payout"
	| "expired"
	| "adjustment";
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";
export type PayoutMethod =
	| "stripe_connect"
	| "paypal"
	| "bank_transfer"
	| "manual";

export interface ReferralCode {
	id: string;
	code: string;
	user_id: string;
	company_id: string | null;
	referrer_type: ReferrerType;
	clicks: number;
	signups: number;
	conversions: number;
	total_earned_cents: number;
	active: boolean;
	expires_at: Date | null;
	created_at: Date;
}

export interface Referral {
	id: string;
	referral_code_id: string;
	referred_user_id: string | null;
	referred_company_id: string | null;
	status: ReferralStatus;
	first_click_at: Date;
	signup_at: Date | null;
	company_created_at: Date | null;
	subscription_started_at: Date | null;
	reward_credited_at: Date | null;
	discount_applied: boolean;
	reward_earned_cents: number;
}

export interface ReferralConfig {
	referrer_reward_cents: number;
	referred_discount_percent: number;
	reward_trigger: string;
	min_payout_cents: number;
	payout_hold_days: number;
	auto_approve_below_cents: number;
	stripe_coupon_id: string;
}

// Generate a unique referral code
// Format: {PREFIX}-{4RANDOM} e.g., 929T-A3F2
export async function generateCode(
	userId: string,
	options: {
		prefix?: string;
		companyId?: string;
		referrerType?: ReferrerType;
	} = {},
): Promise<{ success: true; code: string } | { success: false; error: string }> {
	const pool = getPool();

	// Generate 4-character random alphanumeric (uppercase)
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars: 0, O, I, 1
	let randomPart = "";
	for (let i = 0; i < 4; i++) {
		randomPart += chars[Math.floor(Math.random() * chars.length)];
	}

	// Use provided prefix or generate from company name / user info
	let prefix = options.prefix?.toUpperCase().slice(0, 4) || "TOWR";

	// Try to get company name for prefix if not provided
	if (!options.prefix && options.companyId) {
		const companyResult = await pool.query(
			"SELECT name FROM company WHERE id = $1",
			[options.companyId],
		);
		if (companyResult.rows[0]?.name) {
			// Take first 4 letters of company name
			prefix = companyResult.rows[0].name
				.replace(/[^A-Za-z]/g, "")
				.toUpperCase()
				.slice(0, 4);
		}
	}

	// Pad prefix if too short
	while (prefix.length < 4) {
		prefix += "X";
	}

	const code = `${prefix}-${randomPart}`;

	// Create the referral code record - handle collision via unique constraint
	const id = crypto.randomUUID();
	try {
		await pool.query(
			`INSERT INTO referral_code (id, code, user_id, company_id, referrer_type)
			 VALUES ($1, $2, $3, $4, $5)`,
			[
				id,
				code,
				userId,
				options.companyId || null,
				options.referrerType || "customer",
			],
		);
		return { success: true, code };
	} catch (error: unknown) {
		// Handle unique constraint violation (PostgreSQL error code 23505)
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "23505"
		) {
			// Retry with new random part (max 10 attempts via call stack)
			return generateCode(userId, options);
		}
		throw error;
	}
}

// Validate a referral code and return referrer info
export async function validateCode(code: string): Promise<
	| {
			valid: true;
			referralCode: ReferralCode;
			referrerName: string;
	  }
	| { valid: false; error: string }
> {
	const pool = getPool();

	const result = await pool.query(
		`SELECT rc.*, u.name as referrer_name, c.name as company_name
		 FROM referral_code rc
		 JOIN "user" u ON u.id = rc.user_id
		 LEFT JOIN company c ON c.id = rc.company_id
		 WHERE rc.code = $1`,
		[code.toUpperCase()],
	);

	if (result.rows.length === 0) {
		return { valid: false, error: "Invalid referral code" };
	}

	const row = result.rows[0];

	// Check if code is active
	if (!row.active) {
		return { valid: false, error: "This referral code is no longer active" };
	}

	// Check if code is expired
	if (row.expires_at && new Date(row.expires_at) < new Date()) {
		return { valid: false, error: "This referral code has expired" };
	}

	return {
		valid: true,
		referralCode: {
			id: row.id,
			code: row.code,
			user_id: row.user_id,
			company_id: row.company_id,
			referrer_type: row.referrer_type,
			clicks: row.clicks,
			signups: row.signups,
			conversions: row.conversions,
			total_earned_cents: row.total_earned_cents,
			active: row.active,
			expires_at: row.expires_at,
			created_at: row.created_at,
		},
		referrerName: row.company_name || row.referrer_name || "A friend",
	};
}

// Track a click event (creates referral record)
export async function trackClick(
	code: string,
): Promise<
	{ success: true; referralId: string } | { success: false; error: string }
> {
	const validation = await validateCode(code);
	if (!validation.valid) {
		return { success: false, error: validation.error };
	}

	const pool = getPool();
	const referralId = crypto.randomUUID();

	// Create referral record with clicked status
	await pool.query(
		`INSERT INTO referral (id, referral_code_id, status, first_click_at)
		 VALUES ($1, $2, 'clicked', NOW())`,
		[referralId, validation.referralCode.id],
	);

	// Increment click count
	await pool.query(
		"UPDATE referral_code SET clicks = clicks + 1 WHERE id = $1",
		[validation.referralCode.id],
	);

	return { success: true, referralId };
}

// Attribute a signup to a referral code
export async function attributeSignup(
	userId: string,
	code: string,
): Promise<
	{ success: true; referralId: string } | { success: false; error: string }
> {
	const validation = await validateCode(code);
	if (!validation.valid) {
		return { success: false, error: validation.error };
	}

	// Prevent self-referral
	if (validation.referralCode.user_id === userId) {
		return { success: false, error: "Cannot use your own referral code" };
	}

	const pool = getPool();

	// Check if user already has a referral attribution
	const existingReferral = await pool.query(
		"SELECT id FROM referral WHERE referred_user_id = $1",
		[userId],
	);

	if (existingReferral.rows.length > 0) {
		return { success: false, error: "User already has a referral attribution" };
	}

	// Find clicked referral or create new one
	const clickedReferral = await pool.query(
		`SELECT id FROM referral
		 WHERE referral_code_id = $1
		 AND referred_user_id IS NULL
		 AND status = 'clicked'
		 ORDER BY first_click_at DESC
		 LIMIT 1`,
		[validation.referralCode.id],
	);

	let referralId: string;

	if (clickedReferral.rows.length > 0) {
		// Update existing clicked referral
		referralId = clickedReferral.rows[0].id;
		await pool.query(
			`UPDATE referral
			 SET referred_user_id = $1, status = 'signed_up', signup_at = NOW(), updated_at = NOW()
			 WHERE id = $2`,
			[userId, referralId],
		);
	} else {
		// Create new referral record (direct code entry, no prior click)
		referralId = crypto.randomUUID();
		await pool.query(
			`INSERT INTO referral (id, referral_code_id, referred_user_id, status, signup_at)
			 VALUES ($1, $2, $3, 'signed_up', NOW())`,
			[referralId, validation.referralCode.id, userId],
		);
	}

	// Increment signup count
	await pool.query(
		"UPDATE referral_code SET signups = signups + 1 WHERE id = $1",
		[validation.referralCode.id],
	);

	return { success: true, referralId };
}

// Get user's credit balance
export async function getCreditBalance(
	userId: string,
): Promise<{
	available: number;
	pending: number;
	total_earned: number;
	total_paid_out: number;
}> {
	const pool = getPool();

	// Get available balance (earned - redeemed - payouts)
	const balanceResult = await pool.query(
		`SELECT COALESCE(SUM(amount_cents), 0) as balance
		 FROM referral_credit
		 WHERE user_id = $1`,
		[userId],
	);

	// Get pending (credits within hold period)
	const configResult = await pool.query(
		"SELECT payout_hold_days FROM referral_config WHERE id = 'default'",
	);
	const holdDays = configResult.rows[0]?.payout_hold_days || 30;

	const pendingResult = await pool.query(
		`SELECT COALESCE(SUM(amount_cents), 0) as pending
		 FROM referral_credit
		 WHERE user_id = $1
		 AND type = 'earned'
		 AND created_at > NOW() - INTERVAL '1 day' * $2`,
		[userId, holdDays],
	);

	// Get totals
	const totalsResult = await pool.query(
		`SELECT
			 COALESCE(SUM(CASE WHEN type = 'earned' THEN amount_cents ELSE 0 END), 0) as total_earned,
			 COALESCE(SUM(CASE WHEN type = 'payout' THEN ABS(amount_cents) ELSE 0 END), 0) as total_paid_out
		 FROM referral_credit
		 WHERE user_id = $1`,
		[userId],
	);

	const available = Number(balanceResult.rows[0].balance);
	const pending = Number(pendingResult.rows[0].pending);
	const totalEarned = Number(totalsResult.rows[0].total_earned);
	const totalPaidOut = Number(totalsResult.rows[0].total_paid_out);

	return {
		available,
		pending,
		total_earned: totalEarned,
		total_paid_out: totalPaidOut,
	};
}

// Get referral config
export async function getConfig(): Promise<ReferralConfig> {
	const pool = getPool();

	const result = await pool.query(
		"SELECT * FROM referral_config WHERE id = 'default'",
	);

	if (result.rows.length === 0) {
		// Return defaults if not configured
		return {
			referrer_reward_cents: 5000,
			referred_discount_percent: 20,
			reward_trigger: "subscription_created",
			min_payout_cents: 5000,
			payout_hold_days: 30,
			auto_approve_below_cents: 50000,
			stripe_coupon_id: "REFERRAL20",
		};
	}

	return result.rows[0];
}

// Get user's referral code (or create if doesn't exist)
export async function getUserCode(
	userId: string,
	companyId?: string,
): Promise<ReferralCode | null> {
	const pool = getPool();

	const result = await pool.query(
		"SELECT * FROM referral_code WHERE user_id = $1 LIMIT 1",
		[userId],
	);

	if (result.rows.length > 0) {
		return result.rows[0];
	}

	// Auto-generate code for user
	const generated = await generateCode(userId, {
		companyId,
		referrerType: companyId ? "customer" : "affiliate",
	});

	if (!generated.success) {
		return null;
	}

	// Fetch the newly created code
	const newResult = await pool.query(
		"SELECT * FROM referral_code WHERE user_id = $1 LIMIT 1",
		[userId],
	);

	return newResult.rows[0] || null;
}

// Get user's referral stats
export async function getUserStats(userId: string): Promise<{
	code: string | null;
	clicks: number;
	signups: number;
	conversions: number;
	total_earned_cents: number;
	balance: {
		available: number;
		pending: number;
	};
}> {
	const pool = getPool();

	const codeResult = await pool.query(
		"SELECT * FROM referral_code WHERE user_id = $1 LIMIT 1",
		[userId],
	);

	if (codeResult.rows.length === 0) {
		return {
			code: null,
			clicks: 0,
			signups: 0,
			conversions: 0,
			total_earned_cents: 0,
			balance: { available: 0, pending: 0 },
		};
	}

	const code = codeResult.rows[0];
	const balance = await getCreditBalance(userId);

	return {
		code: code.code,
		clicks: code.clicks,
		signups: code.signups,
		conversions: code.conversions,
		total_earned_cents: code.total_earned_cents,
		balance: {
			available: balance.available,
			pending: balance.pending,
		},
	};
}

// Get referral for a company (if they were referred)
export async function getReferralForCompany(companyId: string): Promise<{
	referral: Referral | null;
	referralCode: ReferralCode | null;
	referrerUserId: string | null;
}> {
	const pool = getPool();

	const result = await pool.query(
		`SELECT r.*, rc.user_id as referrer_user_id, rc.company_id as referrer_company_id
		 FROM referral r
		 JOIN referral_code rc ON r.referral_code_id = rc.id
		 WHERE r.referred_company_id = $1
		 ORDER BY r.created_at DESC
		 LIMIT 1`,
		[companyId],
	);

	if (result.rows.length === 0) {
		return { referral: null, referralCode: null, referrerUserId: null };
	}

	const row = result.rows[0];

	const codeResult = await pool.query(
		"SELECT * FROM referral_code WHERE id = $1",
		[row.referral_code_id],
	);

	return {
		referral: {
			id: row.id,
			referral_code_id: row.referral_code_id,
			referred_user_id: row.referred_user_id,
			referred_company_id: row.referred_company_id,
			status: row.status,
			first_click_at: row.first_click_at,
			signup_at: row.signup_at,
			company_created_at: row.company_created_at,
			subscription_started_at: row.subscription_started_at,
			reward_credited_at: row.reward_credited_at,
			discount_applied: row.discount_applied,
			reward_earned_cents: row.reward_earned_cents,
		},
		referralCode: codeResult.rows[0] || null,
		referrerUserId: row.referrer_user_id,
	};
}

// Credit the referrer when a subscription is created
export async function creditReferrer(
	referralId: string,
): Promise<{ success: true; creditId: string } | { success: false; error: string }> {
	const pool = getPool();
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// Get referral details with row lock
		const referralResult = await client.query(
			`SELECT r.*, rc.user_id as referrer_user_id, rc.company_id as referrer_company_id, rc.id as code_id
			 FROM referral r
			 JOIN referral_code rc ON r.referral_code_id = rc.id
			 WHERE r.id = $1
			 FOR UPDATE`,
			[referralId],
		);

		if (referralResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return { success: false, error: "Referral not found" };
		}

		const referral = referralResult.rows[0];

		// Check if already credited
		if (referral.reward_credited_at) {
			await client.query("ROLLBACK");
			return { success: false, error: "Referral already credited" };
		}

		// Get reward amount from config
		const config = await getConfig();
		const rewardCents = config.referrer_reward_cents;

		// Get current balance within transaction
		const balanceResult = await client.query(
			`SELECT COALESCE(SUM(amount_cents), 0) as balance
			 FROM referral_credit
			 WHERE user_id = $1`,
			[referral.referrer_user_id],
		);
		const newBalance = Number(balanceResult.rows[0].balance) + rewardCents;

		// Create credit record
		const creditId = crypto.randomUUID();
		await client.query(
			`INSERT INTO referral_credit (id, user_id, company_id, type, amount_cents, referral_id, balance_after_cents, description)
			 VALUES ($1, $2, $3, 'earned', $4, $5, $6, $7)`,
			[
				creditId,
				referral.referrer_user_id,
				referral.referrer_company_id,
				rewardCents,
				referralId,
				newBalance,
				"Referral reward - new customer subscribed",
			],
		);

		// Update referral status
		await client.query(
			`UPDATE referral
			 SET status = 'credited', reward_credited_at = NOW(), reward_earned_cents = $1, updated_at = NOW()
			 WHERE id = $2`,
			[rewardCents, referralId],
		);

		// Update code stats
		await client.query(
			`UPDATE referral_code
			 SET conversions = conversions + 1, total_earned_cents = total_earned_cents + $1
			 WHERE id = $2`,
			[rewardCents, referral.code_id],
		);

		await client.query("COMMIT");
		return { success: true, creditId };
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Failed to credit referrer:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to credit referrer",
		};
	} finally {
		client.release();
	}
}

// Format cents as dollars for display
export function formatCents(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

// Generate referral URL
export function getReferralUrl(code: string, baseUrl?: string): string {
	const base = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://tow.center";
	return `${base}/?ref=${code}`;
}
