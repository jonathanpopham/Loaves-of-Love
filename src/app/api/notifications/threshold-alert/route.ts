import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResendClient, NOTIFICATION_FROM } from '@/lib/resend'
import {
  detectThresholdCrossing,
  buildAlertEmailHtml,
  buildAlertEmailSubject,
} from '@/lib/notifications/threshold-checker'
import type { InventoryCategory } from '@/types/database'

/**
 * POST /api/notifications/threshold-alert
 * Called internally after inventory quantity changes.
 * Body: { category, previousQuantity, newQuantity }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { category, previousQuantity, newQuantity } = body as {
    category: InventoryCategory
    previousQuantity: number
    newQuantity: number
  }

  // Get threshold for this category
  const { data: threshold } = await supabase
    .from('inventory_thresholds')
    .select('*')
    .eq('category', category)
    .single()

  if (!threshold) {
    return NextResponse.json({ skipped: true, reason: 'No threshold configured' })
  }

  const crossing = detectThresholdCrossing(category, previousQuantity, newQuantity, threshold)

  if (!crossing) {
    return NextResponse.json({ skipped: true, reason: 'No threshold crossing' })
  }

  // Get users to notify based on their preferences
  const { data: rawPreferences } = await supabase
    .from('notification_preferences')
    .select('user_id, profiles(email)')
    .eq('threshold_alerts', true)
  const preferences = (rawPreferences || []) as unknown as {
    user_id: string
    profiles: { email: string } | null
  }[]

  // Also get users who don't have preferences yet (default: on)
  const { data: rawProfiles } = await supabase.from('profiles').select('id, email')
  const allProfiles = (rawProfiles || []) as unknown as { id: string; email: string }[]
  const usersWithPrefs = new Set(preferences.map((p) => p.user_id))
  const defaultOnUsers = allProfiles.filter((p) => !usersWithPrefs.has(p.id))

  const emailsToNotify: string[] = []

  // Users with explicit preference = on
  for (const pref of preferences) {
    if (pref.profiles?.email) {
      emailsToNotify.push(pref.profiles.email)
    }
  }

  // Users with no preference record (default on)
  for (const profile of defaultOnUsers) {
    if (profile.email) {
      emailsToNotify.push(profile.email)
    }
  }

  if (emailsToNotify.length === 0) {
    return NextResponse.json({ skipped: true, reason: 'No recipients' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://loaves-of-love.vercel.app'
  const resend = getResendClient()

  const { error } = await resend.emails.send({
    from: NOTIFICATION_FROM,
    to: emailsToNotify,
    subject: buildAlertEmailSubject(crossing),
    html: buildAlertEmailHtml(crossing, appUrl),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    sent: true,
    recipients: emailsToNotify.length,
    crossing: crossing.newStatus,
  })
}
