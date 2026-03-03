/**
 * PlantCard — карточка растения
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';
import type { Plant } from '../../services/supabase';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface PlantCardProps {
  plant: Plant;
  onPress: () => void;
}

export function PlantCard({ plant, onPress }: PlantCardProps) {
  const plantedDate = plant.planted_at 
    ? format(new Date(plant.planted_at), 'd MMMM yyyy', { locale: ru })
    : null;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Растение ${plant.name}${plant.variety ? ', сорт ' + plant.variety : ''}`}
    >
      <Card style={styles.card}>
        <View style={styles.content}>
          {plant.image_url ? (
            <Image
              source={{ uri: plant.image_url }}
              style={styles.image}
              accessibilityLabel={`Фото растения ${plant.name}`}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="eco" size={32} color={theme.colors.colorPrimaryMid} />
            </View>
          )}
          
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {plant.name}
            </Text>
            {plant.variety && (
              <Text style={styles.variety} numberOfLines={1}>
                {plant.variety}
              </Text>
            )}
            {plantedDate && (
              <View style={styles.dateRow}>
                <MaterialIcons name="event" size={14} color={theme.colors.colorTextTertiary} />
                <Text style={styles.date}>{plantedDate}</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.xs,
  },
  variety: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginBottom: theme.spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.colorTextTertiary,
    marginLeft: theme.spacing.xs,
  },
});
