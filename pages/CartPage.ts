import { Locator, expect, test } from '@playwright/test'
import { BasePage } from './BasePage'

export class CartPage extends BasePage {
  readonly rows: Locator = this.page.locator('#tbodyid tr')
  private readonly placeOrderButton: Locator = this.page.getByRole('button', {
    name: 'Place Order',
  })

  async goto(): Promise<void> {
    await this.navigateTo('/cart.html', 'Go to cart page')
  }

  /** Rows load incrementally — wait for the exact expected count, not just the first response. */
  async waitForRowCount(expectedCount: number): Promise<void> {
    await test.step(`Wait for cart to show ${expectedCount} row(s)`, async () => {
      await expect(this.rows, `Expect cart to show ${expectedCount} row(s)`).toHaveCount(
        expectedCount,
        {
          timeout: 15000,
        },
      )
    })
  }

  async openPlaceOrder(): Promise<void> {
    await test.step('Open Place Order modal', async () => {
      await this.placeOrderButton.click()
    })
  }
}
