import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, X, CheckCheck, Trash2 } from 'lucide-react';
import { usePushNotifications, type DotaNotification } from '../../hooks/usePushNotifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'ahora mismo';
  if (m < 60) return `hace ${m}m`;
  if (h < 24) return `hace ${h}h`;
  return `hace ${d}d`;
}

function notifColor(n: DotaNotification): string {
  const t = n.tag ?? '';
  if (t.includes('new_match')) return 'text-emerald-400';
  if (t.includes('parsed')) return 'text-sky-400';
  if (t.includes('update')) return 'text-amber-400';
  return 'text-slate-400';
}

function notifIcon(n: DotaNotification): string {
  const t = n.tag ?? '';
  if (t.includes('new_match')) return '⚔️';
  if (t.includes('parsed')) return '🔬';
  if (t.includes('update')) return '🔄';
  return '🔔';
}

// Resolve the in-app route for a notification based on tag + data
function getNotifRoute(n: DotaNotification): string | null {
  const t = n.tag ?? '';
  const matchId = n.data?.matchId;
  if (matchId && (t.includes('new_match') || t.includes('parsed') || t.includes('parse_requested'))) {
    return `/match/${matchId}`;
  }
  if (t.includes('dashboard') && n.data?.accountId) {
    return `/dashboard/${n.data.accountId}`;
  }
  return null;
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

const NotificationItem: React.FC<{
  notif: DotaNotification;
  onClick: () => void;
}> = ({ notif, onClick }) => {
  const route = getNotifRoute(notif);
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition hover:bg-slate-800/60 ${
        notif.read ? 'opacity-60' : 'bg-slate-900/80 border border-slate-800'
      }`}
    >
      <span className="text-lg shrink-0 leading-none mt-0.5">{notifIcon(notif)}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate flex items-center gap-1.5 ${notifColor(notif)}`}>
          <span className="truncate">{notif.title}</span>
          {route && <span className="shrink-0 text-gray-500 text-[10px]">→ ver</span>}
        </p>
        <p className="text-xs text-gray-300 leading-relaxed mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-[10px] text-gray-500 mt-1">{timeAgo(notif.timestamp)}</p>
      </div>
      {!notif.read && (
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
      )}
    </div>
  );
};

// ─── NotificationPanel ────────────────────────────────────────────────────────

export const NotificationPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    permission,
    notifications,
    unreadCount,
    currentAccountId,
    requestPermission,
    markRead,
    markAllRead,
    clearAll,
    testNotification,
  } = usePushNotifications();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleNotifClick = (notif: DotaNotification) => {
    markRead(notif.id);
    const route = getNotifRoute(notif);
    if (route) {
      setOpen(false);
      navigate(route);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 transition"
        title="Notificaciones"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4.5 h-4.5 text-amber-400 animate-[wiggle_1s_ease-in-out]" />
        ) : (
          <Bell className="w-4.5 h-4.5 text-gray-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-bold text-white">Notificaciones</span>
              {currentAccountId && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-gray-400 font-mono">
                  #{currentAccountId}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Marcar todas como leídas"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-sky-400 hover:bg-slate-800 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Borrar todas"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Permission & Action Banner */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
            {permission === 'default' && (
              <button
                onClick={requestPermission}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition"
              >
                Activar Push
              </button>
            )}
            {permission === 'granted' && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Push activo
              </span>
            )}
            {permission === 'denied' && (
              <span className="text-[11px] text-rose-400 font-semibold">
                Push bloqueado
              </span>
            )}
            <button
              onClick={testNotification}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white text-xs font-medium transition ml-auto"
            >
              Probar Alerta
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin space-y-1 p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm text-gray-500">Sin notificaciones para este jugador</p>
                <p className="text-xs text-gray-600 mt-1 max-w-[220px]">
                  {currentAccountId
                    ? `Monitoreando partidas y análisis del jugador #${currentAccountId}.`
                    : 'Selecciona un jugador para ver sus alertas de partida.'}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notif={n} onClick={() => handleNotifClick(n)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
