import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Stripe = require('stripe')

// Use loose typing for Stripe objects to avoid version-specific type issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeEvent = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeCheckoutSession = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeInvoice = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeSubscription = any

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: StripeEvent
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {
    // ── 订阅激活 ──
    case 'checkout.session.completed': {
      const session = event.data.object as StripeCheckoutSession
      if (session.mode === 'subscription') {
        await handleSubscriptionActivated(session)
      } else if (session.mode === 'payment') {
        await handleTopUpCompleted(session)
      }
      break
    }

    // ── 订阅续费 ──
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as StripeInvoice
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: 'ACTIVE',
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        })
        // 重置月度免费 Token
        await prisma.tokenBalance.updateMany({
          where: { user: { subscription: { stripeSubscriptionId: sub.id } } },
          data: { freeTokensUsed: 0, freeTokensReset: new Date() },
        })
      }
      break
    }

    // ── 支付失败 ──
    case 'invoice.payment_failed': {
      const invoice = event.data.object as StripeInvoice
      if (invoice.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: 'PAST_DUE' },
        })
      }
      break
    }

    // ── 订阅取消 ──
    case 'customer.subscription.deleted': {
      const sub = event.data.object as StripeSubscription
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: 'CANCELED', cancelAtPeriodEnd: false },
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as StripeSubscription
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionActivated(session: StripeCheckoutSession) {
  const { userId, planId } = session.subscription_data?.metadata ?? {}
  if (!userId || !planId) return

  const stripeSubId = session.subscription as string
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubId,
      stripePriceId: stripeSub.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      status: 'ACTIVE',
    },
    create: {
      userId,
      planId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubId,
      stripePriceId: stripeSub.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      status: 'ACTIVE',
    },
  })
}

async function handleTopUpCompleted(session: StripeCheckoutSession) {
  const { topupId, userId, amountUsd } = session.metadata ?? {}
  if (!topupId || !userId) return

  await prisma.creditTopUp.update({
    where: { id: topupId },
    data: { status: 'SUCCEEDED', stripePaymentIntentId: session.payment_intent as string },
  })

  await prisma.tokenBalance.upsert({
    where: { userId },
    update: { creditUsd: { increment: parseFloat(amountUsd) } },
    create: { userId, creditUsd: parseFloat(amountUsd) },
  })
}
