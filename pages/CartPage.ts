import { Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { logger } from '../utils/logger'

export class CartPage extends BasePage {
  readonly rows: Locator = this.page.locator('#tbodyid tr')
  private readonly placeOrderButton: Locator = this.page.getByRole('button', {
    name: 'Place Order',
  })

  async goto(): Promise<void> {
    await this.navigateTo('/cart.html')
  }

  /** Rows load incrementally — wait for the exact expected count, not just the first response. */
  async waitForRowCount(expectedCount: number): Promise<void> {
    await expect(this.rows, `Expect cart to show ${expectedCount} row(s)`).toHaveCount(
      expectedCount,
      {
        timeout: 15000,
      },
    )
    logger.step(`Wait for cart to show ${expectedCount} row(s) successfully`)
  }

  async openPlaceOrder(): Promise<void> {
    await this.placeOrderButton.click()
    logger.step('Open Place Order modal successfully')
  }
}
