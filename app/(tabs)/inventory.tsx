/**
 * Inventory Screen — учёт садового инвентаря
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useInventory } from '../../hooks/useInventory';
import { useAlert } from '@/template';
import { InventoryCard } from '../../components/features/InventoryCard';
import { Loader } from '../../components/ui/Loader';
import { theme } from '../../constants/theme';

export default function InventoryScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { items, loading, deleteItem, refreshItems } = useInventory();
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshItems();
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Удалить элемент?',
      `"${name}" будет удалён из инвентаря`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(id);
              showAlert('Успешно', 'Элемент удалён');
            } catch (error: any) {
              showAlert('Ошибка', error.message || 'Не удалось удалить');
            }
          },
        },
      ]
    );
  };
  
  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Loader />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Инвентарь</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/inventory/new' as any)}
          accessibilityRole="button"
          accessibilityLabel="Добавить элемент инвентаря"
        >
          <MaterialIcons name="add" size={28} color={theme.colors.colorPrimary} />
        </TouchableOpacity>
      </View>
      
      {items.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="inventory" size={64} color={theme.colors.colorTextTertiary} />
          <Text style={styles.emptyText}>Инвентарь пуст</Text>
          <Text style={styles.emptyHint}>
            Добавьте семена, удобрения и инструменты
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <InventoryCard
              item={item}
              onPress={() => router.push(`/inventory/${item.id}` as any)}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: theme.spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginTop: theme.spacing.md,
  },
  emptyHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
