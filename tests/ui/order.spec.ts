import { test, expect } from '../../fixtures/ui-fixtures'
import { ProductPage } from '../../pages/ProductPage'
import { CartPage } from '../../pages/CartPage'
import { PlaceOrderModal } from '../../pages/PlaceOrderModal'
import { loginViaApi } from '../../utils/auth'
import { SAMSUNG_GALAXY_S6, ORDER_TEST_ACCOUNT } from './order.testdata'

test.describe('Place Order', () => {
  test.beforeEach(async ({ page, context, workerApiClient, baseURL }) => {
    await loginViaApi({
      client: workerApiClient,
      context,
      page,
      baseURL: baseURL!,
      account: ORDER_TEST_ACCOUNT,
    })
  })

  test(
    'a valid order with only Name and Card succeeds',
    { tag: ['@TC-014', '@smoke'] },
    async ({ page }) => {
      const productPage = new ProductPage(page)
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      await productPage.goto(SAMSUNG_GALAXY_S6.id)
      await productPage.addToCart()
      await cartPage.goto()
      await cartPage.waitForRowCount(1)
      await cartPage.openPlaceOrder()

      await placeOrderModal.fill({ name: 'Luha QA', card: '4111111111111111' })
      const confirmation = await placeOrderModal.submitExpectingConfirmation()

      expect(confirmation.name).toBe('Luha QA')
      expect(confirmation.cardNumber).toBe('4111111111111111')
      expect(confirmation.amount).toBe(SAMSUNG_GALAXY_S6.price)
      expect(confirmation.id).toMatch(/^\d+$/)
    },
  )

  test(
    'missing both Name and Card shows validation alert',
    { tag: ['@TC-015', '@regression'] },
    async ({ page }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      await cartPage.goto()
      await cartPage.openPlaceOrder()
      const message = await placeOrderModal.submitExpectingDialog()
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )

  test(
    'missing Name only shows the same validation alert',
    { tag: ['@TC-016', '@regression'] },
    async ({ page }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      await cartPage.goto()
      await cartPage.openPlaceOrder()
      await placeOrderModal.fill({ card: '4111111111111111' })
      const message = await placeOrderModal.submitExpectingDialog()
      // Confirmed from source: a single `name == "" || creditcard == ""` check,
      // so missing either field alone produces the identical combined message.
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )

  test(
    'missing Card only shows the same validation alert',
    { tag: ['@TC-017', '@regression'] },
    async ({ page }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      await cartPage.goto()
      await cartPage.openPlaceOrder()
      await placeOrderModal.fill({ name: 'Luha QA' })
      const message = await placeOrderModal.submitExpectingDialog()
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )

  test(
    'known defect — an order can be placed with an empty cart',
    { tag: ['@TC-018', '@regression', '@known-defect'] },
    async ({ page }) => {
      test.fail(true, 'Known defect: an order can be placed with an empty cart')

      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      await cartPage.goto()
      await cartPage.waitForRowCount(0)
      await cartPage.openPlaceOrder()
      await placeOrderModal.fill({ name: 'Empty Cart Test', card: '4111111111111111' })
      const confirmation = await placeOrderModal.submitExpectingConfirmation()

      expect(confirmation.amount).toBeGreaterThan(0)
    },
  )

  test(
    'known defect — confirmation date is one month behind the real date',
    { tag: ['@TC-019', '@regression', '@known-defect'] },
    async ({ page }) => {
      test.fail(true, 'Known defect: confirmation date is one month behind the real date')

      const productPage = new ProductPage(page)
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      await productPage.goto(SAMSUNG_GALAXY_S6.id)
      await productPage.addToCart()
      await cartPage.goto()
      await cartPage.waitForRowCount(1)
      await cartPage.openPlaceOrder()
      await placeOrderModal.fill({ name: 'Date Bug Test', card: '4111111111111111' })
      const confirmation = await placeOrderModal.submitExpectingConfirmation()

      // Computed in UTC to match playwright.config.ts's timezoneId: 'UTC', so this
      // stays deterministic regardless of the CI runner's local timezone.
      const now = new Date()
      const expectedDate = `${now.getUTCDate()}/${now.getUTCMonth() + 1}/${now.getUTCFullYear()}`
      expect(confirmation.date).toBe(expectedDate)
    },
  )
})
