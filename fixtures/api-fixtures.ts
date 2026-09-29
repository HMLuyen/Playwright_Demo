import { test as base } from '@playwright/test'
import { DemoblazeClient } from '../api/demoblazeClient'
import { API_URL } from '../utils/env'

interface TestFixtures {
  apiClient: DemoblazeClient
}

export const test = base.extend<TestFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new DemoblazeClient(request, API_URL))
  },
})

export { expect } from '@playwright/test'
