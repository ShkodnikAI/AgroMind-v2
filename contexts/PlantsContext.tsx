/**
 * PlantsContext — управление растениями в садах
 * 
 * Паттерн:
 * - Оптимистичные обновления UI
 * - Кеширование в AsyncStorage
 * - Offline queue при ошибке сети
 * - Зависимость от GardensContext
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, type Plant } from '../services/supabase';
import { addToQueue } from '../services/offlineQueue';
import { useAuth } from '@/template';
import { useGardens } from '../hooks/useGardens';

const CACHE_KEY = 'agromind_plants_cache';

interface PlantsContextType {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  getPlantsByGarden: (gardenId: string) => Plant[];
  addPlant: (plant: Omit<Plant, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  refreshPlants: () => Promise<void>;
}

export const PlantsContext = createContext<PlantsContextType | undefined>(undefined);

/**
 * Provider для управления растениями
 */
export function PlantsProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { gardens } = useGardens();
  
  /**
   * Загрузить растения из кеша
   */
  const loadFromCache = async (): Promise<Plant[]> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (err) {
      console.error('[PlantsContext] Ошибка чтения кеша:', err);
      return [];
    }
  };
  
  /**
   * Сохранить растения в кеш
   */
  const saveToCache = async (data: Plant[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[PlantsContext] Ошибка записи кеша:', err);
    }
  };
  
  /**
   * Загрузить растения с сервера
   */
  const fetchPlants = async (): Promise<void> => {
    if (!user || gardens.length === 0) {
      setPlants([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const gardenIds = gardens.map(g => g.id);
      
      const { data, error: fetchError } = await supabase
        .from('plants')
        .select('*')
        .in('garden_id', gardenIds)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setPlants(data || []);
      await saveToCache(data || []);
    } catch (err: any) {
      console.error('[PlantsContext] Ошибка загрузки растений:', err);
      setError(err.message || 'Не удалось загрузить растения');
      
      // Загрузить из кеша при ошибке сети
      const cached = await loadFromCache();
      setPlants(cached);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Получить растения конкретного сада
   */
  const getPlantsByGarden = (gardenId: string): Plant[] => {
    return plants.filter(p => p.garden_id === gardenId);
  };
  
  /**
   * Добавить новое растение
   */
  const addPlant = async (plant: Omit<Plant, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    
    const newPlant: Plant = {
      id: tempId,
      ...plant,
      created_at: now,
      updated_at: now,
    };
    
    // Оптимистичное обновление
    setPlants(prev => [newPlant, ...prev]);
    
    try {
      const { data, error: insertError } = await supabase
        .from('plants')
        .insert({
          garden_id: plant.garden_id,
          name: plant.name,
          variety: plant.variety,
          planted_at: plant.planted_at,
          image_url: plant.image_url,
          notes: plant.notes,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Заменить временный ID на реальный
      setPlants(prev => prev.map(p => p.id === tempId ? data : p));
      await saveToCache(plants);
    } catch (err: any) {
      console.error('[PlantsContext] Ошибка добавления растения:', err);
      
      // Откат UI и добавление в offline queue
      setPlants(prev => prev.filter(p => p.id !== tempId));
      
      await addToQueue({
        type: 'CREATE',
        entity: 'plant',
        payload: { ...newPlant, id: undefined },
      });
      
      throw err;
    }
  };
  
  /**
   * Обновить растение
   */
  const updatePlant = async (id: string, updates: Partial<Plant>): Promise<void> => {
    const original = plants.find(p => p.id === id);
    if (!original) throw new Error('Растение не найдено');
    
    // Оптимистичное обновление
    setPlants(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
    
    try {
      const { error: updateError } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      await saveToCache(plants);
    } catch (err: any) {
      console.error('[PlantsContext] Ошибка обновления растения:', err);
      
      // Откат UI
      setPlants(prev => prev.map(p => p.id === id ? original : p));
      
      await addToQueue({
        type: 'UPDATE',
        entity: 'plant',
        payload: { id, ...updates },
      });
      
      throw err;
    }
  };
  
  /**
   * Удалить растение
   */
  const deletePlant = async (id: string): Promise<void> => {
    const original = plants.find(p => p.id === id);
    if (!original) throw new Error('Растение не найдено');
    
    // Оптимистичное удаление
    setPlants(prev => prev.filter(p => p.id !== id));
    
    try {
      const { error: deleteError } = await supabase
        .from('plants')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      await saveToCache(plants);
    } catch (err: any) {
      console.error('[PlantsContext] Ошибка удаления растения:', err);
      
      // Откат UI
      setPlants(prev => [...prev, original]);
      
      await addToQueue({
        type: 'DELETE',
        entity: 'plant',
        payload: { id },
      });
      
      throw err;
    }
  };
  
  // Загрузить растения при изменении садов
  useEffect(() => {
    fetchPlants();
  }, [user, gardens]);
  
  const value: PlantsContextType = {
    plants,
    loading,
    error,
    getPlantsByGarden,
    addPlant,
    updatePlant,
    deletePlant,
    refreshPlants: fetchPlants,
  };
  
  return (
    <PlantsContext.Provider value={value}>
      {children}
    </PlantsContext.Provider>
  );
}
