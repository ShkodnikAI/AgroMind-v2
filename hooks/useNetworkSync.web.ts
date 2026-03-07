/**
 * useNetworkSync (Web) — упрощённая версия без background fetch
 * 
 * Только синхронизация при восстановлении сети, без фоновых задач
 */

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineQueue } from '../services/offlineQueue';
import { useAlert } from '@/template';

export function useNetworkSync(): void {
  const { showAlert } = useAlert();
  
  useEffect(() => {
    // Слушать изменения сети (без background sync)
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        try {
          const { synced, failed } = await syncOfflineQueue();
          
          if (failed > 0) {
            showAlert(
              'Ошибка синхронизации',
              `${failed} операций не синхронизировано. Проверьте данные.`
            );
          } else if (synced > 0) {
            console.log(`[NetworkSync] Синхронизировано: ${synced}`);
          }
        } catch (error) {
          console.error('[NetworkSync] Ошибка:', error);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);
}
