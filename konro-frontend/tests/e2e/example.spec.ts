import { test, expect } from '@playwright/test'

test.describe('Konro App Basic', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Nuxt/)
    
    // This test will be updated once we implement the actual Konro UI
    await expect(page.locator('body')).toBeVisible()
  })
  
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await expect(page.locator('body')).toBeVisible()
  })
})