import React from 'react';
import { Trophy, Swords, Shield, Activity, Target } from 'lucide-react';
import type { Player, WinLoss, PlayerTotal } from '../../api/types';
import { getRankName } from '../../utils/formatting';
import { RANK_COLORS } from '../../utils/constants';

interface OverviewCardProps {
  player: Player | null;
  winLoss: WinLoss | null;
  totals: PlayerTotal[] | null;
  loading?: boolean;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  player,
  winLoss,
  totals,
  loading = false,
}) => {
  const profile = player?.profile;
  const personaname = profile?.personaname || player?.personaname || 'Jugador de Dota';
  const avatar = profile?.avatarfull || player?.avatarfull;
  const rankTier = player?.rank_tier;
  const rankName = getRankName(rankTier);
  const tierMain = rankTier ? Math.floor(rankTier / 10) : 0;
  const rankColor = RANK_COLORS[tierMain] || '#94a3b8';

  const wins = winLoss?.win ?? 0;
  const losses = winLoss?.lose ?? 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

  // Extract averages from totals
  const getAverage = (field: string): number => {
    if (!totals) return 0;
    const entry = totals.find((t) => t.field === field);
    if (!entry || !entry.n || entry.n === 0) return 0;
    return Math.round(entry.sum / entry.n);
  };

  const avgKills = getAverage('kills');
  const avgDeaths = getAverage('deaths');
  const avgAssists = getAverage('assists');
  const avgGpm = getAverage('gold_per_min');
  const avgXpm = getAverage('xp_per_min');
  const avgLastHits = getAverage('last_hits');

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: rankColor }}
      />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Player identity */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden border-2 p-0.5 bg-slate-950 shadow-lg"
              style={{ borderColor: rankColor }}
            >
              {avatar ? (
                <img src={avatar} alt={personaname} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-500 font-bold text-2xl">
                  {personaname.charAt(0)}
                </div>
              )}
            </div>
            {rankTier && rankTier > 0 && (
              <span
                className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[11px] font-bold shadow border border-slate-900"
                style={{ backgroundColor: rankColor, color: '#090d16' }}
              >
                ★ {rankTier % 10 || 1}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{personaname}</h1>
              {profile?.loccountrycode && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-gray-400 font-mono">
                  {profile.loccountrycode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-md border"
                style={{
                  color: rankColor,
                  borderColor: `${rankColor}40`,
                  backgroundColor: `${rankColor}15`,
                }}
              >
                {rankName}
              </span>

              {player?.leaderboard_rank && (
                <span className="text-xs text-amber-400 font-mono font-medium flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> #{player.leaderboard_rank}
                </span>
              )}

              {player?.mmr_estimate?.estimate && (
                <span className="text-xs text-gray-400 font-mono">
                  MMR Est: ~{player.mmr_estimate.estimate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Win / Loss ratio */}
        <div className="w-full lg:w-72 bg-slate-950/60 rounded-xl p-4 border border-slate-800/60">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Récord Global
            </span>
            <span className="text-base font-bold text-emerald-400">{winRate}% WR</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 text-xs font-mono">
            <span className="text-emerald-400 font-medium">{wins} Victorias</span>
            <span className="text-gray-500">{totalGames} partidas</span>
            <span className="text-rose-400 font-medium">{losses} Derrotas</span>
          </div>
        </div>
      </div>

      {/* Bottom: Averages grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/40 text-center">
          <span className="text-[11px] text-gray-400 uppercase font-medium block mb-1">
            KDA Promedio
          </span>
          <span className="text-sm font-bold font-mono text-gray-200">
            {avgKills} / {avgDeaths} / {avgAssists}
          </span>
        </div>

        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/40 text-center">
          <span className="text-[11px] text-gray-400 uppercase font-medium block mb-1">
            GPM Promedio
          </span>
          <span className="text-sm font-bold font-mono text-amber-400">{avgGpm}</span>
        </div>

        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/40 text-center">
          <span className="text-[11px] text-gray-400 uppercase font-medium block mb-1">
            XPM Promedio
          </span>
          <span className="text-sm font-bold font-mono text-sky-400">{avgXpm}</span>
        </div>

        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/40 text-center">
          <span className="text-[11px] text-gray-400 uppercase font-medium block mb-1">
            Last Hits
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400">{avgLastHits}</span>
        </div>

        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/40 text-center">
          <span className="text-[11px] text-gray-400 uppercase font-medium block mb-1">
            Impacto KDA
          </span>
          <span className="text-sm font-bold font-mono text-purple-400">
            {avgDeaths > 0 ? ((avgKills + avgAssists) / avgDeaths).toFixed(2) : '-'}
          </span>
        </div>

        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/40 text-center">
          <span className="text-[11px] text-gray-400 uppercase font-medium block mb-1">
            Partidas Totales
          </span>
          <span className="text-sm font-bold font-mono text-gray-300">{totalGames}</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
