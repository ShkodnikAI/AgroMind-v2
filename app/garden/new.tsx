/**
 * New Garden Screen — создание нового сада
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { useGardens } from '../../hooks/useGardens';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

export default function NewGardenScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { addGarden } = useGardens();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Введите название сада';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await addGarden({
        name: name.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
      });
      
      showAlert('Успешно', 'Сад создан');
      router.back();
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось создать сад');
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
          <Input
            label="Название сада *"
            value={name}
            onChangeText={setName}
            placeholder="Мой сад"
            error={errors.name}
            maxLength={100}
          />
          
          <Input
            label="Описание"
            value={description}
            onChangeText={setDescription}
            placeholder="Краткое описание сада"
            multiline
            numberOfLines={3}
            style={styles.textarea}
            maxLength={500}
          />
          
          <Input
            label="Местоположение"
            value={location}
            onChangeText={setLocation}
            placeholder="Город, район"
            maxLength={200}
          />
          
          <Button
            title="Создать сад"
            onPress={handleSubmit}
            loading={loading}
            disabled={!name.trim()}
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
  textarea: {
    height: 80,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
