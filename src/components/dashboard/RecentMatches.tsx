import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { RecentMatch } from '../../api/types';
import HeroIcon from '../common/HeroIcon';
import KDABadge from '../common/KDABadge';
import {
  formatDuration,
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
}

export const RecentMatches: React.FC<RecentMatchesProps> = ({
  matches,
  loading = false,
}) => {
  const { getHeroName } = useConstants();
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');

  const filteredMatches = matches.filter((m) => {
    const won = didWin(m.player_slot, m.radiant_win);
    if (filter === 'win') return won;
    if (filter === 'loss') return !won;
    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-white tracking-tight">Partidas Recientes</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-gray-400 font-mono">
            {matches.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('win')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'win'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Victorias
          </button>
          <button
            onClick={() => setFilter('loss')}
            className={`px-3 py-1 rounded-lg transition ${
              filter === 'loss'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Derrotas
          </button>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron partidas con el filtro seleccionado.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Resultado / Héroe</th>
                <th className="pb-3">Tipo / Modo</th>
                <th className="pb-3 text-center">Duración</th>
                <th className="pb-3">KDA</th>
                <th className="pb-3 text-right">GPM / XPM</th>
                <th className="pb-3 text-right pr-2">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredMatches.map((match) => {
                const won = didWin(match.player_slot, match.radiant_win);
                const radiant = isRadiant(match.player_slot);
                const heroName = getHeroName(match.hero_id);

                return (
                  <tr
                    key={match.match_id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Hero & Result */}
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-1 self-stretch rounded-full ${
                            won ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <HeroIcon heroId={match.hero_id} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-200 group-hover:text-white transition">
                              {heroName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                won
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {won ? 'Victoria' : 'Derrota'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>{radiant ? 'Radiant' : 'Dire'}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(match.start_time)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Mode & Lobby */}
                    <td className="py-3">
                      <div className="text-xs font-medium text-gray-300">
                        {getGameModeName(match.game_mode)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {getLobbyTypeName(match.lobby_type)}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-mono text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {formatDuration(match.duration)}
                      </div>
                    </td>

                    {/* KDA */}
                    <td className="py-3">
                      <KDABadge
                        kills={match.kills}
                        deaths={match.deaths}
                        assists={match.assists}
                      />
                    </td>

                    {/* GPM / XPM */}
                    <td className="py-3 text-right">
                      <div className="font-mono text-xs text-amber-400 font-semibold">
                        {match.gold_per_min}{' '}
                        <span className="text-[10px] font-normal text-gray-500">GPM</span>
                      </div>
                      <div className="font-mono text-[11px] text-sky-400">
                        {match.xp_per_min}{' '}
                        <span className="text-[10px] text-gray-500">XPM</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 text-right pr-2">
                      <Link
                        to={`/match/${match.match_id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600/90 text-gray-300 hover:text-white transition shadow-sm"
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
      )}
    </div>
  );
};

export default RecentMatches;
