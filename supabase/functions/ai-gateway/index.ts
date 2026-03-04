/**
 * AI Gateway Edge Function
 * 
 * Маршрутизирует запросы к AI провайдеру (OpenAI/Gemini)
 * Возвращает fallback-ответ при любой ошибке
 */

import { corsHeaders, handleCORS } from '../_shared/cors.ts';
import { aiProvider } from '../_shared/ai-client.ts';

Deno.serve(async (req) => {
  // ── OPTIONS preflight ──────────────────────────────
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }
  
  try {
    // ── Парсинг запроса ────────────────────────────────
    const { prompt, key, subkey, system } = await req.json();
    
    if (!prompt || !key) {
      return new Response(
        JSON.stringify({ error: 'Отсутствуют обязательные поля: prompt, key' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // ── Логирование ────────────────────────────────────
    console.log(`[AI Gateway] Запрос: key=${key}, subkey=${subkey}, promptLength=${prompt.length}`);
    
    // ── Вызов AI провайдера ────────────────────────────
    const defaultSystem = 'Ты — эксперт-агроном. Давай краткие практические советы по уходу за растениями.';
    const result = await aiProvider.complete(prompt, system ?? defaultSystem);
    
    // ── Успешный ответ ─────────────────────────────────
    return new Response(
      JSON.stringify({ result }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error: any) {
    // ── Логирование ошибки ─────────────────────────────
    console.error('[AI Gateway] Ошибка:', error.message);
    
    // ── Возврат ошибки (клиент использует fallback) ───
    return new Response(
      JSON.stringify({
        error: error.message || 'AI сервис недоступен',
        shouldUseFallback: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
