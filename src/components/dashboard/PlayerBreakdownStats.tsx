import React, { useState } from 'react';
import {
  Gamepad2,
  Globe,
  Swords,
  Shield,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { PlayerCount } from '../../api/types';
import { GAME_MODES, LOBBY_TYPES, LANE_ROLES, DOTA_REGIONS } from '../../utils/constants';

interface PlayerBreakdownStatsProps {
  counts: PlayerCount | null;
  loading?: boolean;
}

export const PlayerBreakdownStats: React.FC<PlayerBreakdownStatsProps> = ({
  counts,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'game_mode' | 'lane_role' | 'region' | 'team' | 'lobby_type'>('game_mode');

  if (loading) {
    return (
      <div className="bg-[#0e121a]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-6 w-56 bg-slate-800/60 rounded mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#141924]/60 rounded-xl border border-white/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  if (!counts) {
    return null;
  }

  // Helper to extract and sort stats for a given category
  const getSortedCategory = (
    data: Record<string, { games: number; win: number }> | undefined,
    nameMap: Record<number | string, string>
  ) => {
    if (!data) return [];
    return Object.entries(data)
      .map(([key, val]) => {
        const id = Number(key);
        const name = nameMap[id] || nameMap[key] || `ID ${key}`;
        const winrate = val.games > 0 ? ((val.win / val.games) * 100).toFixed(1) : '0.0';
        return {
          id: key,
          name,
          games: val.games,
          win: val.win,
          losses: val.games - val.win,
          winrate: Number(winrate),
        };
      })
      .filter((item) => item.games > 0)
      .sort((a, b) => b.games - a.games);
  };

  // Team (Faction) Radiant vs Dire mapping
  const factionMap: Record<string, string> = {
    '0': 'Dire',
    '1': 'Radiant',
  };

  const gameModes = getSortedCategory(counts.game_mode, GAME_MODES);
  const laneRoles = getSortedCategory(counts.lane_role, LANE_ROLES);
  const regions = getSortedCategory(counts.region, DOTA_REGIONS);
  const teams = getSortedCategory(counts.is_radiant, factionMap);
  const lobbies = getSortedCategory(counts.lobby_type, LOBBY_TYPES);

  const tabs = [
    { key: 'game_mode', label: 'Modos de Juego', icon: Gamepad2, count: gameModes.length },
    { key: 'lane_role', label: 'Líneas & Roles', icon: Swords, count: laneRoles.length },
    { key: 'region', label: 'Regiones / Servidores', icon: Globe, count: regions.length },
    { key: 'team', label: 'Bando (Radiant / Dire)', icon: Shield, count: teams.length },
    { key: 'lobby_type', label: 'Lobbies', icon: Layers, count: lobbies.length },
  ] as const;

  const currentList =
    activeTab === 'game_mode'
      ? gameModes
      : activeTab === 'lane_role'
      ? laneRoles
      : activeTab === 'region'
      ? regions
      : activeTab === 'team'
      ? teams
      : lobbies;

  // Calculate totals for active category
  const totalCategoryGames = currentList.reduce((acc, curr) => acc + curr.games, 0);

  return (
    <div className="bg-gradient-to-b from-[#111520]/90 to-[#0c0f16]/95 border border-white/[0.08] hover:border-amber-500/25 rounded-2xl p-6 shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              Desglose Táctico Estilo OpenDota
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Distribución histórica por Modo, Bando, Región y Línea
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-[#090b10] p-1.5 rounded-xl border border-white/[0.08] overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-white/10 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Stats Cards */}
      {currentList.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-medium">
          No hay datos registrados en esta categoría para este jugador.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {currentList.map((item) => {
            const sharePct = totalCategoryGames > 0 ? ((item.games / totalCategoryGames) * 100).toFixed(1) : '0.0';
            const isHighWinrate = item.winrate >= 55;
            const isLowWinrate = item.winrate < 48;

            return (
              <div
                key={item.id}
                className="bg-[#090b10]/80 hover:bg-[#121624] border border-white/[0.06] hover:border-amber-500/40 rounded-xl p-4 transition group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                      {item.name}
                    </span>
                    <span
                      className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                        isHighWinrate
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isLowWinrate
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-white/[0.06] text-slate-200 border border-white/10'
                      }`}
                    >
                      {item.winrate}% WR
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-2">
                    <span>
                      <strong className="text-white">{item.games}</strong> partidas ({sharePct}%)
                    </span>
                    <span className="text-[11px]">
                      <span className="text-emerald-400 font-semibold">{item.win}V</span> - <span className="text-rose-400 font-semibold">{item.losses}D</span>
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighWinrate
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : isLowWinrate
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                        : 'bg-gradient-to-r from-amber-500 to-amber-300'
                    }`}
                    style={{ width: `${item.winrate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerBreakdownStats;
