'use client'

import { useState, useEffect } from 'react'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  lastUsedAt: string | null
  isActive: boolean
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchKeys = async () => {
    const res = await fetch('/api/tokens/keys')
    const data = await res.json()
    setKeys(data.keys ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchKeys() }, [])

  const createKey = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    const res = await fetch('/api/tokens/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    })
    const data = await res.json()
    if (data.key) {
      setNewKeyValue(data.key)
      setNewKeyName('')
      setShowForm(false)
      fetchKeys()
    }
    setCreating(false)
  }

  const revokeKey = async (id: string) => {
    await fetch(`/api/tokens/keys/${id}`, { method: 'DELETE' })
    fetchKeys()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage API keys for your applications.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + New API Key
        </button>
      </div>

      {/* New Key Warning */}
      {newKeyValue && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            ⚠️ Copy your API key now — it will not be shown again.
          </p>
          <div className="flex items-center gap-3 font-mono text-sm bg-white border border-amber-200 rounded px-3 py-2">
            <span className="flex-1 break-all">{newKeyValue}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(newKeyValue); }}
              className="shrink-0 text-xs text-amber-700 hover:text-amber-900 font-medium"
            >
              Copy
            </button>
          </div>
          <button onClick={() => setNewKeyValue(null)} className="mt-2 text-xs text-amber-600 hover:underline">
            I've copied it, dismiss
          </button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New API Key</h3>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Key name (e.g. Production, Development)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createKey()}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <button onClick={createKey} disabled={creating} className="btn-primary">
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No API keys yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-brand-600 text-sm hover:underline">
              Create your first key →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Key</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Last Used</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{key.name}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{key.keyPreview}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      key.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {key.isActive && (
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
