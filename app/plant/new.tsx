/**
 * New Plant Screen — добавление нового растения
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAlert } from '@/template';
import { usePlants } from '../../hooks/usePlants';
import { useGardens } from '../../hooks/useGardens';
import { useAuth } from '@/template';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { pickImage, takePhoto, uploadPlantImage } from '../../services/imageService';
import { theme } from '../../constants/theme';

export default function NewPlantScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { addPlant } = usePlants();
  const { gardens } = useGardens();
  const { user } = useAuth();
  const { gardenId } = useLocalSearchParams<{ gardenId?: string }>();
  
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [plantedAt, setPlantedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
  
  const handlePickImage = async () => {
    try {
      const uri = await pickImage();
      if (uri) setImageUri(uri);
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось выбрать фото');
    }
  };
  
  const handleTakePhoto = async () => {
    try {
      const uri = await takePhoto();
      if (uri) setImageUri(uri);
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось сделать фото');
    }
  };
  
  const handleRemoveImage = () => {
    Alert.alert('Удалить фото?', '', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => setImageUri(null) },
    ]);
  };
  
  const handleSubmit = async () => {
    if (!validate() || !gardenId || !user) return;
    
    setLoading(true);
    try {
      let imageUrl: string | null = null;
      
      if (imageUri) {
        setUploadingImage(true);
        const tempId = `temp_${Date.now()}`;
        imageUrl = await uploadPlantImage(imageUri, user.id, tempId);
        setUploadingImage(false);
      }
      
      await addPlant({
        garden_id: gardenId,
        name: name.trim(),
        variety: variety.trim() || null,
        planted_at: plantedAt.trim() || null,
        notes: notes.trim() || null,
        image_url: imageUrl,
      });
      
      showAlert('Успешно', 'Растение добавлено');
      router.back();
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось добавить растение');
    } finally {
      setLoading(false);
      setUploadingImage(false);
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
          
          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Фото растения</Text>
            
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveImage}
                  accessibilityRole="button"
                  accessibilityLabel="Удалить фото"
                >
                  <MaterialIcons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="eco" size={48} color={theme.colors.colorTextTertiary} />
              </View>
            )}
            
            <View style={styles.imageButtons}>
              <Button
                title="Галерея"
                onPress={handlePickImage}
                variant="secondary"
                style={styles.halfButton}
                icon={<MaterialIcons name="photo-library" size={20} color={theme.colors.colorPrimary} />}
              />
              <Button
                title="Камера"
                onPress={handleTakePhoto}
                variant="secondary"
                style={styles.halfButton}
                icon={<MaterialIcons name="photo-camera" size={20} color={theme.colors.colorPrimary} />}
              />
            </View>
          </View>
          
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
            title={uploadingImage ? 'Загрузка фото...' : 'Добавить растение'}
            onPress={handleSubmit}
            loading={loading || uploadingImage}
            disabled={!name.trim() || !gardenId || uploadingImage}
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
  imageSection: {
    marginBottom: theme.spacing.md,
  },
  imageLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.colorDanger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
});
