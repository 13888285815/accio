import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = auth()
  const clerkUser = await currentUser()

  // 获取或创建数据库用户
  let user = await prisma.user.findUnique({ where: { clerkId: userId! } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId!,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim(),
        avatarUrl: clerkUser?.imageUrl,
      },
    })
    // 创建免费订阅
    const freePlan = await prisma.plan.findFirst({ where: { name: 'Free' } })
    if (freePlan) {
      await prisma.subscription.create({
        data: { userId: user.id, planId: freePlan.id, status: 'FREE' },
      })
      await prisma.tokenBalance.create({ data: { userId: user.id } })
    }
  }

  const [subscription, balance, usageToday] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    }),
    prisma.tokenBalance.findUnique({ where: { userId: user.id } }),
    prisma.tokenUsage.aggregate({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      _sum: { totalTokens: true, costUsd: true },
    }),
  ])

  const monthlyLimit = subscription?.plan.monthlyTokenLimit ?? 10000
  const usedTokens = balance?.freeTokensUsed ?? 0
  const usagePercent = Math.min(100, Math.round((usedTokens / monthlyLimit) * 100))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {clerkUser?.firstName ?? 'Developer'} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s your API usage at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Current Plan"
          value={subscription?.plan.name ?? 'Free'}
          sub={<Link href="/dashboard/billing" className="text-brand-600 hover:underline text-xs">Upgrade →</Link>}
          color="blue"
        />
        <StatCard
          title="Tokens Used (Month)"
          value={usedTokens.toLocaleString()}
          sub={`of ${monthlyLimit.toLocaleString()} free tokens`}
          color="purple"
        />
        <StatCard
          title="Tokens Today"
          value={(usageToday._sum.totalTokens ?? 0).toLocaleString()}
          sub="tokens consumed today"
          color="green"
        />
        <StatCard
          title="Credit Balance"
          value={`$${(balance?.creditUsd ?? 0).toFixed(2)}`}
          sub={<Link href="/dashboard/billing" className="text-brand-600 hover:underline text-xs">Top up →</Link>}
          color="amber"
        />
      </div>

      {/* Usage Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Monthly Free Token Quota</h2>
          <span className="text-sm text-gray-500">{usagePercent}% used</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : 'bg-brand-500'}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {(monthlyLimit - usedTokens).toLocaleString()} tokens remaining this month
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction href="/dashboard/api-keys" title="Create API Key" desc="Generate a new key to start calling APIs" icon="🔑" />
        <QuickAction href="/dashboard/usage" title="View Usage Details" desc="Detailed breakdown by model and endpoint" icon="📊" />
        <QuickAction href="/docs" title="Read the Docs" desc="Integration guides and API reference" icon="📖" />
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, color }: {
  title: string; value: string; sub: React.ReactNode; color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="card">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${colors[color]?.split(' ')[1]}`}>{value}</p>
      <div className="mt-1 text-xs text-gray-400">{sub}</div>
    </div>
  )
}

function QuickAction({ href, title, desc, icon }: {
  href: string; title: string; desc: string; icon: string
}) {
  return (
    <Link href={href} className="card flex items-start gap-3 hover:border-brand-200 hover:shadow-md transition-all">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
      </div>
    </Link>
  )
}
