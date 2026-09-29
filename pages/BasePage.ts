import { Locator, Page, expect } from '@playwright/test'
import { logger } from '../utils/logger'

export abstract class BasePage {
  protected readonly navbarToggler: Locator
  protected readonly loginLink: Locator
  protected readonly welcomeText: Locator

  constructor(protected readonly page: Page) {
    this.navbarToggler = page.locator('.navbar-toggler')
    this.loginLink = page.locator('#login2')
    this.welcomeText = page.locator('#nameofuser')
  }

  protected async navigateTo(path: string): Promise<void> {
    const response = await this.page.goto(path)
    expect(response?.status(), `Expect navigation to "${path}" to succeed`).toBeLessThan(400)
  }

  /** Mobile viewports collapse the navbar behind a toggler. */
  private async openMobileNavIfCollapsed(): Promise<void> {
    if (await this.navbarToggler.isVisible().catch(() => false)) {
      const loginVisible = await this.loginLink.isVisible().catch(() => false)
      if (!loginVisible) {
        await this.navbarToggler.click()
      }
    }
  }

  /** Navbar chrome — present on every page. */
  async openLoginModal(): Promise<void> {
    await this.openMobileNavIfCollapsed()
    await this.loginLink.click()
    logger.step('Open login modal successfully')
  }

  async expectLoggedIn(username: string): Promise<void> {
    await expect(this.welcomeText, `Expect navbar to show "Welcome ${username}"`).toHaveText(
      `Welcome ${username}`,
    )
    await expect(this.loginLink, 'Expect "Log in" link to be hidden once logged in').toBeHidden()
    logger.step(`Verify logged in as ${username} successfully`)
  }
}
