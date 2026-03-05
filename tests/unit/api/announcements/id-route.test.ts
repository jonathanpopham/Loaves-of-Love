import { NextRequest } from 'next/server'

const mockSelect = jest.fn()
const mockSingle = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockEq = jest.fn()
const mockGetUser = jest.fn()

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    })
  ),
}))

import { GET, PATCH, DELETE } from '@/app/api/announcements/[id]/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

const paramsPromise = (id: string) => Promise.resolve({ id })

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/announcements/[id]', () => {
  it('returns an announcement by id', async () => {
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({
      data: { id: 'a1', title: 'Test', pinned: false },
      error: null,
    })

    const res = await GET(makeRequest('http://localhost/api/announcements/a1'), {
      params: paramsPromise('a1'),
    })
    expect(res.status).toBe(200)
  })

  it('returns 404 when not found', async () => {
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const res = await GET(makeRequest('http://localhost/api/announcements/bad'), {
      params: paramsPromise('bad'),
    })
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/announcements/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await PATCH(
      makeRequest('http://localhost/api/announcements/a1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }),
      { params: paramsPromise('a1') }
    )
    expect(res.status).toBe(401)
  })

  it('returns 403 when non-admin tries to pin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // Profile fetch
    const profileSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { role: 'baker' },
          error: null,
        }),
      }),
    })
    mockFrom.mockReturnValueOnce({
      select: profileSelect,
      update: mockUpdate,
      delete: mockDelete,
    })

    const res = await PATCH(
      makeRequest('http://localhost/api/announcements/a1', {
        method: 'PATCH',
        body: JSON.stringify({ pinned: true }),
      }),
      { params: paramsPromise('a1') }
    )
    expect(res.status).toBe(403)
  })

  it('allows admin to pin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })

    const profileSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
    })
    mockFrom
      .mockReturnValueOnce({
        select: profileSelect,
        update: mockUpdate,
        delete: mockDelete,
      })
      .mockReturnValueOnce({
        select: mockSelect,
        update: mockUpdate,
        delete: mockDelete,
      })

    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({
      data: { id: 'a1', pinned: true },
      error: null,
    })

    const res = await PATCH(
      makeRequest('http://localhost/api/announcements/a1', {
        method: 'PATCH',
        body: JSON.stringify({ pinned: true }),
      }),
      { params: paramsPromise('a1') }
    )
    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/announcements/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await DELETE(
      makeRequest('http://localhost/api/announcements/a1', { method: 'DELETE' }),
      { params: paramsPromise('a1') }
    )
    expect(res.status).toBe(401)
  })

  it('deletes an announcement', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })

    const res = await DELETE(
      makeRequest('http://localhost/api/announcements/a1', { method: 'DELETE' }),
      { params: paramsPromise('a1') }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
