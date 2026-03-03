/**
 * New Plant Screen — добавление нового растения
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAlert } from '@/template';
import { usePlants } from '../../hooks/usePlants';
import { useGardens } from '../../hooks/useGardens';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

export default function NewPlantScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { addPlant } = usePlants();
  const { gardens } = useGardens();
  const { gardenId } = useLocalSearchParams<{ gardenId?: string }>();
  
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [plantedAt, setPlantedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const selectedGarden = gardens.find(g => g.id === gardenId);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Введите название растения';
    }
    
    if (!gardenId) {
      newErrors.general = 'Выберите сад';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate() || !gardenId) return;
    
    setLoading(true);
    try {
      await addPlant({
        garden_id: gardenId,
        name: name.trim(),
        variety: variety.trim() || null,
        planted_at: plantedAt.trim() || null,
        notes: notes.trim() || null,
        image_url: null,
      });
      
      showAlert('Успешно', 'Растение добавлено');
      router.back();
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось добавить растение');
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
          {selectedGarden && (
            <View style={styles.gardenInfo}>
              <Text style={styles.gardenLabel}>Сад:</Text>
              <Text style={styles.gardenName}>{selectedGarden.name}</Text>
            </View>
          )}
          
          <Input
            label="Название растения *"
            value={name}
            onChangeText={setName}
            placeholder="Томат, яблоня, роза..."
            error={errors.name}
            maxLength={100}
          />
          
          <Input
            label="Сорт"
            value={variety}
            onChangeText={setVariety}
            placeholder="Название сорта"
            maxLength={100}
          />
          
          <Input
            label="Дата посадки"
            value={plantedAt}
            onChangeText={setPlantedAt}
            placeholder="2024-03-15"
            maxLength={10}
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
          
          {errors.general && (
            <Text style={styles.generalError}>{errors.general}</Text>
          )}
          
          <Button
            title="Добавить растение"
            onPress={handleSubmit}
            loading={loading}
            disabled={!name.trim() || !gardenId}
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
  gardenInfo: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  gardenLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginBottom: theme.spacing.xs,
  },
  gardenName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
  },
  textarea: {
    height: 80,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  generalError: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorDanger,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
