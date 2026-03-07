// supabase/functions/identify-plant/index.ts
// Edge Function для определения растений по фото через AI Vision

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const AI_PROVIDER = Deno.env.get('AI_PROVIDER') ?? 'openai';

interface IdentifyRequest {
  image: string; // base64
}

interface IdentifyResponse {
  name: string;
  variety: string | null;
  confidence: number;
  care_tips: string;
}

/**
 * Определить растение через OpenAI GPT-4 Vision
 */
async function identifyWithOpenAI(imageBase64: string): Promise<IdentifyResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: 'Ты — эксперт-ботаник. Определи растение по фото и верни JSON: {name: string, variety: string|null, confidence: 0-100, care_tips: string}. Только JSON, без текста вокруг.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Определи это растение:' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI Vision HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Извлечь JSON из ответа
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI не вернул валидный JSON');
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Определить растение через Gemini Vision
 */
async function identifyWithGemini(imageBase64: string): Promise<IdentifyResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: 'Определи растение по фото и верни ТОЛЬКО JSON формата: {name: string, variety: string|null, confidence: 0-100, care_tips: string}. Без текста вокруг JSON.',
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Vision HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  // Извлечь JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI не вернул валидный JSON');
  }
  
  return JSON.parse(jsonMatch[0]);
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image }: IdentifyRequest = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Параметр image обязателен' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[identify-plant] Начало определения растения...');

    let result: IdentifyResponse;

    if (AI_PROVIDER === 'gemini' && GEMINI_API_KEY) {
      console.log('[identify-plant] Используем Gemini Vision');
      result = await identifyWithGemini(image);
    } else if (OPENAI_API_KEY) {
      console.log('[identify-plant] Используем OpenAI Vision');
      result = await identifyWithOpenAI(image);
    } else {
      throw new Error('AI Vision недоступен: отсутствуют API ключи');
    }

    console.log('[identify-plant] Распознано:', result.name);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[identify-plant] Ошибка:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Ошибка определения растения' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
