import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()
  const clerkUser = await currentUser()

  if (!userId) return null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {clerkUser?.firstName ?? 'Developer'} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">Your dashboard is ready. Connect a database to unlock full features.</p>
      </div>

      {/* Setup Banner */}
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4">
        <span className="text-2xl">🛠️</span>
        <div>
          <p className="font-semibold text-amber-900">Database not connected</p>
          <p className="mt-1 text-sm text-amber-700">
            Connect Supabase to enable API key management, token usage tracking, and billing.
          </p>
        </div>
      </div>

      {/* Stats Grid (placeholder) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { title: 'Current Plan', value: 'Free', color: 'text-blue-600' },
          { title: 'Tokens Used', value: '—', color: 'text-purple-600' },
          { title: 'Tokens Today', value: '—', color: 'text-green-600' },
          { title: 'Credit Balance', value: '$0.00', color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.title} className="card">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.title}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/dashboard/api-keys', title: 'API Keys', desc: 'Create and manage your API keys', icon: '🔑' },
          { href: '/dashboard/usage', title: 'Usage Analytics', desc: 'Token consumption breakdown', icon: '📊' },
          { href: '/dashboard/billing', title: 'Billing & Plans', desc: 'Upgrade your plan', icon: '💳' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card flex items-start gap-3 hover:border-brand-200 hover:shadow-md transition-all">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
