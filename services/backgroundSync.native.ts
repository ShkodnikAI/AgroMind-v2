/**
 * Background Sync Service — фоновая синхронизация offline-очереди
 * 
 * Использует expo-background-fetch для периодической синхронизации
 * даже когда приложение закрыто.
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { syncOfflineQueue } from './offlineQueue.native';

const BACKGROUND_SYNC_TASK = 'AGROMIND_BACKGROUND_SYNC';

/**
 * Определить фоновую задачу синхронизации
 * КРИТИЧНО: вызвать ДО registerBackgroundSync
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log('[BackgroundSync] Запуск фоновой синхронизации...');
    
    const { synced, failed } = await syncOfflineQueue();
    
    console.log(`[BackgroundSync] Синхронизировано: ${synced}, Ошибок: ${failed}`);
    
    return synced > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundSync] Ошибка:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Зарегистрировать фоновую задачу синхронизации
 * Вызывать при старте приложения (app/_layout.tsx)
 */
export async function registerBackgroundSync(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    
    if (isRegistered) {
      console.log('[BackgroundSync] Задача уже зарегистрирована');
      return;
    }
    
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // каждые 15 минут
      stopOnTerminate: false, // продолжать после закрытия
      startOnBoot: true, // запускать после перезагрузки
    });
    
    console.log('[BackgroundSync] Задача зарегистрирована успешно');
  } catch (error) {
    console.error('[BackgroundSync] Ошибка регистрации:', error);
  }
}

/**
 * Отменить регистрацию фоновой задачи
 */
export async function unregisterBackgroundSync(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    console.log('[BackgroundSync] Задача отменена');
  } catch (error) {
    console.error('[BackgroundSync] Ошибка отмены:', error);
  }
}

/**
 * Получить статус фоновой задачи
 */
export async function getBackgroundSyncStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
  return await BackgroundFetch.getStatusAsync();
}
