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
  Flame,
  ShieldAlert,
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
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
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
        window.history.replaceState({}, '', window.location.pathname);
        navigate(`/dashboard/${steamAccountId}`);
      }
    }
  }, []);

  const performSearch = async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const parsedId = parsePlayerId(trimmed);
    if (parsedId && !isNaN(Number(parsedId)) && parsedId.length <= 10) {
      const numId = Number(parsedId);
      setAccountId(numId);
      navigate(`/dashboard/${numId}`);
      return;
    }

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
    <div className="max-w-4xl mx-auto py-8 sm:py-14 px-4">
      {/* Hero Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-red-500/15 border border-amber-500/30 text-amber-300 text-xs font-black tracking-widest uppercase font-mono shadow-sm">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          DOTA 2 ADVANCED TELEMETRY
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-sans">
          Domina cada <span className="bg-gradient-to-r from-red-500 via-amber-500 to-amber-300 bg-clip-text text-transparent">partida de Dota</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Métricas de farm GPM/XPM en tiempo real, mapas de calor de wards, autopsia de peleas y rendimiento competitivo.
        </p>
      </div>

      {/* Player History (if any) */}
      {playerHistory.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">
                Historial Reciente
              </h2>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition font-semibold"
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
                className="bg-[#0e121a]/90 hover:bg-[#141924] border border-white/[0.06] hover:border-amber-500/40 rounded-xl p-3 flex items-center gap-3 text-left transition group shadow-sm"
              >
                {entry.avatarfull ? (
                  <img
                    src={entry.avatarfull}
                    alt={entry.personaname}
                    className="w-10 h-10 rounded-lg object-cover border border-white/10 group-hover:border-amber-500/50 flex-shrink-0 transition"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0 font-bold">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-200 group-hover:text-amber-300 truncate transition-colors">
                    {entry.personaname}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5 font-mono text-xs text-slate-400">
                    <span>ID: {entry.accountId}</span>
                    <span className="text-[10px] text-amber-500/80">{timeAgo(entry.lastSeen)}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Search Box Card */}
      <div className="bg-gradient-to-b from-[#121622]/90 to-[#0a0d14] border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl mb-8 transition-all">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa Steam ID (ej. 86745912), link de perfil o nombre..."
              className="w-full bg-[#080a0f] border border-white/[0.1] rounded-xl pl-12 pr-32 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 transition shadow-inner"
            />
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-amber-400 absolute left-4 top-4.5 transition-colors" />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="absolute right-2.5 top-2.5 bottom-2.5 px-6 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-wider transition shadow-md flex items-center gap-1.5"
            >
              {searching ? 'Buscando...' : 'Analizar'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>Soporta Steam ID32, ID64 y URLs de Dotabuff / OpenDota</span>
            <span className="text-amber-400 font-bold">100% Gratis</span>
          </div>
        </form>

        {/* Steam Login Button */}
        <div className="mt-5 pt-5 border-t border-white/[0.07]">
          <button
            onClick={handleSteamLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-[#17202d] hover:bg-[#202d40] border border-[#2b3a4f] hover:border-amber-500/50 text-white font-bold text-sm transition shadow-lg group"
          >
            <svg viewBox="0 0 233 233" className="w-5 h-5 text-slate-300 group-hover:text-amber-400 transition-colors" fill="currentColor">
              <path d="M116.5 0C52.1 0 0 52.2 0 116.5c0 52.1 34.1 96.4 81.2 111.5l30.3-62.5c-1-.2-2-.4-3-.6-18.4-4.6-31.2-21.4-31.2-40.5 0-23.3 18.9-42.2 42.2-42.2 23.3 0 42.2 18.9 42.2 42.2 0 19.5-13.3 36.2-31.3 40.4l-29.1 60.1c3.7.4 7.5.6 11.3.6 64.3 0 116.5-52.2 116.5-116.5S180.8 0 116.5 0zm-9.9 168.4c-18.3 0-33.1-14.9-33.1-33.2s14.8-33.1 33.1-33.1c18.3 0 33.1 14.8 33.1 33.1s-14.8 33.2-33.1 33.2z"/>
            </svg>
            <span>Iniciar sesión directo con Steam</span>
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2 font-mono">
            Carga tu cuenta al instante mediante autenticación oficial de Valve
          </p>
        </div>

        {/* Search Results */}
        {searching && <Loading message="Consultando base de jugadores..." size="md" />}

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {results.length > 0 && !searching && (
          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3.5 font-mono">
              Resultados Encontrados ({results.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {results.map((player) => (
                <button
                  key={player.account_id}
                  onClick={() => handleSelectPlayer(player.account_id)}
                  className="bg-[#090b10] hover:bg-[#141924] border border-white/[0.08] hover:border-amber-500/50 rounded-xl p-3 flex items-center gap-3 text-left transition group shadow-sm"
                >
                  {player.avatarfull ? (
                    <img
                      src={player.avatarfull}
                      alt={player.personaname}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10 group-hover:border-amber-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-100 group-hover:text-amber-300 truncate transition-colors">
                      {player.personaname}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      ID: {player.account_id}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pro Demo Players Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-black text-slate-300 uppercase tracking-widest font-mono">
            O prueba con los mejores del mundo
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DEMO_PLAYERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPlayer(p.id)}
              className="bg-[#0e121a]/80 hover:bg-[#141924] border border-white/[0.06] hover:border-amber-500/40 rounded-xl p-4 text-left transition group shadow-sm"
            >
              <div className="font-bold text-sm text-slate-100 group-hover:text-amber-300 truncate transition-colors">
                {p.name}
              </div>
              <div className="text-xs text-amber-400 font-bold mt-0.5">{p.role}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1.5 flex justify-between items-center">
                <span className="truncate mr-1">{p.team}</span>
                <span className="text-[10px] bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded text-slate-300 flex-shrink-0">
                  {p.id}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
