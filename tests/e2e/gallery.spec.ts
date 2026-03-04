import { test, expect } from '@playwright/test'

test('home page loads and shows ministry title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Loaves of Love')
})

test('gallery section is present with title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Our Ministry' })).toBeVisible()
})

test('empty gallery shows placeholder text', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('No photos yet.')).toBeVisible()
})

test('header logo is visible', async ({ page }) => {
  await page.goto('/')
  const logo = page.getByAltText('Loaves of Love')
  await expect(logo).toBeVisible()
})

test('header logo links to home', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: /loaves of love/i })
  await expect(link).toHaveAttribute('href', '/')
})
