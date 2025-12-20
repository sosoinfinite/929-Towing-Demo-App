# tow.center

AI-powered dispatch service for towing companies. Automate calls, parse motor club emails, handle 2-way SMS with drivers and customers, and manage jobs 24/7.

## Features

### AI Voice Dispatch
- **24/7 Call Answering** - Never miss a call again. AI answers in under 2 seconds.
- **Smart Quoting** - Automatically calculates pricing based on location, mileage, and vehicle type.
- **Natural Conversations** - Powered by ElevenLabs voice AI that sounds human.
- **SMS Notifications** - Get job details texted to you immediately after each call.

### Motor Club Email Integration
- **Automatic Parsing** - AI parses dispatch emails from AAA, Agero, Urgently, Swoop, Honk, and more.
- **Job Creation** - Extracts customer info, service type, vehicle details, and locations.
- **Resend Webhooks** - Receives inbound email via Resend's email receiving API.

### 2-Way SMS Communication
- **Driver Updates** - Drivers can text "OTW", "arrived", "done" to update job status.
- **Customer Notifications** - Automatic SMS updates to customers about ETA and arrival.
- **Message Threading** - Full conversation history for each job.

### Jobs Dashboard
- **Unified Queue** - All jobs from calls, emails, SMS, and manual entry in one place.
- **Status Tracking** - Pending, Assigned, En Route, Arrived, Completed, Cancelled.
- **Driver Assignment** - Assign drivers and notify them via SMS.
- **Message Thread** - Send and receive SMS directly from the job detail page.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **UI**: shadcn/ui + Tailwind CSS v4 + Framer Motion
- **Auth**: Better Auth (email/password, magic link, phone OTP, passkeys, TOTP 2FA)
- **Database**: Neon PostgreSQL (serverless)
- **AI**: Vercel AI SDK with Google Gemini 3 Flash
- **Voice**: ElevenLabs Conversational AI
- **SMS/Voice**: Twilio
- **Email**: Resend + react-email
- **Payments**: Stripe
- **Rate Limiting**: Upstash Redis (Vercel KV)
- **Hosting**: Vercel

## Authentication

tow.center uses Better Auth with multiple authentication methods optimized for different user roles:

### Auth Methods
| Method | Best For | Description |
|--------|----------|-------------|
| Email/Password | All users | Traditional sign-in with email verification |
| Magic Link | Dispatchers | Passwordless email sign-in |
| Phone OTP | Drivers | SMS code verification for mobile sign-in |
| Passkeys | All users | Face ID, Touch ID, Windows Hello |
| TOTP 2FA | Admins | Authenticator app (Google Authenticator, Authy) |

### Auth Routes
| Route | Purpose |
|-------|---------|
| `/sign-in` | Email/password login |
| `/sign-up` | Create account |
| `/magic-link` | Passwordless email login |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password |
| `/two-factor` | Enter TOTP code after login |
| `/dashboard/account` | Manage profile & security settings |

### Security Features
- **Rate Limiting** - Protection against brute force attacks via Vercel KV
- **Session Management** - 7-day sessions with auto-refresh
- **Organization Support** - Team invites and role management
- **Passkey Management** - Add/remove WebAuthn credentials
- **2FA Management** - Enable/disable TOTP with QR code

## Getting Started

### Prerequisites

- Bun (recommended) or Node.js 20+
- PostgreSQL database (we use Neon)
- Twilio account
- Resend account
- ElevenLabs account
- Stripe account

### Installation

```bash
# Clone the repository
git clone https://github.com/sosoinfinite/929-Towing-Demo-App.git
cd 929-Towing-Demo-App

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
ADMIN_USER_ID=user-id-1,user-id-2

# Rate Limiting (Vercel KV)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Resend (Email)
RESEND_API_KEY=re_...
RESEND_SIGNING_SECRET=whsec_...

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# ElevenLabs (Voice AI)
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=...

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Database Setup

```bash
# Run Better Auth migrations
bun run db:migrate
```

### Development

```bash
# Start the development server
bun dev

# Preview email templates
bun run email

# Lint code
bun run lint

# Build for production
bun run build
```

## Webhook Configuration

### Twilio SMS Webhook
Configure your Twilio phone number to POST to:
```
https://your-domain.com/api/twilio/sms
```

### Twilio Voice Webhook
Configure your Twilio phone number to POST to:
```
https://your-domain.com/api/twilio/voice
```

### Resend Email Webhook
1. Add MX record: `inbound.resend.com` (priority 10)
2. Configure webhook URL in Resend dashboard:
```
https://your-domain.com/api/email/inbound
```
3. Subscribe to `email.received` events

### Stripe Webhook
Configure webhook URL in Stripe dashboard:
```
https://your-domain.com/api/stripe/webhook
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (sign-in, sign-up, 2FA, etc.)
│   ├── (marketing)/      # Landing page, service areas
│   ├── dashboard/        # Dashboard pages
│   │   ├── account/      # Profile & security settings
│   │   ├── jobs/         # Jobs list, detail, new job
│   │   ├── calls/        # Call history
│   │   ├── settings/     # Company settings
│   │   └── help/         # Help center
│   └── api/
│       ├── auth/         # Better Auth endpoints
│       ├── jobs/         # Jobs CRUD API
│       ├── email/        # Resend webhook
│       ├── twilio/       # SMS and voice webhooks
│       └── stripe/       # Payment webhooks
├── components/
│   ├── ui/               # shadcn components
│   └── ...               # App components
├── lib/
│   ├── auth.ts           # Better Auth config
│   ├── auth-client.ts    # Better Auth client
│   ├── db.ts             # Database schema & pool
│   ├── rate-limit.ts     # Upstash rate limiting
│   ├── dispatch-agent.ts # AI agent with tools
│   ├── twilio.ts         # Twilio helpers
│   └── email.ts          # Resend client
└── emails/               # react-email templates
```

## AI Dispatch Agent

The dispatch agent uses Vercel AI SDK with Google Gemini 3 Flash. It has access to these tools:

| Tool | Description |
|------|-------------|
| `createJob` | Create a new job from parsed dispatch request |
| `updateJobStatus` | Update job status (pending, en_route, etc.) |
| `sendNotification` | Send SMS to phone number |
| `lookupJob` | Find active jobs by customer phone |
| `lookupDriver` | Check if phone belongs to a driver |
| `getJobById` | Get specific job details |
| `findDriverActiveJob` | Find driver's current assignment |

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Alpha | Free 3 months, then $49/mo | 100 AI mins, shared number, 7-day recordings |
| Starter | $99/mo | 500 AI mins, dedicated number, 30-day recordings |
| Pro | $199/mo | Unlimited AI mins, dedicated number, 90-day recordings |

## License

Proprietary - All rights reserved.
