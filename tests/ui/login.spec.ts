import { test, expect } from '../../fixtures/ui-fixtures';

test.describe('Login', () => {
  test(
    'TC-LOGIN-001: valid credentials log the user in',
    { tag: '@smoke' },
    async ({ page, homePage, loginModal, workerAccount }) => {
      await homePage.goto();
      await homePage.openLoginModal();
      await loginModal.fill(workerAccount.username, workerAccount.password);
      await loginModal.submitExpectingSuccess();
      await homePage.expectLoggedIn(workerAccount.username);
    },
  );

  test(
    'TC-LOGIN-002: empty username and password shows validation alert',
    { tag: '@regression' },
    async ({ homePage, loginModal }) => {
      await homePage.goto();
      await homePage.openLoginModal();
      const message = await loginModal.submitExpectingDialog();
      expect(message).toBe('Please fill out Username and Password.');
    },
  );

  test(
    'TC-LOGIN-003: unknown username shows "User does not exist."',
    { tag: '@regression' },
    async ({ homePage, loginModal }) => {
      await homePage.goto();
      await homePage.openLoginModal();
      await loginModal.fill(`no_such_user_${Date.now()}`, 'anyPassword123');
      const message = await loginModal.submitExpectingDialog();
      expect(message).toBe('User does not exist.');
    },
  );

  test(
    'TC-LOGIN-004: wrong password for an existing user shows "Wrong password."',
    { tag: '@regression' },
    async ({ homePage, loginModal, workerAccount }) => {
      await homePage.goto();
      await homePage.openLoginModal();
      await loginModal.fill(workerAccount.username, 'DefinitelyWrongPassword!');
      const message = await loginModal.submitExpectingDialog();
      expect(message).toBe('Wrong password.');
    },
  );

  test(
    'TC-LOGIN-008: SQL-injection-style username is treated as just another unknown user',
    { tag: '@regression' },
    async ({ homePage, loginModal }) => {
      await homePage.goto();
      await homePage.openLoginModal();
      await loginModal.fill(`' OR '1'='1`, 'anyPassword123');
      const message = await loginModal.submitExpectingDialog();
      expect(message).toBe('User does not exist.');
    },
  );
});
