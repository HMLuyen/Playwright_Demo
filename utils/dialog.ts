import { Dialog, Page } from '@playwright/test'

/**
 * Register the dialog listener before the triggering action and accept() inside the handler:
 * client-side alerts fire inside the click and block it until dismissed. Server-side alerts
 * fire after the response arrives, so wait up to timeoutMs for the dialog instead of returning
 * as soon as the click resolves.
 */
export async function captureDialog(
  page: Page,
  trigger: () => Promise<void>,
  timeoutMs = 5000,
): Promise<string> {
  let resolveMessage!: (message: string) => void
  const dialogMessage = new Promise<string>((resolve) => {
    resolveMessage = resolve
  })
  const onDialog = async (dialog: Dialog): Promise<void> => {
    const message = dialog.message()
    await dialog.accept()
    resolveMessage(message)
  }
  page.once('dialog', onDialog)

  let timer: NodeJS.Timeout | undefined
  try {
    await trigger()
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Expected a dialog within ${timeoutMs}ms but none appeared`)),
        timeoutMs,
      )
    })
    return await Promise.race([dialogMessage, timeout])
  } finally {
    clearTimeout(timer)
    page.off('dialog', onDialog)
  }
}
