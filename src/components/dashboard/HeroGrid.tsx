import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award } from 'lucide-react';
import type { HeroStats } from '../../api/types';
import HeroIcon from '../common/HeroIcon';
import { useConstants } from '../../hooks/useConstants';

interface HeroGridProps {
  heroes: HeroStats[];
  accountId: number;
  limit?: number;
}

export const HeroGrid: React.FC<HeroGridProps> = ({
  heroes,
  accountId,
  limit = 6,
}) => {
  const { getHeroName } = useConstants();

  // Sort heroes by games played descending
  const sortedHeroes = [...heroes]
    .filter((h) => h.games > 0)
    .sort((a, b) => b.games - a.games)
    .slice(0, limit);

  if (sortedHeroes.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-gray-500">
        No hay datos de héroes disponibles.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Héroes Más Jugados</h2>
        </div>
        <Link
          to={`/heroes/${accountId}`}
          className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition"
        >
          Ver Todos ({heroes.length})
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sortedHeroes.map((hero) => {
          const heroId = Number(hero.hero_id);
          const winRate = hero.games > 0 ? ((hero.win / hero.games) * 100).toFixed(1) : '0.0';
          const isHighWinrate = Number(winRate) >= 55;

          return (
            <div
              key={heroId}
              className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex items-center gap-3 transition group"
            >
              <HeroIcon heroId={heroId} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-200 truncate group-hover:text-white transition">
                    {getHeroName(heroId)}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      isHighWinrate ? 'text-emerald-400' : 'text-gray-300'
                    }`}
                  >
                    {winRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-xs text-gray-400 font-mono">
                  <span>{hero.games} partidas</span>
                  <span className="text-[11px] text-gray-500">
                    {hero.win}V - {hero.games - hero.win}D
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isHighWinrate ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                    style={{ width: `${winRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroGrid;
