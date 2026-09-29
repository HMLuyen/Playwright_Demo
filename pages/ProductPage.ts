import { Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { captureDialog } from '../utils/dialog'
import { logger } from '../utils/logger'

export class ProductPage extends BasePage {
  private readonly productTitle: Locator = this.page.locator('.name')
  private readonly addToCartLink: Locator = this.page.getByRole('link', { name: 'Add to cart' })

  async goto(productId: number): Promise<void> {
    await this.page.goto(`/prod.html?idp_=${productId}`)
    await this.productTitle.waitFor({ state: 'visible' })
    logger.step(`Go to product page (id=${productId}) successfully`)
  }

  async addToCart(): Promise<string> {
    const message = await captureDialog(this.page, async () => {
      await this.addToCartLink.click()
    })
    expect(message, 'Expect "Product added." alert after add to cart').toBe('Product added.')
    logger.step('Add product to cart successfully')
    return message
  }
}
