import { NextRequest } from 'next/server'

const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockOrder = jest.fn()
const mockEq = jest.fn()
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

import { GET, POST } from '@/app/api/comments/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/comments', () => {
  it('returns 400 when parentType or parentId missing', async () => {
    const res = await GET(makeRequest('http://localhost/api/comments'))
    expect(res.status).toBe(400)
  })

  it('returns comments filtered by parentType and parentId', async () => {
    const comments = [{ id: '1', body: 'test', created_at: '2026-01-01' }]
    const mockEq2 = jest.fn()
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq2 })
    mockEq2.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: comments, error: null })

    const res = await GET(
      makeRequest('http://localhost/api/comments?parentType=recipe&parentId=abc')
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(mockEq).toHaveBeenCalledWith('parent_type', 'recipe')
    expect(mockEq2).toHaveBeenCalledWith('parent_id', 'abc')
  })

  it('returns 500 on database error', async () => {
    const mockEq2 = jest.fn()
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ eq: mockEq2 })
    mockEq2.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const res = await GET(
      makeRequest('http://localhost/api/comments?parentType=recipe&parentId=abc')
    )
    expect(res.status).toBe(500)
  })
})

describe('POST /api/comments', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(
      makeRequest('http://localhost/api/comments', {
        method: 'POST',
        body: JSON.stringify({ parent_type: 'recipe', parent_id: 'abc', body: 'test' }),
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when required fields missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const res = await POST(
      makeRequest('http://localhost/api/comments', {
        method: 'POST',
        body: JSON.stringify({ parent_type: 'recipe' }),
      })
    )
    expect(res.status).toBe(400)
  })

  it('creates a comment and returns 201', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({ single: mockSingle }),
    })
    mockSingle.mockResolvedValue({
      data: { id: 'c1', body: 'Great bread!', author_id: 'user-1' },
      error: null,
    })

    const res = await POST(
      makeRequest('http://localhost/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          parent_type: 'recipe',
          parent_id: 'recipe-1',
          body: 'Great bread!',
        }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.body).toBe('Great bread!')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        parent_type: 'recipe',
        parent_id: 'recipe-1',
        body: 'Great bread!',
        author_id: 'user-1',
      })
    )
  })
})
