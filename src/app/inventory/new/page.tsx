'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { InventoryCategory } from '@/types/database'
import { CATEGORY_LABELS, DEFAULT_FRESHNESS_DAYS } from '@/lib/inventory'

const categories = Object.keys(CATEGORY_LABELS) as InventoryCategory[]

export default function NewInventoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const category = form.get('category') as InventoryCategory

    const body = {
      name: form.get('name'),
      category,
      quantity: Number(form.get('quantity')) || 0,
      baked_date: form.get('baked_date') || new Date().toISOString().split('T')[0],
      freshness_days: Number(form.get('freshness_days')) || DEFAULT_FRESHNESS_DAYS[category],
    }

    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/inventory')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create item')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Inventory</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Item Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g., Sourdough Loaves"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            defaultValue={0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="baked_date" className="block text-sm font-medium text-gray-700">
            Baked Date
          </label>
          <input
            id="baked_date"
            name="baked_date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="freshness_days" className="block text-sm font-medium text-gray-700">
            Freshness Window (days)
          </label>
          <input
            id="freshness_days"
            name="freshness_days"
            type="number"
            min="1"
            placeholder="Auto-set by category"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
