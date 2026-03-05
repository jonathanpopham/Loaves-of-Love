import type { InventoryCategory, InventoryThreshold } from '@/types/database'
import { getThresholdStatus, type ThresholdStatus, CATEGORY_LABELS } from '@/lib/inventory'

export interface ThresholdCrossing {
  category: InventoryCategory
  previousStatus: ThresholdStatus
  newStatus: ThresholdStatus
  quantity: number
  threshold: InventoryThreshold
}

/**
 * Detect if a quantity change crosses a threshold boundary.
 * Only triggers on downward crossings (green→yellow, green→red, yellow→red).
 */
export function detectThresholdCrossing(
  category: InventoryCategory,
  previousQuantity: number,
  newQuantity: number,
  threshold: InventoryThreshold
): ThresholdCrossing | null {
  // Only care about decreases
  if (newQuantity >= previousQuantity) return null

  const prevStatus = getThresholdStatus(
    previousQuantity,
    threshold.green_threshold,
    threshold.yellow_threshold
  )
  const newStatus = getThresholdStatus(
    newQuantity,
    threshold.green_threshold,
    threshold.yellow_threshold
  )

  // Only notify on actual status change
  if (prevStatus === newStatus) return null

  // Only notify on downward transitions
  const severity = { green: 0, yellow: 1, red: 2 }
  if (severity[newStatus] <= severity[prevStatus]) return null

  return {
    category,
    previousStatus: prevStatus,
    newStatus: newStatus,
    quantity: newQuantity,
    threshold,
  }
}

export function buildAlertEmailHtml(crossing: ThresholdCrossing, appUrl: string): string {
  const categoryLabel = CATEGORY_LABELS[crossing.category]
  const isRed = crossing.newStatus === 'red'

  const statusLabel = isRed ? 'RESERVE LEVEL' : 'Time to Bake'
  const color = isRed ? '#dc2626' : '#ca8a04'
  const reserveInfo =
    isRed && crossing.threshold.reserve_label
      ? `<p style="color:#dc2626;font-weight:bold;">${crossing.threshold.red_threshold} reserved for ${crossing.threshold.reserve_label}</p>`
      : ''

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:${color};">${statusLabel} — ${categoryLabel}</h2>
      <p>Current stock: <strong>${crossing.quantity}</strong></p>
      <p>Thresholds: ${crossing.threshold.green_threshold} (good) / ${crossing.threshold.yellow_threshold} (bake) / ${crossing.threshold.red_threshold} (reserve)</p>
      ${reserveInfo}
      <p><a href="${appUrl}/inventory" style="color:#4f46e5;">View Inventory →</a></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <p style="color:#9ca3af;font-size:12px;">Loaves of Love — St. Anne's Episcopal Church</p>
    </div>
  `.trim()
}

export function buildAlertEmailSubject(crossing: ThresholdCrossing): string {
  const categoryLabel = CATEGORY_LABELS[crossing.category]
  if (crossing.newStatus === 'red') {
    return `Low Stock Alert — ${categoryLabel} at reserve level (${crossing.quantity})`
  }
  return `Time to Bake — ${categoryLabel} stock is at ${crossing.quantity}`
}
