/**
 * Inventory Context — управление садовым инвентарём
 * 
 * Функции:
 * - CRUD инвентаря (семена, удобрения, инструменты)
 * - Отслеживание количества
 * - Offline-first с кешированием
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { addToQueue } from '../services/offlineQueue';
import { useAuth } from '@/template';
import { useAlert } from '@/template';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  created_at: string;
}

interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  addItem: (data: Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateItem: (id: string, data: Partial<Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

export const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Загрузить инвентарь из Supabase + кеш
   */
  const loadItems = async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setItems(data || []);
    } catch (err: any) {
      console.error('[InventoryContext] Ошибка загрузки:', err);
      setError(err.message || 'Не удалось загрузить инвентарь');
      showAlert('Ошибка', 'Не удалось загрузить инвентарь');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Добавить элемент инвентаря
   */
  const addItem = async (data: Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Требуется авторизация');
    
    try {
      const newItem = {
        user_id: user.id,
        name: data.name,
        quantity: data.quantity ?? null,
        unit: data.unit ?? null,
      };
      
      // Оптимистичное обновление
      const tempId = `temp_${Date.now()}`;
      const optimisticItem: InventoryItem = {
        id: tempId,
        ...newItem,
        created_at: new Date().toISOString(),
      };
      setItems(prev => [optimisticItem, ...prev]);
      
      const { data: inserted, error: insertError } = await supabase
        .from('inventory')
        .insert(newItem)
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Заменить temp на реальный ID
      setItems(prev => prev.map(item => item.id === tempId ? inserted : item));
    } catch (err: any) {
      console.error('[InventoryContext] Ошибка добавления:', err);
      
      // Откатить оптимистичное обновление
      setItems(prev => prev.filter(item => !item.id.startsWith('temp_')));
      
      // Добавить в offline-очередь
      await addToQueue({
        type: 'CREATE',
        entity: 'inventory',
        payload: { user_id: user.id, ...data },
      });
      
      throw new Error(err.message || 'Не удалось добавить элемент');
    }
  };
  
  /**
   * Обновить элемент инвентаря
   */
  const updateItem = async (
    id: string,
    data: Partial<Omit<InventoryItem, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      // Оптимистичное обновление
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      
      const { error: updateError } = await supabase
        .from('inventory')
        .update(data)
        .eq('id', id);
      
      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('[InventoryContext] Ошибка обновления:', err);
      
      // Откатить
      await loadItems();
      
      // Добавить в offline-очередь
      await addToQueue({
        type: 'UPDATE',
        entity: 'inventory',
        payload: { id, ...data },
      });
      
      throw new Error(err.message || 'Не удалось обновить элемент');
    }
  };
  
  /**
   * Удалить элемент инвентаря
   */
  const deleteItem = async (id: string) => {
    try {
      // Оптимистичное обновление
      setItems(prev => prev.filter(item => item.id !== id));
      
      const { error: deleteError } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
    } catch (err: any) {
      console.error('[InventoryContext] Ошибка удаления:', err);
      
      // Откатить
      await loadItems();
      
      // Добавить в offline-очередь
      await addToQueue({
        type: 'DELETE',
        entity: 'inventory',
        payload: { id },
      });
      
      throw new Error(err.message || 'Не удалось удалить элемент');
    }
  };
  
  /**
   * Принудительно перезагрузить данные
   */
  const refreshItems = async () => {
    await loadItems();
  };
  
  // Загрузить при монтировании и при изменении пользователя
  useEffect(() => {
    loadItems();
  }, [user?.id]);
  
  return (
    <InventoryContext.Provider
      value={{
        items,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        refreshItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}
