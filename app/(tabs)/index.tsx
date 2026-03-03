/**
 * Gardens List Screen — главный экран со списком садов
 */

import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/template';
import { useGardens } from '../../hooks/useGardens';
import { usePlants } from '../../hooks/usePlants';
import { GardenCard } from '../../components/features/GardenCard';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import { theme } from '../../constants/theme';

export default function GardensScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { gardens, loading, refreshGardens } = useGardens();
  const { plants } = usePlants();
  
  const handleLogout = async () => {
    await logout();
  };
  
  const getPlantCount = (gardenId: string) => {
    return plants.filter(p => p.garden_id === gardenId).length;
  };
  
  if (loading && gardens.length === 0) {
    return <Loader />;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Мои сады</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Выйти из аккаунта"
          style={styles.logoutButton}
        >
          <MaterialIcons name="logout" size={24} color={theme.colors.colorText} />
        </TouchableOpacity>
      </View>
      
      {gardens.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="yard" size={64} color={theme.colors.colorTextTertiary} />
          <Text style={styles.emptyTitle}>Нет садов</Text>
          <Text style={styles.emptyText}>
            Создайте первый сад, чтобы начать{'\n'}отслеживать ваши растения
          </Text>
          <Button
            title="Создать сад"
            onPress={() => router.push('/garden/new')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={gardens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GardenCard
              garden={item}
              plantCount={getPlantCount(item.id)}
              onPress={() => router.push(`/garden/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshGardens}
              tintColor={theme.colors.colorPrimary}
            />
          }
        />
      )}
      
      {gardens.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/garden/new')}
          accessibilityRole="button"
          accessibilityLabel="Добавить новый сад"
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
    marginTop: theme.spacing.xs,
  },
  logoutButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.colorTextSecondary,
    textAlign: 'center',
    lineHeight: theme.fontSize.md * theme.lineHeight.relaxed,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.md,
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.colorPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: theme.shadow.lg,
      android: { elevation: 8 },
    }),
  },
});
