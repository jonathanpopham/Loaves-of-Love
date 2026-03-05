import type { AssignmentStatus, DeliveryDestination } from '@/types/database'

export const DESTINATION_LABELS: Record<DeliveryDestination, string> = {
  ruths_cottage: "Ruth's Cottage",
  brother_charlies: "Brother Charlie's Rescue Mission",
  bake_sale: 'Bake Sale',
  individual: 'Individual',
  other: 'Other',
}

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export const STATUS_COLORS: Record<AssignmentStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
}

/**
 * Validates a status transition.
 * Allowed: open → in_progress, in_progress → completed, open → completed
 */
export function isValidStatusTransition(from: AssignmentStatus, to: AssignmentStatus): boolean {
  if (from === to) return false
  if (from === 'completed') return false
  if (from === 'open' && (to === 'in_progress' || to === 'completed')) return true
  if (from === 'in_progress' && to === 'completed') return true
  return false
}
