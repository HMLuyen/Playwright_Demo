import { BrowserContext, Page } from '@playwright/test'
import { DemoblazeClient } from '../api/demoblazeClient'
import { logger } from './logger'

export interface FixedAccount {
  username: string
  password: string
}

export async function loginViaApi(params: {
  client: DemoblazeClient
  context: BrowserContext
  page: Page
  baseURL: string
  account: FixedAccount
}): Promise<void> {
  const { client, context, page, baseURL, account } = params
  const token = await client.login(account)
  await client.clearCart(account.username)
  await context.addCookies([{ name: 'tokenp_', value: token, url: baseURL }])
  await page.goto('/')
  await page.locator('#nameofuser').waitFor({ state: 'visible' })
  logger.step(`Log in via API as ${account.username} successfully`)
}
