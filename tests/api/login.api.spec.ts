import { test, expect } from '../../fixtures/base-test'
import { API_TEST_ACCOUNT } from './login.api.testdata'

test.describe('Login via API', () => {
  test.beforeAll(async ({ apiClient }) => {
    // Demoblaze can reset its data and has no delete-account API, so signup is idempotent setup.
    await apiClient.signup(API_TEST_ACCOUNT)
  })

  test(
    'valid login returns a token',
    { tag: ['@TC-021', '@smoke'] },
    async ({ apiClient, log }) => {
      log.step('1. Login with valid credentials')
      const token = await apiClient.login(API_TEST_ACCOUNT)

      log.step('2. Verify a token was returned')
      expect(token.length).toBeGreaterThan(0)
    },
  )

  test(
    'wrong password rejects with "Wrong password."',
    { tag: ['@TC-022', '@regression'] },
    async ({ apiClient, log }) => {
      log.step('1. Attempt login with wrong password')
      await expect(
        apiClient.login({
          username: API_TEST_ACCOUNT.username,
          password: 'DefinitelyWrongPassword!',
        }),
      ).rejects.toThrow('Wrong password.')
    },
  )
})
