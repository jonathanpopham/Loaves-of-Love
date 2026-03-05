import { NextRequest } from 'next/server'

const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockOrder = jest.fn()
const mockSingle = jest.fn()
const mockEq = jest.fn()
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

import { GET, POST } from '@/app/api/announcements/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/announcements', () => {
  it('returns announcements sorted by pinned then date', async () => {
    const announcements = [
      { id: '1', title: 'Pinned', pinned: true },
      { id: '2', title: 'Recent', pinned: false },
    ]
    const mockOrder2 = jest.fn()
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ order: mockOrder2 })
    mockOrder2.mockResolvedValue({ data: announcements, error: null })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toHaveLength(2)
    expect(mockOrder).toHaveBeenCalledWith('pinned', { ascending: false })
    expect(mockOrder2).toHaveBeenCalledWith('created_at', { ascending: false })
  })
})

describe('POST /api/announcements', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await POST(
      makeRequest('http://localhost/api/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', body: 'Test body' }),
      })
    )
    expect(res.status).toBe(401)
  })

  it('returns 400 when title or body missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const res = await POST(
      makeRequest('http://localhost/api/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: 'No body' }),
      })
    )
    expect(res.status).toBe(400)
  })

  it('creates announcement without pin for non-admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // First call: announcements table for insert
    mockFrom.mockReturnValueOnce({ select: mockSelect, insert: mockInsert })
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({ single: mockSingle }),
    })
    mockSingle.mockResolvedValue({
      data: { id: '1', title: 'News', pinned: false },
      error: null,
    })

    const res = await POST(
      makeRequest('http://localhost/api/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: 'News', body: 'Some news' }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.pinned).toBe(false)
  })

  it('allows admin to pin an announcement', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })

    // Profile fetch for pin check
    const profileSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
    })
    mockFrom
      .mockReturnValueOnce({ select: profileSelect, insert: mockInsert })
      .mockReturnValueOnce({ select: mockSelect, insert: mockInsert })

    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({ single: mockSingle }),
    })
    mockSingle.mockResolvedValue({
      data: { id: '1', title: 'Urgent', pinned: true },
      error: null,
    })

    const res = await POST(
      makeRequest('http://localhost/api/announcements', {
        method: 'POST',
        body: JSON.stringify({ title: 'Urgent', body: 'Need loaves ASAP', pinned: true }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ pinned: true }))
  })
})
