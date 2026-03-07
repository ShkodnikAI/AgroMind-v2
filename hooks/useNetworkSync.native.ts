/**
 * useNetworkSync — автоматическая синхронизация при восстановлении сети
 * + регистрация фоновой синхронизации
 */

import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineQueue } from '../services/offlineQueue';
import { registerBackgroundSync } from '../services/backgroundSync';
import { useAlert } from '@/template';

export function useNetworkSync(): void {
  const { showAlert } = useAlert();
  
  useEffect(() => {
    // Зарегистрировать фоновую синхронизацию при монтировании
    registerBackgroundSync().catch(error => {
      console.error('[useNetworkSync] Ошибка регистрации background sync:', error);
    });
    
    // Слушать изменения сети
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
