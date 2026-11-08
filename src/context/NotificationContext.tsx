import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface DotaNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  timestamp: number;
  read: boolean;
}

export interface NotificationContextValue {
  permission: NotifPermission;
  notifications: DotaNotification[];
  unreadCount: number;
  activeToast: DotaNotification | null;
  requestPermission: () => Promise<NotifPermission>;
  sendNotification: (
    title: string,
    body: string,
    options?: {
      icon?: string;
      tag?: string;
      data?: Record<string, unknown>;
      silent?: boolean;
    }
  ) => void;
  dismissToast: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  testNotification: () => void;
}

const NOTIF_STORE_KEY = 'dotascope_notifications_v2';
const MAX_STORED = 40;

function loadStored(): DotaNotification[] {
  try {
    const raw = localStorage.getItem(NOTIF_STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStored(notifs: DotaNotification[]) {
  try {
    localStorage.setItem(NOTIF_STORE_KEY, JSON.stringify(notifs.slice(0, MAX_STORED)));
  } catch {
    // Ignore storage quota errors
  }
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ─── Provider Component ───────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotifPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as NotifPermission;
  });

  const [notifications, setNotifications] = useState<DotaNotification[]>(() => loadStored());
  const [activeToast, setActiveToast] = useState<DotaNotification | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Request browser permission
  const requestPermission = useCallback(async (): Promise<NotifPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotifPermission);
      return result as NotifPermission;
    } catch {
      return 'denied';
    }
  }, []);

  // Dismiss toast banner
  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Send notification (updates UI state, shows in-app toast, and sends system push)
  const sendNotification = useCallback(
    (
      title: string,
      body: string,
      options?: {
        icon?: string;
        tag?: string;
        data?: Record<string, unknown>;
        silent?: boolean;
      }
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const notif: DotaNotification = {
        id,
        title,
        body,
        icon: options?.icon ?? './icons/icon-192.png',
        tag: options?.tag,
        data: options?.data,
        timestamp: Date.now(),
        read: false,
      };

      // 1. Update shared state and localStorage
      setNotifications((prev) => {
        const updated = [notif, ...prev.filter((item) => item.id !== notif.id)].slice(0, MAX_STORED);
        saveStored(updated);
        return updated;
      });

      // 2. Trigger in-app floating toast banner
      setActiveToast(notif);

      // Auto dismiss toast after 6.5s
      setTimeout(() => {
        setActiveToast((current) => (current?.id === notif.id ? null : current));
      }, 6500);

      // 3. Trigger haptic vibration if supported on Android
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          // Ignore
        }
      }

      // 4. Try browser Notification API
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          const n = new Notification(title, {
            body,
            icon: notif.icon,
            tag: options?.tag,
            silent: options?.silent ?? false,
            data: options?.data,
          });
          setTimeout(() => n.close(), 8000);
        } catch {
          // Ignore browser restriction
        }
      }

      // 5. Try Service Worker showNotification (PWA background compatible)
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            if (reg.showNotification && Notification.permission === 'granted') {
              reg.showNotification(title, {
                body,
                icon: notif.icon,
                badge: './icons/icon-192.png',
                tag: options?.tag,
                data: options?.data,
              });
            }
          })
          .catch(() => {});
      }
    },
    []
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveStored(updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStored(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveStored([]);
    setActiveToast(null);
  }, []);

  // Quick test method for user verification
  const testNotification = useCallback(() => {
    sendNotification(
      '🧪 Prueba de Notificación DotaScope',
      'El sistema de notificaciones está funcionando correctamente. Recibirás avisos de nuevas partidas y análisis parseados.',
      { tag: 'test' }
    );
  }, [sendNotification]);

  const value = useMemo(
    () => ({
      permission,
      notifications,
      unreadCount,
      activeToast,
      requestPermission,
      sendNotification,
      dismissToast,
      markRead,
      markAllRead,
      clearAll,
      testNotification,
    }),
    [
      permission,
      notifications,
      unreadCount,
      activeToast,
      requestPermission,
      sendNotification,
      dismissToast,
      markRead,
      markAllRead,
      clearAll,
      testNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
