/**
 * Sentry Service — мониторинг ошибок в продакшене
 * 
 * Конфигурация:
 * - DSN: EXPO_PUBLIC_SENTRY_DSN в .env
 * - Включён только в production
 * - Performance monitoring с tracesSampler
 */

import * as Sentry from '@sentry/react-native';

/**
 * Инициализировать Sentry
 * Вызывать один раз при старте приложения
 */
export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('[Sentry] DSN не найден — мониторинг отключён');
    return;
  }
  
  Sentry.init({
    dsn,
    
    // Включить только в production
    enabled: !__DEV__,
    
    // Debug mode для разработки
    debug: __DEV__,
    
    // Environment
    environment: __DEV__ ? 'development' : 'production',
    
    // Release версия (синхронизируется с app.json)
    release: 'agromind@1.0.0',
    
    // Performance Monitoring
    integrations: [
      Sentry.reactNativeTracingIntegration({
        enableUserInteractionTracing: true,
        enableNativeFramesTracking: true,
      }),
    ],
    
    // Sampler для контроля трафика performance
    tracesSampler: (samplingContext) => {
      const name = samplingContext.transactionContext.name;
      
      // Критичные транзакции — 100%
      if (name.includes('auth') || name.includes('payment')) {
        return 1.0;
      }
      
      // AI операции — 50%
      if (name.includes('ai-gateway') || name.includes('identify-plant')) {
        return 0.5;
      }
      
      // Остальные — 10%
      return 0.1;
    },
    
    // Breadcrumbs для контекста ошибок
    maxBreadcrumbs: 50,
    
    // Фильтрация конфиденциальных данных
    beforeSend: (event, hint) => {
      // Убрать токены из URL и headers
      if (event.request) {
        if (event.request.url) {
          event.request.url = event.request.url.replace(/token=[^&]+/, 'token=REDACTED');
        }
        if (event.request.headers) {
          if (event.request.headers['Authorization']) {
            event.request.headers['Authorization'] = 'REDACTED';
          }
        }
      }
      
      return event;
    },
  });
  
  console.log('[Sentry] Мониторинг инициализирован');
}

/**
 * Зарегистрировать пользователя в Sentry для контекста ошибок
 */
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Очистить данные пользователя при выходе
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Добавить breadcrumb для отслеживания действий
 */
export function addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Вручную отправить ошибку в Sentry
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Отправить кастомное сообщение (не ошибку)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}
