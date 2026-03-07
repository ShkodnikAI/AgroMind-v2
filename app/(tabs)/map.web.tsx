/**
 * Map Screen (Web) — заглушка для веб-версии
 * 
 * react-native-maps не поддерживается на Web
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <MaterialIcons name="map" size={64} color={theme.colors.colorTextTertiary} />
        <Text style={styles.title}>Карта сада</Text>
        <Text style={styles.description}>
          Карта доступна только в мобильном приложении
        </Text>
        <Text style={styles.hint}>
          Откройте приложение на Android или iOS устройстве чтобы использовать карту сада
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorBackground,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextTertiary,
    textAlign: 'center',
  },
});
