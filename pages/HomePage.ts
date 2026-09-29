import { Page, expect } from '@playwright/test'

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/')
  }

  /** Mobile viewports collapse the navbar behind a toggler — confirmed live at 375x667. */
  private async openMobileNavIfCollapsed(): Promise<void> {
    const toggler = this.page.locator('.navbar-toggler')
    if (await toggler.isVisible().catch(() => false)) {
      const loginLink = this.page.locator('#login2')
      const loginVisible = await loginLink.isVisible().catch(() => false)
      if (!loginVisible) {
        await toggler.click()
      }
    }
  }

  async openLoginModal(): Promise<void> {
    await this.openMobileNavIfCollapsed()
    await this.page.locator('#login2').click()
  }

  async expectLoggedIn(username: string): Promise<void> {
    await expect(this.page.locator('#nameofuser')).toHaveText(`Welcome ${username}`)
    await expect(this.page.locator('#login2')).toBeHidden()
  }
}
