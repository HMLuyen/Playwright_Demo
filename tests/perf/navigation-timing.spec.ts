import { test, expect } from '@playwright/test'

// Kept intentionally small, this is a public third-party site we don't own.
const DOM_CONTENT_LOADED_BUDGET_MS = 3000

test.describe('Performance tests', () => {
  test(
    'home page DOMContentLoaded completes within baseline',
    { tag: ['@TC-020', '@regression'] },
    async ({ page }) => {
      await page.goto('/')
      const timing = await page.evaluate(() => {
        const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        return {
          domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        }
      })

      expect(timing.domContentLoaded).toBeLessThan(DOM_CONTENT_LOADED_BUDGET_MS)
    },
  )
})
