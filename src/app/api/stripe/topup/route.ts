import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amountUsd } = await req.json()
  if (!amountUsd || amountUsd < 5) {
    return NextResponse.json({ error: 'Minimum top-up is $5' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const topup = await prisma.creditTopUp.create({
    data: { userId: user.id, amountUsd, status: 'PENDING' },
  })

  const subscription = await prisma.subscription.findUnique({ where: { userId: user.id } })
  let customerId = subscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email })
    customerId = customer.id
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Accio Credit Top-Up — $${amountUsd}` },
        unit_amount: Math.round(amountUsd * 100),
      },
      quantity: 1,
    }],
    metadata: { topupId: topup.id, userId: user.id, amountUsd: amountUsd.toString() },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?topup=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  })

  return NextResponse.json({ url: session.url })
}
