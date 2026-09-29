import { defineConfig, devices } from '@playwright/test'
import { BASE_URL } from './utils/env'

const HEADLESS = process.env.HEADLESS !== 'false'
const WORKERS = process.env.WORKERS ? Number(process.env.WORKERS) : 2
const RETRIES = process.env.RETRIES ? Number(process.env.RETRIES) : process.env.CI ? 1 : 0

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: RETRIES,
  workers: WORKERS,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: BASE_URL,
    headless: HEADLESS,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
})
