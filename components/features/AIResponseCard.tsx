/**
 * AIResponseCard — карточка AI-ответа с индикацией fallback-режима
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface Props {
  text: string;
  isFallback: boolean;
  onRetry?: () => void;
}

export function AIResponseCard({ text, isFallback, onRetry }: Props) {
  return (
    <View style={styles.container}>
      {isFallback && (
        <View
          style={styles.fallbackBanner}
          accessibilityRole="alert"
          accessibilityLabel="Показаны общие рекомендации, AI недоступен"
        >
          <MaterialIcons name="wifi-off" size={16} color={theme.colors.colorWarning} />
          <Text style={styles.bannerText}>Общие рекомендации (AI недоступен)</Text>
          {onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Повторить запрос к AI"
            >
              <Text style={styles.retryText}>Повторить</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.colorSurface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  fallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.colorWarning + '20',
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  bannerText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorWarning,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  retryText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorPrimary,
    fontWeight: theme.fontWeight.semibold,
  },
  text: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorText,
    lineHeight: theme.fontSize.md * theme.lineHeight.relaxed,
  },
});
