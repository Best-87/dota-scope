import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Swords, User, RefreshCw } from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';
import { parsePlayerId } from '../../utils/steamId';
import { getRankName } from '../../utils/formatting';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { player, accountId, loading, setAccountId, refetchPlayer } = usePlayerContext();
  const [searchInput, setSearchInput] = useState('');

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

  const rankName = player?.rank_tier ? getRankName(player.rank_tier) : null;
  const personaname = player?.profile?.personaname || player?.personaname;
  const avatar = player?.profile?.avatarfull || player?.avatarfull;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to={accountId ? `/dashboard/${accountId}` : '/dashboard/1242630127'}
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform">
            <Swords className="w-5 h-5 text-white" />
          </div>
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

        {/* Player Profile / Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {accountId && player ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetchPlayer()}
                disabled={loading}
                title="Actualizar datos"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
              </button>

              <Link
                to={`/dashboard/${accountId}`}
                className="flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg p-1.5 pr-3 transition"
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
                  <span className="text-xs font-semibold text-gray-200 max-w-[120px] truncate leading-tight">
                    {personaname || `ID ${accountId}`}
                  </span>
                  {rankName && (
                    <span className="text-[10px] text-amber-400/90 leading-tight">
                      {rankName}
                    </span>
                  )}
                </div>
              </Link>
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
