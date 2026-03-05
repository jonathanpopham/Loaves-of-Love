import { NextRequest } from 'next/server'

// Mock Supabase server client
const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockOrder = jest.fn()
const mockEq = jest.fn()
const mockIlike = jest.fn()
const mockSingle = jest.fn()
const mockGetUser = jest.fn()

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    })
  ),
}))

import { GET, POST } from '@/app/api/recipes/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/recipes', () => {
  it('returns all recipes ordered by created_at desc', async () => {
    const recipes = [
      { id: '1', title: 'Sourdough', created_at: '2026-01-02' },
      { id: '2', title: 'Banana Bread', created_at: '2026-01-01' },
    ]

    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: recipes, error: null })

    const res = await GET(makeRequest('http://localhost/api/recipes'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(2)
    expect(body[0].title).toBe('Sourdough')
    expect(mockFrom).toHaveBeenCalledWith('recipes')
    expect(mockSelect).toHaveBeenCalledWith('*, profiles:created_by(display_name)')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('filters by search term using ilike', async () => {
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ ilike: mockIlike })
    mockIlike.mockResolvedValue({ data: [{ id: '1', title: 'Sourdough' }], error: null })

    const res = await GET(makeRequest('http://localhost/api/recipes?search=sour'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(mockIlike).toHaveBeenCalledWith('title', '%sour%')
  })

  it('filters by category', async () => {
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ data: [], error: null })

    const res = await GET(makeRequest('http://localhost/api/recipes?category=breads'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual([])
    expect(mockEq).toHaveBeenCalledWith('category', 'breads')
  })

  it('returns 500 on database error', async () => {
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const res = await GET(makeRequest('http://localhost/api/recipes'))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('DB error')
  })
})

describe('POST /api/recipes', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(
      makeRequest('http://localhost/api/recipes', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when title is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const res = await POST(
      makeRequest('http://localhost/api/recipes', {
        method: 'POST',
        body: JSON.stringify({ description: 'no title' }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('Title is required')
  })

  it('creates a recipe and returns 201', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) })
    mockSingle.mockResolvedValue({
      data: { id: 'new-1', title: 'Challah', created_by: 'user-1' },
      error: null,
    })

    const res = await POST(
      makeRequest('http://localhost/api/recipes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Challah',
          description: 'Braided egg bread',
          ingredients: ['flour', 'eggs', 'sugar'],
          instructions: 'Mix and bake',
        }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.title).toBe('Challah')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Challah',
        description: 'Braided egg bread',
        ingredients: ['flour', 'eggs', 'sugar'],
        instructions: 'Mix and bake',
        created_by: 'user-1',
      })
    )
  })

  it('returns 500 on insert error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({ single: mockSingle }),
    })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Insert failed' } })

    const res = await POST(
      makeRequest('http://localhost/api/recipes', {
        method: 'POST',
        body: JSON.stringify({ title: 'Bad Recipe' }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Insert failed')
  })
})
