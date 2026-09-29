import { test, expect } from '../../fixtures/ui-fixtures'
import { HomePage } from '../../pages/HomePage'
import { LoginModal } from '../../pages/LoginModal'
import { LOGIN_TEST_ACCOUNT } from './login.testdata'

test.describe('Login', () => {
  test('TC-001: valid credentials log the user in', { tag: '@smoke' }, async ({ page }) => {
    const homePage = new HomePage(page)
    const loginModal = new LoginModal(page)
    await homePage.goto()
    await homePage.openLoginModal()
    await loginModal.fill(LOGIN_TEST_ACCOUNT.username, LOGIN_TEST_ACCOUNT.password)
    await loginModal.submitExpectingSuccess()
    await homePage.expectLoggedIn(LOGIN_TEST_ACCOUNT.username)
  })

  test(
    'TC-002: empty username and password shows validation alert',
    { tag: '@regression' },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      const message = await loginModal.submitExpectingDialog()
      expect(message).toBe('Please fill out Username and Password.')
    },
  )

  test(
    'TC-003: unknown username shows "User does not exist."',
    { tag: '@regression' },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      await loginModal.fill(`no_such_user_${Date.now()}`, 'anyPassword123')
      const message = await loginModal.submitExpectingDialog()
      expect(message).toBe('User does not exist.')
    },
  )

  test(
    'TC-004: wrong password for an existing user shows "Wrong password."',
    { tag: '@regression' },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      await loginModal.fill(LOGIN_TEST_ACCOUNT.username, 'DefinitelyWrongPassword!')
      const message = await loginModal.submitExpectingDialog()
      expect(message).toBe('Wrong password.')
    },
  )

  test(
    'TC-008: SQL-injection-style username is treated as just another unknown user',
    { tag: '@regression' },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      await loginModal.fill(`' OR '1'='1`, 'anyPassword123')
      const message = await loginModal.submitExpectingDialog()
      expect(message).toBe('User does not exist.')
    },
  )
})
