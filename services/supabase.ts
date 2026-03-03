/**
 * Supabase клиент для AgroMind (React Native)
 * 
 * ⚠️ AsyncStorage обязателен — localStorage недоступен в RN
 * ⚠️ detectSessionInUrl: false — иначе падает на RN deep links
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/template';

/**
 * Получить настроенный Supabase клиент
 * Использует OnSpace Cloud backend
 */
export const supabase = getSupabaseClient();

/**
 * Типы базы данных (будут автоматически сгенерированы OnSpace)
 */
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      gardens: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      plants: {
        Row: {
          id: string;
          garden_id: string;
          name: string;
          variety: string | null;
          planted_at: string | null;
          image_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          garden_id: string;
          name: string;
          variety?: string | null;
          planted_at?: string | null;
          image_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          garden_id?: string;
          name?: string;
          variety?: string | null;
          planted_at?: string | null;
          image_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Garden = Database['public']['Tables']['gardens']['Row'];
export type Plant = Database['public']['Tables']['plants']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
