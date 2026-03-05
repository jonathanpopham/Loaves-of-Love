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

import { GET, PATCH, DELETE } from '@/app/api/recipes/[id]/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

const paramsPromise = (id: string) => Promise.resolve({ id })

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/recipes/[id]', () => {
  it('returns a recipe by id', async () => {
    const recipe = { id: 'abc', title: 'Sourdough', ingredients: ['flour', 'water'] }
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: recipe, error: null })

    const res = await GET(makeRequest('http://localhost/api/recipes/abc'), {
      params: paramsPromise('abc'),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.title).toBe('Sourdough')
    expect(mockEq).toHaveBeenCalledWith('id', 'abc')
  })

  it('returns 404 when recipe not found', async () => {
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const res = await GET(makeRequest('http://localhost/api/recipes/bad'), {
      params: paramsPromise('bad'),
    })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe('Not found')
  })
})

describe('PATCH /api/recipes/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await PATCH(
      makeRequest('http://localhost/api/recipes/abc', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      }),
      { params: paramsPromise('abc') }
    )

    expect(res.status).toBe(401)
  })

  it('updates allowed fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({
      data: { id: 'abc', title: 'Updated Title' },
      error: null,
    })

    const res = await PATCH(
      makeRequest('http://localhost/api/recipes/abc', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title', malicious_field: 'ignored' }),
      }),
      { params: paramsPromise('abc') }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.title).toBe('Updated Title')
    // Should only update allowed fields
    expect(mockUpdate).toHaveBeenCalledWith({ title: 'Updated Title' })
  })

  it('returns 500 on update error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Update failed' } })

    const res = await PATCH(
      makeRequest('http://localhost/api/recipes/abc', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'X' }),
      }),
      { params: paramsPromise('abc') }
    )

    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/recipes/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await DELETE(
      makeRequest('http://localhost/api/recipes/abc', { method: 'DELETE' }),
      {
        params: paramsPromise('abc'),
      }
    )

    expect(res.status).toBe(401)
  })

  it('deletes a recipe', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: null })

    const res = await DELETE(
      makeRequest('http://localhost/api/recipes/abc', { method: 'DELETE' }),
      {
        params: paramsPromise('abc'),
      }
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockEq).toHaveBeenCalledWith('id', 'abc')
  })

  it('returns 500 on delete error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockEq.mockResolvedValue({ error: { message: 'Delete failed' } })

    const res = await DELETE(
      makeRequest('http://localhost/api/recipes/abc', { method: 'DELETE' }),
      {
        params: paramsPromise('abc'),
      }
    )
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Delete failed')
  })
})
