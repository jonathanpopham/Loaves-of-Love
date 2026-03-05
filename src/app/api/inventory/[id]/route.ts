import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesUpdate } from '@/types/database'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.from('inventory_items').select('*').eq('id', id).single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const updates: TablesUpdate<'inventory_items'> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.category !== undefined) updates.category = body.category
  if (body.quantity !== undefined) updates.quantity = body.quantity
  if (body.baked_date !== undefined) updates.baked_date = body.baked_date
  if (body.freshness_days !== undefined) updates.freshness_days = body.freshness_days

  const query = supabase.from('inventory_items')
  // @ts-expect-error -- Supabase v2.98 generic inference resolves to never with hand-written types
  const { data, error } = await query.update(updates).eq('id', id).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

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
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('inventory_items').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
