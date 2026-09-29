import { Locator, Page, expect, test } from '@playwright/test'

export class CartPage {
  readonly rows: Locator

  constructor(private readonly page: Page) {
    this.rows = page.locator('#tbodyid tr')
  }

  async goto(): Promise<void> {
    await test.step('Go to cart page', async () => {
      await this.page.goto('/cart.html')
    })
  }

  /** Rows load incrementally — wait for the exact expected count, not just the first response. */
  async waitForRowCount(expectedCount: number): Promise<void> {
    await test.step(`Wait for cart to show ${expectedCount} row(s)`, async () => {
      await expect(this.rows).toHaveCount(expectedCount, { timeout: 15000 })
    })
  }

  async openPlaceOrder(): Promise<void> {
    await test.step('Open Place Order modal', async () => {
      await this.page.getByRole('button', { name: 'Place Order' }).click()
    })
  }
}
