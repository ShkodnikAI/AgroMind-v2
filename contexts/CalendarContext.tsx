/**
 * CalendarContext — управление задачами ухода за растениями
 * 
 * Паттерн:
 * - Кеширование в AsyncStorage
 * - Оптимистичные обновления
 * - Offline queue
 * - Автоматические уведомления
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { addToQueue } from '../services/offlineQueue';
import { scheduleNotification, cancelNotification } from '../services/notifications';
import { useAuth } from '@/template';
import { usePlants } from '../hooks/usePlants';

const CACHE_KEY = 'agromind_calendar_cache';

export type TaskType = 'watering' | 'fertilizing' | 'pruning' | 'other';

export interface CalendarTask {
  id: string;
  plant_id: string;
  task_type: TaskType;
  scheduled_at: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  notification_id?: string; // ID запланированного уведомления
}

interface CalendarContextType {
  tasks: CalendarTask[];
  loading: boolean;
  error: string | null;
  getTasksByPlant: (plantId: string) => CalendarTask[];
  getUpcomingTasks: () => CalendarTask[];
  addTask: (task: Omit<CalendarTask, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'notification_id'>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { plants } = usePlants();
  
  const loadFromCache = async (): Promise<CalendarTask[]> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (err) {
      console.error('[CalendarContext] Ошибка чтения кеша:', err);
      return [];
    }
  };
  
  const saveToCache = async (data: CalendarTask[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[CalendarContext] Ошибка записи кеша:', err);
    }
  };
  
  const fetchTasks = async (): Promise<void> => {
    if (!user || plants.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const plantIds = plants.map(p => p.id);
      
      const { data, error: fetchError } = await supabase
        .from('care_calendar')
        .select('*')
        .in('plant_id', plantIds)
        .order('scheduled_at', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      setTasks(data || []);
      await saveToCache(data || []);
    } catch (err: any) {
      console.error('[CalendarContext] Ошибка загрузки задач:', err);
      setError(err.message || 'Не удалось загрузить задачи');
      
      const cached = await loadFromCache();
      setTasks(cached);
    } finally {
      setLoading(false);
    }
  };
  
  const getTasksByPlant = (plantId: string): CalendarTask[] => {
    return tasks.filter(t => t.plant_id === plantId);
  };
  
  const getUpcomingTasks = (): CalendarTask[] => {
    const now = new Date().toISOString();
    return tasks
      .filter(t => !t.completed_at && t.scheduled_at >= now)
      .slice(0, 10);
  };
  
  const addTask = async (
    task: Omit<CalendarTask, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'notification_id'>
  ): Promise<void> => {
    const tempId = `temp_${Date.now()}`;
    const now = new Date().toISOString();
    
    const newTask: CalendarTask = {
      id: tempId,
      ...task,
      completed_at: null,
      created_at: now,
      updated_at: now,
    };
    
    setTasks(prev => [newTask, ...prev]);
    
    try {
      const { data, error: insertError } = await supabase
        .from('care_calendar')
        .insert({
          plant_id: task.plant_id,
          task_type: task.task_type,
          scheduled_at: task.scheduled_at,
          notes: task.notes,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Запланировать уведомление за 1 час до задачи
      let notificationId: string | undefined;
      try {
        const scheduledDate = new Date(task.scheduled_at);
        const notificationDate = new Date(scheduledDate.getTime() - 60 * 60 * 1000); // -1 час
        
        // Планировать только если дата в будущем
        if (notificationDate > new Date()) {
          const taskTypeLabel = {
            watering: 'Полив',
            fertilizing: 'Подкормка',
            pruning: 'Обрезка',
            other: 'Задача ухода',
          }[task.task_type];
          
          notificationId = await scheduleNotification(
            taskTypeLabel,
            `Запланировано на ${scheduledDate.toLocaleString('ru-RU')}`,
            notificationDate
          );
          
          console.log(`[CalendarContext] Уведомление запланировано: ${notificationId}`);
        }
      } catch (notifError) {
        console.warn('[CalendarContext] Не удалось запланировать уведомление:', notifError);
      }
      
      // Оптимистичное обновление с notification_id
      const taskWithNotif = { ...data, notification_id: notificationId };
      setTasks(prev => prev.map(t => t.id === tempId ? taskWithNotif : t));
      
      // Обновить кеш
      await saveToCache(tasks.map(t => t.id === tempId ? taskWithNotif : t));
    } catch (err: any) {
      console.error('[CalendarContext] Ошибка добавления задачи:', err);
      
      setTasks(prev => prev.filter(t => t.id !== tempId));
      
      await addToQueue({
        type: 'CREATE',
        entity: 'calendar_task',
        payload: { ...newTask, id: undefined },
      });
      
      throw err;
    }
  };
  
  const completeTask = async (id: string): Promise<void> => {
    const original = tasks.find(t => t.id === id);
    if (!original) throw new Error('Задача не найдена');
    
    const now = new Date().toISOString();
    
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed_at: now, updated_at: now } : t
    ));
    
    try {
      const { error: updateError } = await supabase
        .from('care_calendar')
        .update({ completed_at: now })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      await saveToCache(tasks);
    } catch (err: any) {
      console.error('[CalendarContext] Ошибка завершения задачи:', err);
      
      setTasks(prev => prev.map(t => t.id === id ? original : t));
      
      await addToQueue({
        type: 'UPDATE',
        entity: 'calendar_task',
        payload: { id, completed_at: now },
      });
      
      throw err;
    }
  };
  
  const deleteTask = async (id: string): Promise<void> => {
    const original = tasks.find(t => t.id === id);
    if (!original) throw new Error('Задача не найдена');
    
    // Отменить уведомление если было запланировано
    if (original.notification_id) {
      try {
        await cancelNotification(original.notification_id);
        console.log(`[CalendarContext] Уведомление отменено: ${original.notification_id}`);
      } catch (notifError) {
        console.warn('[CalendarContext] Не удалось отменить уведомление:', notifError);
      }
    }
    
    setTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      const { error: deleteError } = await supabase
        .from('care_calendar')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      await saveToCache(tasks);
    } catch (err: any) {
      console.error('[CalendarContext] Ошибка удаления задачи:', err);
      
      setTasks(prev => [...prev, original]);
      
      await addToQueue({
        type: 'DELETE',
        entity: 'calendar_task',
        payload: { id },
      });
      
      throw err;
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [user, plants]);
  
  const value: CalendarContextType = {
    tasks,
    loading,
    error,
    getTasksByPlant,
    getUpcomingTasks,
    addTask,
    completeTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
  
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}
