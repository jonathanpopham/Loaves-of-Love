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

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    async function fetchLatest() {
      const res = await fetch('/api/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.slice(0, 3))
      }
    }
    fetchLatest()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/inventory"
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-gray-900">Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Track bread, cookies, and baked goods</p>
        </Link>
        <Link
          href="/assignments"
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-gray-900">Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">Baking tasks and deliveries</p>
        </Link>
        <Link
          href="/recipes"
          className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <h2 className="font-semibold text-gray-900">Recipes</h2>
          <p className="text-sm text-gray-500 mt-1">Ministry recipe collection</p>
        </Link>
      </div>

      {announcements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Latest Announcements</h2>
            <Link href="/announcements" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <Link
                key={a.id}
                href={`/announcements/${a.id}`}
                className="block bg-white shadow rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2">
                  {a.pinned && (
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Pinned
                    </span>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{a.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.body}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
