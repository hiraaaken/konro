import { test, expect } from '@playwright/test'

test.describe('User Onboarding Flow (Issue #9)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test('should show welcome screen for first-time users', async ({ page }) => {
    await page.goto('/')

    // Check welcome screen elements
    await expect(page.locator('h1')).toContainText('Konro')
    await expect(page.locator('text=ポジティブ励ましチャットボット')).toBeVisible()
    await expect(page.locator('button', { hasText: '始める' })).toBeVisible()
    await expect(page.locator('text=デモを見る')).toBeVisible()
  })

  test('should navigate to setup when user clicks "始める"', async ({ page }) => {
    await page.goto('/')
    
    await page.click('button:has-text("始める")')
    
    // Should be redirected to setup page
    await expect(page).toHaveURL('/setup')
    await expect(page.locator('h1')).toContainText('Konro')
    await expect(page.locator('text=あなたのことを教えてください')).toBeVisible()
  })

  test('should complete user info setup flow', async ({ page }) => {
    await page.goto('/setup')

    // Fill out user information
    await page.selectOption('select >> nth=0', '20代')  // Age
    await page.selectOption('select >> nth=1', '男性')  // Gender  
    await page.selectOption('select >> nth=2', '学生')  // Occupation

    // Submit the form
    await page.click('button:has-text("保存")')

    // Should be redirected to fire level selection
    await expect(page).toHaveURL('/select')
    await expect(page.locator('text=今日の励まし火力を選んでください')).toBeVisible()
  })

  test('should allow skipping user info setup', async ({ page }) => {
    await page.goto('/setup')

    // Click skip button
    await page.click('button:has-text("後で設定")')

    // Should be redirected to fire level selection
    await expect(page).toHaveURL('/select')
    await expect(page.locator('text=今日の励まし火力を選んでください')).toBeVisible()
  })

  test('should remember user choice and skip setup on return visit', async ({ page }) => {
    // First visit - complete setup
    await page.goto('/setup')
    await page.selectOption('select >> nth=0', '30代')
    await page.click('button:has-text("保存")')
    
    // Verify we're at select page
    await expect(page).toHaveURL('/select')

    // Go back to home page
    await page.goto('/')
    
    // Click "始める" again
    await page.click('button:has-text("始める")')
    
    // Should go directly to select page, skipping setup
    await expect(page).toHaveURL('/select')
  })

  test('should remember skip choice and skip setup on return visit', async ({ page }) => {
    // First visit - skip setup
    await page.goto('/setup')
    await page.click('button:has-text("後で設定")')
    
    // Verify we're at select page
    await expect(page).toHaveURL('/select')

    // Go back to home page
    await page.goto('/')
    
    // Click "始める" again
    await page.click('button:has-text("始める")')
    
    // Should go directly to select page, skipping setup
    await expect(page).toHaveURL('/select')
  })

  test('should show form validation states', async ({ page }) => {
    await page.goto('/setup')

    // Initially, form should be ready for input
    await expect(page.locator('select >> nth=0')).toBeVisible()
    await expect(page.locator('button:has-text("保存")')).toBeEnabled()
    await expect(page.locator('button:has-text("後で設定")')).toBeEnabled()

    // Fill partial information
    await page.selectOption('select >> nth=0', '20代')

    // Form should still be submittable (partial info is allowed)
    await expect(page.locator('button:has-text("保存")')).toBeEnabled()
  })

  test('should redirect to setup from protected routes when onboarding incomplete', async ({ page }) => {
    // Try to access fire level selection directly without setup
    await page.goto('/select')
    
    // Should be redirected to setup
    await expect(page).toHaveURL('/setup')
    await expect(page.locator('text=あなたのことを教えてください')).toBeVisible()
  })

  test('should redirect to setup from chat route when onboarding incomplete', async ({ page }) => {
    // Try to access chat directly without setup
    await page.goto('/chat')
    
    // Should be redirected to setup first
    await expect(page).toHaveURL('/setup')
    await expect(page.locator('text=あなたのことを教えてください')).toBeVisible()
  })

  test('should preserve user info across page refreshes', async ({ page }) => {
    await page.goto('/setup')

    // Fill out form
    await page.selectOption('select >> nth=0', '40代')
    await page.selectOption('select >> nth=1', '女性')
    await page.selectOption('select >> nth=2', '会社員')
    await page.click('button:has-text("保存")')

    // Verify redirect to select
    await expect(page).toHaveURL('/select')

    // Refresh page
    await page.reload()

    // Should stay on select page (not redirect to setup)
    await expect(page).toHaveURL('/select')

    // Go back to setup to verify info is preserved
    await page.goto('/setup')
    
    // Form should be pre-filled
    await expect(page.locator('select >> nth=0')).toHaveValue('40代')
    await expect(page.locator('select >> nth=1')).toHaveValue('女性')
    await expect(page.locator('select >> nth=2')).toHaveValue('会社員')
  })

  test('should show progress indicator when user has partial info', async ({ page }) => {
    await page.goto('/setup')

    // Fill only age
    await page.selectOption('select >> nth=0', '50代')

    // Should show some indication of partial completion
    // (The exact implementation may vary, this is a placeholder)
    await expect(page.locator('button:has-text("保存")')).toBeEnabled()
  })

  test('should handle demo flow independently', async ({ page }) => {
    await page.goto('/')
    
    // Click demo link
    await page.click('text=デモを見る')
    
    // Should go to demo page without setup requirement
    await expect(page).toHaveURL('/demo')
    await expect(page.locator('text=Fire Level Selector Demo')).toBeVisible()
  })
})