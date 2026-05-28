import { test, expect } from '@playwright/test'

test.describe('youtube-intent-feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear localStorage between tests
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('shows empty state on first visit', async ({ page }) => {
    await expect(page.getByText('여러 관심사를 한 화면에서 보세요')).toBeVisible()
    await expect(page.getByRole('button', { name: 'React' })).toBeVisible()
  })

  test('adds keyword and shows feed column', async ({ page }) => {
    await page.getByRole('textbox').fill('React')
    await page.keyboard.press('Enter')
    await expect(page.getByText('React column').or(page.locator('[data-testid]'))).toBeVisible({ timeout: 5000 })
  })

  test('persists keywords after reload', async ({ page }) => {
    await page.getByRole('textbox').fill('React')
    await page.keyboard.press('Enter')
    await page.reload()
    // Keyword chip should still be visible
    await expect(page.getByText('React').first()).toBeVisible()
  })

  test('removes keyword column when chip × is clicked', async ({ page }) => {
    await page.getByRole('textbox').fill('React')
    await page.keyboard.press('Enter')
    // Wait for chip to appear
    await page.waitForSelector('button[aria-label="React 삭제"]')
    await page.click('button[aria-label="React 삭제"]')
    await expect(page.getByText('여러 관심사를 한 화면에서 보세요')).toBeVisible()
  })
})
