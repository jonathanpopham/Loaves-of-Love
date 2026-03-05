'use client'

import { useEffect, useState } from 'react'

interface Preferences {
  threshold_alerts: boolean
  comment_replies: boolean
  assignment_reminders: boolean
  weekly_digest: boolean
}

const PREF_LABELS: Record<keyof Preferences, { label: string; description: string }> = {
  threshold_alerts: {
    label: 'Threshold Alerts',
    description: 'Get notified when inventory drops below threshold levels',
  },
  comment_replies: {
    label: 'Comment Replies',
    description: 'Get notified when someone comments on an item you commented on',
  },
  assignment_reminders: {
    label: 'Assignment Reminders',
    description: 'Get reminded when your assignments are due within 24 hours',
  },
  weekly_digest: {
    label: 'Weekly Digest',
    description: 'Receive a weekly summary of ministry activity',
  },
}

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchPrefs() {
      const res = await fetch('/api/notifications/preferences')
      if (res.ok) {
        const data = await res.json()
        setPrefs({
          threshold_alerts: data.threshold_alerts,
          comment_replies: data.comment_replies,
          assignment_reminders: data.assignment_reminders,
          weekly_digest: data.weekly_digest,
        })
      }
      setLoading(false)
    }
    fetchPrefs()
  }, [])

  async function handleToggle(key: keyof Preferences) {
    if (!prefs) return
    setSaving(true)
    const updated = { ...prefs, [key]: !prefs[key] }

    const res = await fetch('/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: updated[key] }),
    })

    if (res.ok) setPrefs(updated)
    setSaving(false)
  }

  if (loading) return <div className="animate-pulse text-gray-400">Loading...</div>
  if (!prefs) return <div className="text-red-600">Failed to load preferences.</div>

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
      <p className="text-sm text-gray-600">Choose which email notifications you receive.</p>

      <div className="bg-white shadow rounded-lg divide-y">
        {(Object.keys(PREF_LABELS) as (keyof Preferences)[]).map((key) => (
          <div key={key} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-gray-900">{PREF_LABELS[key].label}</p>
              <p className="text-sm text-gray-500">{PREF_LABELS[key].description}</p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                prefs[key] ? 'bg-brand-600' : 'bg-gray-300'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  prefs[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
