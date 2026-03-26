'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    tokens: '10,000 tokens/mo',
    features: ['10,000 free tokens/month', '1 API key', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    tokens: '500,000 tokens/mo',
    features: ['500,000 tokens/month', '5 API keys', 'Priority support', 'Usage analytics'],
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    tokens: 'Unlimited tokens',
    features: ['Unlimited tokens', '20 API keys', 'Dedicated support', 'Custom SLA'],
  },
]

export default function BillingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [topupAmount, setTopupAmount] = useState('10')
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle: billing }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(null)
    }
  }

  const handleTopUp = async () => {
    setLoading('topup')
    try {
      const res = await fetch('/api/stripe/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUsd: parseFloat(topupAmount) }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your subscription and payment methods.</p>
      </div>

      {/* Billing Toggle */}
      <div className="mb-8 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Billing cycle:</span>
        <div className="flex rounded-lg border border-gray-200 p-1">
          {(['monthly', 'yearly'] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBilling(cycle)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
                billing === cycle ? 'bg-brand-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {cycle}
              {cycle === 'yearly' && <span className="ml-1 text-xs text-green-500 font-bold">-17%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 lg:grid-cols-3 mb-10">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-6 ${
              plan.highlight ? 'border-brand-500 ring-2 ring-brand-500' : 'border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              ${billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
              <span className="text-sm font-normal text-gray-500">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
            </p>
            <p className="mt-1 text-sm font-medium text-brand-600">{plan.tokens}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id || plan.id === 'free'}
              className={`mt-6 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                plan.id === 'free'
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : plan.highlight
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'border border-brand-600 text-brand-600 hover:bg-brand-50'
              }`}
            >
              {loading === plan.id ? 'Loading...' : plan.id === 'free' ? 'Current (Default)' : `Subscribe to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Credit Top-Up */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Top Up Credit Balance</h2>
        <p className="text-sm text-gray-500 mb-4">
          Add credit to your account. Used when your monthly free quota is exhausted.
          Rate: <strong>$1 = ~200,000 tokens</strong> (GPT-4o Mini equivalent).
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">$</span>
            <input
              type="number"
              min="5"
              max="500"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="w-24 px-3 py-2 text-sm outline-none"
            />
          </div>
          {['10', '25', '50', '100'].map((amt) => (
            <button
              key={amt}
              onClick={() => setTopupAmount(amt)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                topupAmount === amt ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              ${amt}
            </button>
          ))}
          <button
            onClick={handleTopUp}
            disabled={loading === 'topup'}
            className="btn-primary"
          >
            {loading === 'topup' ? 'Redirecting...' : 'Top Up'}
          </button>
        </div>
      </div>

      {/* Manage Billing */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment & Invoices</h2>
        <p className="text-sm text-gray-500 mb-4">Manage your payment methods and view past invoices via the Stripe portal.</p>
        <button
          onClick={handleManageBilling}
          disabled={loading === 'portal'}
          className="btn-secondary"
        >
          {loading === 'portal' ? 'Loading...' : 'Manage Billing →'}
        </button>
      </div>
    </div>
  )
}
