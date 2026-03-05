import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidStatusTransition } from '@/lib/assignments'
import type { AssignmentStatus } from '@/types/database'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assignments')
    .select(
      '*, assigned_profile:assigned_to(display_name), creator_profile:created_by(display_name)'
    )
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, unknown> = {}

  for (const key of [
    'description',
    'due_date',
    'delivery_destination',
    'delivery_notes',
    'assigned_to',
  ]) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  // Handle status transitions
  if (body.status) {
    // Fetch current status to validate transition
    const { data: current } = (await supabase
      .from('assignments')
      .select('status')
      .eq('id', id)
      .single()) as unknown as { data: { status: AssignmentStatus } | null }

    if (current && !isValidStatusTransition(current.status, body.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${current.status} to ${body.status}` },
        { status: 400 }
      )
    }
    updates.status = body.status
  }

  // Handle claim action
  if (body.claim) {
    updates.assigned_to = user.id
    if (!body.status) updates.status = 'in_progress'
  }

  const query = supabase.from('assignments')
  // @ts-expect-error -- Supabase v2.98 generic inference
  const { data, error } = await query.update(updates).eq('id', id).select().single()
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

  const { error } = await supabase.from('assignments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
