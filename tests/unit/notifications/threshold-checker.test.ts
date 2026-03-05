import {
  detectThresholdCrossing,
  buildAlertEmailSubject,
  buildAlertEmailHtml,
} from '@/lib/notifications/threshold-checker'
import type { InventoryThreshold } from '@/types/database'

const loavesThreshold: InventoryThreshold = {
  id: 'test-id',
  category: 'loaves',
  green_threshold: 30,
  yellow_threshold: 24,
  red_threshold: 8,
  reserve_label: "Brother Charlie's",
  updated_by: null,
  updated_at: '2026-01-01T00:00:00Z',
}

describe('detectThresholdCrossing', () => {
  it('returns null when quantity increases', () => {
    expect(detectThresholdCrossing('loaves', 20, 25, loavesThreshold)).toBeNull()
  })

  it('returns null when quantity stays the same', () => {
    expect(detectThresholdCrossing('loaves', 25, 25, loavesThreshold)).toBeNull()
  })

  it('returns null when status does not change (stays green)', () => {
    expect(detectThresholdCrossing('loaves', 35, 31, loavesThreshold)).toBeNull()
  })

  it('returns null when status does not change (stays yellow)', () => {
    expect(detectThresholdCrossing('loaves', 28, 25, loavesThreshold)).toBeNull()
  })

  it('returns null when status does not change (stays red)', () => {
    expect(detectThresholdCrossing('loaves', 7, 5, loavesThreshold)).toBeNull()
  })

  it('detects green → yellow crossing', () => {
    const result = detectThresholdCrossing('loaves', 30, 29, loavesThreshold)
    expect(result).not.toBeNull()
    expect(result!.previousStatus).toBe('green')
    expect(result!.newStatus).toBe('yellow')
    expect(result!.quantity).toBe(29)
  })

  it('detects green → red crossing (skipping yellow)', () => {
    const result = detectThresholdCrossing('loaves', 30, 5, loavesThreshold)
    expect(result).not.toBeNull()
    expect(result!.previousStatus).toBe('green')
    expect(result!.newStatus).toBe('red')
  })

  it('detects yellow → red crossing', () => {
    const result = detectThresholdCrossing('loaves', 24, 23, loavesThreshold)
    expect(result).not.toBeNull()
    expect(result!.previousStatus).toBe('yellow')
    expect(result!.newStatus).toBe('red')
  })

  it('does not trigger on upward crossing (red → yellow)', () => {
    expect(detectThresholdCrossing('loaves', 20, 25, loavesThreshold)).toBeNull()
  })

  // Meeting notes validation
  it('triggers at exactly 29 (just below green=30)', () => {
    const result = detectThresholdCrossing('loaves', 30, 29, loavesThreshold)
    expect(result).not.toBeNull()
    expect(result!.newStatus).toBe('yellow')
  })

  it('triggers at exactly 23 (just below yellow=24)', () => {
    const result = detectThresholdCrossing('loaves', 24, 23, loavesThreshold)
    expect(result).not.toBeNull()
    expect(result!.newStatus).toBe('red')
  })
})

describe('buildAlertEmailSubject', () => {
  it('builds yellow alert subject', () => {
    const crossing = {
      category: 'loaves' as const,
      previousStatus: 'green' as const,
      newStatus: 'yellow' as const,
      quantity: 29,
      threshold: loavesThreshold,
    }
    const subject = buildAlertEmailSubject(crossing)
    expect(subject).toContain('Time to Bake')
    expect(subject).toContain('Loaves')
    expect(subject).toContain('29')
  })

  it('builds red alert subject', () => {
    const crossing = {
      category: 'loaves' as const,
      previousStatus: 'yellow' as const,
      newStatus: 'red' as const,
      quantity: 8,
      threshold: loavesThreshold,
    }
    const subject = buildAlertEmailSubject(crossing)
    expect(subject).toContain('Low Stock Alert')
    expect(subject).toContain('reserve level')
    expect(subject).toContain('8')
  })
})

describe('buildAlertEmailHtml', () => {
  it('includes category and quantity in yellow alert', () => {
    const crossing = {
      category: 'loaves' as const,
      previousStatus: 'green' as const,
      newStatus: 'yellow' as const,
      quantity: 29,
      threshold: loavesThreshold,
    }
    const html = buildAlertEmailHtml(crossing, 'https://app.example.com')
    expect(html).toContain('Loaves')
    expect(html).toContain('29')
    expect(html).toContain('Time to Bake')
    expect(html).toContain('https://app.example.com/inventory')
  })

  it('includes reserve info in red alert', () => {
    const crossing = {
      category: 'loaves' as const,
      previousStatus: 'yellow' as const,
      newStatus: 'red' as const,
      quantity: 7,
      threshold: loavesThreshold,
    }
    const html = buildAlertEmailHtml(crossing, 'https://app.example.com')
    expect(html).toContain("Brother Charlie's")
    expect(html).toContain('RESERVE LEVEL')
  })

  it('includes inventory link', () => {
    const crossing = {
      category: 'cookies' as const,
      previousStatus: 'green' as const,
      newStatus: 'yellow' as const,
      quantity: 10,
      threshold: { ...loavesThreshold, category: 'cookies' as const, reserve_label: null },
    }
    const html = buildAlertEmailHtml(crossing, 'https://myapp.com')
    expect(html).toContain('href="https://myapp.com/inventory"')
  })
})
