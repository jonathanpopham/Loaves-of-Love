import type { InventoryCategory } from '@/types/database'

export type FreshnessStatus = 'fresh' | 'expiring_soon' | 'expired' | 'unknown'

export type ThresholdStatus = 'green' | 'yellow' | 'red'

export function getFreshnessStatus(
  bakedDate: string | null,
  freshnessDays: number | null
): FreshnessStatus {
  if (!bakedDate || !freshnessDays) return 'unknown'

  const baked = new Date(bakedDate)
  const now = new Date()
  const daysSinceBaked = Math.floor((now.getTime() - baked.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSinceBaked > freshnessDays) return 'expired'
  if (daysSinceBaked >= freshnessDays * 0.8) return 'expiring_soon'
  return 'fresh'
}

export function getThresholdStatus(
  quantity: number,
  greenThreshold: number,
  yellowThreshold: number
): ThresholdStatus {
  if (quantity >= greenThreshold) return 'green'
  if (quantity >= yellowThreshold) return 'yellow'
  return 'red'
}

export const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  loaves: 'Loaves',
  cookies: 'Cookies',
  coffee_cakes: 'Coffee Cakes',
  emergency_bags: 'Emergency Bags',
  bake_sale: 'Bake Sale',
}

export const DEFAULT_FRESHNESS_DAYS: Record<InventoryCategory, number> = {
  loaves: 5,
  cookies: 14,
  coffee_cakes: 7,
  emergency_bags: 90,
  bake_sale: 7,
}

export const THRESHOLD_COLORS: Record<ThresholdStatus, { bg: string; text: string }> = {
  green: { bg: 'bg-green-100', text: 'text-green-800' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  red: { bg: 'bg-red-100', text: 'text-red-800' },
}

export const FRESHNESS_COLORS: Record<FreshnessStatus, { bg: string; text: string }> = {
  fresh: { bg: 'bg-green-100', text: 'text-green-700' },
  expiring_soon: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  expired: { bg: 'bg-red-100', text: 'text-red-700' },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-500' },
}
