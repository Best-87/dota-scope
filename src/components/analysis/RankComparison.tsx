import React from 'react';
import { Trophy, Award, TrendingUp, Sparkles } from 'lucide-react';
import type { HeroRanking } from '../../api/types';
import HeroIcon from '../common/HeroIcon';
import { useConstants } from '../../hooks/useConstants';

interface RankComparisonProps {
  rankings: HeroRanking[];
}

export const RankComparison: React.FC<RankComparisonProps> = ({ rankings }) => {
  const { getHeroName } = useConstants();

  // Sort rankings by percent_rank descending (highest percentile first)
  const sortedRankings = [...rankings].sort((a, b) => b.percent_rank - a.percent_rank);

  if (sortedRankings.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center text-gray-500">
        No se encontraron percentiles de ranking para este jugador en OpenDota.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Percentil Global por Héroe (Comunidad Dota 2)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Compara tu nivel de maestría y score relativo contra todos los jugadores de Dota 2 a nivel mundial
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRankings.map((ranking) => {
          const heroId = Number(ranking.hero_id);
          const heroName = getHeroName(heroId);
          const topPercent = Math.max(1, Math.round((1 - ranking.percent_rank) * 100));
          const isTopTier = topPercent <= 10;
          const isHighTier = topPercent <= 25;

          return (
            <div
              key={heroId}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition group flex items-center gap-3.5"
            >
              <HeroIcon heroId={heroId} size="lg" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-200 group-hover:text-white truncate">
                    {heroName}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isTopTier
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isHighTier
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-gray-400'
                    }`}
                  >
                    Top {topPercent}%
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                    <span>Percentil global</span>
                    <span>{(ranking.percent_rank * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isTopTier
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                          : isHighTier
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-400'
                          : 'bg-sky-500'
                      }`}
                      style={{ width: `${ranking.percent_rank * 100}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 font-mono mt-1 text-right">
                  Score: {ranking.score ? ranking.score.toFixed(4) : '-'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RankComparison;
