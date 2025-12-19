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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_call_company_id ON call(company_id);
CREATE INDEX IF NOT EXISTS idx_call_created_at ON call(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_company_id ON subscription(company_id);
`;
