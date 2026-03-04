/**
 * AI Client — абстрактный провайдер для Edge Functions
 * 
 * ⚠️ Deno runtime (НЕ React Native!)
 * 
 * Поддерживаемые провайдеры:
 * - OpenAI (gpt-4o-mini)
 * - Gemini (gemini-2.0-flash)
 */

export interface AIProvider {
  complete(prompt: string, system: string): Promise<string>;
}

/**
 * OpenAI Provider
 */
class OpenAIProvider implements AIProvider {
  async complete(prompt: string, system: string): Promise<string> {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY не настроен');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI HTTP ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

/**
 * Gemini Provider
 */
class GeminiProvider implements AIProvider {
  async complete(prompt: string, system: string): Promise<string> {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY не настроен');
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${system}\n\n${prompt}` }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      }),
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${error}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

/**
 * Получить провайдера по переменной окружения
 */
function getProvider(): AIProvider {
  const providerName = Deno.env.get('AI_PROVIDER') ?? 'openai';
  
  if (providerName === 'gemini') {
    return new GeminiProvider();
  }
  
  return new OpenAIProvider();
}

export const aiProvider = getProvider();
