import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only author can edit
  const { data: comment } = (await supabase
    .from('comments')
    .select('author_id')
    .eq('id', id)
    .single()) as unknown as { data: { author_id: string | null } | null }

  if (!comment || comment.author_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const query = supabase.from('comments')
  // @ts-expect-error -- Supabase v2.98 generic inference
  const { data, error } = await query.update({ body: body.body }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if author or admin
  const { data: comment } = (await supabase
    .from('comments')
    .select('author_id')
    .eq('id', id)
    .single()) as unknown as { data: { author_id: string | null } | null }

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = (await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as unknown as { data: { role: string } | null }

  const isAdmin = profile?.role === 'admin'
  if (comment.author_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
