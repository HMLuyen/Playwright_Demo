import { Locator } from '@playwright/test'
import { BaseModal } from './BaseModal'
import { captureDialog } from '../utils/dialog'
import { logger } from '../utils/logger'

export interface OrderDetails {
  name?: string
  country?: string
  city?: string
  card?: string
  month?: string
  year?: string
}

export interface PurchaseConfirmation {
  id: string
  amount: number
  cardNumber: string
  name: string
  date: string
}

/**
 * The site joins the confirmation fields with literal "\n" in its source
 * (Id: X\nAmount: Y USD\nCard Number: Z\nName: W\nDate: D), which sweetalert
 * renders with no visible separator in .textContent() — fields run together
 * with zero whitespace between them. Parse by label boundary, not by splitting
 * on whitespace/newlines.
 */
function parseConfirmationText(text: string): PurchaseConfirmation {
  const idMatch = text.match(/Id:\s*(\d+)/)
  const amountMatch = text.match(/Amount:\s*(\d+)\s*USD/)
  const cardMatch = text.match(/Card Number:\s*([\s\S]*?)Name:/)
  const nameMatch = text.match(/Name:\s*([\s\S]*?)Date:/)
  const dateMatch = text.match(/Date:\s*([\s\S]*)$/)
  return {
    id: idMatch?.[1] ?? '',
    amount: amountMatch ? parseInt(amountMatch[1], 10) : NaN,
    cardNumber: cardMatch?.[1]?.trim() ?? '',
    name: nameMatch?.[1]?.trim() ?? '',
    date: dateMatch?.[1]?.trim() ?? '',
  }
}

export class PlaceOrderModal extends BaseModal {
  private readonly placeOrderModal: Locator = this.page.locator('#orderModal')
  private readonly nameInput: Locator = this.placeOrderModal.locator('#name')
  private readonly countryInput: Locator = this.placeOrderModal.locator('#country')
  private readonly cityInput: Locator = this.placeOrderModal.locator('#city')
  private readonly cardInput: Locator = this.placeOrderModal.locator('#card')
  private readonly monthInput: Locator = this.placeOrderModal.locator('#month')
  private readonly yearInput: Locator = this.placeOrderModal.locator('#year')
  private readonly purchaseButton: Locator = this.placeOrderModal.getByRole('button', {
    name: 'Purchase',
  })
  private readonly okButton: Locator = this.page.getByRole('button', { name: 'OK' })
  private readonly confirmationPanel: Locator = this.page.locator('.sweet-alert')
  private readonly confirmationText: Locator = this.confirmationPanel.locator('p')

  async fill(details: OrderDetails): Promise<void> {
    if (details.name !== undefined) await this.nameInput.fill(details.name)
    if (details.country !== undefined) await this.countryInput.fill(details.country)
    if (details.city !== undefined) await this.cityInput.fill(details.city)
    if (details.card !== undefined) await this.cardInput.fill(details.card)
    if (details.month !== undefined) await this.monthInput.fill(details.month)
    if (details.year !== undefined) await this.yearInput.fill(details.year)
    logger.step('Fill order form successfully')
  }

  /** Missing Name/Card shows a native alert — use for the negative-path cases. */
  async submitExpectingDialog(): Promise<string> {
    const message = await captureDialog(this.page, async () => {
      await this.purchaseButton.click()
    })
    logger.step('Submit order, expect alert successfully')
    return message
  }

  /**
   * A valid submission shows a SweetAlert confirmation panel, not a native dialog —
   * confirmed live and from source (purchaseOrder() never checks cart length, so
   * this also fires for an empty cart; see the known-defect tests).
   */
  async submitExpectingConfirmation(): Promise<PurchaseConfirmation> {
    await this.purchaseButton.click()
    await this.confirmationPanel.getByText('Thank you for your purchase!').waitFor()
    const text = (await this.confirmationText.textContent()) ?? ''
    logger.step('Submit order, expect confirmation successfully')
    return parseConfirmationText(text)
  }

  async confirmOk(): Promise<void> {
    await this.okButton.click()
  }
}
