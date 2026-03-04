/**
 * CORS Headers — для Supabase Edge Functions
 * 
 * КРИТИЧНО:
 * - Возвращать эти заголовки во ВСЕХ ответах (успех + ошибка)
 * - Обрабатывать OPTIONS preflight ПЕРВЫМ
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Обработать OPTIONS preflight запрос
 */
export function handleCORS(): Response {
  return new Response('ok', {
    status: 200,
    headers: corsHeaders,
  });
}
