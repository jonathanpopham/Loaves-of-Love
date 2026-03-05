import {
  DESTINATION_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  isValidStatusTransition,
} from '@/lib/assignments'

describe('DESTINATION_LABELS', () => {
  it('has labels for all five destinations', () => {
    expect(DESTINATION_LABELS.ruths_cottage).toBe("Ruth's Cottage")
    expect(DESTINATION_LABELS.brother_charlies).toBe("Brother Charlie's Rescue Mission")
    expect(DESTINATION_LABELS.bake_sale).toBe('Bake Sale')
    expect(DESTINATION_LABELS.individual).toBe('Individual')
    expect(DESTINATION_LABELS.other).toBe('Other')
  })
})

describe('STATUS_LABELS', () => {
  it('has labels for all three statuses', () => {
    expect(STATUS_LABELS.open).toBe('Open')
    expect(STATUS_LABELS.in_progress).toBe('In Progress')
    expect(STATUS_LABELS.completed).toBe('Completed')
  })
})

describe('STATUS_COLORS', () => {
  it('has colors for all three statuses', () => {
    expect(STATUS_COLORS.open).toContain('blue')
    expect(STATUS_COLORS.in_progress).toContain('yellow')
    expect(STATUS_COLORS.completed).toContain('green')
  })
})

describe('isValidStatusTransition', () => {
  it('allows open → in_progress', () => {
    expect(isValidStatusTransition('open', 'in_progress')).toBe(true)
  })

  it('allows open → completed', () => {
    expect(isValidStatusTransition('open', 'completed')).toBe(true)
  })

  it('allows in_progress → completed', () => {
    expect(isValidStatusTransition('in_progress', 'completed')).toBe(true)
  })

  it('disallows same status', () => {
    expect(isValidStatusTransition('open', 'open')).toBe(false)
    expect(isValidStatusTransition('in_progress', 'in_progress')).toBe(false)
    expect(isValidStatusTransition('completed', 'completed')).toBe(false)
  })

  it('disallows backward transitions from completed', () => {
    expect(isValidStatusTransition('completed', 'open')).toBe(false)
    expect(isValidStatusTransition('completed', 'in_progress')).toBe(false)
  })

  it('disallows in_progress → open', () => {
    expect(isValidStatusTransition('in_progress', 'open')).toBe(false)
  })
})
