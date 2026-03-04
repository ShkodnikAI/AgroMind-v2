/**
 * Image Service — загрузка и компрессия фото растений
 * 
 * Стратегия:
 * - Компрессия до ≤500KB перед загрузкой
 * - Уникальные имена файлов: {userId}/{plantId}_{timestamp}.jpg
 * - RLS политика: пользователь может загружать только в свою папку
 */

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

/**
 * Запросить разрешение на доступ к камере
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Запросить разрешение на доступ к медиатеке
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Выбрать изображение из галереи
 */
export async function pickImage(): Promise<string | null> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    throw new Error('Нет доступа к галерее');
  }
  
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
  
  if (result.canceled) return null;
  
  return result.assets[0].uri;
}

/**
 * Сделать фото камерой
 */
export async function takePhoto(): Promise<string | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Нет доступа к камере');
  }
  
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
  
  if (result.canceled) return null;
  
  return result.assets[0].uri;
}

/**
 * Сжать изображение до ≤500KB
 * 
 * @param uri - локальный URI изображения
 * @returns URI сжатого изображения
 */
export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    return result.uri;
  } catch (error) {
    console.error('[ImageService] Ошибка компрессии:', error);
    throw new Error('Не удалось обработать изображение');
  }
}

/**
 * Загрузить фото растения в Supabase Storage
 * 
 * Путь: {userId}/{plantId}_{timestamp}.jpg
 * 
 * @param uri - URI изображения
 * @param userId - ID пользователя (для RLS)
 * @param plantId - ID растения
 * @returns публичный URL изображения
 */
export async function uploadPlantImage(
  uri: string,
  userId: string,
  plantId: string
): Promise<string> {
  try {
    // Сжать изображение
    const compressedUri = await compressImage(uri);
    
    // Уникальное имя файла
    const timestamp = Date.now();
    const filePath = `${userId}/${plantId}_${timestamp}.jpg`;
    
    // Конвертировать в blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    
    // Загрузить в storage
    const { error: uploadError } = await supabase.storage
      .from('plants-images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (uploadError) throw uploadError;
    
    // Получить публичный URL
    const { data } = supabase.storage
      .from('plants-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('[ImageService] Ошибка загрузки:', error);
    throw new Error(error.message || 'Не удалось загрузить фото');
  }
}

/**
 * Удалить фото растения из Storage
 * 
 * @param imageUrl - публичный URL изображения
 */
export async function deletePlantImage(imageUrl: string): Promise<void> {
  try {
    // Извлечь путь из URL
    const urlParts = imageUrl.split('/plants-images/');
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('plants-images')
      .remove([filePath]);
    
    if (error) throw error;
  } catch (error) {
    console.error('[ImageService] Ошибка удаления фото:', error);
    // Не бросаем ошибку - удаление фото не критично
  }
}
