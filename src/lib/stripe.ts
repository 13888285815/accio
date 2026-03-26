import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Token pricing (per 1M tokens, in USD)
export const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o':              { input: 5.00,  output: 15.00 },
  'gpt-4o-mini':         { input: 0.15,  output: 0.60  },
  'gpt-4-turbo':         { input: 10.00, output: 30.00 },
  'claude-3-5-sonnet':   { input: 3.00,  output: 15.00 },
  'claude-3-haiku':      { input: 0.25,  output: 1.25  },
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = TOKEN_PRICING[model]
  if (!pricing) return 0
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output
}

export const PLANS = {
  FREE:       { name: 'Free',       monthlyTokens: 10_000,   price: 0   },
  PRO:        { name: 'Pro',        monthlyTokens: 500_000,  price: 29  },
  ENTERPRISE: { name: 'Enterprise', monthlyTokens: Infinity, price: 199 },
}
