/**
 * Offline Queue — native версия (iOS/Android с uuid)
 * 
 * Стратегия:
 * - Оптимистичные обновления UI
 * - Запись в очередь при ошибке сети
 * - Автоматическая синхронизация при восстановлении сети
 * - Conflict resolution: last-write-wins по updatedAt
 */

import 'react-native-get-random-values'; // ⚠️ Первый импорт
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const QUEUE_KEY = 'agromind_offline_queue';
const MAX_RETRIES = 3;

export type EntityType = 'garden' | 'plant' | 'journal' | 'inventory' | 'calendar_task';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface OfflineAction {
  id: string;                    // UUID для идемпотентности
  type: ActionType;
  entity: EntityType;
  payload: Record<string, unknown>;
  timestamp: number;
  updatedAt: number;             // Для conflict resolution
  retryCount: number;
  synced: boolean;
  failed?: boolean;
}

/**
 * Получить текущую очередь из AsyncStorage
 */
async function getQueue(): Promise<OfflineAction[]> {
  try {
    const json = await AsyncStorage.getItem(QUEUE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('[OfflineQueue] Ошибка чтения очереди:', error);
    return [];
  }
}

/**
 * Сохранить очередь в AsyncStorage
 */
async function saveQueue(queue: OfflineAction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[OfflineQueue] Ошибка сохранения очереди:', error);
  }
}

/**
 * Добавить операцию в очередь
 * 
 * @param action - операция без служебных полей
 */
export async function addToQueue(
  action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'synced' | 'updatedAt'>
): Promise<void> {
  const queue = await getQueue();
  const now = Date.now();
  
  const newAction: OfflineAction = {
    ...action,
    id: uuidv4(),
    timestamp: now,
    updatedAt: now,
    retryCount: 0,
    synced: false,
  };
  
  await saveQueue([...queue, newAction]);
}

/**
 * Выполнить действие через Supabase
 */
async function executeSupabaseAction({ entity, type, payload, updatedAt }: OfflineAction): Promise<void> {
  const table = entity === 'calendar_task' ? 'care_calendar' : `${entity}s`;
  
  if (type === 'CREATE') {
    // Идемпотентность: upsert по id чтобы избежать дублей при повторах
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } else if (type === 'UPDATE') {
    const { id, ...data } = payload as any;
    // last-write-wins: обновляем только если наш updatedAt новее
    const { error } = await supabase
      .from(table)
      .update({ ...data, updated_at: new Date(updatedAt).toISOString() })
      .eq('id', id)
      .lt('updated_at', new Date(updatedAt).toISOString());
    if (error) throw error;
  } else if (type === 'DELETE') {
    const { error } = await supabase.from(table).delete().eq('id', payload.id);
    if (error) throw error;
  }
}

/**
 * Пометить действие как синхронизированное
 */
async function markActionSynced(actionId: string): Promise<void> {
  const queue = await getQueue();
  const updated = queue.map(a => a.id === actionId ? { ...a, synced: true } : a);
  await saveQueue(updated);
}

/**
 * Пометить действие как проваленное после MAX_RETRIES
 */
async function markActionFailed(actionId: string): Promise<void> {
  const queue = await getQueue();
  const updated = queue.map(a => a.id === actionId ? { ...a, failed: true } : a);
  await saveQueue(updated);
}

/**
 * Увеличить счётчик повторов
 */
async function incrementRetryCount(actionId: string): Promise<void> {
  const queue = await getQueue();
  const updated = queue.map(a => 
    a.id === actionId ? { ...a, retryCount: a.retryCount + 1 } : a
  );
  await saveQueue(updated);
}

/**
 * Синхронизировать офлайн-очередь с сервером
 * 
 * @returns статистика синхронизации
 */
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = await getQueue();
  const pending = queue.filter(a => !a.synced && !a.failed);
  
  let synced = 0;
  let failed = 0;
  
  for (const action of pending) {
    try {
      await executeSupabaseAction(action);
      await markActionSynced(action.id);
      synced++;
    } catch (error) {
      console.error(`[OfflineQueue] Ошибка синхронизации ${action.id}:`, error);
      
      if (action.retryCount >= MAX_RETRIES) {
        await markActionFailed(action.id);
        failed++;
      } else {
        await incrementRetryCount(action.id);
      }
    }
  }
  
  // Очистить синхронизированные действия старше 7 дней
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const cleaned = queue.filter(a => !a.synced || a.timestamp > cutoff);
  await saveQueue(cleaned);
  
  return { synced, failed };
}

/**
 * Получить количество неsynced операций
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.filter(a => !a.synced && !a.failed).length;
}

/**
 * Очистить всю очередь (только для тестов!)
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}
