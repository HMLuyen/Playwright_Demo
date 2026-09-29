import { Page } from '@playwright/test'

/** Base for modal/dialog components — not a navigable page, no URL, opened from within a page. */
export abstract class BaseModal {
  constructor(protected readonly page: Page) {}
}
