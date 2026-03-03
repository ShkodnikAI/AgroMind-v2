/**
 * Plant Detail Screen — детали растения
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAlert } from '@/template';
import { usePlants } from '../../hooks/usePlants';
import { useGardens } from '../../hooks/useGardens';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function PlantDetailScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plants, deletePlant } = usePlants();
  const { gardens } = useGardens();
  
  const plant = plants.find(p => p.id === id);
  const garden = plant ? gardens.find(g => g.id === plant.garden_id) : null;
  
  if (!plant) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Растение не найдено</Text>
      </View>
    );
  }
  
  const plantedDate = plant.planted_at
    ? format(new Date(plant.planted_at), 'd MMMM yyyy', { locale: ru })
    : null;
  
  const handleDelete = () => {
    showAlert(
      'Удалить растение?',
      `Растение "${plant.name}" будет удалено навсегда`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlant(plant.id);
              showAlert('Успешно', 'Растение удалено');
              router.back();
            } catch (error: any) {
              showAlert('Ошибка', error.message || 'Не удалось удалить растение');
            }
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll}>
        <View style={styles.header}>
          {plant.image_url ? (
            <Image
              source={{ uri: plant.image_url }}
              style={styles.image}
              accessibilityLabel={`Фото растения ${plant.name}`}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="eco" size={64} color={theme.colors.colorPrimaryMid} />
            </View>
          )}
          
          <Text style={styles.name}>{plant.name}</Text>
          
          {plant.variety && (
            <Text style={styles.variety}>{plant.variety}</Text>
          )}
          
          {garden && (
            <View style={styles.gardenBadge}>
              <MaterialIcons name="yard" size={16} color={theme.colors.colorPrimary} />
              <Text style={styles.gardenName}>{garden.name}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          {plantedDate && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MaterialIcons name="event" size={20} color={theme.colors.colorPrimary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Дата посадки</Text>
                <Text style={styles.infoValue}>{plantedDate}</Text>
              </View>
            </View>
          )}
          
          {plant.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Заметки</Text>
              <Text style={styles.notesText}>{plant.notes}</Text>
            </View>
          )}
          
          <Button
            title="Удалить растение"
            onPress={handleDelete}
            variant="danger"
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorBackground,
  },
  scroll: {
    flex: 1,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.colorSurface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.colorBorder,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  variety: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.colorTextSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  gardenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.colorSurfaceVariant,
    borderRadius: theme.borderRadius.round,
  },
  gardenName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorPrimary,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  section: {
    padding: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.colorSurface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorText,
  },
  notesContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.colorSurface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  notesLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorTextSecondary,
    marginBottom: theme.spacing.sm,
  },
  notesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorText,
    lineHeight: theme.fontSize.md * theme.lineHeight.relaxed,
  },
  deleteButton: {
    marginTop: theme.spacing.md,
  },
});
