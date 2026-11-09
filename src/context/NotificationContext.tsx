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
  accountId?: number | null;
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
  currentAccountId: number | null;
  setCurrentAccountId: (id: number | null) => void;
  requestPermission: () => Promise<NotifPermission>;
  sendNotification: (
    title: string,
    body: string,
    options?: {
      accountId?: number | null;
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

const NOTIF_STORE_PREFIX = 'dotascope_notifications_u_';
const MAX_STORED = 50;

function getStorageKey(accountId: number | null): string {
  return accountId ? `${NOTIF_STORE_PREFIX}${accountId}` : `${NOTIF_STORE_PREFIX}guest`;
}

function loadStored(accountId: number | null): DotaNotification[] {
  try {
    const raw = localStorage.getItem(getStorageKey(accountId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStored(accountId: number | null, notifs: DotaNotification[]) {
  try {
    localStorage.setItem(getStorageKey(accountId), JSON.stringify(notifs.slice(0, MAX_STORED)));
  } catch {
    // Ignore storage quota errors
  }
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ─── Provider Component ───────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('dotascope_account_id');
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const [permission, setPermission] = useState<NotifPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as NotifPermission;
  });

  const [notifications, setNotifications] = useState<DotaNotification[]>(() =>
    loadStored(currentAccountId)
  );
  const [activeToast, setActiveToast] = useState<DotaNotification | null>(null);

  // When currentAccountId changes, load that user's notifications
  useEffect(() => {
    setNotifications(loadStored(currentAccountId));
  }, [currentAccountId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Request browser/system notification permission
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

  // Send notification (updates UI state, shows in-app toast, and triggers native mobile notification)
  const sendNotification = useCallback(
    (
      title: string,
      body: string,
      options?: {
        accountId?: number | null;
        icon?: string;
        tag?: string;
        data?: Record<string, unknown>;
        silent?: boolean;
      }
    ) => {
      const targetUser = options?.accountId !== undefined ? options.accountId : currentAccountId;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const notif: DotaNotification = {
        id,
        accountId: targetUser,
        title,
        body,
        icon: options?.icon ?? './icons/icon-192.png',
        tag: options?.tag,
        data: options?.data,
        timestamp: Date.now(),
        read: false,
      };

      // 1. Update storage for the target user
      const existing = loadStored(targetUser);
      const updated = [notif, ...existing.filter((item) => item.id !== notif.id)].slice(0, MAX_STORED);
      saveStored(targetUser, updated);

      // If notification belongs to active viewing user, update component state & show in-app toast
      if (targetUser === currentAccountId || (!targetUser && !currentAccountId)) {
        setNotifications(updated);
        setActiveToast(notif);
        setTimeout(() => {
          setActiveToast((current) => (current?.id === notif.id ? null : current));
        }, 6500);
      }

      // 2. Trigger native mobile vibration (WhatsApp-like double buzz)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([180, 80, 180]);
        } catch {
          // Ignore
        }
      }

      // 3. Native Service Worker notification with system heads-up and actions (WhatsApp style)
      const targetUrl = options?.data?.matchId
        ? `#/match/${options.data.matchId}`
        : targetUser
        ? `#/dashboard/${targetUser}`
        : '#/';

      const swData = {
        url: targetUrl,
        matchId: options?.data?.matchId,
        accountId: targetUser,
        ...(options?.data || {}),
      };

      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            if (reg.showNotification && Notification.permission === 'granted') {
              reg.showNotification(title, {
                body,
                icon: notif.icon,
                badge: './icons/badge-96.png',
                tag: options?.tag || `dota_${targetUser || 'general'}_${Date.now()}`,
                renotify: true,
                requireInteraction: false,
                silent: options?.silent ?? false,
                data: swData,
                // WhatsApp-like pattern: vibrate on mobile, timestamp
                timestamp: Date.now(),
              } as NotificationOptions);
            }
          })
          .catch(() => {});
      } else if (
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
            data: swData,
          });
          n.onclick = () => {
            window.focus();
            if (options?.data?.matchId) {
              window.location.hash = `#/match/${options.data.matchId}`;
            }
          };
          setTimeout(() => n.close(), 10000);
        } catch {
          // Ignore
        }
      }
    },
    [currentAccountId]
  );

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        saveStored(currentAccountId, updated);
        return updated;
      });
    },
    [currentAccountId]
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStored(currentAccountId, updated);
      return updated;
    });
  }, [currentAccountId]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveStored(currentAccountId, []);
    setActiveToast(null);
  }, [currentAccountId]);

  // Quick test method for user verification
  const testNotification = useCallback(() => {
    sendNotification(
      '🧪 Prueba de Notificación Nativa',
      '¡Funciona! Recibirás avisos nativos tipo WhatsApp cuando termine una partida o se complete el parseo.',
      { tag: 'test', accountId: currentAccountId }
    );
  }, [sendNotification, currentAccountId]);

  const value = useMemo(
    () => ({
      permission,
      notifications,
      unreadCount,
      activeToast,
      currentAccountId,
      setCurrentAccountId,
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
      currentAccountId,
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
