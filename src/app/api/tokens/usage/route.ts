import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCost } from '@/lib/stripe'
import crypto from 'crypto'

/**
 * POST /api/tokens/usage
 * 
 * 核心 Token 计费端点：
 * - 验证 API Key
 * - 检查配额（免费额度 → 付费余额）
 * - 记录用量
 * - 扣减余额
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const rawKey = authHeader?.replace('Bearer ', '')
  if (!rawKey) return NextResponse.json({ error: 'Missing API key' }, { status: 401 })

  // 验证 API Key
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: { include: { subscription: { include: { plan: true } }, tokenBalance: true } } },
  })

  if (!apiKey || !apiKey.isActive) {
    return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 })
  }

  const { model, inputTokens, outputTokens, endpoint } = await req.json()
  const totalTokens = (inputTokens ?? 0) + (outputTokens ?? 0)
  const costUsd = calculateCost(model, inputTokens ?? 0, outputTokens ?? 0)

  const user = apiKey.user
  const plan = user.subscription?.plan
  const balance = user.tokenBalance
  const monthlyLimit = plan?.monthlyTokenLimit ?? 10000
  const usedFree = balance?.freeTokensUsed ?? 0
  const creditBalance = balance?.creditUsd ?? 0

  // 检查是否有可用配额
  const remainingFree = Math.max(0, monthlyLimit - usedFree)

  if (remainingFree === 0 && creditBalance < costUsd) {
    return NextResponse.json({
      error: 'Insufficient tokens. Your free quota is exhausted and credit balance is low. Please top up.',
      code: 'QUOTA_EXCEEDED',
    }, { status: 402 })
  }

  // 记录用量
  await prisma.tokenUsage.create({
    data: {
      userId: user.id,
      apiKeyId: apiKey.id,
      model,
      inputTokens: inputTokens ?? 0,
      outputTokens: outputTokens ?? 0,
      totalTokens,
      costUsd,
      endpoint,
    },
  })

  // 更新余额：先用免费额度，再扣信用额度
  if (remainingFree >= totalTokens) {
    await prisma.tokenBalance.upsert({
      where: { userId: user.id },
      update: { freeTokensUsed: { increment: totalTokens } },
      create: { userId: user.id, freeTokensUsed: totalTokens },
    })
  } else {
    const freeToConsume = remainingFree
    await prisma.tokenBalance.upsert({
      where: { userId: user.id },
      update: {
        freeTokensUsed: { increment: freeToConsume },
        creditUsd: { decrement: costUsd },
      },
      create: { userId: user.id, freeTokensUsed: freeToConsume, creditUsd: -costUsd },
    })
  }

  // 更新 Key 最后使用时间
  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })

  return NextResponse.json({
    success: true,
    usage: { model, inputTokens, outputTokens, totalTokens, costUsd },
    balance: {
      freeTokensRemaining: Math.max(0, remainingFree - totalTokens),
      creditUsd: Math.max(0, creditBalance - (remainingFree < totalTokens ? costUsd : 0)),
    },
  })
}
