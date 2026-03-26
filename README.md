# Accio — AI API SaaS Platform

A full-stack SaaS platform with subscription billing and AI API token metering, similar to Crunchbase's subscription model.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Auth | Clerk (email + OAuth) |
| Database | Supabase (PostgreSQL) + Prisma ORM |
| Billing | Stripe (subscriptions + one-time top-ups) |
| Deployment | Vercel |

## Features

- **3-tier subscription plans**: Free / Pro / Enterprise
- **Clerk Authentication**: Email, Google, GitHub OAuth
- **AI API Token metering**: per-model pricing, monthly quota + pay-as-you-go
- **API Key management**: create, revoke, preview
- **Usage dashboard**: token consumption by model, cost breakdown
- **Credit top-up**: one-time Stripe payments to add balance
- **Stripe Webhook**: real-time subscription state sync

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/13888285815/accio
cd accio
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
# Fill in all required values
```

Required services to set up:
- [Clerk](https://clerk.com) — Auth
- [Supabase](https://supabase.com) — PostgreSQL database
- [Stripe](https://stripe.com) — Payments

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

Then seed the plans in Supabase (or run a seed script):

```sql
INSERT INTO plans (id, name, monthly_price, yearly_price, monthly_token_limit, max_api_keys, features, sort_order)
VALUES
  (gen_random_uuid(), 'Free', 0, 0, 10000, 1, '["10,000 tokens/mo","1 API key","Community support"]', 0),
  (gen_random_uuid(), 'Pro', 29, 290, 500000, 5, '["500,000 tokens/mo","5 API keys","Priority support"]', 1),
  (gen_random_uuid(), 'Enterprise', 199, 1990, 2147483647, 20, '["Unlimited tokens","20 API keys","Dedicated support"]', 2);
```

### 4. Configure Stripe

1. Create products + prices in Stripe Dashboard
2. Add price IDs to `.env.local`
3. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Add `STRIPE_WEBHOOK_SECRET` to env

### 5. Run Locally

```bash
npm run dev
```

## API Usage Example

```bash
# Record token usage (called by your AI proxy layer)
curl -X POST https://yourdomain.com/api/tokens/usage \
  -H "Authorization: Bearer sk-live-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "inputTokens": 1000,
    "outputTokens": 500,
    "endpoint": "/chat/completions"
  }'
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with pricing
│   ├── dashboard/
│   │   ├── page.tsx                # Overview + usage summary
│   │   ├── api-keys/page.tsx       # API key management
│   │   ├── usage/page.tsx          # Token usage analytics
│   │   └── billing/page.tsx        # Subscription + top-up
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── create-checkout/    # Start subscription checkout
│   │   │   ├── portal/             # Stripe billing portal
│   │   │   ├── topup/              # Credit top-up checkout
│   │   │   └── webhook/            # Stripe event handler
│   │   └── tokens/
│   │       ├── keys/               # CRUD for API keys
│   │       └── usage/              # Token billing endpoint
│   └── (auth)/
│       ├── sign-in/                # Clerk sign-in
│       └── sign-up/                # Clerk sign-up
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   └── stripe.ts                   # Stripe client + pricing config
└── middleware.ts                   # Clerk route protection
prisma/
└── schema.prisma                   # Database schema
```

## Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/13888285815/accio)

Remember to add all environment variables in your Vercel project settings.
