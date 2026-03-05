'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/lib/hooks/use-profile'
import { CATEGORY_LABELS } from '@/lib/inventory'
import type { InventoryThreshold, InventoryCategory } from '@/types/database'

export default function ThresholdsPage() {
  const { isAdmin, loading: profileLoading } = useProfile()
  const [thresholds, setThresholds] = useState<InventoryThreshold[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase.from('inventory_thresholds').select('*').order('category')
      if (data) setThresholds(data as InventoryThreshold[])
      setLoading(false)
    }
    fetch()
  }, [])

  async function handleSave(threshold: InventoryThreshold) {
    setSaving(threshold.id)
    const supabase = createClient()
    const updates = {
      green_threshold: threshold.green_threshold,
      yellow_threshold: threshold.yellow_threshold,
      red_threshold: threshold.red_threshold,
      reserve_label: threshold.reserve_label,
    }
    const query = supabase.from('inventory_thresholds')
    // @ts-expect-error -- Supabase v2.98 generic inference resolves to never
    await query.update(updates).eq('id', threshold.id)
    setSaving(null)
  }

  function updateThreshold(id: string, field: string, value: string | number) {
    setThresholds((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  if (profileLoading || loading) {
    return <div className="animate-pulse text-gray-400">Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Admin access required</p>
        <p className="text-sm text-gray-500 mt-1">Only admins can manage thresholds.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory Thresholds</h1>
      <p className="text-sm text-gray-600">
        Configure stock level alerts. When inventory drops below these levels, email notifications
        are sent automatically.
      </p>

      <div className="space-y-4">
        {thresholds.map((t) => (
          <div key={t.id} className="bg-white shadow rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">
              {CATEGORY_LABELS[t.category as InventoryCategory]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-green-700 font-medium">Green (Good)</label>
                <input
                  type="number"
                  min="0"
                  value={t.green_threshold}
                  onChange={(e) => updateThreshold(t.id, 'green_threshold', Number(e.target.value))}
                  className="mt-1 block w-full rounded border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-yellow-700 font-medium">Yellow (Bake)</label>
                <input
                  type="number"
                  min="0"
                  value={t.yellow_threshold}
                  onChange={(e) =>
                    updateThreshold(t.id, 'yellow_threshold', Number(e.target.value))
                  }
                  className="mt-1 block w-full rounded border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-red-700 font-medium">Red (Reserve)</label>
                <input
                  type="number"
                  min="0"
                  value={t.red_threshold}
                  onChange={(e) => updateThreshold(t.id, 'red_threshold', Number(e.target.value))}
                  className="mt-1 block w-full rounded border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-medium">Reserve Label</label>
                <input
                  type="text"
                  value={t.reserve_label || ''}
                  onChange={(e) => updateThreshold(t.id, 'reserve_label', e.target.value)}
                  placeholder="e.g., Brother Charlie's"
                  className="mt-1 block w-full rounded border-gray-300 text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => handleSave(t)}
              disabled={saving === t.id}
              className="mt-3 rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving === t.id ? 'Saving...' : 'Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
