/**
 * Root Layout — провайдеры и глобальная конфигурация
 * 
 * Критично: AlertProvider → AuthProvider → GardensProvider → PlantsProvider
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider, AuthProvider } from '@/template';
import { GardensProvider } from '../contexts/GardensContext';
import { PlantsProvider } from '../contexts/PlantsContext';
import { CalendarProvider } from '../contexts/CalendarContext';
import { MapProvider } from '../contexts/MapContext';
import { InventoryProvider } from '../contexts/InventoryContext';
import { useNetworkSync } from '../hooks/useNetworkSync';
import { requestPermissions } from '../services/notifications';
import { initSentry, setSentryUser, clearSentryUser } from '../services/sentry';
import { useAuth } from '@/template';

// Инициализировать Sentry при старте приложения
initSentry();

function NetworkSyncWrapper({ children }: { children: React.ReactNode }) {
  useNetworkSync();
  const { user } = useAuth();
  
  // Установить пользователя в Sentry при авторизации
  useEffect(() => {
    if (user) {
      setSentryUser(user.id, user.email);
    } else {
      clearSentryUser();
    }
  }, [user]);
  
  // Запросить разрешения на уведомления при первом запуске
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const granted = await requestPermissions();
        if (granted) {
          console.log('[App] Разрешения на уведомления получены');
        } else {
          console.warn('[App] Разрешения на уведомления не получены');
        }
      } catch (error) {
        console.error('[App] Ошибка запроса разрешений на уведомления:', error);
      }
    };
    
    setupNotifications();
  }, []);
  
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <GardensProvider>
            <PlantsProvider>
              <CalendarProvider>
                <MapProvider>
                  <InventoryProvider>
                    <NetworkSyncWrapper>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="garden/new" options={{ presentation: 'modal', headerShown: true, title: 'Новый сад' }} />
                  <Stack.Screen name="plant/new" options={{ presentation: 'modal', headerShown: true, title: 'Новое растение' }} />
                  <Stack.Screen name="calendar/new" options={{ presentation: 'modal', headerShown: true, title: 'Новая задача' }} />
                  <Stack.Screen name="garden/[id]" options={{ headerShown: true, title: 'Сад' }} />
                  <Stack.Screen name="plant/[id]" options={{ headerShown: true, title: 'Растение' }} />
                  <Stack.Screen name="inventory/new" options={{ presentation: 'modal', headerShown: true, title: 'Новый элемент' }} />
                </Stack>
                    </NetworkSyncWrapper>
                  </InventoryProvider>
                </MapProvider>
              </CalendarProvider>
            </PlantsProvider>
          </GardensProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
