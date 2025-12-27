# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: tow.center - AI-Powered Towing Dispatch SaaS

**Domain**: tow.center
**Goal**: MVP to land pitches to tow companies, foundation for SaaS business
**Real Customer**: 929 Towing (paying pilot)

## Commands

```bash
bun dev              # Development server (Next.js 16 with Turbopack)
bun run build        # Production build
bun run lint         # Biome check
bun run lint:fix     # Biome auto-fix
bun run email        # Preview email templates at localhost:3001
bun run db:migrate   # Run Better Auth + app schema migrations
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **UI**: shadcn/ui + Tailwind CSS v4 + Framer Motion
- **Auth**: Better Auth (email/password, magic link, phone OTP, passkeys, TOTP 2FA)
- **Database**: Neon PostgreSQL (serverless, lazy pool initialization)
- **AI**: Vercel AI SDK with Google Gemini 3 Flash (ToolLoopAgent pattern)
- **Voice**: ElevenLabs Conversational AI
- **SMS/Voice**: Twilio
- **Email**: Resend + react-email
- **Payments**: Stripe
- **Rate Limiting**: Upstash Redis (Vercel KV)
- **Hosting**: Vercel

## Architecture Patterns

### Database Connection (lib/db.ts)
- **Lazy pool initialization** to avoid build-time errors
- Use `getPool()` function, never direct Pool instantiation
- Schema includes Better Auth tables + app tables (company, job, call, subscription, etc.)

### AI Dispatch Agents (lib/dispatch-agent.ts)
The app uses **ToolLoopAgent** pattern from Vercel AI SDK with context-aware tools:

1. **Email Dispatch Agent** (`createEmailDispatchAgent`)
   - Parses motor club emails (AAA, Agero, Urgently, Swoop, Honk)
   - Extracts customer info, service type, vehicle details, locations
   - Auto-creates jobs via `createJob` tool

2. **SMS Handler Agent** (`createSmsHandlerAgent`)
   - Determines if sender is driver or customer via `lookupDriver`
   - For drivers: parses status updates ("otw" → en_route, "arrived" → arrived)
   - For customers: looks up existing jobs or creates new ones
   - Responds via `sendNotification` tool (SMS replies)

**Tool Pattern**: All agents use tools created by `createDispatchTools(companyId, source)` which provides:
- `createJob` - Create new job with full metadata
- `updateJobStatus` - Change job status (pending → assigned → en_route → arrived → completed)
- `sendNotification` - Send SMS via Twilio
- `lookupJob` - Find active jobs by customer phone
- `lookupDriver` - Check if phone belongs to a driver
- `getJobById` - Retrieve specific job
- `findDriverActiveJob` - Find driver's current assignment

### Authentication (lib/auth.ts)
Better Auth configured with plugins:
- **nextCookies** - Session management for Next.js
- **admin** - Admin-only routes (env: ADMIN_USER_ID)
- **magicLink** - Passwordless email sign-in
- **phoneNumber** - SMS OTP via Twilio
- **twoFactor** - TOTP with authenticator apps
- **passkey** - WebAuthn (Face ID, Touch ID, Windows Hello)
- **organization** - Team invites and role management

Custom **user fields**: `companyId`, `role` (owner, admin, dispatch, driver, member, customer)

**Permission system** (lib/permissions.ts): Uses access control with roles for fine-grained authorization

### API Webhook Flow

**Incoming Call** → `/api/twilio/voice`
1. Check `dispatch_active` flag on company
2. If false → voicemail
3. If true → Query agent_config and previous jobs for dynamic variables
4. Calculate time-based greeting (Good morning/afternoon based on hour)
5. TwiML `<Connect><Stream>` to ElevenLabs WebSocket with dynamic variables:
   - `company_name` - Company name from database
   - `dispatcher_name` - Configurable AI agent name (default: "Brian")
   - `company_service_area` - Service area coverage
   - `greeting_time_based` - Time-appropriate greeting
   - `_if_previous_customer` - Boolean for repeat caller detection
   - `last_service_type`, `last_vehicle_info`, `last_service_date` - Previous job context
   - `call_id` - Internal call tracking ID
6. Status callback → log to `call` table

**Inbound SMS** → `/api/twilio/sms`
1. Log to `message` table
2. Run `handleInboundSMS()` with SMS handler agent
3. Agent determines if driver/customer and takes action
4. Response sent via `sendNotification` tool

**Inbound Email** → `/api/email/inbound` (Resend webhook)
1. Store in `inbound_email` table
2. If `to: hookups@tow.center` → create lead, else parse as dispatch
3. Run `parseDispatchEmail()` with email dispatch agent
4. Agent creates job from extracted data

### Database Schema (lib/db.ts)

**Better Auth tables** (auto-managed):
- `user`, `session`, `account`, `verification`

**App tables**:
- `company` - Towing businesses, dispatch toggle, Twilio config
- `job` - Unified queue (source: email/sms/phone/manual), status tracking
- `call` - Call log with Twilio SID, transcript
- `subscription` - Stripe billing (plan: alpha/starter/pro)
- `agent_config` - ElevenLabs agent settings per company
- `message` - SMS/email thread (links to job, tracks direction/channel)
- `inbound_email` - Raw emails before processing
- `driver_profile` - Driver-specific info (status, phone)
- `lead` - Sales leads from hookups@tow.center
- `lead_message` - Conversation threads for leads
- `email_template` - Quick reply templates
- `notification_preferences` - Per-user notification settings

**Key indexes**: company_id, status, created_at, customer_phone, assigned_driver_id

### ElevenLabs Dynamic Variables

The voice AI agent uses **dynamic variables** for personalized, context-aware conversations:

**Per-Company Customization:**
- `{{company_name}}` - Auto-injected from database (multi-tenant support)
- `{{dispatcher_name}}` - Configurable AI name (stored in agent_config table)
- `{{company_service_area}}` - Service coverage area

**Repeat Caller Recognition:**
- `{{_if_previous_customer}}` - Boolean flag for returning customers
- `{{last_service_type}}` - Previous service (tow, jumpstart, etc.)
- `{{last_vehicle_info}}` - Vehicle from last job
- `{{last_service_date}}` - Date of last service

**Time-Based Personalization:**
- `{{greeting_time_based}}` - "Good morning!" / "Good afternoon!" (6am-12pm / 12pm-6pm)

**System Variables:**
- `{{system__caller_id}}` - Twilio caller phone number
- `{{call_id}}` - Internal tracking ID

All variables are passed via TwiML `<Parameter>` tags in `/api/twilio/voice` and automatically available in the ElevenLabs system prompt and first message.

### Route Structure

```
src/app/
├── (auth)/               # Better Auth UI (@daveyplate/better-auth-ui)
│   ├── sign-in/          # Email/password login
│   ├── sign-up/          # Account creation
│   ├── magic-link/       # Passwordless email
│   ├── forgot-password/
│   ├── reset-password/
│   └── two-factor/       # TOTP entry
├── (marketing)/
│   ├── page.tsx          # Landing page with ElevenLabs demo widget
│   └── layout.tsx        # SEO metadata
├── dashboard/
│   ├── layout.tsx        # SidebarProvider + auth check
│   ├── page.tsx          # Dispatch toggle + stats
│   ├── jobs/             # Jobs list, detail, new job form
│   ├── calls/            # Call history table
│   ├── settings/         # Company settings
│   └── help/             # Help center
└── api/
    ├── auth/[...all]/    # Better Auth endpoints
    ├── jobs/             # Jobs CRUD (GET, POST, PATCH, DELETE)
    ├── email/inbound/    # Resend webhook
    ├── twilio/           # SMS and voice webhooks
    ├── stripe/webhook/   # Payment events
    └── upload/           # Vercel Blob (company logos)
```

### Component Organization

**UI Components** (components/ui/): shadcn components - **DO NOT MANUALLY EDIT**

**App Components**:
- `app-sidebar.tsx` - Main navigation with tow.center branding
- `nav-user.tsx` - User menu with Better Auth signOut
- `dispatch-toggle.tsx` - Main dispatch on/off switch
- `hero-section.tsx` - Landing page hero with AI demo
- `ai-demo.tsx` - ElevenLabs conversational AI widget (@elevenlabs/react)
- `section-cards.tsx` - Metrics cards for dashboard

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=       # Random secret (32+ chars)
BETTER_AUTH_URL=          # http://localhost:3000 for dev
ADMIN_USER_ID=            # Comma-separated user IDs for admin access

# Rate Limiting (Vercel KV)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Resend (Email)
RESEND_API_KEY=
RESEND_SIGNING_SECRET=    # Webhook signature verification

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ElevenLabs (Voice AI)
ELEVENLABS_API_KEY=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=  # For landing page demo

# Stripe (Payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_BASE_URL=     # http://localhost:3000 for dev
```

## Pricing Tiers

| Plan | Price | AI Minutes | Phone | Recordings |
|------|-------|-----------|-------|------------|
| Alpha | Free 3mo → $49/mo | 100/mo | Shared | 7 days |
| Starter | $99/mo | 500/mo | Dedicated | 30 days |
| Pro | $199/mo | Unlimited | Dedicated | 90 days |

## Development Workflow

### Adding a New Job Source
1. Add source type to `JobSource` in lib/dispatch-agent.ts
2. Create tools with `createDispatchTools(companyId, source)`
3. Create agent with ToolLoopAgent pattern
4. Add API webhook handler
5. Update database `job.source` enum if needed

### Testing Webhooks Locally
Use Twilio CLI or ngrok to forward webhooks to localhost:
```bash
# Twilio CLI
twilio phone-numbers:update +1XXX --sms-url=http://localhost:3000/api/twilio/sms

# Or use ngrok
ngrok http 3000
```

### Adding Email Templates
1. Create new template in `emails/` directory using react-email
2. Import in lib/auth.ts or lib/email.ts
3. Preview with `bun run email`

## Important Notes

- **Limited local resources**: Avoid running `bun dev` on this machine. Commit and push changes frequently, test on Vercel preview deployments instead.
- **Better Auth migrations**: Run `bun run db:migrate` after pulling schema changes
- **Lazy DB pool**: Always use `getPool()` not direct Pool construction
- **Agent context**: Always pass `companyId` to agents for multi-tenancy
- **Phone normalization**: SMS lookup normalizes to last 10 digits
- **Job status flow**: pending → assigned → en_route → arrived → completed
- **Resend webhooks**: Verify signature with RESEND_SIGNING_SECRET
- **Rate limiting**: Applied to auth endpoints via lib/rate-limit.ts
