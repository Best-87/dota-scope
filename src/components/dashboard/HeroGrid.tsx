import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, Flame, Swords } from 'lucide-react';
import type { HeroStats } from '../../api/types';
import HeroIcon from '../common/HeroIcon';
import { useConstants } from '../../hooks/useConstants';

interface HeroGridProps {
  heroes: HeroStats[];
  accountId: number;
  limit?: number;
  loading?: boolean;
}

export const HeroGrid: React.FC<HeroGridProps> = ({
  heroes,
  accountId,
  limit = 6,
  loading = false,
}) => {
  const { getHeroName } = useConstants();

  if (loading) {
    return (
      <div className="bg-[#0e121a]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-6 w-48 bg-slate-800/60 rounded mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="h-20 bg-[#141924]/60 rounded-xl border border-white/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  // Sort heroes by games played descending
  const sortedHeroes = [...heroes]
    .filter((h) => h.games > 0)
    .sort((a, b) => b.games - a.games)
    .slice(0, limit);

  if (sortedHeroes.length === 0) {
    return (
      <div className="bg-[#0e121a]/80 border border-white/[0.08] rounded-2xl p-6 text-center text-slate-500">
        No hay datos de héroes disponibles.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#111520]/90 to-[#0c0f16]/95 border border-white/[0.08] hover:border-amber-500/25 rounded-2xl p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              Héroes Más Jugados
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Rendimiento competitivo del jugador
            </span>
          </div>
        </div>
        <Link
          to={`/heroes/${accountId}`}
          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25"
        >
          Ver Todos ({heroes.length})
          <ChevronRight className="w-3.5 h-3.5" />
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
              className="bg-[#090b10]/80 hover:bg-[#121624] border border-white/[0.06] hover:border-amber-500/40 rounded-xl p-3.5 flex items-center gap-3.5 transition group shadow-sm"
            >
              <div className="relative flex-shrink-0">
                <HeroIcon heroId={heroId} size="md" />
                {isHighWinrate && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black shadow-sm" title="Winrate excepcional (+55%)">
                    ★
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                    {getHeroName(heroId)}
                  </span>
                  <span
                    className={`text-xs font-black font-mono ${
                      isHighWinrate ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300'
                    }`}
                  >
                    {winRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-xs text-slate-400 font-mono">
                  <span>{hero.games} partidas</span>
                  <span className="text-[11px] text-slate-500">
                    <span className="text-emerald-400 font-semibold">{hero.win}V</span> - <span className="text-rose-400 font-semibold">{hero.games - hero.win}D</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighWinrate
                        ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-sm'
                        : 'bg-gradient-to-r from-sky-500 to-indigo-500'
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
