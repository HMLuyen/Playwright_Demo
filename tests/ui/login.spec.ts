import { test, expect } from '../../fixtures/ui-fixtures'
import { HomePage } from '../../pages/HomePage'
import { LoginModal } from '../../pages/LoginModal'
import { LOGIN_TEST_ACCOUNT } from './login.testdata'

test.describe('Login', () => {
  test('valid credentials log the user in', { tag: ['@TC-001', '@smoke'] }, async ({ page }) => {
    const homePage = new HomePage(page)
    const loginModal = new LoginModal(page)
    await homePage.goto()
    await homePage.openLoginModal()
    await loginModal.fill(LOGIN_TEST_ACCOUNT.username, LOGIN_TEST_ACCOUNT.password)
    await loginModal.submitExpectingSuccess()
    await homePage.expectLoggedIn(LOGIN_TEST_ACCOUNT.username)
  })

  test(
    'empty username and password shows validation alert',
    { tag: ['@TC-002', '@regression'] },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      const message = await loginModal.submitExpectingDialog()
      await test.step('Verify alert message', async () => {
        expect(message).toBe('Please fill out Username and Password.')
      })
    },
  )

  test(
    'unknown username shows "User does not exist."',
    { tag: ['@TC-003', '@regression'] },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      await loginModal.fill(`no_such_user_${Date.now()}`, 'anyPassword123')
      const message = await loginModal.submitExpectingDialog()
      await test.step('Verify alert message', async () => {
        expect(message).toBe('User does not exist.')
      })
    },
  )

  test(
    'wrong password for an existing user shows "Wrong password."',
    { tag: ['@TC-004', '@regression'] },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      await loginModal.fill(LOGIN_TEST_ACCOUNT.username, 'DefinitelyWrongPassword!')
      const message = await loginModal.submitExpectingDialog()
      await test.step('Verify alert message', async () => {
        expect(message).toBe('Wrong password.')
      })
    },
  )

  test(
    'SQL-injection-style username is treated as just another unknown user',
    { tag: ['@TC-008', '@regression'] },
    async ({ page }) => {
      const homePage = new HomePage(page)
      const loginModal = new LoginModal(page)
      await homePage.goto()
      await homePage.openLoginModal()
      await loginModal.fill(`' OR '1'='1`, 'anyPassword123')
      const message = await loginModal.submitExpectingDialog()
      await test.step('Verify alert message', async () => {
        expect(message).toBe('User does not exist.')
      })
    },
  )
})
