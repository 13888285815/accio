import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ keys: [] })

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, keyPreview: true, lastUsedAt: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ keys })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: { include: { plan: true } } },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const maxKeys = user.subscription?.plan.maxApiKeys ?? 1
  const existingKeys = await prisma.apiKey.count({ where: { userId: user.id, isActive: true } })
  if (existingKeys >= maxKeys) {
    return NextResponse.json({
      error: `Your plan allows max ${maxKeys} API key(s). Upgrade to create more.`,
    }, { status: 403 })
  }

  const rawKey = `sk-live-${crypto.randomBytes(24).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const keyPreview = `${rawKey.substring(0, 12)}...${rawKey.slice(-4)}`

  const apiKey = await prisma.apiKey.create({
    data: { userId: user.id, name: name.trim(), keyHash, keyPreview },
  })

  return NextResponse.json({ key: rawKey, id: apiKey.id, preview: keyPreview })
}
