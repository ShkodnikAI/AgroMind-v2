/**
 * Root Layout — провайдеры и глобальная конфигурация
 * 
 * Критично: AlertProvider → AuthProvider → GardensProvider → PlantsProvider
 */

import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider, AuthProvider } from '@/template';
import { GardensProvider } from '../contexts/GardensContext';
import { PlantsProvider } from '../contexts/PlantsContext';
import { useNetworkSync } from '../hooks/useNetworkSync';

function NetworkSyncWrapper({ children }: { children: React.ReactNode }) {
  useNetworkSync();
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <GardensProvider>
            <PlantsProvider>
              <NetworkSyncWrapper>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="garden/new" options={{ presentation: 'modal', headerShown: true, title: 'Новый сад' }} />
                  <Stack.Screen name="plant/new" options={{ presentation: 'modal', headerShown: true, title: 'Новое растение' }} />
                  <Stack.Screen name="garden/[id]" options={{ headerShown: true, title: 'Сад' }} />
                  <Stack.Screen name="plant/[id]" options={{ headerShown: true, title: 'Растение' }} />
                </Stack>
              </NetworkSyncWrapper>
            </PlantsProvider>
          </GardensProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </AlertProvider>
  );
}
