import { Trophy, Swords, Shield, Activity, Target, Zap, Flame, Award, Skull, Crosshair } from 'lucide-react';
import type { Player, WinLoss, PlayerTotal } from '../../api/types';
import { getRankName, estimateMmrFromRank } from '../../utils/formatting';
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
  const rankColor = RANK_COLORS[tierMain] || '#d97706';

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
  const kdaRatio = avgDeaths > 0 ? ((avgKills + avgAssists) / avgDeaths).toFixed(2) : '-';

  return (
    <div className="bg-gradient-to-b from-[#121622]/90 via-[#0d1017]/95 to-[#090b10] border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Dynamic ambient gold/rank flare */}
      <div
        className="absolute -right-24 -top-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: rankColor }}
      />
      <div className="absolute left-10 -bottom-20 w-80 h-80 rounded-full blur-3xl bg-amber-500/10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Player identity */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            {/* Glowing avatar frame */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-amber-500/40 via-red-500/30 to-amber-300/40 blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
            <div
              className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 p-0.5 bg-[#0a0d14] shadow-xl flex items-center justify-center"
              style={{ borderColor: rankColor }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={personaname}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold text-2xl font-mono">
                  {personaname.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {rankTier && rankTier > 0 && (
              <span
                className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-lg border border-[#090b10] flex items-center gap-0.5"
                style={{ backgroundColor: rankColor, color: '#090b10' }}
              >
                ★ {rankTier % 10 || 1}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans drop-shadow-md">
                {personaname}
              </h1>
              {profile?.loccountrycode && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-slate-300 uppercase">
                  {profile.loccountrycode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              <span
                className="text-xs font-extrabold px-3 py-1 rounded-lg border shadow-sm tracking-wide"
                style={{
                  color: rankColor,
                  borderColor: `${rankColor}50`,
                  backgroundColor: `${rankColor}15`,
                }}
              >
                {rankName}
              </span>

              {player?.leaderboard_rank && (
                <span className="text-xs text-amber-300 font-mono font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> #{player.leaderboard_rank}
                </span>
              )}

              {/* MMR Display */}
              {(() => {
                const mmrVal = player?.mmr_estimate?.estimate || estimateMmrFromRank(player?.rank_tier);
                if (!mmrVal) return null;
                return (
                  <span className="text-xs font-mono font-black px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>MMR ~{mmrVal.toLocaleString()}</span>
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Center/Right: Win / Loss ratio gaming card */}
        <div className="w-full lg:w-80 bg-[#090c12]/80 rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-inner relative">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Winrate Global
            </span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {winRate}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 w-full bg-rose-950/40 rounded-full overflow-hidden flex border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${winRate}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-3 text-xs font-mono font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {wins.toLocaleString()} W
            </span>
            <span className="text-slate-500 text-[11px] font-normal">
              {totalGames.toLocaleString()} partidas
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {losses.toLocaleString()} L
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Pro Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/[0.07]">
        <div className="bg-[#090c12]/60 hover:bg-[#0e131d] rounded-xl p-3 border border-white/[0.05] hover:border-amber-500/25 transition text-center group">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono font-bold tracking-wider block mb-1">
            KDA Promedio
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-slate-100 group-hover:text-amber-300 transition-colors">
            {avgKills} / {avgDeaths} / {avgAssists}
          </span>
        </div>

        <div className="bg-[#090c12]/60 hover:bg-[#0e131d] rounded-xl p-3 border border-white/[0.05] hover:border-amber-500/25 transition text-center group">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono font-bold tracking-wider block mb-1">
            GPM Oro/min
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-amber-400">
            {avgGpm}
          </span>
        </div>

        <div className="bg-[#090c12]/60 hover:bg-[#0e131d] rounded-xl p-3 border border-white/[0.05] hover:border-amber-500/25 transition text-center group">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono font-bold tracking-wider block mb-1">
            XPM XP/min
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-cyan-400">
            {avgXpm}
          </span>
        </div>

        <div className="bg-[#090c12]/60 hover:bg-[#0e131d] rounded-xl p-3 border border-white/[0.05] hover:border-amber-500/25 transition text-center group">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono font-bold tracking-wider block mb-1">
            Last Hits
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
            {avgLastHits}
          </span>
        </div>

        <div className="bg-[#090c12]/60 hover:bg-[#0e131d] rounded-xl p-3 border border-white/[0.05] hover:border-amber-500/25 transition text-center group">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono font-bold tracking-wider block mb-1">
            Ratio KDA
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-purple-300">
            {kdaRatio}
          </span>
        </div>

        <div className="bg-[#090c12]/60 hover:bg-[#0e131d] rounded-xl p-3 border border-white/[0.05] hover:border-amber-500/25 transition text-center group">
          <span className="text-[10.5px] text-slate-400 uppercase font-mono font-bold tracking-wider block mb-1">
            Historial Dota
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-slate-300">
            {totalGames > 0 ? totalGames.toLocaleString() : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OverviewCard;
