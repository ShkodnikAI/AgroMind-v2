/**
 * CalendarItem — карточка задачи ухода
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { CalendarTask } from '../../contexts/CalendarContext';
import { theme } from '../../constants/theme';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props {
  task: CalendarTask;
  plantName: string;
  onComplete: () => void;
  onDelete: () => void;
}

const taskIcons: Record<string, string> = {
  watering: 'water-drop',
  fertilizing: 'eco',
  pruning: 'content-cut',
  other: 'event',
};

const taskColors: Record<string, string> = {
  watering: theme.colors.colorInfo,
  fertilizing: theme.colors.colorSuccess,
  pruning: theme.colors.colorWarning,
  other: theme.colors.colorTextSecondary,
};

const taskLabels: Record<string, string> = {
  watering: 'Полив',
  fertilizing: 'Подкормка',
  pruning: 'Обрезка',
  other: 'Другое',
};

export function CalendarItem({ task, plantName, onComplete, onDelete }: Props) {
  const isCompleted = !!task.completed_at;
  const isPast = new Date(task.scheduled_at) < new Date() && !isCompleted;
  
  const scheduledDate = format(new Date(task.scheduled_at), 'd MMMM, HH:mm', { locale: ru });
  
  const iconName = taskIcons[task.task_type] || 'event';
  const iconColor = taskColors[task.task_type] || theme.colors.colorTextSecondary;
  const label = taskLabels[task.task_type] || 'Задача';
  
  return (
    <View style={[styles.container, isCompleted && styles.completed]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <MaterialIcons name={iconName as any} size={24} color={iconColor} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.label, isCompleted && styles.completedText]}>
          {label}
        </Text>
        <Text style={[styles.plant, isCompleted && styles.completedText]}>
          {plantName}
        </Text>
        <View style={styles.dateRow}>
          <MaterialIcons
            name="schedule"
            size={14}
            color={isPast ? theme.colors.colorDanger : theme.colors.colorTextSecondary}
          />
          <Text style={[styles.date, isPast && styles.pastDate]}>
            {scheduledDate}
          </Text>
        </View>
        {task.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {task.notes}
          </Text>
        )}
      </View>
      
      <View style={styles.actions}>
        {!isCompleted ? (
          <TouchableOpacity
            onPress={onComplete}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel="Отметить выполненным"
          >
            <MaterialIcons name="check-circle" size={28} color={theme.colors.colorSuccess} />
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check" size={16} color={theme.colors.colorSuccess} />
          </View>
        )}
        
        <TouchableOpacity
          onPress={onDelete}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel="Удалить задачу"
        >
          <MaterialIcons name="delete" size={24} color={theme.colors.colorDanger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.colorSurface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  completed: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.colorTextSecondary,
  },
  plant: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginBottom: theme.spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginLeft: theme.spacing.xs,
  },
  pastDate: {
    color: theme.colors.colorDanger,
    fontWeight: theme.fontWeight.medium,
  },
  notes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextTertiary,
    fontStyle: 'italic',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.colorSuccess + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
});
