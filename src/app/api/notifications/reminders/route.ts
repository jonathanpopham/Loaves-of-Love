import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/notifications/reminders
 * Triggered by Vercel cron (daily). Protected by CRON_SECRET.
 * Finds assignments due within 24 hours and emails assignees.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  // Find assignments due within 24 hours that aren't completed
  const { data: assignments } = (await supabase
    .from('assignments')
    .select('id, description, assigned_to, due_date')
    .neq('status', 'completed')
    .not('assigned_to', 'is', null)
    .not('due_date', 'is', null)
    .lte('due_date', tomorrow.toISOString().split('T')[0])
    .gte('due_date', now.toISOString().split('T')[0])) as unknown as {
    data: { id: string; description: string; assigned_to: string; due_date: string }[] | null
  }

  if (!assignments || assignments.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No upcoming assignments' })
  }

  // Check which assignees have reminders enabled
  const assigneeIds = Array.from(new Set(assignments.map((a) => a.assigned_to)))
  const { data: prefs } = (await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('assignment_reminders', true)
    .in('user_id', assigneeIds)) as unknown as { data: { user_id: string }[] | null }

  const enabledUserIds = new Set(prefs?.map((p) => p.user_id) ?? [])
  const toNotify = assignments.filter((a) => enabledUserIds.has(a.assigned_to))

  // In production, send emails via Resend
  // For now, return what would be sent
  return NextResponse.json({
    sent: toNotify.length,
    assignments: toNotify.map((a) => ({
      id: a.id,
      description: a.description,
      due_date: a.due_date,
    })),
  })
}
