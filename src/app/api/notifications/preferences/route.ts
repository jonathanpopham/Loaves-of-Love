import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Try to get existing preferences
  const { data } = (await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()) as unknown as { data: Record<string, unknown> | null }

  if (data) return NextResponse.json(data)

  // Auto-create with defaults
  const defaults = {
    user_id: user.id,
    threshold_alerts: true,
    comment_replies: true,
    assignment_reminders: true,
    weekly_digest: true,
  }
  const { data: created, error } = (await supabase
    .from('notification_preferences')
    // @ts-expect-error -- Supabase v2.98 generic inference
    .insert(defaults)
    .select()
    .single()) as unknown as { data: Record<string, unknown> | null; error: unknown }

  if (error) return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 })
  return NextResponse.json(created)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, boolean> = {}

  for (const key of [
    'threshold_alerts',
    'comment_replies',
    'assignment_reminders',
    'weekly_digest',
  ]) {
    if (typeof body[key] === 'boolean') updates[key] = body[key]
  }

  const query = supabase.from('notification_preferences')
  // @ts-expect-error -- Supabase v2.98 generic inference
  const { data, error } = await query.update(updates).eq('user_id', user.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
