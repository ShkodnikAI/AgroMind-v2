/**
 * Sentry Service (Web) — заглушка для веб-платформы
 * 
 * @sentry/react-native не поддерживается на Web
 */

/**
 * Инициализировать Sentry (заглушка для Web)
 */
export function initSentry() {
  console.log('[Sentry] Web версия - мониторинг отключён');
}

/**
 * Зарегистрировать пользователя в Sentry
 */
export function setSentryUser(userId: string, email?: string) {
  // No-op на Web
}

/**
 * Очистить данные пользователя
 */
export function clearSentryUser() {
  // No-op на Web
}

/**
 * Добавить breadcrumb
 */
export function addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
  // No-op на Web
}

/**
 * Отправить ошибку в Sentry
 */
export function captureError(error: Error, context?: Record<string, any>) {
  console.error('[Sentry Web]', error, context);
}

/**
 * Отправить сообщение
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[Sentry Web] ${level}:`, message);
}
