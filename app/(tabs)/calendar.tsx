/**
 * Calendar Screen — календарь задач ухода
 */

import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { useCalendar } from '../../hooks/useCalendar';
import { usePlants } from '../../hooks/usePlants';
import { CalendarItem } from '../../components/features/CalendarItem';
import { Loader } from '../../components/ui/Loader';
import { theme } from '../../constants/theme';

export default function CalendarScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { tasks, loading, completeTask, deleteTask, refreshTasks } = useCalendar();
  const { plants } = usePlants();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  
  const getPlantName = (plantId: string): string => {
    return plants.find(p => p.id === plantId)?.name || 'Неизвестное растение';
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'upcoming') {
      return !task.completed_at && new Date(task.scheduled_at) >= new Date();
    }
    if (filter === 'completed') {
      return !!task.completed_at;
    }
    return true;
  });
  
  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      showAlert('Успешно', 'Задача выполнена');
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось отметить задачу');
    }
  };
  
  const handleDelete = (taskId: string) => {
    showAlert('Удалить задачу?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId);
            showAlert('Успешно', 'Задача удалена');
          } catch (error: any) {
            showAlert('Ошибка', error.message || 'Не удалось удалить задачу');
          }
        },
      },
    ]);
  };
  
  if (loading && tasks.length === 0) {
    return <Loader />;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Календарь ухода</Text>
      </View>
      
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterActive]}
          onPress={() => setFilter('upcoming')}
          accessibilityRole="button"
          accessibilityLabel="Предстоящие задачи"
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Предстоящие
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
          accessibilityRole="button"
          accessibilityLabel="Все задачи"
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Все
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterActive]}
          onPress={() => setFilter('completed')}
          accessibilityRole="button"
          accessibilityLabel="Выполненные задачи"
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Выполненные
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredTasks.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="event-available" size={64} color={theme.colors.colorTextTertiary} />
          <Text style={styles.emptyText}>
            {filter === 'completed' ? 'Нет выполненных задач' : 'Нет задач'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CalendarItem
              task={item}
              plantName={getPlantName(item.plant_id)}
              onComplete={() => handleComplete(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshTasks}
              tintColor={theme.colors.colorPrimary}
            />
          }
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: theme.colors.colorPrimary,
  },
  filterText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorTextSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
    marginTop: theme.spacing.sm,
  },
});
