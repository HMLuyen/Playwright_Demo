import { test as base } from '@playwright/test'
import { DemoblazeClient } from '../api/demoblazeClient'
import { API_URL } from '../utils/env'
import { logger, Logger } from '../utils/logger'

interface TestFixtures {
  apiClient: DemoblazeClient
  log: Logger
}

export const test = base.extend<TestFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new DemoblazeClient(request, API_URL))
  },
  log: async ({}, use) => {
    await use(logger)
  },
})

export { expect } from '@playwright/test'
