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

import { GET, POST } from '@/app/api/assignments/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/assignments', () => {
  it('returns all assignments ordered by due_date', async () => {
    const assignments = [{ id: '1', description: 'Bake loaves', status: 'open' }]
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: assignments, error: null })

    const res = await GET(makeRequest('http://localhost/api/assignments'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(mockFrom).toHaveBeenCalledWith('assignments')
  })

  it('filters by status', async () => {
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ data: [], error: null })

    const res = await GET(makeRequest('http://localhost/api/assignments?status=open'))
    expect(res.status).toBe(200)
    expect(mockEq).toHaveBeenCalledWith('status', 'open')
  })

  it('filters by destination', async () => {
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ data: [], error: null })

    const res = await GET(makeRequest('http://localhost/api/assignments?destination=ruths_cottage'))
    expect(res.status).toBe(200)
    expect(mockEq).toHaveBeenCalledWith('delivery_destination', 'ruths_cottage')
  })

  it('filters by assignee', async () => {
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ data: [], error: null })

    const res = await GET(makeRequest('http://localhost/api/assignments?assignee=user-1'))
    expect(res.status).toBe(200)
    expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-1')
  })

  it('returns 500 on database error', async () => {
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const res = await GET(makeRequest('http://localhost/api/assignments'))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/assignments', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(
      makeRequest('http://localhost/api/assignments', {
        method: 'POST',
        body: JSON.stringify({ description: 'Test' }),
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when description is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const res = await POST(
      makeRequest('http://localhost/api/assignments', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    )
    expect(res.status).toBe(400)
  })

  it('creates an assignment with status open when no assignee', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) })
    mockSingle.mockResolvedValue({
      data: { id: 'new-1', description: 'Bake loaves', status: 'open' },
      error: null,
    })

    const res = await POST(
      makeRequest('http://localhost/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Bake loaves',
          delivery_destination: 'ruths_cottage',
        }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.status).toBe('open')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Bake loaves',
        status: 'open',
        created_by: 'user-1',
      })
    )
  })

  it('sets status to in_progress when assigned_to is provided', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) })
    mockSingle.mockResolvedValue({
      data: { id: 'new-1', description: 'Bake', status: 'in_progress', assigned_to: 'user-1' },
      error: null,
    })

    const res = await POST(
      makeRequest('http://localhost/api/assignments', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Bake',
          assigned_to: 'user-1',
        }),
      })
    )

    expect(res.status).toBe(201)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'in_progress',
        assigned_to: 'user-1',
      })
    )
  })
})
