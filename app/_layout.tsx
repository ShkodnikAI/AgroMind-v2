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
import { useNetworkSync } from '../hooks/useNetworkSync';
import { requestPermissions } from '../services/notifications';

function NetworkSyncWrapper({ children }: { children: React.ReactNode }) {
  useNetworkSync();
  
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
                <NetworkSyncWrapper>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="garden/new" options={{ presentation: 'modal', headerShown: true, title: 'Новый сад' }} />
                  <Stack.Screen name="plant/new" options={{ presentation: 'modal', headerShown: true, title: 'Новое растение' }} />
                  <Stack.Screen name="calendar/new" options={{ presentation: 'modal', headerShown: true, title: 'Новая задача' }} />
                  <Stack.Screen name="garden/[id]" options={{ headerShown: true, title: 'Сад' }} />
                  <Stack.Screen name="plant/[id]" options={{ headerShown: true, title: 'Растение' }} />
                </Stack>
                </NetworkSyncWrapper>
              </CalendarProvider>
            </PlantsProvider>
          </GardensProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
