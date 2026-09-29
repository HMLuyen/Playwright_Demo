import { test, expect } from '../../fixtures/base-test'
import { HomePage } from '../../pages/HomePage'
import { LoginModal } from '../../components/LoginModal'
import { LOGIN_TEST_ACCOUNT } from './login.testdata'

test.describe('Login', () => {
  test.beforeAll(async ({ apiClient }) => {
    // Demoblaze can reset its data and has no delete-account API, so signup is idempotent setup.
    await apiClient.signup(LOGIN_TEST_ACCOUNT)
  })

  test(
    'valid credentials log the user in',
    { tag: ['@TC-001', '@smoke'] },
    async ({ page, log }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)

      log.step('1. Go to home page')
      await homePage.goto()

      log.step('2. Click "Log in"')
      await homePage.openLoginModal()

      log.step('3. Enter username and password')
      await loginModal.fill(LOGIN_TEST_ACCOUNT.username, LOGIN_TEST_ACCOUNT.password)

      log.step('4. Click "Log in" to submit')
      await loginModal.submitExpectingSuccess()

      log.step('5. Verify user is logged in')
      await homePage.expectLoggedIn(LOGIN_TEST_ACCOUNT.username)
    },
  )

  test(
    'empty username and password shows validation alert',
    { tag: ['@TC-002', '@regression'] },
    async ({ page, log }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)

      log.step('1. Go to home page')
      await homePage.goto()

      log.step('2. Click "Log in"')
      await homePage.openLoginModal()

      log.step('3. Leave username and password empty, click "Log in"')
      const message = await loginModal.submitExpectingDialog()

      log.step('4. Verify alert message')
      expect(message).toBe('Please fill out Username and Password.')
    },
  )
})
