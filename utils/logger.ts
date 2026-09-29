/* eslint-disable no-console */
export type LogLevel = 'INFO' | 'STEP'

export interface Logger {
  log: (message: string, level?: LogLevel) => void
  step: (message: string) => void
}

export const logger: Logger = {
  log: (message: string, level = 'INFO'): void => {
    const index = process.env.TEST_PARALLEL_INDEX ?? 'global'
    console.log(`[Worker-${index}][${level}] ${message}`)
  },
  step: (message: string): void => {
    logger.log(message, 'STEP')
  },
}
