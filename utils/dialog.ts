import { Page } from '@playwright/test'

/**
 * Register event listener for dialogs before the triggering action
 * and must accept() inside the handler itself (the alert fires synchronously
 * inside the click and blocks page script execution until dismissed).
 */
export async function captureDialog(page: Page, trigger: () => Promise<void>): Promise<string> {
  let message = ''
  page.once('dialog', async (dialog) => {
    message = dialog.message()
    await dialog.accept()
  })
  await trigger()
  return message
}
