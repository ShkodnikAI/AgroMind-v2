/**
 * Loader — индикатор загрузки
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export function Loader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.colorPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
