import { Locator } from '@playwright/test'
import { BasePage } from './BasePage'
import { captureDialog } from '../utils/dialog'
import { logger } from '../utils/logger'

export class ProductPage extends BasePage {
  private readonly productTitle: Locator = this.page.locator('.name')
  private readonly priceContainer: Locator = this.page.locator('.price-container')
  private readonly addToCartLink: Locator = this.page.getByRole('link', { name: 'Add to cart' })

  async goto(productId: number): Promise<void> {
    await this.page.goto(`/prod.html?idp_=${productId}`)
    await this.productTitle.waitFor({ state: 'visible' })
    logger.step(`Go to product page (id=${productId}) successfully`)
  }

  async getTitle(): Promise<string> {
    return (await this.productTitle.textContent())?.trim() ?? ''
  }

  async getPriceText(): Promise<string> {
    return (await this.priceContainer.textContent())?.trim() ?? ''
  }

  async addToCart(): Promise<string> {
    const message = await captureDialog(this.page, async () => {
      await this.addToCartLink.click()
    })
    logger.step('Add product to cart successfully')
    return message
  }
}
