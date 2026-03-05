import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { InventoryCategory, InventoryItem, InventoryThreshold } from '@/types/database'
import { getThresholdStatus } from '@/lib/inventory'

export async function GET() {
  const supabase = await createClient()

  const [itemsResult, thresholdsResult] = await Promise.all([
    supabase.from('inventory_items').select('category, quantity'),
    supabase.from('inventory_thresholds').select('*'),
  ])

  if (itemsResult.error) {
    return NextResponse.json({ error: itemsResult.error.message }, { status: 500 })
  }
  if (thresholdsResult.error) {
    return NextResponse.json({ error: thresholdsResult.error.message }, { status: 500 })
  }

  const items = itemsResult.data as Pick<InventoryItem, 'category' | 'quantity'>[]
  const thresholds = thresholdsResult.data as InventoryThreshold[]

  // Aggregate quantities per category
  const totals: Record<string, number> = {}
  for (const item of items) {
    totals[item.category] = (totals[item.category] || 0) + item.quantity
  }

  const thresholdMap = new Map(thresholds.map((t) => [t.category, t]))

  const categories: InventoryCategory[] = [
    'loaves',
    'cookies',
    'coffee_cakes',
    'emergency_bags',
    'bake_sale',
  ]

  const summary = categories.map((category) => {
    const threshold = thresholdMap.get(category)
    const quantity = totals[category] || 0
    return {
      category,
      quantity,
      status: threshold
        ? getThresholdStatus(quantity, threshold.green_threshold, threshold.yellow_threshold)
        : ('green' as const),
      threshold: threshold
        ? {
            green: threshold.green_threshold,
            yellow: threshold.yellow_threshold,
            red: threshold.red_threshold,
            reserveLabel: threshold.reserve_label,
          }
        : null,
    }
  })

  return NextResponse.json(summary)
}
