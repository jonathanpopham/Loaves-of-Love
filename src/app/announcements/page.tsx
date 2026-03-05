'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Announcement {
  id: string
  title: string
  body: string
  pinned: boolean
  created_at: string
  author: { display_name: string } | null
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      const res = await fetch('/api/announcements')
      if (res.ok) setAnnouncements(await res.json())
      setLoading(false)
    }
    fetchAnnouncements()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <Link
          href="/announcements/new"
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          New Announcement
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-400">Loading...</div>
      ) : announcements.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No announcements yet.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Link
              key={a.id}
              href={`/announcements/${a.id}`}
              className="block bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                {a.pinned && (
                  <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Pinned
                  </span>
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{a.title}</h2>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{a.body}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {a.author?.display_name && `${a.author.display_name} · `}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
