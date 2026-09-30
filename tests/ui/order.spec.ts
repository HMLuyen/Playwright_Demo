import { test, expect } from '../../fixtures/base-test'
import { ProductPage } from '../../pages/ProductPage'
import { CartPage } from '../../pages/CartPage'
import { PlaceOrderModal } from '../../components/PlaceOrderModal'
import { loginViaApi } from '../../utils/auth'
import {
  SAMSUNG_GALAXY_S6,
  ORDER_VALIDATION_ACCOUNT,
  ORDER_PLACEMENT_ACCOUNT,
  ORDER_EMPTYCART_ACCOUNT,
} from './order.testdata'

test.describe('Place Order — validation errors', () => {
  test.describe.configure({ mode: 'default' })

  test.beforeAll(async ({ apiClient }) => {
    // Demoblaze can reset its data and has no delete-account API, so signup is idempotent setup.
    await apiClient.signup(ORDER_VALIDATION_ACCOUNT)
  })

  test.beforeEach(async ({ page, context, apiClient, baseURL }) => {
    await loginViaApi({
      client: apiClient,
      context,
      page,
      baseURL: baseURL!,
      account: ORDER_VALIDATION_ACCOUNT,
    })
  })

  test(
    'Verify missing both Name and Card shows validation alert',
    { tag: ['@TC-010', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page')
      await cartPage.goto()

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Leave Name and Card empty, click "Purchase"')
      const message = await placeOrderModal.submitExpectingDialog()

      log.step('4. Verify alert message')
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )

  test(
    'Verify missing Name only shows the same validation alert',
    { tag: ['@TC-011', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page')
      await cartPage.goto()

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Card only, leave Name empty')
      await placeOrderModal.fill({ card: '123' })

      log.step('4. Click "Purchase"')
      const message = await placeOrderModal.submitExpectingDialog()

      log.step('5. Verify alert message')
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )

  test(
    'Verify missing Card only shows the same validation alert',
    { tag: ['@TC-012', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page')
      await cartPage.goto()

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Name only, leave Card empty')
      await placeOrderModal.fill({ name: 'Luha QA' })

      log.step('4. Click "Purchase"')
      const message = await placeOrderModal.submitExpectingDialog()

      log.step('5. Verify alert message')
      expect(message).toBe('Please fill out Name and Creditcard.')
    },
  )
})

test.describe('Place Order — placement', () => {
  test.describe.configure({ mode: 'default' })

  test.beforeAll(async ({ apiClient }) => {
    // Demoblaze can reset its data and has no delete-account API, so signup is idempotent setup.
    await apiClient.signup(ORDER_PLACEMENT_ACCOUNT)
  })

  test.beforeEach(async ({ page, context, apiClient, baseURL }) => {
    await loginViaApi({
      client: apiClient,
      context,
      page,
      baseURL: baseURL!,
      account: ORDER_PLACEMENT_ACCOUNT,
    })
  })

  test(
    'Verify a valid order with only Name and Card succeeds',
    { tag: ['@TC-009', '@smoke'] },
    async ({ page, log }) => {
      const productPage = new ProductPage(page)
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('0. Precondition: add item to cart')
      await productPage.goto(SAMSUNG_GALAXY_S6.id)
      await productPage.addToCart()

      log.step('1. Go to Cart page')
      await cartPage.goto()
      await cartPage.waitForRowCount(1)

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Name and Card')
      await placeOrderModal.fill({ name: 'Luha QA', card: '123' })

      log.step('4. Click "Purchase"')
      const confirmation = await placeOrderModal.submitExpectingConfirmation()

      log.step('5. Verify order confirmation details')
      expect(confirmation.name).toBe('Luha QA')
      expect(confirmation.cardNumber).toBe('123')
      expect(confirmation.amount).toBe(SAMSUNG_GALAXY_S6.price)
      expect(confirmation.id).toMatch(/^\d+$/)
    },
  )
})

test.describe('Place Order — empty cart defect', () => {
  test.beforeAll(async ({ apiClient }) => {
    // Demoblaze can reset its data and has no delete-account API, so signup is idempotent setup.
    await apiClient.signup(ORDER_EMPTYCART_ACCOUNT)
  })

  test.beforeEach(async ({ page, context, apiClient, baseURL }) => {
    await loginViaApi({
      client: apiClient,
      context,
      page,
      baseURL: baseURL!,
      account: ORDER_EMPTYCART_ACCOUNT,
    })
  })

  test(
    'Verify an order can be placed with an empty cart',
    { tag: ['@TC-013', '@regression'] },
    async ({ page, log }) => {
      const cartPage = new CartPage(page)
      const placeOrderModal = new PlaceOrderModal(page)

      log.step('1. Go to Cart page with empty cart')
      await cartPage.goto()
      await cartPage.waitForRowCount(0)

      log.step('2. Click "Place Order"')
      await cartPage.openPlaceOrder()

      log.step('3. Fill Name and Card')
      await placeOrderModal.fill({ name: 'Empty Cart Test', card: '123' })

      log.step('4. Click "Purchase"')
      const confirmation = await placeOrderModal.submitExpectingConfirmation()

      log.step('5. Verify order amount is 0')
      expect(confirmation.amount).toBe(0)
    },
  )
})
