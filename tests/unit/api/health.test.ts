import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.service).toBe('loaves-of-love')
    expect(typeof body.timestamp).toBe('string')
  })

  it('returns a valid ISO timestamp', async () => {
    const response = await GET()
    const body = await response.json()
    const date = new Date(body.timestamp)
    expect(isNaN(date.getTime())).toBe(false)
  })
})
