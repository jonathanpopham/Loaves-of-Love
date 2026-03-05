'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { InventoryCategory } from '@/types/database'
import {
  CATEGORY_LABELS,
  getFreshnessStatus,
  FRESHNESS_COLORS,
  THRESHOLD_COLORS,
} from '@/lib/inventory'

interface InventoryItemRow {
  id: string
  name: string
  category: InventoryCategory
  quantity: number
  baked_date: string | null
  freshness_days: number | null
}

interface SummaryItem {
  category: InventoryCategory
  quantity: number
  status: 'green' | 'yellow' | 'red'
  threshold: { green: number; yellow: number; red: number; reserveLabel: string | null } | null
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItemRow[]>([])
  const [summary, setSummary] = useState<SummaryItem[]>([])
  const [filter, setFilter] = useState<InventoryCategory | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [itemsRes, summaryRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/inventory/summary'),
      ])
      if (itemsRes.ok) setItems(await itemsRes.json())
      if (summaryRes.ok) setSummary(await summaryRes.json())
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredItems = filter ? items.filter((i) => i.category === filter) : items

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading inventory...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Link
          href="/inventory/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Add Inventory
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {summary.map((s) => {
          const colors = THRESHOLD_COLORS[s.status]
          return (
            <button
              key={s.category}
              onClick={() => setFilter(filter === s.category ? '' : s.category)}
              className={`rounded-lg p-4 text-left transition-shadow hover:shadow-md ${colors.bg} ${filter === s.category ? 'ring-2 ring-brand-500' : ''}`}
            >
              <p className={`text-sm font-medium ${colors.text}`}>{CATEGORY_LABELS[s.category]}</p>
              <p className={`text-2xl font-bold ${colors.text}`}>{s.quantity}</p>
              {s.threshold?.reserveLabel && s.status === 'red' && (
                <p className="text-xs text-red-600 mt-1">Reserve: {s.threshold.reserveLabel}</p>
              )}
            </button>
          )
        })}
      </div>

      {filter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Filtered: <strong>{CATEGORY_LABELS[filter]}</strong>
          </span>
          <button onClick={() => setFilter('')} className="text-xs text-brand-600 hover:underline">
            Clear
          </button>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Freshness
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Baked
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No inventory items{filter ? ` in ${CATEGORY_LABELS[filter]}` : ''}.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const freshness = getFreshnessStatus(item.baked_date, item.freshness_days)
                const fColors = FRESHNESS_COLORS[freshness]
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventory/${item.id}`}
                        className="text-sm font-medium text-brand-600 hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {CATEGORY_LABELS[item.category]}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${fColors.bg} ${fColors.text}`}
                      >
                        {freshness.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.baked_date ? new Date(item.baked_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
