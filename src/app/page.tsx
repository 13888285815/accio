import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for experimenting',
    tokens: '10,000 tokens/mo',
    features: ['10,000 free tokens/month', '1 API key', 'Community support', 'Standard rate limits'],
    cta: 'Get Started Free',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For developers & small teams',
    tokens: '500,000 tokens/mo',
    features: ['500,000 tokens/month', '5 API keys', 'Priority support', 'Higher rate limits', 'Usage analytics', 'Pay-as-you-go after quota'],
    cta: 'Start Pro Trial',
    href: '/sign-up?plan=pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For production workloads',
    tokens: 'Unlimited tokens',
    features: ['Unlimited tokens', '20 API keys', 'Dedicated support', 'Custom rate limits', 'Advanced analytics', 'SLA guarantee', 'Custom models'],
    cta: 'Contact Sales',
    href: '/contact',
    highlight: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-600">Accio</Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900">Docs</Link>
            <SignedOut>
              <Link href="/sign-in" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
              <Link href="/sign-up" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-brand-100">
            AI API Platform — Pay Only for What You Use
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Build AI products<br />
            <span className="text-brand-600">without limits</span>
          </h1>
          <p className="mb-10 text-xl text-gray-500 max-w-2xl mx-auto">
            Access GPT-4o, Claude, and more through a single unified API. Simple token-based billing, transparent pricing, no surprises.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary px-8 py-3 text-base">Start for Free</Link>
            <Link href="/docs" className="btn-secondary px-8 py-3 text-base">View Docs</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8 text-center">
          {[
            { value: '1B+', label: 'Tokens processed' },
            { value: '50k+', label: 'Developers' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold text-brand-600">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-500">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-brand-600 text-white shadow-xl ring-2 ring-brand-600'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-gray-900">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 text-sm ${plan.highlight ? 'text-brand-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? 'text-brand-100' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${plan.highlight ? 'text-brand-100' : 'text-brand-600'}`}>
                    {plan.tokens}
                  </p>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-brand-50' : 'text-gray-600'}`}>
                      <svg className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? 'text-brand-200' : 'text-brand-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-10 text-center text-sm text-gray-500">
        <p>© 2026 Accio. All rights reserved.</p>
      </footer>
    </div>
  )
}
