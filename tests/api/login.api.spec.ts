import { test, expect } from '../../fixtures/api-fixtures';
import { generateWorkerUsername, DEFAULT_TEST_PASSWORD } from '../../utils/users';
import { API_URL } from '../../utils/env';

test.describe('Login/Signup API', () => {
  test(
    'TC-API-LOGIN-001: valid login returns a token',
    { tag: '@smoke' },
    async ({ apiClient, apiAccount }) => {
      const token = await apiClient.login(apiAccount);
      expect(token.length).toBeGreaterThan(0);
    },
  );

  test(
    'TC-API-LOGIN-002: wrong password rejects with "Wrong password."',
    { tag: '@regression' },
    async ({ apiClient, apiAccount }) => {
      await expect(
        apiClient.login({ username: apiAccount.username, password: 'DefinitelyWrongPassword!' }),
      ).rejects.toThrow('Wrong password.');
    },
  );

  test(
    'TC-API-LOGIN-003: unknown username rejects with "User does not exist."',
    { tag: '@regression' },
    async ({ apiClient }) => {
      await expect(
        apiClient.login({ username: `no_such_user_${Date.now()}`, password: 'anyPassword123' }),
      ).rejects.toThrow('User does not exist.');
    },
  );

  test(
    'TC-API-LOGIN-004: password is base64-encoded before being sent, never plaintext',
    { tag: '@regression' },
    async ({ request }, testInfo) => {
      const username = generateWorkerUsername(`${testInfo.project.name}_encodetest`, testInfo.workerIndex);
      const rawPassword = 'PlainTextPassword1';
      const encoded = Buffer.from(rawPassword, 'utf-8').toString('base64');
      expect(encoded).not.toBe(rawPassword);

      await request.post(`${API_URL}/signup`, { data: { username, password: encoded } });
      const loginRes = await request.post(`${API_URL}/login`, { data: { username, password: encoded } });
      const body = await loginRes.json();
      // Success body is a bare JSON string ("Auth_token: ..."), not an object.
      expect(typeof body).toBe('string');
      expect(body).toContain('Auth_token: ');
    },
  );

  test(
    'TC-API-SIGNUP-001: signing up with an existing username returns a duplicate error',
    { tag: '@regression' },
    async ({ request, apiAccount }) => {
      const encoded = Buffer.from(apiAccount.password, 'utf-8').toString('base64');
      const res = await request.post(`${API_URL}/signup`, {
        data: { username: apiAccount.username, password: encoded },
      });
      const body = await res.json();
      expect(body.errorMessage).toBe('This user already exist.');
    },
  );

  test(
    'TC-API-SIGNUP-002: signing up with a new username succeeds silently',
    { tag: '@regression' },
    async ({ apiClient }, testInfo) => {
      const username = generateWorkerUsername(`${testInfo.project.name}_api_signup`, testInfo.workerIndex);
      await expect(apiClient.signup({ username, password: DEFAULT_TEST_PASSWORD })).resolves.toBeUndefined();
    },
  );

  test(
    'TC-API-CHECK-001: /check validates a real token and returns the owning username',
    { tag: '@regression' },
    async ({ apiClient, apiAccount }) => {
      const result = await apiClient.check(apiAccount.token);
      expect(result.username).toBe(apiAccount.username);
    },
  );
});
