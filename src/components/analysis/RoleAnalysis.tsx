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
import { didWin, calculateKDA } from '../../utils/formatting';

interface RoleAnalysisProps {
  matches: RecentMatch[];
}

// ─── Hero archetypes for position inference ────────────────────────────────────
// Pos 1 heroes that are HARD CARRIES: typically safe lane, high CS
const CARRY_HEROES = new Set([
  1,   // Anti-Mage
  6,   // Drow Ranger
  8,   // Juggernaut
  10,  // Morphling
  12,  // Phantom Lancer
  18,  // Sven
  32,  // Riki
  35,  // Sniper
  41,  // Faceless Void
  42,  // Wraith King
  44,  // Phantom Assassin
  48,  // Luna
  54,  // Lifestealer
  56,  // Clinkz
  63,  // Weaver
  67,  // Spectre
  70,  // Ursa
  72,  // Gyrocopter
  81,  // Chaos Knight
  93,  // Slark
  94,  // Medusa
  95,  // Troll Warlord
  109, // Terrorblade
  114, // Monkey King
  138, // Muerta
  145, // Kez
]);

// Pos 2 heroes: almost exclusively mid lane
const MID_HEROES = new Set([
  11,  // Shadow Fiend
  13,  // Puck
  15,  // Razor
  17,  // Storm Spirit
  22,  // Zeus
  25,  // Lina
  34,  // Tinker
  36,  // Necrophos
  39,  // Queen of Pain
  43,  // Death Prophet
  46,  // Templar Assassin
  47,  // Viper
  49,  // Dragon Knight
  52,  // Leshrac
  59,  // Huskar
  65,  // Batrider
  74,  // Invoker
  76,  // Outworld Destroyer
  82,  // Meepo
  92,  // Arc Warden
  106, // Ember Spirit
  120, // Pangolier
  126, // Void Spirit
]);

// Pos 3 heroes: typically off lane
const OFFLANE_HEROES = new Set([
  2,   // Axe
  16,  // Sand King
  28,  // Slardar
  29,  // Tidehunter
  33,  // Enigma
  38,  // Beastmaster
  55,  // Dark Seer
  60,  // Night Stalker
  69,  // Doom
  71,  // Spirit Breaker
  78,  // Brewmaster
  96,  // Centaur Warrunner
  97,  // Magnus
  98,  // Timbersaw
  99,  // Bristleback
  104, // Legion Commander
  108, // Underlord
  129, // Mars
  135, // Dawnbreaker
  137, // Primal Beast
]);

// Pos 4/5 heroes: supports
const SUPPORT_HEROES = new Set([
  3,   // Bane
  5,   // Crystal Maiden
  7,   // Earthshaker
  14,  // Pudge
  19,  // Tiny
  21,  // Windranger
  26,  // Lion
  27,  // Shadow Shaman
  30,  // Witch Doctor
  31,  // Lich
  37,  // Warlock
  50,  // Dazzle
  51,  // Clockwerk
  57,  // Omniknight
  58,  // Enchantress
  62,  // Bounty Hunter
  64,  // Jakiro
  66,  // Chen
  68,  // Ancient Apparition
  75,  // Silencer
  79,  // Shadow Demon
  83,  // Treant Protector
  84,  // Ogre Magi
  85,  // Undying
  86,  // Rubick
  87,  // Disruptor
  88,  // Nyx Assassin
  90,  // Keeper of the Light
  91,  // Io
  100, // Tusk
  101, // Skywrath Mage
  102, // Abaddon
  105, // Techies
  107, // Earth Spirit
  111, // Oracle
  121, // Grimstroke
  123, // Hoodwink
  128, // Snapfire
  136, // Marci
  139, // Ringmaster
]);

// Radiant lane number for each position
// Radiant: safe = lane 1, mid = lane 2, off = lane 3
// Dire: safe = lane 3, mid = lane 2, off = lane 1

/**
 * Improved position inference for a single recent match.
 * Uses: hero archetype → lane field → lane_role → is_roaming → last_hits/gpm as tiebreaker.
 *
 * Returns 1-5 (Dota position).
 */
function inferPosition(match: RecentMatch): 1 | 2 | 3 | 4 | 5 {
  const heroId = match.hero_id;
  const lane = match.lane;           // 1=Safe(Radiant)/Off(Dire), 2=Mid, 3=Off(Radiant)/Safe(Dire)
  const laneRole = match.lane_role;  // 1=Safe, 2=Mid, 3=Off, 4=Jungle
  const isRoaming = match.is_roaming;
  const lh = match.last_hits || 0;
  const gpm = match.gold_per_min || 0;

  // ── Step 1: Hard-coded hero archetypes (most reliable) ─────────────────────
  if (MID_HEROES.has(heroId) && (lane === 2 || laneRole === 2)) {
    return 2;
  }
  if (CARRY_HEROES.has(heroId) && !isRoaming) {
    // If the carry is in mid lane, treat as pos 2 flex pick
    if (lane === 2 || laneRole === 2) return 2;
    return 1;
  }
  if (MID_HEROES.has(heroId)) {
    return 2;
  }

  // ── Step 2: Use lane field (most direct indicator) ──────────────────────────
  if (lane === 2 || laneRole === 2) {
    return 2;
  }

  // ── Step 3: Roaming detection → Pos 4 ──────────────────────────────────────
  if (isRoaming) {
    return 4;
  }

  // ── Step 4: Support hero disambiguation ─────────────────────────────────────
  if (SUPPORT_HEROES.has(heroId)) {
    // If support is in safe lane (lane 1 for radiant, 3 for dire) with low farm → pos 5
    // If support is roaming/off → pos 4
    if (laneRole === 4) return 4; // jungle/roam
    // Low farm support = pos 5
    if (lh < 40 && gpm < 250) return 5;
    return 4;
  }

  // ── Step 5: Lane role directly ─────────────────────────────────────────────
  if (laneRole === 1) {
    // Safe lane core: check if it's a carry hero or offlaner flexed to safe
    if (OFFLANE_HEROES.has(heroId)) return 3;
    // High farm = pos 1, lower farm = pos 3 or flex
    return lh > 80 ? 1 : 3;
  }
  if (laneRole === 3) {
    // Off lane
    if (CARRY_HEROES.has(heroId)) return 1; // unusual but possible
    return 3;
  }
  if (laneRole === 4) return 4; // Jungle / roaming

  // ── Step 6: Fallback based on farm indicators ───────────────────────────────
  if (OFFLANE_HEROES.has(heroId)) return 3;
  if (gpm > 500 || lh > 150) return 1; // very high farm = carry
  if (gpm > 380 || lh > 80) return 3;  // decent farm = offlaner
  if (lh < 30 && gpm < 280) return 5;  // very low farm = hard support

  return 4; // Default: roaming support
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
