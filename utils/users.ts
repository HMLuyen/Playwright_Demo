/**
 * Builds a unique username per worker so parallel CI matrix jobs never collide.
 */
export function generateWorkerUsername(projectName: string, workerIndex: number): string {
  const safeProject = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `pwdemo_${safeProject}_w${workerIndex}_${Date.now()}_${randomSuffix}`
}
