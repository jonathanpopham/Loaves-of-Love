'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { InventoryItem } from '@/types/database'
import { CATEGORY_LABELS, getFreshnessStatus, FRESHNESS_COLORS } from '@/lib/inventory'
import { useProfile } from '@/lib/hooks/use-profile'

export default function InventoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { profile, isAdmin } = useProfile()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchItem() {
      const res = await fetch(`/api/inventory/${id}`)
      if (res.ok) {
        setItem(await res.json())
      }
      setLoading(false)
    }
    fetchItem()
  }, [id])

  async function updateQuantity(delta: number) {
    if (!item) return
    setUpdating(true)
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: item.quantity + delta }),
    })
    if (res.ok) {
      setItem(await res.json())
    }
    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this item?')) return
    const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/inventory')
    }
  }

  if (loading) {
    return <div className="animate-pulse text-gray-400">Loading...</div>
  }

  if (!item) {
    return <div className="text-red-600">Item not found.</div>
  }

  const freshness = getFreshnessStatus(item.baked_date, item.freshness_days)
  const fColors = FRESHNESS_COLORS[freshness]
  const canDelete = isAdmin || item.created_by === profile?.id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{CATEGORY_LABELS[item.category]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Freshness</p>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${fColors.bg} ${fColors.text}`}
            >
              {freshness.replace('_', ' ')}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Baked Date</p>
            <p className="font-medium">
              {item.baked_date ? new Date(item.baked_date).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Freshness Window</p>
            <p className="font-medium">
              {item.freshness_days ? `${item.freshness_days} days` : '—'}
            </p>
          </div>
        </div>

        {/* Quantity controls */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-2">Quantity</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => updateQuantity(-1)}
              disabled={updating || item.quantity <= 0}
              className="h-10 w-10 rounded-full border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30"
            >
              -
            </button>
            <span className="text-3xl font-bold text-gray-900 min-w-[3rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(1)}
              disabled={updating}
              className="h-10 w-10 rounded-full border border-gray-300 text-lg font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/inventory')}
        className="text-sm text-brand-600 hover:underline"
      >
        &larr; Back to Inventory
      </button>
    </div>
  )
}
