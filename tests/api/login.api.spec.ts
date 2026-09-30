import { test, expect } from '../../fixtures/base-test'
import { API_TEST_ACCOUNT } from './login.api.testdata'

test.describe('Login via API', () => {
  test.beforeAll(async ({ apiClient }) => {
    // Demoblaze can reset its data and has no delete-account API, so signup is idempotent setup.
    await apiClient.signup(API_TEST_ACCOUNT)
  })

  test(
    'Verify unknown username rejects with "User does not exist."',
    { tag: ['@TC-003', '@regression'] },
    async ({ apiClient, log }) => {
      log.step('1. Attempt login with unknown username')
      await expect(
        apiClient.login({ username: `no_such_user_${Date.now()}`, password: 'anyPassword123' }),
      ).rejects.toThrow('User does not exist.')
    },
  )

  test(
    'Verify wrong password rejects with "Wrong password."',
    { tag: ['@TC-004', '@regression'] },
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
