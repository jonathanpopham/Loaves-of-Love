/**
 * Integration tests for RLS policy behaviour.
 *
 * These tests verify the access-control rules defined in
 * 20260304000001_rls_policies.sql by running against a real
 * Supabase local instance (supabase start).
 *
 * In CI without a local Supabase instance the tests are skipped
 * automatically (SUPABASE_URL is not set).
 */

import { test, expect } from '@playwright/test'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const hasLocalSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_KEY)

// ─── Helpers ─────────────────────────────────────────────────

async function supabaseRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any,
  method: string,
  path: string,
  options: {
    token?: string
    serviceRole?: boolean
    body?: unknown
    prefer?: string
  } = {}
) {
  const key = options.serviceRole ? SUPABASE_SERVICE_KEY! : (options.token ?? SUPABASE_ANON_KEY!)
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
  if (options.prefer) {
    headers['Prefer'] = options.prefer
  }
  return request.fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    data: options.body ? JSON.stringify(options.body) : undefined,
  })
}

// ─── Smoke-test: page still works ────────────────────────────

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Loaves of Love/)
})

// ─── RLS: unauthenticated access is denied ────────────────────

test.describe('RLS: unauthenticated access', () => {
  test.skip(!hasLocalSupabase, 'Requires local Supabase (supabase start)')

  test('unauthenticated request cannot read profiles', async ({ request }) => {
    const res = await request.fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY!}`,
      },
    })
    // Should return empty array (RLS blocks anon reads) or 401
    if (res.status() === 200) {
      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body).toHaveLength(0)
    } else {
      expect([401, 403]).toContain(res.status())
    }
  })

  test('unauthenticated request cannot read inventory_items', async ({ request }) => {
    const res = await request.fetch(`${SUPABASE_URL}/rest/v1/inventory_items?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY!}`,
      },
    })
    if (res.status() === 200) {
      const body = await res.json()
      expect(body).toHaveLength(0)
    } else {
      expect([401, 403]).toContain(res.status())
    }
  })
})

// ─── RLS: threshold seeds ─────────────────────────────────────

test.describe('RLS: inventory threshold seed data', () => {
  test.skip(!hasLocalSupabase, 'Requires local Supabase (supabase start)')

  test('loaves thresholds are seeded correctly (30/24/8)', async ({ request }) => {
    const res = await supabaseRequest(
      request as never,
      'GET',
      'inventory_thresholds?select=*&category=eq.loaves',
      { serviceRole: true }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].green_threshold).toBe(30)
    expect(body[0].yellow_threshold).toBe(24)
    expect(body[0].red_threshold).toBe(8)
    expect(body[0].reserve_label).toBe("Brother Charlie's")
  })

  test('all five inventory categories have threshold records', async ({ request }) => {
    const res = await supabaseRequest(
      request as never,
      'GET',
      'inventory_thresholds?select=category',
      { serviceRole: true }
    )
    expect(res.status()).toBe(200)
    const body = await res.json()
    const categories = body.map((r: { category: string }) => r.category)
    expect(categories).toContain('loaves')
    expect(categories).toContain('cookies')
    expect(categories).toContain('coffee_cakes')
    expect(categories).toContain('emergency_bags')
    expect(categories).toContain('bake_sale')
  })
})

// ─── RLS: baker cannot modify thresholds ─────────────────────

test.describe('RLS: baker cannot modify thresholds', () => {
  test.skip(!hasLocalSupabase, 'Requires local Supabase (supabase start)')

  /**
   * This test uses the anon key (no role claim = treated as baker).
   * A real auth token for a baker user would be needed for a full test.
   * The expectation is that the update is rejected.
   */
  test('non-admin cannot update inventory thresholds', async ({ request }) => {
    const res = await supabaseRequest(
      request as never,
      'PATCH',
      'inventory_thresholds?category=eq.loaves',
      {
        body: { green_threshold: 999 },
        prefer: 'return=representation',
      }
    )
    // Should be rejected: 401 unauthorized or 0 rows updated
    if (res.status() === 200) {
      const body = await res.json()
      // RLS blocked the update: 0 rows affected
      expect(Array.isArray(body) ? body : []).toHaveLength(0)
    } else {
      expect([401, 403]).toContain(res.status())
    }
  })
})
