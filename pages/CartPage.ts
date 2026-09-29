import { Locator, Page, expect } from '@playwright/test'

export class CartPage {
  readonly rows: Locator

  constructor(private readonly page: Page) {
    this.rows = page.locator('#tbodyid tr')
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html')
  }

  /** Rows load incrementally — wait for the exact expected count, not just the first response. */
  async waitForRowCount(expectedCount: number): Promise<void> {
    await expect(this.rows).toHaveCount(expectedCount, { timeout: 15000 })
  }

  async openPlaceOrder(): Promise<void> {
    await this.page.getByRole('button', { name: 'Place Order' }).click()
  }
}
