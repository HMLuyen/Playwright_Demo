import { test, expect } from '../../fixtures/base-test'
import { generateWorkerUsername } from '../../utils/users'
import { API_URL } from '../../utils/env'
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

  test(
    'unknown username rejects with "User does not exist."',
    { tag: ['@TC-023', '@regression'] },
    async ({ apiClient, log }) => {
      log.step('1. Attempt login with unknown username')
      await expect(
        apiClient.login({ username: `no_such_user_${Date.now()}`, password: 'anyPassword123' }),
      ).rejects.toThrow('User does not exist.')
    },
  )

  test(
    'password is base64-encoded before being sent, never plaintext',
    { tag: ['@TC-024', '@regression'] },
    async ({ request, log }, testInfo) => {
      const username = generateWorkerUsername(
        `${testInfo.project.name}_encodetest`,
        testInfo.workerIndex,
      )
      const rawPassword = 'PlainTextPassword1'
      const encoded = Buffer.from(rawPassword, 'utf-8').toString('base64')
      expect(encoded).not.toBe(rawPassword)

      log.step('1. Sign up new user with base64-encoded password')
      await request.post(`${API_URL}/signup`, { data: { username, password: encoded } })

      log.step('2. Login and verify response contains a token')
      const loginRes = await request.post(`${API_URL}/login`, {
        data: { username, password: encoded },
      })
      const body = await loginRes.json()
      expect(typeof body).toBe('string')
      expect(body).toContain('Auth_token: ')
    },
  )
})
