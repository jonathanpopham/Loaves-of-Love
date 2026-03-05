import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/notifications/digest
 * Triggered by Vercel cron (weekly). Protected by CRON_SECRET.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get users with weekly_digest enabled
  const { data: prefs } = (await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('weekly_digest', true)) as unknown as { data: { user_id: string }[] | null }

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No users with digest enabled' })
  }

  // Get summary data for the past week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [inventoryResult, assignmentsResult, announcementsResult] = await Promise.all([
    supabase.from('inventory_items').select('category, quantity'),
    supabase.from('assignments').select('*').in('status', ['open', 'in_progress']),
    supabase.from('announcements').select('id').gte('created_at', oneWeekAgo),
  ])

  const summary = {
    inventoryItems: inventoryResult.data?.length ?? 0,
    openAssignments: assignmentsResult.data?.length ?? 0,
    newAnnouncements: announcementsResult.data?.length ?? 0,
    recipientCount: prefs.length,
  }

  // In production, this would loop through prefs and send emails via Resend
  // For now, return the summary showing what would be sent
  return NextResponse.json({ sent: prefs.length, summary })
}
