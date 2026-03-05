'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useProfile } from '@/lib/hooks/use-profile'
import CommentSection from '@/components/CommentSection'

interface AnnouncementDetail {
  id: string
  title: string
  body: string
  pinned: boolean
  author_id: string | null
  created_at: string
  author: { display_name: string } | null
}

export default function AnnouncementDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { profile, isAdmin } = useProfile()
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncement() {
      const res = await fetch(`/api/announcements/${id}`)
      if (res.ok) setAnnouncement(await res.json())
      setLoading(false)
    }
    fetchAnnouncement()
  }, [id])

  async function handleDelete() {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    if (res.ok) router.push('/announcements')
  }

  async function handleTogglePin() {
    if (!announcement) return
    const res = await fetch(`/api/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !announcement.pinned }),
    })
    if (res.ok) {
      setAnnouncement((prev) => (prev ? { ...prev, pinned: !prev.pinned } : prev))
    }
  }

  if (loading) return <div className="animate-pulse text-gray-400">Loading...</div>
  if (!announcement) return <div className="text-red-600">Announcement not found.</div>

  const canDelete = isAdmin || announcement.author_id === profile?.id

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
          {announcement.pinned && (
            <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Pinned
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={handleTogglePin}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              {announcement.pinned ? 'Unpin' : 'Pin'}
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-sm text-gray-500 mb-4">
          {announcement.author?.display_name && `${announcement.author.display_name} · `}
          {new Date(announcement.created_at).toLocaleDateString()}
        </p>
        <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">{announcement.body}</div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <CommentSection parentType="announcement" parentId={id} />
      </div>

      <button
        onClick={() => router.push('/announcements')}
        className="text-sm text-brand-600 hover:underline"
      >
        &larr; Back to Announcements
      </button>
    </div>
  )
}
