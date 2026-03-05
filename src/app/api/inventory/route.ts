import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { InventoryCategory, TablesInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as InventoryCategory | null

  let query = supabase.from('inventory_items').select('*').order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, category, quantity, baked_date, freshness_days } = body

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
  }

  const row: TablesInsert<'inventory_items'> = {
    name,
    category,
    quantity: quantity ?? 0,
    baked_date: baked_date ?? new Date().toISOString().split('T')[0],
    freshness_days: freshness_days ?? null,
    created_by: user.id,
  }

  // @ts-expect-error -- Supabase v2.98 generic inference resolves to never with hand-written types
  const { data, error } = await supabase.from('inventory_items').insert(row).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
