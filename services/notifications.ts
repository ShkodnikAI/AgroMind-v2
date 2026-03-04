/**
 * Notifications Service — управление push-уведомлениями
 * 
 * Критично:
 * - setNotificationHandler ДО регистрации токена
 * - Android 13+ требует явного запроса разрешений
 */

import * as Notifications from 'expo-notifications';

/**
 * Настроить обработчик уведомлений
 * ОБЯЗАТЕЛЬНО вызвать ДО регистрации токена
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Запросить разрешение на уведомления
 * Android 13+ (API 33+) требует явного запроса
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync({
      android: {
        allowAlert: true,
        allowSound: true,
        allowBadge: true,
      },
    });
    return status === 'granted';
  } catch (error) {
    console.error('[Notifications] Ошибка запроса разрешений:', error);
    return false;
  }
}

/**
 * Получить push-токен устройства
 */
export async function getPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.error('[Notifications] Ошибка получения токена:', error);
    return null;
  }
}

/**
 * Запланировать локальное уведомление
 * 
 * @param title - заголовок
 * @param body - текст
 * @param trigger - когда показать (Date или секунды)
 * @returns ID уведомления
 */
export async function scheduleNotification(
  title: string,
  body: string,
  trigger: Date | number
): Promise<string> {
  const triggerTime = trigger instanceof Date 
    ? trigger 
    : { seconds: trigger };
  
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: triggerTime,
  });
  
  return id;
}

/**
 * Отменить запланированное уведомление
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Отменить все запланированные уведомления
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Получить все запланированные уведомления
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
