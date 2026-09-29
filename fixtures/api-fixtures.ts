import { test as base } from '@playwright/test'
import { DemoblazeClient } from '../api/demoblazeClient'
import { API_TEST_ACCOUNT } from '../tests/api/testdata'
import { API_URL } from '../utils/env'

interface ApiAccount {
  username: string
  password: string
  token: string
}

interface TestFixtures {
  apiClient: DemoblazeClient
}

interface WorkerFixtures {
  apiAccount: ApiAccount
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new DemoblazeClient(request, API_URL))
  },

  apiAccount: [
    async ({ playwright }, use) => {
      const requestContext = await playwright.request.newContext({ baseURL: API_URL })
      const client = new DemoblazeClient(requestContext, API_URL)
      await client.signup(API_TEST_ACCOUNT)
      const token = await client.login(API_TEST_ACCOUNT)
      await use({ ...API_TEST_ACCOUNT, token })
      await requestContext.dispose()
    },
    { scope: 'worker' },
  ],
})

export { expect } from '@playwright/test'
