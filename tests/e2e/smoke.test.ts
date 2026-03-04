import { test, expect } from '@playwright/test'

test('home page loads and shows ministry name', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Loaves of Love/)
  await expect(page.getByRole('heading', { name: 'Loaves of Love' })).toBeVisible()
})

test('navigation renders all main links', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation')
  await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Inventory' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Recipes' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Assignments' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Announcements' })).toBeVisible()
})

test('health check API returns ok', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body.status).toBe('ok')
})

test('navigating to dashboard shows heading', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})
