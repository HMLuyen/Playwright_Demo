import { test as base } from '@playwright/test';
import { DemoblazeClient } from '../api/demoblazeClient';
import { generateWorkerUsername, DEFAULT_TEST_PASSWORD } from '../utils/users';
import { API_URL } from '../utils/env';
import { HomePage } from '../pages/HomePage';
import { LoginModal } from '../pages/LoginModal';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { PlaceOrderModal } from '../pages/PlaceOrderModal';

interface WorkerAccount {
  username: string;
  password: string;
  token: string;
}

interface TestFixtures {
  homePage: HomePage;
  loginModal: LoginModal;
  /** Authenticated page, cart cleared, for Order tests. Login tests use plain `page` instead. */
  authenticatedPage: import('@playwright/test').Page;
  productPage: ProductPage;
  cartPage: CartPage;
  placeOrderModal: PlaceOrderModal;
}

interface WorkerFixtures {
  workerApiClient: DemoblazeClient;
  workerAccount: WorkerAccount;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // One API client per worker, used for account setup and per-test cart clearing.
  workerApiClient: [
    async ({ playwright }, use) => {
      const requestContext = await playwright.request.newContext({ baseURL: API_URL });
      await use(new DemoblazeClient(requestContext, API_URL));
      await requestContext.dispose();
    },
    { scope: 'worker' },
  ],

  // One account per worker — cart is mutated by tests, so it stays unique per worker.
  workerAccount: [
    async ({ workerApiClient }, use, workerInfo) => {
      const username = generateWorkerUsername(workerInfo.project.name, workerInfo.workerIndex);
      const password = DEFAULT_TEST_PASSWORD;
      await workerApiClient.signup({ username, password });
      const token = await workerApiClient.login({ username, password });
      await use({ username, password, token });
    },
    { scope: 'worker' },
  ],

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginModal: async ({ page }, use) => {
    await use(new LoginModal(page));
  },

  authenticatedPage: async ({ page, context, workerAccount, workerApiClient, baseURL }, use) => {
    await workerApiClient.clearCart(workerAccount.username);
    await context.addCookies([{ name: 'tokenp_', value: workerAccount.token, url: baseURL }]);
    await page.goto('/');
    // Confirms the auth cookie actually took.
    await page.locator('#nameofuser').waitFor({ state: 'visible' });
    await use(page);
  },

  productPage: async ({ authenticatedPage }, use) => {
    await use(new ProductPage(authenticatedPage));
  },

  cartPage: async ({ authenticatedPage }, use) => {
    await use(new CartPage(authenticatedPage));
  },

  placeOrderModal: async ({ authenticatedPage }, use) => {
    await use(new PlaceOrderModal(authenticatedPage));
  },
});

export { expect } from '@playwright/test';
