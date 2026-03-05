import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/types/database'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('announcements')
    .select('*, author:author_id(display_name)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, body: announcementBody, pinned } = body

  if (!title || !announcementBody) {
    return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
  }

  // Only admin can pin
  let isPinned = false
  if (pinned) {
    const { data: profile } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()) as unknown as { data: { role: string } | null }
    isPinned = profile?.role === 'admin'
  }

  const row: TablesInsert<'announcements'> = {
    title,
    body: announcementBody,
    author_id: user.id,
    pinned: isPinned,
  }

  const { data, error } = await supabase
    .from('announcements')
    // @ts-expect-error -- Supabase v2.98 generic inference
    .insert(row)
    .select('*, author:author_id(display_name)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
