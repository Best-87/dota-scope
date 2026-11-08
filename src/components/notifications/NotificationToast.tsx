import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { useNotifications, type DotaNotification } from '../../context/NotificationContext';

function notifIcon(n: DotaNotification): string {
  const t = n.tag ?? '';
  if (t.includes('new_match')) return '⚔️';
  if (t.includes('parsed')) return '🎉';
  if (t.includes('parse_requested')) return '⏳';
  if (t.includes('update')) return '🔄';
  if (t.includes('test')) return '🧪';
  return '🔔';
}

function notifBorderColor(n: DotaNotification): string {
  const t = n.tag ?? '';
  if (t.includes('new_match')) return 'border-emerald-500/50 bg-emerald-950/90 text-emerald-300';
  if (t.includes('parsed')) return 'border-sky-500/50 bg-sky-950/90 text-sky-300';
  if (t.includes('parse_requested')) return 'border-amber-500/50 bg-amber-950/90 text-amber-300';
  if (t.includes('test')) return 'border-purple-500/50 bg-purple-950/90 text-purple-300';
  return 'border-slate-700 bg-slate-900/95 text-gray-200';
}

export const NotificationToast: React.FC = () => {
  const { activeToast, dismissToast, markRead } = useNotifications();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const handleClick = () => {
    markRead(activeToast.id);
    const matchId = activeToast.data?.matchId;
    if (matchId) {
      navigate(`/match/${matchId}`);
    }
    dismissToast();
  };

  return (
    <aside
      aria-label="Aviso del sistema"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div
        className={`flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md cursor-pointer transition-transform hover:scale-[1.01] ${notifBorderColor(
          activeToast
        )}`}
        onClick={handleClick}
      >
        <span className="text-2xl flex-shrink-0 select-none">
          {notifIcon(activeToast)}
        </span>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white">
            <span>{activeToast.title}</span>
            {Boolean(activeToast.data?.matchId) && (
              <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-300 mt-0.5 leading-snug line-clamp-3">
            {activeToast.body}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition flex-shrink-0"
          title="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default NotificationToast;
