/* eslint-disable no-console */
export type LogLevel = 'INFO' | 'STEP' | 'DEBUG' | 'WARNING' | 'ERROR'

export interface Logger {
  log: (message: string, level?: LogLevel) => void
  step: (message: string) => void
  error: (message: string, error: unknown, stackTrace?: boolean) => void
}

/**
 * Coerce an unknown thrown value into a human-readable string for logs.
 * Handles Error instances (most common), plain objects (JSON.stringify with a circular-ref
 * guard), and primitives — avoiding the `[object Object]` result from a naive `String(error)`.
 */
export const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error)
    } catch {
      // Circular reference or other stringify failure — fall through.
    }
  }
  return String(error)
}

export const logger: Logger = {
  log: (message: string, level = 'INFO'): void => {
    const index = process.env.TEST_PARALLEL_INDEX ?? 'global'
    console.log(`[Worker-${index}][${level}] ${message}`)
  },
  step: (message: string): void => {
    logger.log(message, 'STEP')
  },
  error: (message: string, error: unknown, stackTrace: boolean = false): void => {
    console.error(message, stackTrace ? error : formatError(error))
  },
}
