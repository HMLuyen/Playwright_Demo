import { test as base } from '@playwright/test'
import { DemoblazeClient } from '../api/demoblazeClient'
import { API_URL } from '../utils/env'
import { logger, Logger } from '../utils/logger'

interface TestFixtures {
  log: Logger
}

interface WorkerFixtures {
  workerApiClient: DemoblazeClient
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  log: async ({}, use) => {
    await use(logger)
  },
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
