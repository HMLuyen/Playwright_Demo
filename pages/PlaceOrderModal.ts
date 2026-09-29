import { Locator, Page } from '@playwright/test';
import { captureDialog } from '../utils/dialog';

export interface OrderDetails {
  name?: string;
  country?: string;
  city?: string;
  card?: string;
  month?: string;
  year?: string;
}

export interface PurchaseConfirmation {
  id: string;
  amount: number;
  cardNumber: string;
  name: string;
  date: string;
}

/**
 * The site joins the confirmation fields with literal "\n" in its source
 * (Id: X\nAmount: Y USD\nCard Number: Z\nName: W\nDate: D), which sweetalert
 * renders with no visible separator in .textContent() — fields run together
 * with zero whitespace between them. Parse by label boundary, not by splitting
 * on whitespace/newlines.
 */
function parseConfirmationText(text: string): PurchaseConfirmation {
  const idMatch = text.match(/Id:\s*(\d+)/);
  const amountMatch = text.match(/Amount:\s*(\d+)\s*USD/);
  const cardMatch = text.match(/Card Number:\s*([\s\S]*?)Name:/);
  const nameMatch = text.match(/Name:\s*([\s\S]*?)Date:/);
  const dateMatch = text.match(/Date:\s*([\s\S]*)$/);
  return {
    id: idMatch?.[1] ?? '',
    amount: amountMatch ? parseInt(amountMatch[1], 10) : NaN,
    cardNumber: cardMatch?.[1]?.trim() ?? '',
    name: nameMatch?.[1]?.trim() ?? '',
    date: dateMatch?.[1]?.trim() ?? '',
  };
}

export class PlaceOrderModal {
  private readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('#orderModal');
  }

  async fill(details: OrderDetails): Promise<void> {
    if (details.name !== undefined) await this.root.locator('#name').fill(details.name);
    if (details.country !== undefined) await this.root.locator('#country').fill(details.country);
    if (details.city !== undefined) await this.root.locator('#city').fill(details.city);
    if (details.card !== undefined) await this.root.locator('#card').fill(details.card);
    if (details.month !== undefined) await this.root.locator('#month').fill(details.month);
    if (details.year !== undefined) await this.root.locator('#year').fill(details.year);
  }

  /** Missing Name/Card shows a native alert — use for the negative-path cases. */
  async submitExpectingDialog(): Promise<string> {
    return captureDialog(this.page, async () => {
      await this.root.getByRole('button', { name: 'Purchase' }).click();
    });
  }

  /**
   * A valid submission shows a SweetAlert confirmation panel, not a native dialog —
   * confirmed live and from source (purchaseOrder() never checks cart length, so
   * this also fires for an empty cart; see the known-defect tests).
   */
  async submitExpectingConfirmation(): Promise<PurchaseConfirmation> {
    await this.root.getByRole('button', { name: 'Purchase' }).click();
    const confirmation = this.page.locator('.sweet-alert');
    await confirmation.getByText('Thank you for your purchase!').waitFor();
    const text = (await confirmation.locator('p').textContent()) ?? '';
    return parseConfirmationText(text);
  }

  async confirmOk(): Promise<void> {
    await this.page.getByRole('button', { name: 'OK' }).click();
  }
}
