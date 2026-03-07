/**
 * InventoryCard — карточка элемента инвентаря
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { InventoryItem } from '../../contexts/InventoryContext';
import { theme } from '../../constants/theme';

interface Props {
  item: InventoryItem;
  onPress?: () => void;
  onDelete?: () => void;
}

export function InventoryCard({ item, onPress, onDelete }: Props) {
  const getIcon = () => {
    const name = item.name.toLowerCase();
    if (name.includes('семена') || name.includes('семя')) return 'spa';
    if (name.includes('удобрени') || name.includes('компост')) return 'eco';
    if (name.includes('инструмент') || name.includes('лопата') || name.includes('грабли')) return 'build';
    if (name.includes('горшок') || name.includes('контейнер')) return 'widgets';
    return 'inventory';
  };
  
  const getQuantityColor = () => {
    if (!item.quantity) return theme.colors.colorTextTertiary;
    if (item.quantity < 5) return theme.colors.colorWarning;
    return theme.colors.colorSuccess;
  };
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, количество: ${item.quantity || 'не указано'}`}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name={getIcon()} size={24} color={theme.colors.colorPrimary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        
        {item.quantity !== null && (
          <View style={styles.quantityRow}>
            <MaterialIcons name="numbers" size={14} color={getQuantityColor()} />
            <Text style={[styles.quantity, { color: getQuantityColor() }]}>
              {item.quantity} {item.unit || ''}
            </Text>
          </View>
        )}
      </View>
      
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Удалить элемент"
        >
          <MaterialIcons name="delete" size={20} color={theme.colors.colorDanger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.colorSurface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.xs,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: theme.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
});
