import { Locator, test } from '@playwright/test'
import { BasePage } from './BasePage'
import { captureDialog } from '../utils/dialog'

export class ProductPage extends BasePage {
  private readonly productTitle: Locator = this.page.locator('.name')
  private readonly priceContainer: Locator = this.page.locator('.price-container')
  private readonly addToCartLink: Locator = this.page.getByRole('link', { name: 'Add to cart' })

  async goto(productId: number): Promise<void> {
    await test.step(`Go to product page (id=${productId})`, async () => {
      await this.page.goto(`/prod.html?idp_=${productId}`)
      await this.productTitle.waitFor({ state: 'visible' })
    })
  }

  async getTitle(): Promise<string> {
    return (await this.productTitle.textContent())?.trim() ?? ''
  }

  async getPriceText(): Promise<string> {
    return (await this.priceContainer.textContent())?.trim() ?? ''
  }

  /**
   * Returns the alert message. Logged-in path shows "Product added." (with a period);
   * the guest path shows "Product added" (no period) — a real copy inconsistency
   * between the two, confirmed from source, not a rendering artifact.
   */
  async addToCart(): Promise<string> {
    return test.step('Add product to cart', async () => {
      return captureDialog(this.page, async () => {
        await this.addToCartLink.click()
      })
    })
  }
}
