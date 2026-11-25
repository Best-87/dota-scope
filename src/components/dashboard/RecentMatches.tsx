import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Swords,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { RecentMatch } from '../../api/types';
import { requestParse, getMatch } from '../../api/opendota';
import HeroIcon from '../common/HeroIcon';
import KDABadge from '../common/KDABadge';
import {
  formatDuration,
  formatMatchDateTime,
  formatTimeAgo,
  getGameModeName,
  getLobbyTypeName,
  didWin,
  isRadiant,
} from '../../utils/formatting';
import { useConstants } from '../../hooks/useConstants';

interface RecentMatchesProps {
  matches: RecentMatch[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export const RecentMatches: React.FC<RecentMatchesProps> = ({
  matches,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}) => {
  const { getHeroName } = useConstants();
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [parseStates, setParseStates] = useState<
    Record<number, 'idle' | 'requesting' | 'polling' | 'parsed' | 'error'>
  >({});
  const pollTimersRef = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    const timers = pollTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, []);

  const handleRequestParse = async (matchId: number) => {
    const current = parseStates[matchId];
    if (current === 'requesting' || current === 'polling' || current === 'parsed') return;

    setParseStates((prev) => ({ ...prev, [matchId]: 'requesting' }));
    try {
      await requestParse(matchId);
      setParseStates((prev) => ({ ...prev, [matchId]: 'polling' }));

      let attempts = 0;
      const timer = setInterval(async () => {
        attempts += 1;
        try {
          const detail = await getMatch(matchId);
          if (detail?.version != null && detail.version > 0) {
            clearInterval(timer);
            delete pollTimersRef.current[matchId];
            setParseStates((prev) => ({ ...prev, [matchId]: 'parsed' }));
            return;
          }
        } catch {
          // Ignore transient polling errors
        }
        if (attempts >= 15) {
          clearInterval(timer);
          delete pollTimersRef.current[matchId];
          setParseStates((prev) => ({ ...prev, [matchId]: 'idle' }));
        }
      }, 5000);

      pollTimersRef.current[matchId] = timer;
    } catch {
      setParseStates((prev) => ({ ...prev, [matchId]: 'error' }));
    }
  };

  const renderParseButton = (matchId: number, isParsed: boolean) => {
    if (isParsed) return null;
    const status = parseStates[matchId] || 'idle';
    const isBusy = status === 'requesting' || status === 'polling';

    return (
      <button
        type="button"
        onClick={() => handleRequestParse(matchId)}
        disabled={isBusy}
        title="Solicitar parseo de replay a OpenDota"
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
          status === 'error'
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
            : isBusy
            ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 cursor-wait'
            : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300'
        }`}
      >
        {isBusy ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        <span>
          {status === 'requesting'
            ? 'Enviando...'
            : status === 'polling'
            ? 'Parseando...'
            : status === 'error'
            ? 'Reintentar'
            : 'Parsear'}
        </span>
      </button>
    );
  };

  const filteredMatches = matches.filter((m) => {
    const won = didWin(m.player_slot, m.radiant_win);
    if (filter === 'win') return won;
    if (filter === 'loss') return !won;
    return true;
  });

  return (
    <div className="bg-gradient-to-b from-[#111520]/90 to-[#0c0f16]/95 border border-white/[0.08] hover:border-amber-500/25 rounded-2xl p-6 shadow-xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <Swords className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">Partidas Recientes</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-amber-300 font-mono font-bold border border-white/10">
                {matches.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Historial competitivo y métricas de impacto</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-[#090b10] p-1.5 rounded-xl border border-white/[0.08] text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('win')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filter === 'win'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Victorias
          </button>
          <button
            onClick={() => setFilter('loss')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              filter === 'loss'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Derrotas
          </button>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-medium">
          No se encontraron partidas con el filtro seleccionado.
        </div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="md:hidden space-y-3">
            {filteredMatches.map((match) => {
              const won = didWin(match.player_slot, match.radiant_win);
              const radiant = isRadiant(match.player_slot);
              const heroName = getHeroName(match.hero_id);
              const isParsed =
                Boolean(match.version != null && match.version > 0) ||
                parseStates[match.match_id] === 'parsed';

              return (
                <div
                  key={match.match_id}
                  className={`bg-[#090c12]/90 border rounded-2xl p-4 space-y-3 transition ${
                    won ? 'border-emerald-500/25 hover:border-emerald-500/45' : 'border-rose-500/25 hover:border-rose-500/45'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <HeroIcon heroId={match.hero_id} size="md" />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-100 truncate">
                          {heroName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono flex-wrap">
                          <span className={radiant ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {radiant ? 'Radiant' : 'Dire'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3 h-3 text-amber-500/80" />
                            {formatMatchDateTime(match.start_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isParsed && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          title="Partida analizada"
                        >
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>Parseada</span>
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase flex-shrink-0 font-mono ${
                          won
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {won ? 'Victoria' : 'Derrota'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#0e121a] border border-white/[0.04] text-xs font-mono text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">KDA</span>
                      <span className="font-bold text-slate-100">
                        {match.kills}/{match.deaths}/{match.assists}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">GPM / XPM</span>
                      <span className="font-bold text-amber-400">
                        {match.gold_per_min} <span className="text-cyan-400">/ {match.xp_per_min}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">DURACIÓN</span>
                      <span className="text-slate-300 font-bold">
                        {formatDuration(match.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 truncate font-mono">
                      {getGameModeName(match.game_mode)}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {renderParseButton(match.match_id, isParsed)}
                      <Link
                        to={`/match/${match.match_id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white transition shadow-md shadow-red-950/40"
                      >
                        <span>Analizar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="pb-3.5 pl-3">Resultado / Héroe</th>
                  <th className="pb-3.5">Modo de Juego</th>
                  <th className="pb-3.5 text-center">Duración</th>
                  <th className="pb-3.5">KDA</th>
                  <th className="pb-3.5 text-right">GPM / XPM</th>
                  <th className="pb-3.5 text-right pr-3">Telemetría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredMatches.map((match) => {
                  const won = didWin(match.player_slot, match.radiant_win);
                  const radiant = isRadiant(match.player_slot);
                  const heroName = getHeroName(match.hero_id);

                  return (
                    <tr
                      key={match.match_id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Hero & Result */}
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-1.5 self-stretch rounded-full ${
                              won ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                            }`}
                          />
                          <HeroIcon heroId={match.hero_id} size="md" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                                {heroName}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase font-mono ${
                                  won
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}
                              >
                                {won ? 'Victoria' : 'Derrota'}
                              </span>
                              {Boolean(match.version != null && match.version > 0) && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                                  title="Partida analizada"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                                  <span>Parseada</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                              <span className={radiant ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                {radiant ? 'Radiant' : 'Dire'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-300">
                                <Calendar className="w-3 h-3 text-amber-500/80" />
                                {formatMatchDateTime(match.start_time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mode & Lobby */}
                      <td className="py-3.5">
                        <div className="text-xs font-bold text-slate-200">
                          {getGameModeName(match.game_mode)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {getLobbyTypeName(match.lobby_type)}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200 bg-[#090b10] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                          <Clock className="w-3.5 h-3.5 text-amber-500/80" />
                          {formatDuration(match.duration)}
                        </div>
                      </td>

                      {/* KDA */}
                      <td className="py-3.5">
                        <KDABadge
                          kills={match.kills}
                          deaths={match.deaths}
                          assists={match.assists}
                        />
                      </td>

                      {/* GPM / XPM */}
                      <td className="py-3.5 text-right">
                        <div className="font-mono text-xs text-amber-400 font-bold">
                          {match.gold_per_min}{' '}
                          <span className="text-[10px] font-normal text-slate-500">GPM</span>
                        </div>
                        <div className="font-mono text-[11px] text-cyan-400 font-bold">
                          {match.xp_per_min}{' '}
                          <span className="text-[10px] font-normal text-slate-500">XPM</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 text-right pr-3">
                        <Link
                          to={`/match/${match.match_id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#141924] hover:bg-gradient-to-r hover:from-red-600 hover:to-amber-600 border border-white/[0.08] hover:border-transparent text-slate-200 hover:text-white transition-all shadow-sm"
                        >
                          <span>Analizar</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <div className="mt-5 pt-4 border-t border-white/[0.08] text-center">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-xl bg-[#121622] hover:bg-[#181f2f] border border-amber-500/30 hover:border-amber-500/60 text-amber-300 font-bold text-xs transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span>Cargando partidas...</span>
                  </>
                ) : (
                  <>
                    <span>Cargar más partidas del historial</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentMatches;
