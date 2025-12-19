# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: TowAI - AI-Powered Towing Dispatch SaaS

**Goal**: MVP to land pitches to tow companies, foundation for SaaS business
**Real Customer**: 929 Towing (paying pilot)
**Timeline**: 2-4 weeks

## Commands

```bash
bun dev           # Development server (Turbopack default in Next 16)
bun run build     # Production build
bun run lint      # Biome check
bun run lint:fix  # Biome auto-fix
```

## Tech Stack

- Next.js 16 (App Router, React 19, Turbopack)
- shadcn/ui + Tailwind CSS v4 (dashboard-01 block)
- Better Auth (email/password)
- Neon PostgreSQL (serverless)
- Twilio (calls, SMS)
- ElevenLabs (AI voice agent)
- Stripe (billing)
- Vercel (hosting)

## Market Position

| Competitor | Price | AI Voice |
|------------|-------|----------|
| Towbook | $49/mo | No |
| TowingDispatch.ai | $499/mo | Yes |
| **TowAI** | **$99/mo** | **Yes** |

**Alpha Program**: Free 3 months → $49/mo locked for life

---

## Setup Progress

- [x] Next.js 16 project created
- [x] shadcn/ui initialized
- [x] Biome installed (replaces ESLint)
- [x] Add dependencies (framer-motion, better-auth, @neondatabase/serverless, twilio)
- [x] Set up Neon PostgreSQL schema (lib/db.ts)
- [x] Configure Better Auth (lib/auth.ts, lib/auth-client.ts)
- [x] Port dispatch toggle UI from demo
- [x] Create landing page with SEO + conversion optimization
- [x] Install shadcn dashboard-01 block
- [x] Create dashboard with SidebarProvider layout
- [ ] Set up Neon database connection (needs env vars)
- [ ] Run Better Auth migrations
- [ ] Add Twilio webhooks
- [ ] Add ElevenLabs integration
- [ ] Add Stripe billing

---

## Project Structure (Current)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx        # SEO metadata
│   │   └── page.tsx          # Landing page
│   ├── dashboard/
│   │   ├── layout.tsx        # SidebarProvider + auth
│   │   ├── page.tsx          # Dispatch toggle + stats
│   │   ├── calls/page.tsx    # Call history
│   │   └── settings/page.tsx # Company settings
│   └── api/
│       └── auth/[...all]/route.ts
├── components/
│   ├── ui/                   # shadcn (DO NOT EDIT)
│   ├── app-sidebar.tsx       # TowAI navigation
│   ├── nav-user.tsx          # User menu with signOut
│   ├── site-header.tsx       # Header with sidebar trigger
│   ├── section-cards.tsx     # TowAI metrics cards
│   ├── dispatch-toggle.tsx   # Main toggle component
│   ├── floating-icons.tsx    # $ and Z animations
│   ├── hero-section.tsx      # Landing page hero with AI demo
│   └── ai-demo.tsx           # ElevenLabs conversational AI widget
├── lib/
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client
│   ├── db.ts                 # Neon PostgreSQL + schema
│   ├── brand.ts              # TowAI brand colors
│   └── utils.ts              # cn() helper
└── proxy.ts                  # Route protection (Next.js 16)
```

---

## Database Schema (Neon PostgreSQL)

Better Auth creates: `user`, `session`, `account`, `verification`

App tables:
```sql
company (id, name, phone, twilio_phone, dispatch_active, service_area)
call (id, company_id, twilio_call_sid, caller_number, status, duration, transcript, ai_handled)
subscription (id, company_id, stripe_customer_id, plan, status)
agent_config (id, company_id, elevenlabs_agent_id, greeting_message)
```

User extensions: `company_id`, `role`

---

## Twilio → ElevenLabs Flow

```
Incoming Call → /api/twilio/voice
     │
     ├─ dispatch_active = false → Voicemail
     │
     └─ dispatch_active = true
           │
           ▼
        TwiML: <Connect><Stream url="wss://api.elevenlabs.io/..." />
           │
           ▼
        ElevenLabs AI handles conversation
           │
           ▼
        Status callback → Log to DB
```

---

## Pricing Tiers

| Feature | Alpha (Free) | Starter ($99) | Pro ($199) |
|---------|--------------|---------------|------------|
| AI Minutes | 100/mo | 500/mo | Unlimited |
| Phone Number | Shared | Dedicated | Dedicated |
| Call Recording | 7 days | 30 days | 90 days |

---

## Environment Variables

```
DATABASE_URL=              # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=        # Random secret for auth
BETTER_AUTH_URL=           # http://localhost:3000 for dev
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
ELEVENLABS_API_KEY=
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=  # For landing page AI demo widget
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_BASE_URL=      # http://localhost:3000 for dev
```

---

## Next Steps

1. Set up Neon database + run `npx @better-auth/cli migrate`
2. Add Twilio webhook endpoints
3. Connect ElevenLabs conversational AI
4. Add Stripe billing integration
5. Deploy to Vercel
