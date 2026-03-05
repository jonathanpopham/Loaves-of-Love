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

import { PATCH, DELETE } from '@/app/api/comments/[id]/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

const paramsPromise = (id: string) => Promise.resolve({ id })

beforeEach(() => {
  jest.clearAllMocks()
})

describe('PATCH /api/comments/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await PATCH(
      makeRequest('http://localhost/api/comments/c1', {
        method: 'PATCH',
        body: JSON.stringify({ body: 'updated' }),
      }),
      { params: paramsPromise('c1') }
    )
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is not the author', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-2' } } })

    // Mock fetching the comment to check authorship
    const commentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { author_id: 'user-1' },
          error: null,
        }),
      }),
    })
    mockFrom.mockReturnValueOnce({
      select: commentSelect,
      update: mockUpdate,
      delete: mockDelete,
    })

    const res = await PATCH(
      makeRequest('http://localhost/api/comments/c1', {
        method: 'PATCH',
        body: JSON.stringify({ body: 'updated' }),
      }),
      { params: paramsPromise('c1') }
    )
    expect(res.status).toBe(403)
  })

  it('updates comment when user is the author', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // Mock fetching the comment
    const commentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { author_id: 'user-1' },
          error: null,
        }),
      }),
    })
    mockFrom
      .mockReturnValueOnce({
        select: commentSelect,
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
      data: { id: 'c1', body: 'updated text' },
      error: null,
    })

    const res = await PATCH(
      makeRequest('http://localhost/api/comments/c1', {
        method: 'PATCH',
        body: JSON.stringify({ body: 'updated text' }),
      }),
      { params: paramsPromise('c1') }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.body).toBe('updated text')
  })
})

describe('DELETE /api/comments/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await DELETE(
      makeRequest('http://localhost/api/comments/c1', { method: 'DELETE' }),
      { params: paramsPromise('c1') }
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 when comment not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const commentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    })
    mockFrom.mockReturnValueOnce({
      select: commentSelect,
      update: mockUpdate,
      delete: mockDelete,
    })

    const res = await DELETE(
      makeRequest('http://localhost/api/comments/c1', { method: 'DELETE' }),
      { params: paramsPromise('c1') }
    )
    expect(res.status).toBe(404)
  })

  it('returns 403 when not author and not admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-2' } } })

    // Comment fetch
    const commentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { author_id: 'user-1' },
          error: null,
        }),
      }),
    })
    // Profile fetch
    const profileSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { role: 'baker' },
          error: null,
        }),
      }),
    })

    mockFrom
      .mockReturnValueOnce({
        select: commentSelect,
        update: mockUpdate,
        delete: mockDelete,
      })
      .mockReturnValueOnce({
        select: profileSelect,
        update: mockUpdate,
        delete: mockDelete,
      })

    const res = await DELETE(
      makeRequest('http://localhost/api/comments/c1', { method: 'DELETE' }),
      { params: paramsPromise('c1') }
    )
    expect(res.status).toBe(403)
  })

  it('allows admin to delete any comment', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } })

    // Comment fetch
    const commentSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { author_id: 'user-1' },
          error: null,
        }),
      }),
    })
    // Profile fetch — admin
    const profileSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      }),
    })
    // Delete
    const deleteMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })

    mockFrom
      .mockReturnValueOnce({
        select: commentSelect,
        update: mockUpdate,
        delete: deleteMock,
      })
      .mockReturnValueOnce({
        select: profileSelect,
        update: mockUpdate,
        delete: deleteMock,
      })
      .mockReturnValueOnce({
        select: mockSelect,
        update: mockUpdate,
        delete: deleteMock,
      })

    const res = await DELETE(
      makeRequest('http://localhost/api/comments/c1', { method: 'DELETE' }),
      { params: paramsPromise('c1') }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
