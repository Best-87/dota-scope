import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Shield, Target, Award, Compass, Star } from 'lucide-react';
import type { RecentMatch } from '../../api/types';
import { didWin, calculateKDA, isRadiant } from '../../utils/formatting';
import { HERO_PRIMARY_ROLE } from '../../utils/matchAutopsy';

interface RoleAnalysisProps {
  matches: RecentMatch[];
}

/**
 * Intelligent and accurate position inference for a match player (Pos 1 to 5).
 * Uses competitive Dota 2 criteria:
 * 1. Base archetype (HERO_PRIMARY_ROLE for all 127 heroes)
 * 2. Team side (Radiant vs Dire):
 *    - Radiant: Safe = Lane 1, Off = Lane 3
 *    - Dire: Safe = Lane 3, Off = Lane 1
 *    - Mid = Lane 2
 * 3. CS/min and GPM thresholds to disambiguate Core (Pos 1/2/3) vs Support (Pos 4/5)
 * 4. Roaming telemetry (is_roaming) -> Soft Support (Pos 4)
 * 5. Safe vs Offlane support positioning:
 *    - Support in safe lane with core -> Pos 5 (Hard Support)
 *    - Support roaming or in offlane -> Pos 4 (Soft Support)
 */
function inferPosition(match: RecentMatch): 1 | 2 | 3 | 4 | 5 {
  const heroId = match.hero_id;
  const primaryPos = HERO_PRIMARY_ROLE[heroId] || 4;
  const lane = match.lane; // 1=Bot, 2=Mid, 3=Top
  const laneRole = match.lane_role; // 1=Safe core, 2=Mid core, 3=Off core, 4=Jungle/Roam
  const isRoaming = Boolean(match.is_roaming);
  const lh = match.last_hits || 0;
  const gpm = match.gold_per_min || 0;
  const duration = match.duration || 1800;
  const csPerMin = duration > 0 ? (lh * 60) / duration : 0;
  const radiant = isRadiant(match.player_slot);

  const safeLaneNum = radiant ? 1 : 3;
  const offLaneNum = radiant ? 3 : 1;

  const isHighFarm = csPerMin >= 4.0 || gpm >= 420;
  const isLowFarm = csPerMin < 2.8 && gpm < 380;

  // ── 1. Telemetría de Líneas Directa (Prioridad Absoluta) ────────────────────
  // Safe lane (Línea Segura: Lane 1 en Radiant, Lane 3 en Dire)
  if (lane === safeLaneNum || laneRole === 1) {
    if (isLowFarm && (primaryPos === 5 || primaryPos === 4)) {
      return 5;
    }
    // Si farmea como core en safe lane, es Pos 1 (Carry) aunque el héroe sea DK, Lina, etc.
    return 1;
  }

  // Offlane (Línea Difícil: Lane 3 en Radiant, Lane 1 en Dire)
  if (lane === offLaneNum || laneRole === 3) {
    if (isLowFarm && (primaryPos === 4 || primaryPos === 5 || isRoaming)) {
      return 4;
    }
    // Si farmea como core en offlane, es Pos 3 (Offlaner)
    return 3;
  }

  // Midlane (Lane 2 o lane_role 2)
  if (lane === 2 || laneRole === 2) {
    if ((primaryPos === 4 || primaryPos === 5) && csPerMin < 2.5 && isRoaming) {
      return 4;
    }
    return 2;
  }

  // ── 2. Roaming / Soft Support ──────────────────────────────────────────────
  if (isRoaming || laneRole === 4) {
    return 4;
  }

  // ── 3. Partidas sin telemetría de carril (lane es null/undefined) ───────────
  // Si el farm es muy alto de carry (top CS y GPM alto), catalogar como Carry
  if (csPerMin >= 6.5 || (gpm >= 560 && csPerMin >= 4.5)) {
    return 1;
  }

  // Si tiene arquetipo Mid pero con farm bajo, no es mid
  if (primaryPos === 2) {
    if (isLowFarm) return 4;
    return 2;
  }

  if (primaryPos === 1) {
    return 1;
  }

  if (primaryPos === 3) {
    return 3;
  }

  if (primaryPos === 4 || primaryPos === 5) {
    if (isHighFarm && csPerMin >= 5.0) return 1;
    return primaryPos;
  }

  // Criterios generales por métricas
  if (csPerMin >= 4.2 || gpm >= 440) return 3;
  if (csPerMin < 2.0 && gpm < 320) return 5;

  return primaryPos;
}

type PositionKey = 1 | 2 | 3 | 4 | 5;

interface PositionData {
  name: string;
  shortName: string;
  color: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  lh: number;
}

const POSITION_META: Record<PositionKey, { name: string; shortName: string; color: string }> = {
  1: { name: 'Carry (Pos 1)', shortName: 'Carry', color: '#f59e0b' },
  2: { name: 'Mid (Pos 2)', shortName: 'Mid', color: '#3b82f6' },
  3: { name: 'Offlaner (Pos 3)', shortName: 'Offlane', color: '#ef4444' },
  4: { name: 'Ap. Fuerte (Pos 4)', shortName: 'Pos 4', color: '#8b5cf6' },
  5: { name: 'Apoyo (Pos 5)', shortName: 'Pos 5', color: '#22c55e' },
};

export const RoleAnalysis: React.FC<RoleAnalysisProps> = ({ matches }) => {
  // ── Use improved position inference on each match ─────────────────────────
  const roleStats = React.useMemo(() => {
    const roles: Record<PositionKey, PositionData> = {
      1: { ...POSITION_META[1], games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0, lh: 0 },
      2: { ...POSITION_META[2], games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0, lh: 0 },
      3: { ...POSITION_META[3], games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0, lh: 0 },
      4: { ...POSITION_META[4], games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0, lh: 0 },
      5: { ...POSITION_META[5], games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0, lh: 0 },
    };

    for (const m of matches) {
      const pos = inferPosition(m);
      const target = roles[pos];
      target.games += 1;
      if (didWin(m.player_slot, m.radiant_win)) {
        target.wins += 1;
      }
      target.kills += m.kills || 0;
      target.deaths += m.deaths || 0;
      target.assists += m.assists || 0;
      target.gpm += m.gold_per_min || 0;
      target.xpm += m.xp_per_min || 0;
      target.lh += m.last_hits || 0;
    }

    return (Object.keys(roles) as unknown as PositionKey[]).map((id) => {
      const data = roles[id as PositionKey];
      const winrate = data.games > 0 ? Number(((data.wins / data.games) * 100).toFixed(1)) : 0;
      const kda = calculateKDA(data.kills, data.deaths, data.assists);
      const avgGpm = data.games > 0 ? Math.round(data.gpm / data.games) : 0;
      const avgXpm = data.games > 0 ? Math.round(data.xpm / data.games) : 0;
      const avgLh = data.games > 0 ? Math.round(data.lh / data.games) : 0;
      return {
        id: Number(id) as PositionKey,
        name: data.name,
        shortName: data.shortName,
        color: data.color,
        games: data.games,
        wins: data.wins,
        winrate,
        kda,
        avgGpm,
        avgXpm,
        avgLh,
      };
    });
  }, [matches]);

  // Only show positions with at least 1 game (filter empty ones in chart)
  const activeRoles = roleStats.filter((r) => r.games > 0);
  const chartData = activeRoles.map((r) => ({
    name: r.shortName,
    winrate: r.winrate,
    games: r.games,
    kda: r.kda,
    color: r.color,
  }));

  // Most played position
  const mainRole = activeRoles.length > 0
    ? activeRoles.reduce((a, b) => (b.games > a.games ? b : a))
    : null;

  return (
    <div className="space-y-6">
      {/* Main role badge */}
      {mainRole && mainRole.games > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{
            background: `${mainRole.color}12`,
            borderColor: `${mainRole.color}30`,
          }}
        >
          <Star className="w-5 h-5" style={{ color: mainRole.color }} />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Rol Principal
            </div>
            <div className="font-bold text-white">
              {mainRole.name}{' '}
              <span className="text-sm font-normal text-gray-400">
                — {mainRole.games} partidas · {mainRole.winrate}% WR
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cards per position */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {roleStats.map((r) => {
          const isHigh = r.winrate >= 50;
          const isEmpty = r.games === 0;

          return (
            <div
              key={r.id}
              className={`bg-slate-900/80 border rounded-2xl p-4 shadow-xl relative overflow-hidden transition ${
                isEmpty ? 'opacity-40' : ''
              }`}
              style={{ borderColor: isEmpty ? '#1e293b' : `${r.color}30` }}
            >
              {/* Position number badge */}
              <div
                className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                style={{
                  background: `${r.color}20`,
                  color: r.color,
                  border: `1px solid ${r.color}50`,
                }}
              >
                {r.id}
              </div>

              <div className="mb-2 pr-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block leading-tight">
                  {r.shortName}
                </span>
                <span className="text-[10px] text-gray-600 font-mono">{r.games} partidas</span>
              </div>

              <div className="flex items-baseline gap-1.5 mb-2">
                <span
                  className={`text-2xl font-black font-mono ${
                    isEmpty ? 'text-gray-600' : isHigh ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isEmpty ? '—' : `${r.winrate}%`}
                </span>
                {!isEmpty && <span className="text-[10px] text-gray-500">WR</span>}
              </div>

              {/* Progress bar */}
              {!isEmpty && (
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${r.winrate}%` }}
                  />
                </div>
              )}

              {!isEmpty && (
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-gray-500 block text-[10px]">KDA</span>
                    <span className="text-gray-200 font-semibold">{r.kda}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">GPM</span>
                    <span className="font-semibold" style={{ color: r.color }}>{r.avgGpm}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bar chart comparison */}
      {chartData.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white tracking-tight mb-6">
            Comparativa de Winrate % por Posición
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs font-mono">
                          <div className="font-bold text-white mb-1">{data.name}</div>
                          <div className="text-emerald-400">Winrate: {data.winrate}%</div>
                          <div className="text-gray-400">Partidas: {data.games}</div>
                          <div className="text-sky-400">KDA: {data.kda}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="winrate" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.winrate >= 50 ? '#22c55e' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-position detail table */}
      {activeRoles.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
            Estadísticas Detalladas por Posición
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
                  <th className="text-left pb-2 pr-3">Posición</th>
                  <th className="text-right pb-2 px-2">Partidas</th>
                  <th className="text-right pb-2 px-2">WR %</th>
                  <th className="text-right pb-2 px-2">KDA</th>
                  <th className="text-right pb-2 px-2">GPM</th>
                  <th className="text-right pb-2 px-2">XPM</th>
                  <th className="text-right pb-2 pl-2">LH Prom</th>
                </tr>
              </thead>
              <tbody>
                {activeRoles
                  .sort((a, b) => b.games - a.games)
                  .map((r) => (
                    <tr key={r.id} className="border-t border-slate-800/60">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                            style={{
                              background: `${r.color}20`,
                              color: r.color,
                              border: `1px solid ${r.color}50`,
                            }}
                          >
                            {r.id}
                          </span>
                          <span className="text-gray-300 font-semibold">{r.shortName}</span>
                        </div>
                      </td>
                      <td className="text-right px-2 text-gray-400">{r.games}</td>
                      <td className={`text-right px-2 font-bold ${r.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.winrate}%
                      </td>
                      <td className="text-right px-2 text-sky-400">{r.kda}</td>
                      <td className="text-right px-2 text-amber-400">{r.avgGpm}</td>
                      <td className="text-right px-2 text-violet-400">{r.avgXpm}</td>
                      <td className="text-right pl-2 text-gray-400">{r.avgLh}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAnalysis;
