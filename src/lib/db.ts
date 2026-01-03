import { Pool } from "@neondatabase/serverless";

// Lazy pool initialization to avoid errors during build
let _pool: Pool | null = null;

export function getPool(): Pool {
	if (!_pool) {
		if (!process.env.DATABASE_URL) {
			throw new Error("DATABASE_URL environment variable is required");
		}
		_pool = new Pool({
			connectionString: process.env.DATABASE_URL,
		});
	}
	return _pool;
}

// For backwards compatibility
export const pool = {
	query: (...args: Parameters<Pool["query"]>) => getPool().query(...args),
	connect: () => getPool().connect(),
};

// App-specific schema (run via Better Auth CLI + manual migration)
// Better Auth creates: user, session, account, verification
// App tables: company, call, subscription, agent_config

export const APP_SCHEMA = `
-- Company table (towing businesses)
CREATE TABLE IF NOT EXISTS company (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  logo TEXT,
  twilio_phone TEXT,
  dispatch_active BOOLEAN DEFAULT false,
  service_area TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add logo column if not exists (for existing databases)
ALTER TABLE company ADD COLUMN IF NOT EXISTS logo TEXT;

-- Link users to companies (extends Better Auth user)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES company(id);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Call log table
CREATE TABLE IF NOT EXISTS call (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES company(id),
  twilio_call_sid TEXT UNIQUE,
  caller_number TEXT,
  status TEXT,
  duration INTEGER,
  transcript TEXT,
  ai_handled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription table (Stripe integration)
CREATE TABLE IF NOT EXISTS subscription (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES company(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'alpha',
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ElevenLabs agent configuration
CREATE TABLE IF NOT EXISTS agent_config (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES company(id),
  elevenlabs_agent_id TEXT,
  greeting_message TEXT,
  voice_id TEXT,
  dispatcher_name TEXT DEFAULT 'Brian',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add dispatcher_name column if not exists (for existing databases)
ALTER TABLE agent_config ADD COLUMN IF NOT EXISTS dispatcher_name TEXT DEFAULT 'Brian';

-- Notification preferences (per-user settings)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  email_new_calls BOOLEAN DEFAULT true,
  email_missed_calls BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT false,
  sms_new_calls BOOLEAN DEFAULT false,
  sms_missed_calls BOOLEAN DEFAULT true,
  job_updates_channel TEXT DEFAULT 'sms',  -- email, sms, both, none
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add job_updates_channel column if not exists (for existing databases)
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS job_updates_channel TEXT DEFAULT 'sms';

-- Jobs queue (dispatch requests from email, SMS, phone, manual entry)
CREATE TABLE IF NOT EXISTS job (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES company(id),
  source TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',

  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,

  service_type TEXT,
  vehicle_info TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,

  motor_club TEXT,
  po_number TEXT,

  assigned_driver_id TEXT REFERENCES "user"(id),
  assigned_at TIMESTAMP,

  notes TEXT,
  raw_content TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Message threading (SMS + email communications)
CREATE TABLE IF NOT EXISTS message (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES company(id),
  job_id TEXT REFERENCES job(id),
  thread_id TEXT,

  direction TEXT NOT NULL,
  channel TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,

  subject TEXT,
  content TEXT NOT NULL,

  actor_type TEXT,
  actor_user_id TEXT REFERENCES "user"(id),

  external_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Raw inbound emails
CREATE TABLE IF NOT EXISTS inbound_email (
  id TEXT PRIMARY KEY,
  resend_id TEXT UNIQUE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT,
  text_body TEXT,
  html_body TEXT,
  processed BOOLEAN DEFAULT false,
  job_id TEXT REFERENCES job(id),
  received_at TIMESTAMP DEFAULT NOW()
);

-- Driver profiles (extends user for driver-specific info)
CREATE TABLE IF NOT EXISTS driver_profile (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES company(id),
  phone TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_call_company_id ON call(company_id);
CREATE INDEX IF NOT EXISTS idx_call_created_at ON call(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_company_id ON subscription(company_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Job indexes
CREATE INDEX IF NOT EXISTS idx_job_company_id ON job(company_id);
CREATE INDEX IF NOT EXISTS idx_job_status ON job(status);
CREATE INDEX IF NOT EXISTS idx_job_created_at ON job(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_customer_phone ON job(customer_phone);
CREATE INDEX IF NOT EXISTS idx_job_assigned_driver ON job(assigned_driver_id);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_message_company_id ON message(company_id);
CREATE INDEX IF NOT EXISTS idx_message_job_id ON message(job_id);
CREATE INDEX IF NOT EXISTS idx_message_thread_id ON message(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_from_address ON message(from_address);
CREATE INDEX IF NOT EXISTS idx_message_created_at ON message(created_at DESC);

-- Inbound email indexes
CREATE INDEX IF NOT EXISTS idx_inbound_email_to_address ON inbound_email(to_address);
CREATE INDEX IF NOT EXISTS idx_inbound_email_processed ON inbound_email(processed);

-- Driver profile indexes
CREATE INDEX IF NOT EXISTS idx_driver_profile_company ON driver_profile(company_id);
CREATE INDEX IF NOT EXISTS idx_driver_profile_phone ON driver_profile(phone);

-- Sales leads (inbound emails to hookups@tow.center)
CREATE TABLE IF NOT EXISTS lead (
  id TEXT PRIMARY KEY,
  email_id TEXT REFERENCES inbound_email(id),
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body_preview TEXT,
  status TEXT NOT NULL DEFAULT 'new',  -- new, contacted, qualified, converted, rejected
  notes TEXT,
  assigned_to TEXT REFERENCES "user"(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lead indexes
CREATE INDEX IF NOT EXISTS idx_lead_status ON lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_created_at ON lead(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_from_email ON lead(from_email);

-- Lead messages (conversation thread for sales emails)
CREATE TABLE IF NOT EXISTS lead_message (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES lead(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,  -- 'inbound' or 'outbound'
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  resend_id TEXT,  -- Resend message ID for sent emails
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead message indexes
CREATE INDEX IF NOT EXISTS idx_lead_message_lead_id ON lead_message(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_message_created_at ON lead_message(created_at);

-- Email templates for quick replies
CREATE TABLE IF NOT EXISTS email_template (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',  -- 'intro', 'followup', 'pricing', 'demo', 'general'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- REFERRAL SYSTEM TABLES
-- ============================================

-- Referral codes (unique codes for tracking referrals)
-- Format: {PREFIX}-{4RANDOM} e.g., 929T-A3F2, JOES-X7K9
CREATE TABLE IF NOT EXISTS referral_code (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES company(id),  -- NULL for affiliates without companies
  referrer_type TEXT NOT NULL DEFAULT 'customer',  -- customer, affiliate, partner
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_earned_cents INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Referral attribution (tracks referred user journey)
-- Status flow: clicked → signed_up → company_created → subscribed → credited
CREATE TABLE IF NOT EXISTS referral (
  id TEXT PRIMARY KEY,
  referral_code_id TEXT NOT NULL REFERENCES referral_code(id),
  referred_user_id TEXT REFERENCES "user"(id),
  referred_company_id TEXT REFERENCES company(id),
  status TEXT NOT NULL DEFAULT 'clicked',  -- clicked, signed_up, company_created, subscribed, credited
  first_click_at TIMESTAMP DEFAULT NOW(),
  signup_at TIMESTAMP,
  company_created_at TIMESTAMP,
  subscription_started_at TIMESTAMP,
  reward_credited_at TIMESTAMP,
  discount_applied BOOLEAN DEFAULT false,
  stripe_coupon_id TEXT,
  reward_earned_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Referral credit ledger (all credit movements)
-- Types: earned (from referral), redeemed (applied to invoice), payout (cash withdrawal), expired, adjustment
CREATE TABLE IF NOT EXISTS referral_credit (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES company(id),
  type TEXT NOT NULL,  -- earned, redeemed, payout, expired, adjustment
  amount_cents INTEGER NOT NULL,  -- positive for earned, negative for spent
  referral_id TEXT REFERENCES referral(id),
  payout_id TEXT,  -- references referral_payout(id) when type='payout'
  balance_after_cents INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referral payout requests (cash withdrawals)
-- Status flow: pending → processing → completed/failed
CREATE TABLE IF NOT EXISTS referral_payout (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
  method TEXT NOT NULL DEFAULT 'stripe_connect',  -- stripe_connect, paypal, bank_transfer, manual
  method_details JSONB,  -- Store method-specific info (Stripe account ID, PayPal email, etc.)
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by TEXT REFERENCES "user"(id),
  completed_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Referral system configuration (single row with defaults)
CREATE TABLE IF NOT EXISTS referral_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  referrer_reward_cents INTEGER DEFAULT 5000,  -- $50 per conversion
  referred_discount_percent INTEGER DEFAULT 20,  -- 20% off first month
  reward_trigger TEXT DEFAULT 'subscription_created',  -- subscription_created, first_payment
  min_payout_cents INTEGER DEFAULT 5000,  -- $50 minimum payout
  payout_hold_days INTEGER DEFAULT 30,  -- 30-day hold before payout eligible
  auto_approve_below_cents INTEGER DEFAULT 50000,  -- Auto-approve payouts under $500
  stripe_coupon_id TEXT DEFAULT 'REFERRAL20',  -- Reusable Stripe coupon
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default config if not exists
INSERT INTO referral_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Referral system indexes
CREATE INDEX IF NOT EXISTS idx_referral_code_code ON referral_code(code);
CREATE INDEX IF NOT EXISTS idx_referral_code_user ON referral_code(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_code_active ON referral_code(active);
CREATE INDEX IF NOT EXISTS idx_referral_status ON referral(status);
CREATE INDEX IF NOT EXISTS idx_referral_code_id ON referral(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_referred_user ON referral(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_referred_company ON referral(referred_company_id);

-- Unique constraint: each user can only be referred once
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_unique_user ON referral(referred_user_id)
WHERE referred_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_credit_user ON referral_credit(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_credit_type ON referral_credit(type);
CREATE INDEX IF NOT EXISTS idx_referral_credit_created ON referral_credit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_payout_user ON referral_payout(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_payout_status ON referral_payout(status);
`;
