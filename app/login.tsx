/**
 * Login Screen — авторизация через Google OAuth
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Button } from '../components/ui/Button';
import { theme } from '../constants/theme';

export default function LoginScreen() {
  const { signInWithGoogle, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        showAlert('Ошибка входа', error);
      }
    } catch (err: any) {
      showAlert('Ошибка', err.message || 'Не удалось войти');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialIcons name="eco" size={80} color="#FFFFFF" />
            <Text style={styles.title}>AgroMind</Text>
            <Text style={styles.subtitle}>Ваш умный помощник садовода</Text>
          </View>
          
          <View style={styles.footer}>
            <Button
              title="Войти через Google"
              onPress={handleGoogleSignIn}
              loading={loading || operationLoading}
              variant="secondary"
              accessibilityLabel="Войти через Google аккаунт"
              style={styles.button}
            />
            
            <Text style={styles.hint}>
              Создавайте сады, отслеживайте растения,{'\n'}
              получайте AI-советы по уходу
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
    marginTop: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing.md,
  },
  hint: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: theme.fontSize.sm * theme.lineHeight.relaxed,
  },
});
