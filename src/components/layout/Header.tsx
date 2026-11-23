import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, RefreshCw, Download, Clock, ChevronDown, RefreshCcw, Sparkles } from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';
import { parsePlayerId } from '../../utils/steamId';
import { getRankName } from '../../utils/formatting';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { usePwaUpdate } from '../../hooks/usePwaUpdate';
import { NotificationPanel } from '../notifications/NotificationPanel';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { player, accountId, loading, setAccountId, refetchPlayer, playerHistory } = usePlayerContext();
  const { isInstallable, installApp } = usePwaInstall();
  const { isUpdateAvailable, updateApp, isUpdating } = usePwaUpdate();
  const [searchInput, setSearchInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    const parsedId = parsePlayerId(query);
    if (parsedId && !isNaN(Number(parsedId))) {
      const numId = Number(parsedId);
      setAccountId(numId);
      navigate(`/dashboard/${numId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
    setSearchInput('');
  };

  const handleSelectHistory = (id: number) => {
    setAccountId(id);
    setHistoryOpen(false);
    navigate(`/dashboard/${id}`);
  };

  const rankName = player?.rank_tier ? getRankName(player.rank_tier) : null;
  const personaname = player?.profile?.personaname || player?.personaname;
  const avatar = player?.profile?.avatarfull || player?.avatarfull;

  // History entries excluding current player
  const otherHistory = playerHistory.filter((h) => h.accountId !== accountId);

  return (
    <header className="sticky top-0 z-30 bg-[#0a0d14]/85 backdrop-blur-xl border-b border-white/[0.07] px-4 lg:px-7 py-3 transition-all shadow-lg shadow-black/40">
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo - High Polish Gaming Logo */}
        <Link
          to={accountId ? `/dashboard/${accountId}` : '/search'}
          className="flex items-center gap-3 group flex-shrink-0"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <img
              src="./icons/icon.svg"
              alt="DotaScope"
              className="relative w-9 h-9 rounded-xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wider text-white flex items-center gap-1 leading-none font-sans">
              DOTA<span className="bg-gradient-to-r from-red-500 via-amber-500 to-amber-400 bg-clip-text text-transparent">SCOPE</span>
            </span>
            <span className="text-[9.5px] font-bold text-amber-500/80 tracking-[0.2em] uppercase font-mono mt-0.5 flex items-center gap-1">
              PRO ANALYTICS
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-2 sm:mx-4">
          <div className="relative group">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar Steam ID o Nombre de Pro Player..."
              className="w-full bg-[#111622]/90 border border-white/[0.08] hover:border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-amber-400 absolute left-3 top-2.5 pointer-events-none transition-colors" />
          </div>
        </form>

        {/* Player Profile / Status & Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Notification Bell */}
          <NotificationPanel />

          {/* PWA Update Button */}
          {isUpdateAvailable && (
            <button
              onClick={updateApp}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition shadow-sm animate-pulse"
              title="Nueva versión disponible"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isUpdating ? 'Actualizando...' : 'Actualizar App'}</span>
            </button>
          )}

          {/* PWA Install Button */}
          {isInstallable && !isUpdateAvailable && (
            <button
              onClick={installApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition shadow-sm"
              title="Instalar DotaScope"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}

          {accountId && player ? (
            <div className="flex items-center gap-2" ref={historyRef}>
              {/* Refresh button */}
              <button
                onClick={() => refetchPlayer()}
                disabled={loading}
                title="Actualizar datos"
                className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              {/* Player card with gold edge */}
              <div className="relative">
                <button
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="flex items-center gap-2.5 bg-[#121622] hover:bg-[#181e2e] border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-1.5 pr-3 transition shadow-sm group"
                >
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={personaname || 'Player'}
                        className="w-7 h-7 rounded-lg object-cover border border-amber-500/40 shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0a0d14]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-100 max-w-[110px] truncate leading-tight group-hover:text-amber-300 transition-colors">
                      {personaname || `ID ${accountId}`}
                    </span>
                    {rankName && (
                      <span className="text-[10px] font-semibold text-amber-400/90 leading-tight">
                        {rankName}
                      </span>
                    )}
                  </div>
                  {otherHistory.length > 0 && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {/* History dropdown */}
                {historyOpen && otherHistory.length > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-[#0d1017] border border-amber-500/20 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl">
                    <div className="px-3.5 py-2.5 border-b border-white/[0.08] bg-white/[0.02]">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        Historial reciente
                      </div>
                    </div>
                    <div className="py-1.5">
                      {otherHistory.map((entry) => (
                        <button
                          key={entry.accountId}
                          onClick={() => handleSelectHistory(entry.accountId)}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.06] transition text-left group"
                        >
                          {entry.avatarfull ? (
                            <img
                              src={entry.avatarfull}
                              alt={entry.personaname}
                              className="w-8 h-8 rounded-lg object-cover border border-white/10 group-hover:border-amber-500/50 flex-shrink-0 transition"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate transition-colors">
                              {entry.personaname}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {entry.accountId}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="px-3.5 py-2.5 border-t border-white/[0.08] bg-white/[0.02]">
                      <Link
                        to="/search"
                        onClick={() => setHistoryOpen(false)}
                        className="block w-full text-center text-xs text-amber-400 hover:text-amber-300 font-bold transition"
                      >
                        Buscar otro jugador →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              to="/search"
              className="text-xs px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold transition shadow-lg shadow-red-950/50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Seleccionar Jugador</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
