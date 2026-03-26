import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { planId, billingCycle } = await req.json()

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const plan = await prisma.plan.findFirst({ where: { name: { equals: planId, mode: 'insensitive' } } })
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const priceId = billingCycle === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 400 })

  // Get or create Stripe customer
  let subscription = await prisma.subscription.findUnique({ where: { userId: user.id } })
  let customerId = subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    subscription_data: {
      metadata: { userId: user.id, planId: plan.id },
    },
  })

  return NextResponse.json({ url: session.url })
}
