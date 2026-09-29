/**
 * Builds a unique username per worker so parallel CI matrix jobs never collide
 * (DemoBlaze has no delete-account endpoint, so accounts are never torn down —
 * they just need to never clash with each other).
 */
export function generateWorkerUsername(projectName: string, workerIndex: number): string {
  const safeProject = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `pwdemo_${safeProject}_w${workerIndex}_${Date.now()}_${randomSuffix}`;
}

export const DEFAULT_TEST_PASSWORD = 'DemoPass123!';
