'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useProfile } from '@/lib/hooks/use-profile'
import { DESTINATION_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/lib/assignments'
import type { AssignmentStatus, DeliveryDestination } from '@/types/database'

interface AssignmentRow {
  id: string
  description: string
  status: AssignmentStatus
  due_date: string | null
  delivery_destination: DeliveryDestination | null
  assigned_to: string | null
  created_by: string | null
  assigned_profile: { display_name: string } | null
  creator_profile: { display_name: string } | null
}

export default function AssignmentsPage() {
  const { profile } = useProfile()
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [destFilter, setDestFilter] = useState<string>('')
  const [showMine, setShowMine] = useState(false)

  useEffect(() => {
    async function fetchAssignments() {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (destFilter) params.set('destination', destFilter)
      if (showMine && profile?.id) params.set('assignee', profile.id)
      const res = await fetch(`/api/assignments?${params}`)
      if (res.ok) setAssignments(await res.json())
      setLoading(false)
    }
    fetchAssignments()
  }, [statusFilter, destFilter, showMine, profile?.id])

  async function handleClaim(id: string) {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: true }),
    })
    if (res.ok) {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'in_progress', assigned_to: profile?.id ?? null } : a
        )
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <Link
          href="/assignments/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Create Assignment
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={destFilter}
          onChange={(e) => setDestFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All Destinations</option>
          {Object.entries(DESTINATION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showMine}
            onChange={(e) => setShowMine(e.target.checked)}
            className="rounded border-gray-300"
          />
          My assignments only
        </label>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-400">Loading...</div>
      ) : assignments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No assignments found.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white shadow rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <Link
                  href={`/assignments/${a.id}`}
                  className="font-medium text-gray-900 hover:text-brand-600"
                >
                  {a.description}
                </Link>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-medium ${STATUS_COLORS[a.status]}`}
                  >
                    {STATUS_LABELS[a.status]}
                  </span>
                  {a.delivery_destination && (
                    <span>{DESTINATION_LABELS[a.delivery_destination]}</span>
                  )}
                  {a.due_date && <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                  {a.assigned_profile?.display_name && (
                    <span>Assigned: {a.assigned_profile.display_name}</span>
                  )}
                </div>
              </div>
              {a.status === 'open' && !a.assigned_to && (
                <button
                  onClick={() => handleClaim(a.id)}
                  className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
                >
                  Claim
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
