'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useProfile } from '@/lib/hooks/use-profile'
import CommentSection from '@/components/CommentSection'
import {
  DESTINATION_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  isValidStatusTransition,
} from '@/lib/assignments'
import type { AssignmentStatus, DeliveryDestination } from '@/types/database'

interface AssignmentDetail {
  id: string
  description: string
  status: AssignmentStatus
  due_date: string | null
  delivery_destination: DeliveryDestination | null
  delivery_notes: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  assigned_profile: { display_name: string } | null
  creator_profile: { display_name: string } | null
}

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { profile, isAdmin } = useProfile()
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAssignment() {
      const res = await fetch(`/api/assignments/${id}`)
      if (res.ok) setAssignment(await res.json())
      setLoading(false)
    }
    fetchAssignment()
  }, [id])

  async function handleStatusChange(newStatus: AssignmentStatus) {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setAssignment((prev) => (prev ? { ...prev, ...updated } : prev))
    }
  }

  async function handleClaim() {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: true }),
    })
    if (res.ok) {
      const updated = await res.json()
      setAssignment((prev) => (prev ? { ...prev, ...updated } : prev))
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this assignment?')) return
    const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/assignments')
  }

  if (loading) return <div className="animate-pulse text-gray-400">Loading...</div>
  if (!assignment) return <div className="text-red-600">Assignment not found.</div>

  const canDelete = isAdmin || assignment.created_by === profile?.id
  const canClaim = assignment.status === 'open' && !assignment.assigned_to
  const canProgress =
    assignment.status === 'open' && isValidStatusTransition(assignment.status, 'in_progress')
  const canComplete = isValidStatusTransition(assignment.status, 'completed')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{assignment.description}</h1>
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
        <div className="flex flex-wrap gap-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[assignment.status]}`}
          >
            {STATUS_LABELS[assignment.status]}
          </span>
          {assignment.delivery_destination && (
            <span className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700">
              {DESTINATION_LABELS[assignment.delivery_destination]}
            </span>
          )}
        </div>

        {assignment.due_date && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Due:</span>{' '}
            {new Date(assignment.due_date).toLocaleDateString()}
          </p>
        )}

        {assignment.assigned_profile?.display_name && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Assigned to:</span>{' '}
            {assignment.assigned_profile.display_name}
          </p>
        )}

        {assignment.creator_profile?.display_name && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Created by:</span>{' '}
            {assignment.creator_profile.display_name}
          </p>
        )}

        {assignment.delivery_notes && (
          <div>
            <p className="text-sm font-medium text-gray-700">Delivery Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{assignment.delivery_notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {canClaim && (
            <button
              onClick={handleClaim}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Claim This Assignment
            </button>
          )}
          {canProgress && !canClaim && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
            >
              Start Working
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <CommentSection parentType="assignment" parentId={id} />
      </div>

      <button
        onClick={() => router.push('/assignments')}
        className="text-sm text-brand-600 hover:underline"
      >
        &larr; Back to Assignments
      </button>
    </div>
  )
}
