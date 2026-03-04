/**
 * New Calendar Task Screen — создание задачи ухода
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAlert } from '@/template';
import { useCalendar, TaskType } from '../../contexts/CalendarContext';
import { usePlants } from '../../hooks/usePlants';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

const TASK_TYPES: { value: TaskType; label: string; icon: string }[] = [
  { value: 'watering', label: 'Полив', icon: 'water-drop' },
  { value: 'fertilizing', label: 'Подкормка', icon: 'grain' },
  { value: 'pruning', label: 'Обрезка', icon: 'content-cut' },
  { value: 'other', label: 'Другое', icon: 'more-horiz' },
];

export default function NewCalendarTaskScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { addTask } = useCalendar();
  const { plants } = usePlants();
  const { plantId } = useLocalSearchParams<{ plantId?: string }>();
  
  const [selectedPlantId, setSelectedPlantId] = useState(plantId || '');
  const [taskType, setTaskType] = useState<TaskType>('watering');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const selectedPlant = plants.find(p => p.id === selectedPlantId);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedPlantId) {
      newErrors.plant = 'Выберите растение';
    }
    
    if (!scheduledDate) {
      newErrors.date = 'Введите дату';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      newErrors.date = 'Формат даты: ГГГГ-ММ-ДД';
    }
    
    if (scheduledTime && !/^\d{2}:\d{2}$/.test(scheduledTime)) {
      newErrors.time = 'Формат времени: ЧЧ:ММ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    const dateTime = scheduledTime 
      ? `${scheduledDate}T${scheduledTime}:00`
      : `${scheduledDate}T12:00:00`;
    
    setLoading(true);
    try {
      await addTask({
        plant_id: selectedPlantId,
        task_type: taskType,
        scheduled_at: dateTime,
        notes: notes.trim() || null,
      });
      
      showAlert('Успешно', 'Задача добавлена');
      router.back();
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось добавить задачу');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {selectedPlant && (
            <View style={styles.plantInfo}>
              <MaterialIcons name="eco" size={24} color={theme.colors.colorPrimary} />
              <Text style={styles.plantName}>{selectedPlant.name}</Text>
            </View>
          )}
          
          {!plantId && plants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Растение *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plantsList}
              >
                {plants.map(plant => (
                  <TouchableOpacity
                    key={plant.id}
                    style={[
                      styles.plantChip,
                      selectedPlantId === plant.id && styles.plantChipActive,
                    ]}
                    onPress={() => setSelectedPlantId(plant.id)}
                  >
                    <Text
                      style={[
                        styles.plantChipText,
                        selectedPlantId === plant.id && styles.plantChipTextActive,
                      ]}
                    >
                      {plant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.plant && <Text style={styles.error}>{errors.plant}</Text>}
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.label}>Тип задачи *</Text>
            <View style={styles.taskTypes}>
              {TASK_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.taskType,
                    taskType === type.value && styles.taskTypeActive,
                  ]}
                  onPress={() => setTaskType(type.value)}
                  accessibilityRole="button"
                  accessibilityLabel={type.label}
                >
                  <MaterialIcons
                    name={type.icon as any}
                    size={24}
                    color={
                      taskType === type.value
                        ? '#FFFFFF'
                        : theme.colors.colorPrimary
                    }
                  />
                  <Text
                    style={[
                      styles.taskTypeText,
                      taskType === type.value && styles.taskTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Input
            label="Дата *"
            value={scheduledDate}
            onChangeText={setScheduledDate}
            placeholder="2024-03-15"
            error={errors.date}
            maxLength={10}
          />
          
          <Input
            label="Время (опционально)"
            value={scheduledTime}
            onChangeText={setScheduledTime}
            placeholder="14:00"
            error={errors.time}
            maxLength={5}
          />
          
          <Input
            label="Заметки"
            value={notes}
            onChangeText={setNotes}
            placeholder="Дополнительная информация"
            multiline
            numberOfLines={3}
            style={styles.textarea}
            maxLength={500}
          />
          
          <Button
            title="Добавить задачу"
            onPress={handleSubmit}
            loading={loading}
            disabled={!selectedPlantId || !scheduledDate}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  plantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  plantName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginLeft: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.sm,
  },
  plantsList: {
    gap: theme.spacing.sm,
  },
  plantChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.colorSurfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.colorBorder,
  },
  plantChipActive: {
    backgroundColor: theme.colors.colorPrimary,
    borderColor: theme.colors.colorPrimary,
  },
  plantChipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorText,
  },
  plantChipTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
  taskTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  taskType: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  taskTypeActive: {
    backgroundColor: theme.colors.colorPrimary,
    borderColor: theme.colors.colorPrimary,
  },
  taskTypeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorText,
    marginTop: theme.spacing.xs,
  },
  taskTypeTextActive: {
    color: '#FFFFFF',
  },
  textarea: {
    height: 80,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorDanger,
    marginTop: theme.spacing.xs,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
