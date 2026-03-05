import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const destination = searchParams.get('destination')
  const assignee = searchParams.get('assignee')

  let query = supabase
    .from('assignments')
    .select(
      '*, assigned_profile:assigned_to(display_name), creator_profile:created_by(display_name)'
    )
    .order('due_date', { ascending: true, nullsFirst: false })

  if (status) {
    query = query.eq('status', status)
  }
  if (destination) {
    query = query.eq('delivery_destination', destination)
  }
  if (assignee) {
    query = query.eq('assigned_to', assignee)
  }

  const { data, error } = await query
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
  const { description, due_date, delivery_destination, delivery_notes, assigned_to } = body

  if (!description) return NextResponse.json({ error: 'Description is required' }, { status: 400 })

  const row: TablesInsert<'assignments'> = {
    description,
    due_date: due_date || null,
    delivery_destination: delivery_destination || null,
    delivery_notes: delivery_notes || null,
    assigned_to: assigned_to || null,
    status: assigned_to ? 'in_progress' : 'open',
    created_by: user.id,
  }

  // @ts-expect-error -- Supabase v2.98 generic inference
  const { data, error } = await supabase.from('assignments').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
