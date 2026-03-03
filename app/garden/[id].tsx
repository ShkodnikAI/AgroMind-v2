/**
 * Garden Detail Screen — детали сада и список растений
 */

import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAlert } from '@/template';
import { useGardens } from '../../hooks/useGardens';
import { usePlants } from '../../hooks/usePlants';
import { PlantCard } from '../../components/features/PlantCard';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { theme } from '../../constants/theme';

export default function GardenDetailScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gardens, deleteGarden } = useGardens();
  const { getPlantsByGarden } = usePlants();
  
  const garden = gardens.find(g => g.id === id);
  const plants = getPlantsByGarden(id || '');
  
  if (!garden) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Сад не найден</Text>
      </View>
    );
  }
  
  const handleDelete = () => {
    showAlert(
      'Удалить сад?',
      `Будут удалены все растения в саду "${garden.name}"`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGarden(garden.id);
              showAlert('Успешно', 'Сад удалён');
              router.back();
            } catch (error: any) {
              showAlert('Ошибка', error.message || 'Не удалось удалить сад');
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
          <View style={styles.iconContainer}>
            <MaterialIcons name="yard" size={48} color={theme.colors.colorPrimary} />
          </View>
          
          <Text style={styles.name}>{garden.name}</Text>
          
          {garden.location && (
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color={theme.colors.colorTextSecondary} />
              <Text style={styles.location}>{garden.location}</Text>
            </View>
          )}
          
          {garden.description && (
            <Text style={styles.description}>{garden.description}</Text>
          )}
          
          <View style={styles.actions}>
            <Button
              title="Удалить сад"
              onPress={handleDelete}
              variant="danger"
              style={styles.deleteButton}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Растения ({plants.length})</Text>
            <TouchableOpacity
              onPress={() => router.push(`/plant/new?gardenId=${id}`)}
              accessibilityRole="button"
              accessibilityLabel="Добавить растение"
            >
              <MaterialIcons name="add-circle" size={28} color={theme.colors.colorPrimary} />
            </TouchableOpacity>
          </View>
          
          {plants.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="eco" size={48} color={theme.colors.colorTextTertiary} />
              <Text style={styles.emptyText}>Нет растений</Text>
              <Button
                title="Добавить растение"
                onPress={() => router.push(`/plant/new?gardenId=${id}`)}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            <View>
              {plants.map(plant => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onPress={() => router.push(`/plant/${plant.id}`)}
                />
              ))}
            </View>
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.colorBorder,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  location: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
    marginLeft: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
    lineHeight: theme.fontSize.md * theme.lineHeight.relaxed,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  deleteButton: {
    marginTop: theme.spacing.sm,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  emptyButton: {
    minWidth: 200,
  },
});
