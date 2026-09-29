import { test, expect } from '../../fixtures/api-fixtures'
import { generateWorkerUsername } from '../../utils/users'
import { API_URL } from '../../utils/env'
import { API_TEST_ACCOUNT } from './login.api.testdata'

test.describe('Login via API', () => {
  test.beforeAll(async ({ apiClient }) => {
    // Make sure the account exists before running the tests.
    await apiClient.signup(API_TEST_ACCOUNT)
  })

  test('valid login returns a token', { tag: ['@TC-021', '@smoke'] }, async ({ apiClient }) => {
    const token = await apiClient.login(API_TEST_ACCOUNT)
    expect(token.length).toBeGreaterThan(0)
  })

  test(
    'wrong password rejects with "Wrong password."',
    { tag: ['@TC-022', '@regression'] },
    async ({ apiClient }) => {
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
    async ({ apiClient }) => {
      await expect(
        apiClient.login({ username: `no_such_user_${Date.now()}`, password: 'anyPassword123' }),
      ).rejects.toThrow('User does not exist.')
    },
  )

  test(
    'password is base64-encoded before being sent, never plaintext',
    { tag: ['@TC-024', '@regression'] },
    async ({ request }, testInfo) => {
      const username = generateWorkerUsername(
        `${testInfo.project.name}_encodetest`,
        testInfo.workerIndex,
      )
      const rawPassword = 'PlainTextPassword1'
      const encoded = Buffer.from(rawPassword, 'utf-8').toString('base64')
      expect(encoded).not.toBe(rawPassword)

      await request.post(`${API_URL}/signup`, { data: { username, password: encoded } })
      const loginRes = await request.post(`${API_URL}/login`, {
        data: { username, password: encoded },
      })
      const body = await loginRes.json()
      expect(typeof body).toBe('string')
      expect(body).toContain('Auth_token: ')
    },
  )
})
