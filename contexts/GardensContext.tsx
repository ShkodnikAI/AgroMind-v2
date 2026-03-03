/**
 * GardensContext — управление садами пользователя
 * 
 * Паттерн:
 * - Оптимистичные обновления UI
 * - Кеширование в AsyncStorage
 * - Offline queue при ошибке сети
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, type Garden } from '../services/supabase';
import { addToQueue } from '../services/offlineQueue';
import { useAuth } from '@/template';

const CACHE_KEY = 'agromind_gardens_cache';

interface GardensContextType {
  gardens: Garden[];
  loading: boolean;
  error: string | null;
  addGarden: (garden: Omit<Garden, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGarden: (id: string, updates: Partial<Garden>) => Promise<void>;
  deleteGarden: (id: string) => Promise<void>;
  refreshGardens: () => Promise<void>;
}

export const GardensContext = createContext<GardensContextType | undefined>(undefined);

/**
 * Provider для управления садами
 */
export function GardensProvider({ children }: { children: ReactNode }) {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  /**
   * Загрузить сады из кеша
   */
  const loadFromCache = async (): Promise<Garden[]> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (err) {
      console.error('[GardensContext] Ошибка чтения кеша:', err);
      return [];
    }
  };
  
  /**
   * Сохранить сады в кеш
   */
  const saveToCache = async (data: Garden[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[GardensContext] Ошибка записи кеша:', err);
    }
  };
  
  /**
   * Загрузить сады с сервера
   */
  const fetchGardens = async (): Promise<void> => {
    if (!user) {
      setGardens([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('gardens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setGardens(data || []);
      await saveToCache(data || []);
    } catch (err: any) {
      console.error('[GardensContext] Ошибка загрузки садов:', err);
      setError(err.message || 'Не удалось загрузить сады');
      
      // Загрузить из кеша при ошибке сети
      const cached = await loadFromCache();
      setGardens(cached);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Добавить новый сад
   */
  const addGarden = async (garden: Omit<Garden, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<void> => {
    if (!user) throw new Error('Пользователь не авторизован');
    
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    
    const newGarden: Garden = {
      id: tempId,
      user_id: user.id,
      ...garden,
      created_at: now,
      updated_at: now,
    };
    
    // Оптимистичное обновление
    setGardens(prev => [newGarden, ...prev]);
    
    try {
      const { data, error: insertError } = await supabase
        .from('gardens')
        .insert({
          user_id: user.id,
          name: garden.name,
          description: garden.description,
          location: garden.location,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Заменить временный ID на реальный
      setGardens(prev => prev.map(g => g.id === tempId ? data : g));
      await saveToCache(gardens);
    } catch (err: any) {
      console.error('[GardensContext] Ошибка добавления сада:', err);
      
      // Откат UI и добавление в offline queue
      setGardens(prev => prev.filter(g => g.id !== tempId));
      
      await addToQueue({
        type: 'CREATE',
        entity: 'garden',
        payload: { ...newGarden, id: undefined },
      });
      
      throw err;
    }
  };
  
  /**
   * Обновить сад
   */
  const updateGarden = async (id: string, updates: Partial<Garden>): Promise<void> => {
    const original = gardens.find(g => g.id === id);
    if (!original) throw new Error('Сад не найден');
    
    // Оптимистичное обновление
    setGardens(prev => prev.map(g => 
      g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g
    ));
    
    try {
      const { error: updateError } = await supabase
        .from('gardens')
        .update(updates)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      await saveToCache(gardens);
    } catch (err: any) {
      console.error('[GardensContext] Ошибка обновления сада:', err);
      
      // Откат UI
      setGardens(prev => prev.map(g => g.id === id ? original : g));
      
      await addToQueue({
        type: 'UPDATE',
        entity: 'garden',
        payload: { id, ...updates },
      });
      
      throw err;
    }
  };
  
  /**
   * Удалить сад
   */
  const deleteGarden = async (id: string): Promise<void> => {
    const original = gardens.find(g => g.id === id);
    if (!original) throw new Error('Сад не найден');
    
    // Оптимистичное удаление
    setGardens(prev => prev.filter(g => g.id !== id));
    
    try {
      const { error: deleteError } = await supabase
        .from('gardens')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      await saveToCache(gardens);
    } catch (err: any) {
      console.error('[GardensContext] Ошибка удаления сада:', err);
      
      // Откат UI
      setGardens(prev => [...prev, original]);
      
      await addToQueue({
        type: 'DELETE',
        entity: 'garden',
        payload: { id },
      });
      
      throw err;
    }
  };
  
  // Загрузить сады при монтировании и изменении пользователя
  useEffect(() => {
    fetchGardens();
  }, [user]);
  
  const value: GardensContextType = {
    gardens,
    loading,
    error,
    addGarden,
    updateGarden,
    deleteGarden,
    refreshGardens: fetchGardens,
  };
  
  return (
    <GardensContext.Provider value={value}>
      {children}
    </GardensContext.Provider>
  );
}
