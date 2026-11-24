import React, { useState, useEffect, useCallback } from 'react';
import {
  Gamepad2,
  Globe,
  Swords,
  Shield,
  Layers,
  Award,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { PlayerCount } from '../../api/types';
import { getCounts } from '../../api/opendota';
import { GAME_MODES, LOBBY_TYPES, LANE_ROLES, DOTA_REGIONS } from '../../utils/constants';

// ─── Filter Definitions ───────────────────────────────────────────────────────

export type BreakdownFilter =
  | { type: 'all' }
  | { type: 'limit'; value: number }
  | { type: 'date'; value: number };

interface FilterOption {
  key: string;
  label: string;
  shortLabel: string;
  filter: BreakdownFilter;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all',    label: 'Todas las partidas',  shortLabel: 'Todas',      filter: { type: 'all' } },
  { key: 'l20',    label: 'Últimas 20 partidas',  shortLabel: 'Últ. 20',   filter: { type: 'limit', value: 20 } },
  { key: 'l50',    label: 'Últimas 50 partidas',  shortLabel: 'Últ. 50',   filter: { type: 'limit', value: 50 } },
  { key: 'l100',   label: 'Últimas 100 partidas', shortLabel: 'Últ. 100',  filter: { type: 'limit', value: 100 } },
  { key: 'd30',    label: 'Último mes (30 días)', shortLabel: 'Últ. mes',   filter: { type: 'date', value: 30 } },
  { key: 'd90',    label: 'Últimos 3 meses',      shortLabel: 'Últ. 3m',   filter: { type: 'date', value: 90 } },
];

// ─── Component Props ──────────────────────────────────────────────────────────

interface PlayerBreakdownStatsProps {
  counts: PlayerCount | null;
  loading?: boolean;
  accountId: number | null;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const factionMap: Record<string, string> = {
  '0': 'Dire',
  '1': 'Radiant',
};

function getSortedCategory(
  data: Record<string, { games: number; win: number }> | undefined,
  nameMap: Record<number | string, string>
) {
  if (!data) return [];
  return Object.entries(data)
    .map(([key, val]) => {
      const id = Number(key);
      const name = nameMap[id] || nameMap[key] || `ID ${key}`;
      const winrate = val.games > 0 ? ((val.win / val.games) * 100) : 0;
      return {
        id: key,
        name,
        games: val.games,
        win: val.win,
        losses: val.games - val.win,
        winrate: parseFloat(winrate.toFixed(1)),
      };
    })
    .filter((item) => item.games > 0)
    .sort((a, b) => b.games - a.games);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const PlayerBreakdownStats: React.FC<PlayerBreakdownStatsProps> = ({
  counts: initialCounts,
  loading: initialLoading = false,
  accountId,
}) => {
  const [activeTab, setActiveTab] = useState<
    'game_mode' | 'lane_role' | 'region' | 'team' | 'lobby_type'
  >('game_mode');

  const [activeFilterKey, setActiveFilterKey] = useState<string>('all');
  const [filteredCounts, setFilteredCounts] = useState<PlayerCount | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Use filtered data if available, otherwise fall back to the initial (all-time) data
  const displayCounts = filteredCounts ?? initialCounts;
  const isLoading = initialLoading || filterLoading;

  const applyFilter = useCallback(
    async (filterKey: string) => {
      if (!accountId || accountId <= 0) return;

      const option = FILTER_OPTIONS.find((o) => o.key === filterKey);
      if (!option) return;

      setActiveFilterKey(filterKey);

      // "all" => just use the already-loaded initial counts
      if (option.filter.type === 'all') {
        setFilteredCounts(null);
        setFilterError(null);
        return;
      }

      setFilterLoading(true);
      setFilterError(null);

      try {
        const params =
          option.filter.type === 'limit'
            ? { limit: option.filter.value }
            : { date: option.filter.value };

        const result = await getCounts(accountId, params);
        setFilteredCounts(result);
      } catch {
        setFilterError('No se pudo cargar el filtro. Inténtalo de nuevo.');
        setFilteredCounts(null);
      } finally {
        setFilterLoading(false);
      }
    },
    [accountId]
  );

  // Reset filter when accountId changes
  useEffect(() => {
    setActiveFilterKey('all');
    setFilteredCounts(null);
    setFilterError(null);
  }, [accountId]);

  // ─── Loading Skeleton ───────────────────────────────────────────────────────

  if (initialLoading && !initialCounts) {
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

  if (!initialCounts) return null;

  // ─── Derived Data ───────────────────────────────────────────────────────────

  const gameModes = getSortedCategory(displayCounts?.game_mode, GAME_MODES);
  const laneRoles = getSortedCategory(displayCounts?.lane_role, LANE_ROLES);
  const regions   = getSortedCategory(displayCounts?.region, DOTA_REGIONS);
  const teams     = getSortedCategory(displayCounts?.is_radiant, factionMap);
  const lobbies   = getSortedCategory(displayCounts?.lobby_type, LOBBY_TYPES);

  const tabs = [
    { key: 'game_mode',  label: 'Modos de Juego',       icon: Gamepad2, count: gameModes.length },
    { key: 'lane_role',  label: 'Líneas & Roles',        icon: Swords,   count: laneRoles.length },
    { key: 'region',     label: 'Regiones / Servidores', icon: Globe,    count: regions.length },
    { key: 'team',       label: 'Bando (Radiant / Dire)',icon: Shield,   count: teams.length },
    { key: 'lobby_type', label: 'Lobbies',               icon: Layers,   count: lobbies.length },
  ] as const;

  const currentList =
    activeTab === 'game_mode' ? gameModes
    : activeTab === 'lane_role' ? laneRoles
    : activeTab === 'region'   ? regions
    : activeTab === 'team'     ? teams
    : lobbies;

  const totalCategoryGames = currentList.reduce((acc, curr) => acc + curr.games, 0);

  const activeFilterOption = FILTER_OPTIONS.find((o) => o.key === activeFilterKey);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-b from-[#111520]/90 to-[#0c0f16]/95 border border-white/[0.08] hover:border-amber-500/25 rounded-2xl p-6 shadow-xl transition-all duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Desglose Táctico — Estilo OpenDota
              </h2>
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {activeFilterOption
                  ? activeFilterOption.label
                  : 'Todas las partidas'}
                {filterLoading && (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-1" />
                )}
              </span>
            </div>
          </div>

          {/* Filter Pill Selector */}
          <div className="flex items-center gap-1 bg-[#090b10] p-1 rounded-xl border border-white/[0.08] overflow-x-auto max-w-full flex-wrap">
            {FILTER_OPTIONS.map((opt) => {
              const isActive = activeFilterKey === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => applyFilter(opt.key)}
                  disabled={filterLoading}
                  title={opt.label}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap disabled:opacity-50 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {opt.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Category Tab Switchers ── */}
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
                <span
                  className={`text-[10px] px-1.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 font-black'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter Error ── */}
      {filterError && (
        <div className="mb-4 flex items-center gap-2 text-rose-300 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          <span>{filterError}</span>
          <button
            onClick={() => applyFilter(activeFilterKey)}
            className="ml-auto flex items-center gap-1 text-rose-300 hover:text-rose-100 font-semibold"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}

      {/* ── Filter Loading Overlay ── */}
      {filterLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-sm text-slate-400 font-medium">
              Cargando datos para "{activeFilterOption?.label}"…
            </span>
          </div>
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-medium">
          No hay datos registrados en esta categoría para el filtro seleccionado.
        </div>
      ) : (
        <>
          {/* Total summary badge */}
          <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>
              <strong className="text-amber-400">{totalCategoryGames.toLocaleString()}</strong> partidas analizadas en esta vista
            </span>
          </div>

          {/* ── Stat Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {currentList.map((item) => {
              const sharePct =
                totalCategoryGames > 0
                  ? ((item.games / totalCategoryGames) * 100).toFixed(1)
                  : '0.0';
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
                        <span className="text-emerald-400 font-semibold">{item.win}V</span>
                        {' '}-{' '}
                        <span className="text-rose-400 font-semibold">{item.losses}D</span>
                      </span>
                    </div>
                  </div>

                  {/* Win-Rate Progress Bar */}
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
        </>
      )}
    </div>
  );
};

export default PlayerBreakdownStats;
