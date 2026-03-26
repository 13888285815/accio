import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export default async function UsagePage() {
  const { userId } = auth()
  const user = await prisma.user.findUnique({ where: { clerkId: userId! } })

  if (!user) return <div className="text-sm text-gray-500 p-8">User not found.</div>

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [monthlyAgg, byModel, recentUsages] = await Promise.all([
    prisma.tokenUsage.aggregate({
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
      _sum: { totalTokens: true, costUsd: true, inputTokens: true, outputTokens: true },
      _count: { id: true },
    }),
    prisma.tokenUsage.groupBy({
      by: ['model'],
      where: { userId: user.id, createdAt: { gte: startOfMonth } },
      _sum: { totalTokens: true, costUsd: true },
      orderBy: { _sum: { totalTokens: 'desc' } },
    }),
    prisma.tokenUsage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { model: true, totalTokens: true, costUsd: true, endpoint: true, createdAt: true },
    }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Usage</h1>
        <p className="mt-1 text-sm text-gray-500">Token consumption for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total Tokens', value: (monthlyAgg._sum.totalTokens ?? 0).toLocaleString() },
          { label: 'Input Tokens', value: (monthlyAgg._sum.inputTokens ?? 0).toLocaleString() },
          { label: 'Output Tokens', value: (monthlyAgg._sum.outputTokens ?? 0).toLocaleString() },
          { label: 'Total Cost', value: `$${(monthlyAgg._sum.costUsd ?? 0).toFixed(4)}` },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* By Model */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Usage by Model</h2>
        {byModel.length === 0 ? (
          <p className="text-sm text-gray-400">No usage yet this month.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left font-medium text-gray-500">Model</th>
                <th className="pb-2 text-right font-medium text-gray-500">Tokens</th>
                <th className="pb-2 text-right font-medium text-gray-500">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byModel.map((row) => (
                <tr key={row.model}>
                  <td className="py-2 font-mono text-gray-700">{row.model}</td>
                  <td className="py-2 text-right text-gray-600">{(row._sum.totalTokens ?? 0).toLocaleString()}</td>
                  <td className="py-2 text-right text-gray-600">${(row._sum.costUsd ?? 0).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Requests */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent API Calls</h2>
        </div>
        {recentUsages.length === 0 ? (
          <div className="p-6 text-sm text-gray-400">No API calls yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Model</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Endpoint</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Tokens</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentUsages.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 font-mono text-gray-700">{u.model}</td>
                  <td className="px-6 py-3 text-gray-500">{u.endpoint ?? '—'}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{u.totalTokens.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-gray-600">${u.costUsd.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
