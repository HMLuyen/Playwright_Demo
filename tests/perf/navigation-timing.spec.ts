import { test, expect } from '@playwright/test'

// Kept intentionally small, this is a public third-party site we don't own.
const DOM_CONTENT_LOADED_BUDGET_MS = 3000

test.describe('Performance tests', () => {
  test(
    'home page DOMContentLoaded completes within baseline',
    { tag: ['@regression'] },
    async ({ page }) => {
      await page.goto('/')

      const timing = await test.step('Measure DOMContentLoaded timing', async () => {
        return page.evaluate(() => {
          const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
          return {
            domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
          }
        })
      })

      await test.step('Verify timing is within budget', async () => {
        expect(timing.domContentLoaded).toBeLessThan(DOM_CONTENT_LOADED_BUDGET_MS)
      })
    },
  )
})
