'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/lib/hooks/use-profile'
import { DESTINATION_LABELS } from '@/lib/assignments'

export default function NewAssignmentPage() {
  const router = useRouter()
  const { profile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [assignToSelf, setAssignToSelf] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const body = {
      description: form.get('description'),
      due_date: form.get('due_date') || null,
      delivery_destination: form.get('delivery_destination') || null,
      delivery_notes: form.get('delivery_notes') || null,
      assigned_to: assignToSelf ? profile?.id : null,
    }

    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/assignments')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create assignment')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Assignment</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            placeholder="e.g., Bake 12 sourdough loaves for Ruth's Cottage"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="delivery_destination" className="block text-sm font-medium text-gray-700">
            Delivery Destination
          </label>
          <select
            id="delivery_destination"
            name="delivery_destination"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          >
            <option value="">Select destination...</option>
            {Object.entries(DESTINATION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="delivery_notes" className="block text-sm font-medium text-gray-700">
            Delivery Notes
          </label>
          <textarea
            id="delivery_notes"
            name="delivery_notes"
            rows={2}
            placeholder="Special instructions, contact info, etc."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={assignToSelf}
            onChange={(e) => setAssignToSelf(e.target.checked)}
            className="rounded border-gray-300"
          />
          Assign to myself
        </label>

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
            {loading ? 'Creating...' : 'Create Assignment'}
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
