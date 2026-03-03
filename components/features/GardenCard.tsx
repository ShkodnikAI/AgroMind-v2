/**
 * GardenCard — карточка сада
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { theme } from '../../constants/theme';
import type { Garden } from '../../services/supabase';

interface GardenCardProps {
  garden: Garden;
  plantCount: number;
  onPress: () => void;
}

export function GardenCard({ garden, plantCount, onPress }: GardenCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Сад ${garden.name}, ${plantCount} растений`}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="yard" size={32} color={theme.colors.colorPrimary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={1}>
              {garden.name}
            </Text>
            {garden.location && (
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={14} color={theme.colors.colorTextSecondary} />
                <Text style={styles.location} numberOfLines={1}>
                  {garden.location}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {garden.description && (
          <Text style={styles.description} numberOfLines={2}>
            {garden.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.badge}>
            <MaterialIcons name="local-florist" size={16} color={theme.colors.colorPrimaryMid} />
            <Text style={styles.count}>{plantCount} растений</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginLeft: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    lineHeight: theme.fontSize.sm * theme.lineHeight.relaxed,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.colorSurfaceVariant,
    borderRadius: theme.borderRadius.sm,
  },
  count: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorText,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
});
