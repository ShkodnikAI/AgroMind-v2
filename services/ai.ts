/**
 * AI Service — клиент для AI-советника с fallback
 * 
 * Паттерн:
 * - Основной: Edge Function 'ai-gateway'
 * - Fallback: статические ответы из assets/ai-fallback.json
 * - Автоматический fallback при любой ошибке (сеть, timeout, ключ)
 */

import { supabase } from './supabase';
import fallbackData from '../assets/ai-fallback.json';

export type FallbackKey =
  | 'identify-plant'
  | 'agro-advice'
  | 'fertilizer-calculation'
  | 'detect-pest'
  | 'plant-care-schedule';

type FallbackSubkey = string;

/**
 * Получить статический fallback-ответ
 * 
 * @param key - ключ сценария
 * @param subkey - подтип (general, watering, и т.д.)
 */
export function getFallbackResponse(
  key: FallbackKey,
  subkey: FallbackSubkey = 'general'
): string {
  const entry = fallbackData[key] as Record<string, string>;
  return entry[subkey] ?? entry['general'] ?? entry['offline'] ?? 'Сервис временно недоступен.';
}

/**
 * Вызвать AI через Edge Function с автоматическим fallback
 * 
 * @param prompt - пользовательский запрос
 * @param key - ключ сценария для fallback
 * @param subkey - подтип для более точного fallback
 * @param systemPrompt - системный промпт (опционально)
 * @returns { text, isFallback }
 */
export async function callAI(
  prompt: string,
  key: FallbackKey,
  subkey?: string,
  systemPrompt?: string
): Promise<{ text: string; isFallback: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-gateway', {
      body: {
        prompt,
        key,
        subkey,
        system: systemPrompt,
      },
    });
    
    if (error) throw error;
    
    return {
      text: data.result,
      isFallback: false,
    };
  } catch (error: any) {
    console.warn('[AI Service] Используется fallback:', error.message);
    
    return {
      text: getFallbackResponse(key, subkey),
      isFallback: true,
    };
  }
}

/**
 * Получить совет по уходу за растением
 */
export async function getAgroAdvice(
  plantName: string,
  adviceType: 'general' | 'watering' | 'fertilizing' | 'pests' | 'pruning' = 'general'
): Promise<{ text: string; isFallback: boolean }> {
  const prompt = `Дай совет по уходу за растением "${plantName}". Тип совета: ${adviceType}.`;
  
  const systemPrompt = `Ты — эксперт-агроном. Давай краткие практические советы по уходу за растениями. 
Формат: пункты с конкретными действиями. Максимум 200 слов.`;
  
  return callAI(prompt, 'agro-advice', adviceType, systemPrompt);
}

/**
 * Рассчитать дозу удобрений
 */
export async function calculateFertilizer(
  plantName: string,
  soilType: 'default' | 'sandy-soil' | 'clay-soil',
  area: number = 1
): Promise<{ text: string; isFallback: boolean }> {
  const prompt = `Рассчитай дозу удобрений для растения "${plantName}". Тип почвы: ${soilType}. Площадь: ${area} м².`;
  
  const systemPrompt = `Ты — агроном. Рассчитай норму удобрений NPK с учётом типа почвы. 
Укажи конкретные граммы/м². Формат: краткие пункты, максимум 150 слов.`;
  
  return callAI(prompt, 'fertilizer-calculation', soilType, systemPrompt);
}

/**
 * Определить вредителя или болезнь
 */
export async function detectPest(
  description: string
): Promise<{ text: string; isFallback: boolean }> {
  const prompt = `Определи вредителя или болезнь по описанию: ${description}`;
  
  const systemPrompt = `Ты — фитопатолог. Определи проблему и дай рекомендации по лечению. 
Формат: название вредителя/болезни + меры борьбы. Максимум 200 слов.`;
  
  return callAI(prompt, 'detect-pest', 'general', systemPrompt);
}

/**
 * Создать график ухода за растением
 */
export async function createCareSchedule(
  plantName: string,
  plantType: 'general' | 'vegetables' | 'fruits' = 'general'
): Promise<{ text: string; isFallback: boolean }> {
  const prompt = `Создай график ухода за растением "${plantName}". Тип: ${plantType}.`;
  
  const systemPrompt = `Ты — агроном. Составь график ухода: полив, подкормка, обрезка, осмотр. 
Укажи частоту в днях/неделях. Формат: пункты с действиями. Максимум 200 слов.`;
  
  return callAI(prompt, 'plant-care-schedule', plantType, systemPrompt);
}
