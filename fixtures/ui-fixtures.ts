import { test as base } from '@playwright/test'
import { DemoblazeClient } from '../api/demoblazeClient'
import { API_URL } from '../utils/env'

interface WorkerFixtures {
  workerApiClient: DemoblazeClient
}

export const test = base.extend<{}, WorkerFixtures>({
  // One API client per worker — used by each spec's own login hook (see utils/auth.ts).
  workerApiClient: [
    async ({ playwright }, use) => {
      const requestContext = await playwright.request.newContext({ baseURL: API_URL })
      await use(new DemoblazeClient(requestContext, API_URL))
      await requestContext.dispose()
    },
    { scope: 'worker' },
  ],
})

export { expect } from '@playwright/test'
