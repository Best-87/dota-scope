import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { usePlayer } from '../hooks/usePlayer';
import { useConstants } from '../hooks/useConstants';
import HeroIcon from '../components/common/HeroIcon';
import Loading from '../components/common/Loading';
import type { HeroStats } from '../api/types';

export const HeroesPage: React.FC = () => {
  const { accountId: routeAccountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const accountId = routeAccountId ? Number(routeAccountId) : null;

  const { heroes, loading, error } = usePlayer(accountId);
  const { getHeroName, heroes: heroConstants } = useConstants();

  const [searchTerm, setSearchTerm] = useState('');
  const [minGames, setMinGames] = useState<number>(1);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'games' | 'winrate' | 'win'>('games');

  const filteredAndSortedHeroes = useMemo(() => {
    return heroes
      .filter((h: HeroStats) => {
        if (h.games < minGames) return false;
        const heroId = Number(h.hero_id);
        const name = getHeroName(heroId).toLowerCase();
        if (searchTerm && !name.includes(searchTerm.toLowerCase())) return false;

        // Role filter based on heroConstants
        if (roleFilter !== 'all') {
          const constant = heroConstants[heroId];
          if (!constant || !constant.roles?.includes(roleFilter)) return false;
        }

        return true;
      })
      .sort((a: HeroStats, b: HeroStats) => {
        const wrA = a.games > 0 ? a.win / a.games : 0;
        const wrB = b.games > 0 ? b.win / b.games : 0;

        if (sortBy === 'winrate') return wrB - wrA;
        if (sortBy === 'win') return b.win - a.win;
        return b.games - a.games; // default games
      });
  }, [heroes, minGames, searchTerm, roleFilter, sortBy, getHeroName, heroConstants]);

  if (loading && heroes.length === 0) {
    return <Loading message="Cargando estadísticas de héroes..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Análisis y Rendimiento por Héroe
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Revisa el winrate, partidas y efectividad con cada héroe en tu historial
          </p>
        </div>

        <div className="text-xs text-gray-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Mostrando <strong className="text-white">{filteredAndSortedHeroes.length}</strong> héroes
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar héroe..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Min Games Filter */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Min. Partidas:</span>
          <select
            value={minGames}
            onChange={(e) => setMinGames(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-red-500"
          >
            <option value={1}>1+ partidas</option>
            <option value={5}>5+ partidas</option>
            <option value={10}>10+ partidas</option>
            <option value={20}>20+ partidas</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Rol:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">Todos los roles</option>
            <option value="Carry">Carry</option>
            <option value="Support">Support</option>
            <option value="Nuker">Nuker</option>
            <option value="Disabler">Disabler</option>
            <option value="Initiator">Initiator</option>
            <option value="Durable">Durable / Tank</option>
            <option value="Escape">Escape</option>
            <option value="Pusher">Pusher</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSortBy('games')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === 'games' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Partidas
          </button>
          <button
            onClick={() => setSortBy('winrate')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === 'winrate' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Winrate %
          </button>
          <button
            onClick={() => setSortBy('win')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === 'win' ? 'bg-slate-800 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Victorias
          </button>
        </div>
      </div>

      {/* Heroes Table */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3.5 pl-4">Héroe</th>
                <th className="py-3.5 text-center">Partidas</th>
                <th className="py-3.5 w-60">Winrate %</th>
                <th className="py-3.5 text-center">Victorias / Derrotas</th>
                <th className="py-3.5 text-right pr-4">Roles Principales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredAndSortedHeroes.map((hero: HeroStats) => {
                const heroId = Number(hero.hero_id);
                const heroName = getHeroName(heroId);
                const winRate = hero.games > 0 ? ((hero.win / hero.games) * 100).toFixed(1) : '0.0';
                const isHighWinrate = Number(winRate) >= 55;
                const isLowWinrate = Number(winRate) < 45;
                const heroMeta = heroConstants[heroId];

                return (
                  <tr key={heroId} className="hover:bg-slate-800/40 transition">
                    {/* Hero Info */}
                    <td className="py-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <HeroIcon heroId={heroId} size="md" />
                        <div>
                          <div className="font-bold text-sm text-gray-200">{heroName}</div>
                          <div className="text-[11px] text-gray-500 capitalize">
                            {heroMeta?.primary_attr === 'str'
                              ? 'Fuerza'
                              : heroMeta?.primary_attr === 'agi'
                              ? 'Agilidad'
                              : heroMeta?.primary_attr === 'int'
                              ? 'Inteligencia'
                              : 'Universal'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Games */}
                    <td className="py-3.5 text-center font-mono font-bold text-gray-200">
                      {hero.games}
                    </td>

                    {/* Winrate Bar */}
                    <td className="py-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline text-xs font-mono">
                          <span
                            className={`font-bold ${
                              isHighWinrate
                                ? 'text-emerald-400'
                                : isLowWinrate
                                ? 'text-rose-400'
                                : 'text-gray-300'
                            }`}
                          >
                            {winRate}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHighWinrate
                                ? 'bg-emerald-500'
                                : isLowWinrate
                                ? 'bg-rose-500'
                                : 'bg-sky-500'
                            }`}
                            style={{ width: `${winRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* W/L */}
                    <td className="py-3.5 text-center font-mono">
                      <span className="text-emerald-400 font-semibold">{hero.win}V</span>
                      <span className="text-gray-500 mx-1">-</span>
                      <span className="text-rose-400 font-semibold">{hero.games - hero.win}D</span>
                    </td>

                    {/* Roles tags */}
                    <td className="py-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {heroMeta?.roles?.slice(0, 3).map((r: string) => (
                          <span
                            key={r}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-gray-400"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HeroesPage;
