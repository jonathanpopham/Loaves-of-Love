import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let query = supabase
    .from('recipes')
    .select('*, profiles:created_by(display_name)')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }
  if (search) {
    query = query.ilike('title', `%${search}%`)
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
  const { title, description, ingredients, instructions, photo_url } = body

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const row: TablesInsert<'recipes'> = {
    title,
    description: description || null,
    ingredients: ingredients || null,
    instructions: instructions || null,
    photo_url: photo_url || null,
    created_by: user.id,
  }

  // @ts-expect-error -- Supabase v2.98 generic inference
  const { data, error } = await supabase.from('recipes').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
