// Re-export shared notification context hook and types
export {
  useNotifications as usePushNotifications,
  type NotifPermission,
  type DotaNotification,
  type NotificationContextValue,
} from '../context/NotificationContext';

export { default } from '../context/NotificationContext';
