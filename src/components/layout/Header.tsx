import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, RefreshCw, Download, Clock, ChevronDown } from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';
import { parsePlayerId } from '../../utils/steamId';
import { getRankName } from '../../utils/formatting';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { player, accountId, loading, setAccountId, refetchPlayer, playerHistory } = usePlayerContext();
  const { isInstallable, installApp } = usePwaInstall();
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
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to={accountId ? `/dashboard/${accountId}` : '/search'}
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <img
            src="./icons/icon.svg"
            alt="DotaScope"
            className="w-9 h-9 rounded-xl shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1">
              DOTA<span className="text-red-500 font-extrabold">SCOPE</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase -mt-1">
              Match Intelligence
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-2">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por Steam ID, Friend ID o Nombre..."
              className="w-full bg-slate-900/90 border border-slate-700/70 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </form>

        {/* Player Profile / Status & PWA Install */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={installApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-semibold transition shadow-sm animate-pulse"
              title="Instalar DotaScope como aplicación en tu pantalla de inicio"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {accountId && player ? (
            <div className="flex items-center gap-2" ref={historyRef}>
              {/* Refresh button */}
              <button
                onClick={() => refetchPlayer()}
                disabled={loading}
                title="Actualizar datos"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
              </button>

              {/* Player card + history dropdown */}
              <div className="relative">
                <button
                  onClick={() => setHistoryOpen((v) => !v)}
                  className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg p-1.5 pr-2 transition"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={personaname || 'Player'}
                      className="w-7 h-7 rounded-md object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-gray-200 max-w-[100px] truncate leading-tight">
                      {personaname || `ID ${accountId}`}
                    </span>
                    {rankName && (
                      <span className="text-[10px] text-amber-400/90 leading-tight">
                        {rankName}
                      </span>
                    )}
                  </div>
                  {otherHistory.length > 0 && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {/* History dropdown */}
                {historyOpen && otherHistory.length > 0 && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Cambiar jugador
                      </div>
                    </div>
                    <div className="py-1">
                      {otherHistory.map((entry) => (
                        <button
                          key={entry.accountId}
                          onClick={() => handleSelectHistory(entry.accountId)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-800/80 transition text-left"
                        >
                          {entry.avatarfull ? (
                            <img
                              src={entry.avatarfull}
                              alt={entry.personaname}
                              className="w-7 h-7 rounded-md object-cover border border-slate-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-gray-500 flex-shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-200 truncate">
                              {entry.personaname}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              ID: {entry.accountId}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-slate-800">
                      <Link
                        to="/search"
                        onClick={() => setHistoryOpen(false)}
                        className="block w-full text-center text-xs text-red-400 hover:text-red-300 font-semibold transition"
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
              to="/"
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-medium transition shadow-sm"
            >
              Seleccionar Jugador
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
