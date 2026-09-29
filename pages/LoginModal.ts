import { Locator, Page, test } from '@playwright/test'
import { captureDialog } from '../utils/dialog'

/**
 * Scoped to #logInModal because "Log in" and "Close" button names are duplicated
 * elsewhere on the page (e.g. the signup modal also has a "Close" button).
 */
export class LoginModal {
  private readonly root: Locator

  constructor(private readonly page: Page) {
    this.root = page.locator('#logInModal')
  }

  async fill(username: string, password: string): Promise<void> {
    await test.step(`Fill login form (username: ${username})`, async () => {
      await this.root.locator('#loginusername').fill(username)
      await this.root.locator('#loginpassword').fill(password)
    })
  }

  /** For the negative/edge cases: empty fields, unknown user, wrong password. */
  async submitExpectingDialog(): Promise<string> {
    return test.step('Submit login, expect alert', async () => {
      return captureDialog(this.page, async () => {
        await this.root.getByRole('button', { name: 'Log in' }).click()
      })
    })
  }

  /**
   * Successful login shows no alert; the client calls POST /login then reloads
   * the page. Wait for that response before waiting for the reload, or the click
   * can resolve before the async login call has even started.
   */
  async submitExpectingSuccess(): Promise<void> {
    await test.step('Submit login, expect success', async () => {
      const loginResponse = this.page.waitForResponse(
        (res) => res.url().includes('/login') && res.request().method() === 'POST',
      )
      await this.root.getByRole('button', { name: 'Log in' }).click()
      await loginResponse
      await this.page.waitForLoadState('load')
    })
  }
}
