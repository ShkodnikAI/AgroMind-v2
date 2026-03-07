/**
 * Background Sync Service (Web) — заглушка для веб-версии
 * 
 * expo-background-fetch не поддерживается на Web
 */

/**
 * Зарегистрировать фоновую задачу синхронизации (Web - no-op)
 */
export async function registerBackgroundSync(): Promise<void> {
  console.log('[BackgroundSync] Web не поддерживает фоновую синхронизацию');
}

/**
 * Отменить регистрацию фоновой задачи (Web - no-op)
 */
export async function unregisterBackgroundSync(): Promise<void> {
  // No-op на Web
}

/**
 * Получить статус фоновой задачи (Web - всегда unavailable)
 */
export async function getBackgroundSyncStatus(): Promise<number> {
  return 1; // BackgroundFetchStatus.Unavailable
}
