/**
 * New Inventory Item Screen — добавление элемента инвентаря
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { useInventory } from '../../hooks/useInventory';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

export default function NewInventoryScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { addItem } = useInventory();
  
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Введите название';
    }
    
    if (quantity && isNaN(Number(quantity))) {
      newErrors.quantity = 'Количество должно быть числом';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await addItem({
        name: name.trim(),
        quantity: quantity ? Number(quantity) : null,
        unit: unit.trim() || null,
      });
      
      showAlert('Успешно', 'Элемент добавлен');
      router.back();
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось добавить элемент');
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
          <Text style={styles.hint}>
            Добавьте семена, удобрения, инструменты или другие материалы
          </Text>
          
          <Input
            label="Название *"
            value={name}
            onChangeText={setName}
            placeholder="Семена томатов, Компост, Лопата..."
            error={errors.name}
            maxLength={100}
          />
          
          <Input
            label="Количество"
            value={quantity}
            onChangeText={setQuantity}
            placeholder="100"
            keyboardType="numeric"
            error={errors.quantity}
          />
          
          <Input
            label="Единица измерения"
            value={unit}
            onChangeText={setUnit}
            placeholder="г, кг, шт, л..."
            maxLength={20}
          />
          
          <Button
            title="Добавить в инвентарь"
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
  hint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
