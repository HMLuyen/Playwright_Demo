import { test, expect } from '@playwright/test'

// Kept intentionally small — this is a public third-party site we don't own,
// not infrastructure to load-test hard. See k6/login-load-test.js for the
// API-level counterpart.
const DOM_CONTENT_LOADED_BUDGET_MS = 3000

test.describe('Performance budget', () => {
  test(
    'TC-PERF-001: home page DOMContentLoaded completes within budget',
    { tag: '@regression' },
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
