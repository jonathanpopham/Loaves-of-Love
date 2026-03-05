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

import { GET, PATCH, DELETE } from '@/app/api/assignments/[id]/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

const paramsPromise = (id: string) => Promise.resolve({ id })

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/assignments/[id]', () => {
  it('returns an assignment by id', async () => {
    const assignment = { id: 'abc', description: 'Bake loaves', status: 'open' }
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: assignment, error: null })

    const res = await GET(makeRequest('http://localhost/api/assignments/abc'), {
      params: paramsPromise('abc'),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.description).toBe('Bake loaves')
  })

  it('returns 404 when not found', async () => {
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const res = await GET(makeRequest('http://localhost/api/assignments/bad'), {
      params: paramsPromise('bad'),
    })
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/assignments/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await PATCH(
      makeRequest('http://localhost/api/assignments/abc', {
        method: 'PATCH',
        body: JSON.stringify({ description: 'Updated' }),
      }),
      { params: paramsPromise('abc') }
    )
    expect(res.status).toBe(401)
  })

  it('rejects invalid status transition', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // Mock the current status fetch
    const statusSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { status: 'completed' },
          error: null,
        }),
      }),
    })
    mockFrom.mockReturnValueOnce({ select: statusSelect, update: mockUpdate, delete: mockDelete })

    const res = await PATCH(
      makeRequest('http://localhost/api/assignments/abc', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'open' }),
      }),
      { params: paramsPromise('abc') }
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toContain('Cannot transition')
  })

  it('handles claim action', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({
      data: { id: 'abc', assigned_to: 'user-1', status: 'in_progress' },
      error: null,
    })

    const res = await PATCH(
      makeRequest('http://localhost/api/assignments/abc', {
        method: 'PATCH',
        body: JSON.stringify({ claim: true }),
      }),
      { params: paramsPromise('abc') }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.assigned_to).toBe('user-1')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        assigned_to: 'user-1',
        status: 'in_progress',
      })
    )
  })
})

describe('DELETE /api/assignments/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await DELETE(
      makeRequest('http://localhost/api/assignments/abc', { method: 'DELETE' }),
      { params: paramsPromise('abc') }
    )
    expect(res.status).toBe(401)
  })

  it('deletes an assignment', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })

    const res = await DELETE(
      makeRequest('http://localhost/api/assignments/abc', { method: 'DELETE' }),
      { params: paramsPromise('abc') }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
