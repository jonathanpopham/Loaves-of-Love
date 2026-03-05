import {
  getFreshnessStatus,
  getThresholdStatus,
  CATEGORY_LABELS,
  DEFAULT_FRESHNESS_DAYS,
} from '@/lib/inventory'

describe('getFreshnessStatus', () => {
  it('returns "unknown" when bakedDate is null', () => {
    expect(getFreshnessStatus(null, 5)).toBe('unknown')
  })

  it('returns "unknown" when freshnessDays is null', () => {
    expect(getFreshnessStatus('2026-01-01', null)).toBe('unknown')
  })

  it('returns "unknown" when both are null', () => {
    expect(getFreshnessStatus(null, null)).toBe('unknown')
  })

  it('returns "fresh" when within freshness window', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(getFreshnessStatus(today, 5)).toBe('fresh')
  })

  it('returns "expired" when past freshness window', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    expect(getFreshnessStatus(thirtyDaysAgo, 5)).toBe('expired')
  })

  it('returns "expiring_soon" when in last 20% of window', () => {
    // 10-day window, baked 9 days ago = 90% through = expiring soon
    const nineDaysAgo = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    expect(getFreshnessStatus(nineDaysAgo, 10)).toBe('expiring_soon')
  })

  it('returns "fresh" when at exactly 79% of window', () => {
    // 100-day window, baked 79 days ago = 79% through = still fresh
    const seventyNineDaysAgo = new Date(Date.now() - 79 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    expect(getFreshnessStatus(seventyNineDaysAgo, 100)).toBe('fresh')
  })
})

describe('getThresholdStatus', () => {
  it('returns "green" when quantity >= green threshold', () => {
    expect(getThresholdStatus(30, 30, 24)).toBe('green')
    expect(getThresholdStatus(50, 30, 24)).toBe('green')
  })

  it('returns "yellow" when quantity >= yellow but < green', () => {
    expect(getThresholdStatus(24, 30, 24)).toBe('yellow')
    expect(getThresholdStatus(29, 30, 24)).toBe('yellow')
  })

  it('returns "red" when quantity < yellow threshold', () => {
    expect(getThresholdStatus(23, 30, 24)).toBe('red')
    expect(getThresholdStatus(8, 30, 24)).toBe('red')
    expect(getThresholdStatus(0, 30, 24)).toBe('red')
  })

  // Meeting notes: 30 = good, 24 = time to bake, 8 = Brother Charlie's reserve
  it('matches meeting notes thresholds for loaves', () => {
    expect(getThresholdStatus(30, 30, 24)).toBe('green') // "we're good"
    expect(getThresholdStatus(24, 30, 24)).toBe('yellow') // "time to bake"
    expect(getThresholdStatus(8, 30, 24)).toBe('red') // Brother Charlie's reserve
  })
})

describe('CATEGORY_LABELS', () => {
  it('has labels for all five categories', () => {
    expect(CATEGORY_LABELS.loaves).toBe('Loaves')
    expect(CATEGORY_LABELS.cookies).toBe('Cookies')
    expect(CATEGORY_LABELS.coffee_cakes).toBe('Coffee Cakes')
    expect(CATEGORY_LABELS.emergency_bags).toBe('Emergency Bags')
    expect(CATEGORY_LABELS.bake_sale).toBe('Bake Sale')
  })
})

describe('DEFAULT_FRESHNESS_DAYS', () => {
  it('has defaults for all five categories', () => {
    expect(DEFAULT_FRESHNESS_DAYS.loaves).toBe(5)
    expect(DEFAULT_FRESHNESS_DAYS.cookies).toBe(14)
    expect(DEFAULT_FRESHNESS_DAYS.coffee_cakes).toBe(7)
    expect(DEFAULT_FRESHNESS_DAYS.emergency_bags).toBe(90)
    expect(DEFAULT_FRESHNESS_DAYS.bake_sale).toBe(7)
  })
})
