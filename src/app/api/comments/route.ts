import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TablesInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const parentType = searchParams.get('parentType')
  const parentId = searchParams.get('parentId')

  if (!parentType || !parentId) {
    return NextResponse.json({ error: 'parentType and parentId are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*, author:author_id(display_name)')
    .eq('parent_type', parentType)
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })

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
  const { parent_type, parent_id, body: commentBody } = body

  if (!parent_type || !parent_id || !commentBody) {
    return NextResponse.json(
      { error: 'parent_type, parent_id, and body are required' },
      { status: 400 }
    )
  }

  const row: TablesInsert<'comments'> = {
    parent_type,
    parent_id,
    body: commentBody,
    author_id: user.id,
  }

  const { data, error } = await supabase
    .from('comments')
    // @ts-expect-error -- Supabase v2.98 generic inference
    .insert(row)
    .select('*, author:author_id(display_name)')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
