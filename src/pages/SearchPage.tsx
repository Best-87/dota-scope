import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Swords,
  Trophy,
  ExternalLink,
  Sparkles,
  Zap,
  User,
} from 'lucide-react';
import { searchPlayers } from '../api/opendota';
import type { SearchResult } from '../api/types';
import { parsePlayerId } from '../utils/steamId';
import { usePlayerContext } from '../context/PlayerContext';
import Loading from '../components/common/Loading';

// Popular players for immediate testing
const DEMO_PLAYERS = [
  { id: 86745912, name: 'Arteezy', role: 'Carry', team: 'Shopify Rebellion' },
  { id: 105248644, name: 'Miracle-', role: 'Mid / Carry', team: 'Nigma Galaxy' },
  { id: 94054712, name: 'Topson', role: 'Mid', team: 'Tundra Esports' },
  { id: 88271288, name: 'Ceb', role: 'Offlane / Support', team: 'OG' },
  { id: 25907144, name: 'Cr1t-', role: 'Support', team: 'Team Falcons' },
  { id: 311360822, name: 'Yatoro', role: 'Carry', team: 'Team Spirit' },
];

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccountId } = usePlayerContext();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    // Check if directly a Steam ID or URL
    const parsedId = parsePlayerId(trimmed);
    if (parsedId && !isNaN(Number(parsedId)) && parsedId.length <= 10) {
      const numId = Number(parsedId);
      setAccountId(numId);
      navigate(`/dashboard/${numId}`);
      return;
    }

    // Search by persona name
    setSearching(true);
    setError(null);
    try {
      const res = await searchPlayers(trimmed);
      setResults(res.slice(0, 15));
      if (res.length === 0) {
        setError('No se encontraron jugadores con ese nombre.');
      }
    } catch (err) {
      setError('Error al buscar jugadores. Intenta de nuevo o ingresa tu ID directamente.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      performSearch(q);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleSelectPlayer = (id: number) => {
    setAccountId(id);
    navigate(`/dashboard/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-16 px-4">
      {/* Hero section */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wide">
          <Zap className="w-3.5 h-3.5" />
          ANALIZADOR DE PARTIDAS DE DOTA 2
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Descubre tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">patrones de juego</span>
        </h1>

        <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
          Analiza tus partidas, progresión de farm GPM/XPM, colocación de wards, impacto por rol y evolución a lo largo del tiempo.
        </p>
      </div>

      {/* Quick link to User Default Profile */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-red-400 font-bold uppercase tracking-wider">Tu Perfil Predeterminado</div>
            <div className="text-sm font-bold text-white font-mono">Steam ID: 1242630127</div>
          </div>
        </div>
        <button
          onClick={() => handleSelectPlayer(1242630127)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow"
        >
          Abrir Mi Dashboard
        </button>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl mb-10">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa tu Steam ID (ej. 86745912), link de perfil o nombre..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-12 pr-28 py-3.5 text-base text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition shadow-inner"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-medium text-sm transition shadow flex items-center gap-1.5"
            >
              {searching ? 'Buscando...' : 'Analizar'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>Acepta: Steam ID32, SteamID64, URLs de Steam / Dotabuff / OpenDota</span>
            <span className="text-gray-400">100% Gratuito</span>
          </div>
        </form>

        {/* Search Results */}
        {searching && <Loading message="Buscando perfiles..." size="md" />}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center">
            {error}
          </div>
        )}

        {results.length > 0 && !searching && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Resultados de búsqueda ({results.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {results.map((player) => (
                <button
                  key={player.account_id}
                  onClick={() => handleSelectPlayer(player.account_id)}
                  className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-red-500/40 rounded-xl p-3 flex items-center gap-3 text-left transition group"
                >
                  {player.avatarfull ? (
                    <img
                      src={player.avatarfull}
                      alt={player.personaname}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-200 group-hover:text-white truncate">
                      {player.personaname}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      ID: {player.account_id}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Demo Players section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            ¿No tienes tu ID a mano? Prueba con un jugador profesional
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DEMO_PLAYERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPlayer(p.id)}
              className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-slate-700 rounded-xl p-3.5 text-left transition group"
            >
              <div className="font-bold text-sm text-gray-200 group-hover:text-white truncate">
                {p.name}
              </div>
              <div className="text-xs text-red-400 font-medium mt-0.5">{p.role}</div>
              <div className="text-[11px] text-gray-500 font-mono mt-1 flex justify-between items-center">
                <span>{p.team}</span>
                <span className="text-[10px] bg-slate-800 px-1 rounded">ID: {p.id}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
