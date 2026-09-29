export const SAMSUNG_GALAXY_S6 = { id: 1, name: 'Samsung galaxy s6', price: 360 }

/**
 * One dedicated account per test.describe group in order.spec.ts, not one shared account —
 * lets groups run in parallel against each other (no shared cart/session), while each group
 * is internally serial to avoid racing itself.
 */
export const ORDER_VALIDATION_ACCOUNT = {
  username: 'testUserOrderValidation',
  password: 'DemoPass123!',
}
export const ORDER_PLACEMENT_ACCOUNT = {
  username: 'testUserOrderPlacement',
  password: 'DemoPass123!',
}
export const ORDER_EMPTYCART_ACCOUNT = {
  username: 'testUserOrderEmptyCart',
  password: 'DemoPass123!',
}
