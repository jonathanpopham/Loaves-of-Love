import { NextRequest } from 'next/server'

const mockSelect = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()
const mockSingle = jest.fn()
const mockEq = jest.fn()
const mockGetUser = jest.fn()

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      from: mockFrom,
      auth: { getUser: mockGetUser },
    })
  ),
}))

import { GET, PATCH } from '@/app/api/notifications/preferences/route'

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init as never)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/notifications/preferences', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns existing preferences', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({
      data: {
        user_id: 'user-1',
        threshold_alerts: true,
        comment_replies: false,
        assignment_reminders: true,
        weekly_digest: true,
      },
      error: null,
    })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.comment_replies).toBe(false)
  })

  it('auto-creates preferences with defaults when none exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // First select returns null
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: null, error: null })

    // Second call for insert
    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    })
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            user_id: 'user-1',
            threshold_alerts: true,
            comment_replies: true,
            assignment_reminders: true,
            weekly_digest: true,
          },
          error: null,
        }),
      }),
    })

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.threshold_alerts).toBe(true)
    expect(body.weekly_digest).toBe(true)
  })
})

describe('PATCH /api/notifications/preferences', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const res = await PATCH(
      makeRequest('http://localhost/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ threshold_alerts: false }),
      })
    )
    expect(res.status).toBe(401)
  })

  it('updates only valid boolean fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({
      data: { threshold_alerts: false },
      error: null,
    })

    const res = await PATCH(
      makeRequest('http://localhost/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({
          threshold_alerts: false,
          malicious_field: 'ignored',
          comment_replies: 'not-a-boolean',
        }),
      })
    )

    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ threshold_alerts: false })
  })
})
