import { Locator } from '@playwright/test'
import { BaseModal } from './BaseModal'
import { captureDialog } from '../utils/dialog'
import { logger } from '../utils/logger'

export class LoginModal extends BaseModal {
  private readonly loginModal: Locator = this.page.locator('#logInModal')
  private readonly usernameInput: Locator = this.loginModal.locator('#loginusername')
  private readonly passwordInput: Locator = this.loginModal.locator('#loginpassword')
  private readonly loginButton: Locator = this.loginModal.getByRole('button', { name: 'Log in' })

  async fill(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    logger.step(`Fill login form (username: ${username}) successfully`)
  }

  /** For the negative/edge cases: empty fields, unknown user, wrong password. */
  async submitExpectingDialog(): Promise<string> {
    const message = await captureDialog(this.page, async () => {
      await this.loginButton.click()
    })
    logger.step('Submit login, expect alert successfully')
    return message
  }

  /**
   * Successful login shows no alert; the client calls POST /login then reloads
   * the page. Wait for that response before waiting for the reload, or the click
   * can resolve before the async login call has even started.
   */
  async submitExpectingSuccess(): Promise<void> {
    const loginResponse = this.page.waitForResponse(
      (res) => res.url().includes('/login') && res.request().method() === 'POST',
    )
    await this.loginButton.click()
    await loginResponse
    await this.page.waitForLoadState('load')
    logger.step('Submit login, expect success successfully')
  }
}
