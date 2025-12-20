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
  twilio_phone TEXT,
  dispatch_active BOOLEAN DEFAULT false,
  service_area TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification preferences (per-user settings)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  email_new_calls BOOLEAN DEFAULT true,
  email_missed_calls BOOLEAN DEFAULT true,
  email_weekly_summary BOOLEAN DEFAULT false,
  sms_new_calls BOOLEAN DEFAULT false,
  sms_missed_calls BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

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
`;
