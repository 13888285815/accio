import Link from 'next/link'

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
    href: '/sign-up',
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
    href: '/sign-up',
    highlight: false,
  },
]

const features = [
  { icon: '⚡', title: 'Ultra Low Latency', desc: 'Global edge network with <100ms response times worldwide.' },
  { icon: '🔑', title: 'Simple API Keys', desc: 'One key to access GPT-4o, Claude, Gemini and more.' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Track token usage, costs, and performance in your dashboard.' },
  { icon: '💳', title: 'Pay As You Go', desc: 'Start free. Only pay when you exceed your monthly quota.' },
  { icon: '🛡️', title: 'Enterprise Security', desc: 'SOC2 compliant. Keys are hashed, data encrypted at rest.' },
  { icon: '🔄', title: 'Automatic Failover', desc: 'Multi-provider routing ensures 99.9% uptime SLA.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-brand-600">Accio</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#docs" className="text-sm text-gray-600 hover:text-gray-900">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
            <Link href="/sign-up" className="btn-primary text-sm px-4 py-2">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-28 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-600 ring-1 ring-brand-100">
            🎉 Now supporting GPT-4o, Claude 3.5, Gemini 1.5
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            One API for<br />
            <span className="text-brand-600">all AI models</span>
          </h1>
          <p className="mb-10 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Access the world's best AI models through a single unified API.
            Token-based billing, transparent pricing, zero surprises.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary px-8 py-3.5 text-base w-full sm:w-auto">
              Start for Free — No credit card
            </Link>
            <a href="#pricing" className="btn-secondary px-8 py-3.5 text-base w-full sm:w-auto">
              View Pricing →
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-400">10,000 free tokens every month. Forever.</p>
        </div>
      </section>

      {/* Code Preview */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-gray-900 p-6 text-left shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-gray-400">api_example.py</span>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto"><code>{`import requests

response = requests.post(
    "https://yndxw.com/api/chat",
    headers={"Authorization": "Bearer sk-live-your-key"},
    json={
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)

print(response.json())`}</code></pre>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            { value: '1B+', label: 'Tokens Processed' },
            { value: '50k+', label: 'Developers' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<100ms', label: 'Avg Latency' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold text-brand-600">{stat.value}</div>
              <div className="mt-2 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24" id="features">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900">Everything you need to ship AI</h2>
            <p className="mt-4 text-lg text-gray-500">Built for developers who move fast.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 px-6 py-24" id="pricing">
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
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-gray-900">
                    MOST POPULAR
                  </div>
                )}
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
                <p className={`mt-2 text-sm font-medium ${plan.highlight ? 'text-brand-200' : 'text-brand-600'}`}>
                  {plan.tokens}
                </p>
                <ul className="my-6 space-y-3">
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

          {/* Token pricing table */}
          <div className="mt-16 rounded-2xl bg-white border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Pay-as-you-go Token Pricing</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-left font-medium text-gray-500">Model</th>
                    <th className="pb-3 text-right font-medium text-gray-500">Input (per 1M tokens)</th>
                    <th className="pb-3 text-right font-medium text-gray-500">Output (per 1M tokens)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { model: 'GPT-4o', input: '$5.00', output: '$15.00' },
                    { model: 'GPT-4o Mini', input: '$0.15', output: '$0.60' },
                    { model: 'Claude 3.5 Sonnet', input: '$3.00', output: '$15.00' },
                    { model: 'Claude 3 Haiku', input: '$0.25', output: '$1.25' },
                    { model: 'GPT-4 Turbo', input: '$10.00', output: '$30.00' },
                  ].map((row) => (
                    <tr key={row.model}>
                      <td className="py-3 font-medium text-gray-900">{row.model}</td>
                      <td className="py-3 text-right text-gray-600">{row.input}</td>
                      <td className="py-3 text-right text-gray-600">{row.output}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to build?</h2>
          <p className="text-lg text-gray-500 mb-8">Join 50,000+ developers already using Accio.</p>
          <Link href="/sign-up" className="btn-primary px-10 py-4 text-base">
            Start for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-bold text-gray-900">Accio</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 Accio. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
