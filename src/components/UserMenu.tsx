'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/lib/hooks/use-profile'

export default function UserMenu() {
  const router = useRouter()
  const { profile, loading } = useProfile()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="h-8 w-20 animate-pulse rounded bg-brand-600" />
  }

  if (!profile) return null

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-brand-100">
        <span>{profile.display_name || profile.email}</span>
        {profile.role === 'admin' && (
          <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-medium text-amber-900">
            Admin
          </span>
        )}
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-md px-2 py-1 text-xs text-brand-200 hover:bg-brand-600 hover:text-white transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
