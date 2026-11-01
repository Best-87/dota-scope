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
  Clock,
  Trash2,
  LogIn,
} from 'lucide-react';
import { searchPlayers } from '../api/opendota';
import type { SearchResult } from '../api/types';
import { parsePlayerId, toAccountId } from '../utils/steamId';
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

// ─── Steam OpenID Login ────────────────────────────────────────────────────────
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const APP_RETURN_URL = window.location.origin + window.location.pathname;

function getSteamLoginUrl(): string {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': APP_RETURN_URL,
    'openid.realm': window.location.origin,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

/** Extracts Steam64 ID from OpenID return URL, then converts to accountId */
function extractSteamIdFromUrl(url: string): number | null {
  try {
    const match = url.match(/openid\.claimed_id=https%3A%2F%2Fsteamcommunity\.com%2Fopenid%2Fid%2F(\d+)/);
    if (match) {
      return Number(toAccountId(match[1]));
    }
    // Also check decoded form
    const urlObj = new URL(url);
    const claimedId = urlObj.searchParams.get('openid.claimed_id');
    if (claimedId) {
      const idMatch = claimedId.match(/\/id\/(\d+)$/);
      if (idMatch) {
        return Number(toAccountId(idMatch[1]));
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/** Format time ago in Spanish */
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccountId, playerHistory, clearHistory } = usePlayerContext();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Detect Steam OpenID return ──────────────────────────────────────────────
  useEffect(() => {
    const fullUrl = window.location.href;
    if (fullUrl.includes('openid.claimed_id') || fullUrl.includes('openid.mode=id_res')) {
      const steamAccountId = extractSteamIdFromUrl(fullUrl);
      if (steamAccountId && !isNaN(steamAccountId) && steamAccountId > 0) {
        setAccountId(steamAccountId);
        // Clean up URL params so we don't trigger this again on reload
        window.history.replaceState({}, '', window.location.pathname);
        navigate(`/dashboard/${steamAccountId}`);
      }
    }
  }, []);

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

  const handleSteamLogin = () => {
    window.location.href = getSteamLoginUrl();
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

      {/* Player History */}
      {playerHistory.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                Jugadores Recientes
              </h2>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-400 transition"
              title="Limpiar historial"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playerHistory.map((entry) => (
              <button
                key={entry.accountId}
                onClick={() => handleSelectPlayer(entry.accountId)}
                className="bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/70 hover:border-amber-500/40 rounded-xl p-3 flex items-center gap-3 text-left transition group"
              >
                {entry.avatarfull ? (
                  <img
                    src={entry.avatarfull}
                    alt={entry.personaname}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-gray-500 flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-200 group-hover:text-white truncate">
                    {entry.personaname}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-xs text-gray-500 font-mono">ID: {entry.accountId}</span>
                    <span className="text-[11px] text-amber-500/70">{timeAgo(entry.lastSeen)}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl mb-6">
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

        {/* Steam Login */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <button
            onClick={handleSteamLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1b2838] hover:bg-[#2a3f5f] border border-[#1b2838] hover:border-[#4a9dc5] text-white font-semibold text-sm transition shadow-lg"
          >
            {/* Steam logo SVG */}
            <svg viewBox="0 0 233 233" className="w-6 h-6" fill="currentColor">
              <path d="M116.5 0C52.1 0 0 52.2 0 116.5c0 52.1 34.1 96.4 81.2 111.5l30.3-62.5c-1-.2-2-.4-3-.6-18.4-4.6-31.2-21.4-31.2-40.5 0-23.3 18.9-42.2 42.2-42.2 23.3 0 42.2 18.9 42.2 42.2 0 19.5-13.3 36.2-31.3 40.4l-29.1 60.1c3.7.4 7.5.6 11.3.6 64.3 0 116.5-52.2 116.5-116.5S180.8 0 116.5 0zm-9.9 168.4c-18.3 0-33.1-14.9-33.1-33.2s14.8-33.1 33.1-33.1c18.3 0 33.1 14.8 33.1 33.1s-14.8 33.2-33.1 33.2z"/>
            </svg>
            Iniciar sesión con Steam
          </button>
          <p className="text-center text-[11px] text-gray-600 mt-2">
            Te redirige a Steam y vuelve automáticamente con tu perfil cargado
          </p>
        </div>

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
