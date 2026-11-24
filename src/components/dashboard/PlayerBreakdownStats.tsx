import React, { useState, useEffect, useCallback } from 'react';
import {
  Gamepad2,
  Globe,
  Swords,
  Shield,
  Layers,
  Award,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from 'lucide-react';
import type { PlayerCount } from '../../api/types';
import { getCounts } from '../../api/opendota';
import { GAME_MODES, LOBBY_TYPES, LANE_ROLES, DOTA_REGIONS } from '../../utils/constants';

// ─── Filter definitions (time-based only) ────────────────────────────────────

interface FilterOption {
  key: string;
  label: string;
  shortLabel: string;
  days: number | null; // null = all-time
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Historial completo', shortLabel: 'Todo',  days: null },
  { key: 'd7',  label: 'Última semana',       shortLabel: '7 días', days: 7 },
  { key: 'd14', label: 'Últimas 2 semanas',   shortLabel: '14 días', days: 14 },
  { key: 'd30', label: 'Último mes',          shortLabel: '1 mes',  days: 30 },
  { key: 'd90', label: 'Últimos 3 meses',     shortLabel: '3 meses', days: 90 },
  { key: 'd180',label: 'Últimos 6 meses',     shortLabel: '6 meses', days: 180 },
];

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = 'game_mode' | 'lane_role' | 'region' | 'team' | 'lobby_type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const factionMap: Record<string, string> = { '0': 'Dire', '1': 'Radiant' };

function getSortedCategory(
  data: Record<string, { games: number; win: number }> | undefined,
  nameMap: Record<number | string, string>
) {
  if (!data) return [];
  return Object.entries(data)
    .map(([key, val]) => {
      const id = Number(key);
      const name = nameMap[id] ?? nameMap[key] ?? `ID ${key}`;
      const wr = val.games > 0 ? (val.win / val.games) * 100 : 0;
      return {
        id: key,
        name,
        games: val.games,
        win: val.win,
        losses: val.games - val.win,
        winrate: parseFloat(wr.toFixed(1)),
      };
    })
    .filter((i) => i.games > 0)
    .sort((a, b) => b.games - a.games);
}

function getTotalWR(list: ReturnType<typeof getSortedCategory>) {
  const totalGames = list.reduce((s, i) => s + i.games, 0);
  const totalWins  = list.reduce((s, i) => s + i.win, 0);
  return totalGames > 0 ? (totalWins / totalGames) * 100 : null;
}

// ─── Trend Badge ──────────────────────────────────────────────────────────────

function TrendBadge({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const abs = Math.abs(delta).toFixed(1);

  if (Math.abs(delta) < 0.5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/40">
        <Minus className="w-3 h-3" /> Sin cambios
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <TrendingUp className="w-3 h-3" /> +{abs}% Mejorando
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
      <TrendingDown className="w-3 h-3" /> -{abs}% Bajando
    </span>
  );
}

// ─── Component Props ──────────────────────────────────────────────────────────

interface PlayerBreakdownStatsProps {
  counts: PlayerCount | null;   // all-time counts (already loaded)
  loading?: boolean;
  accountId: number | null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const PlayerBreakdownStats: React.FC<PlayerBreakdownStatsProps> = ({
  counts: allTimeCounts,
  loading: initialLoading = false,
  accountId,
}) => {
  const [activeTab, setActiveTab]           = useState<TabKey>('game_mode');
  const [activeFilterKey, setActiveFilterKey] = useState<string>('all');
  const [periodCounts, setPeriodCounts]     = useState<PlayerCount | null>(null);
  const [filterLoading, setFilterLoading]   = useState(false);
  const [filterError, setFilterError]       = useState<string | null>(null);

  // Which counts to show in the grid
  const displayCounts = activeFilterKey === 'all' ? allTimeCounts : (periodCounts ?? allTimeCounts);
  const isFiltered    = activeFilterKey !== 'all' && periodCounts !== null;

  // ─── Fetch period counts ────────────────────────────────────────────────────
  const applyFilter = useCallback(
    async (key: string) => {
      setActiveFilterKey(key);
      setFilterError(null);

      if (key === 'all') {
        setPeriodCounts(null);
        return;
      }

      const opt = FILTER_OPTIONS.find((o) => o.key === key);
      if (!opt || opt.days === null || !accountId) return;

      setFilterLoading(true);
      try {
        const result = await getCounts(accountId, { date: opt.days });
        setPeriodCounts(result);
      } catch {
        setFilterError('No se pudieron cargar los datos del período. Inténtalo de nuevo.');
        setPeriodCounts(null);
      } finally {
        setFilterLoading(false);
      }
    },
    [accountId]
  );

  // Reset when player changes
  useEffect(() => {
    setActiveFilterKey('all');
    setPeriodCounts(null);
    setFilterError(null);
  }, [accountId]);

  // ─── Loading Skeleton ───────────────────────────────────────────────────────
  if (initialLoading && !allTimeCounts) {
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

  if (!allTimeCounts) return null;

  // ─── Derived Data ───────────────────────────────────────────────────────────
  const nameMapByTab: Record<TabKey, Record<number | string, string>> = {
    game_mode:  GAME_MODES,
    lane_role:  LANE_ROLES,
    region:     DOTA_REGIONS,
    team:       factionMap,
    lobby_type: LOBBY_TYPES,
  };
  const countFieldByTab: Record<TabKey, keyof PlayerCount> = {
    game_mode:  'game_mode',
    lane_role:  'lane_role',
    region:     'region',
    team:       'is_radiant',
    lobby_type: 'lobby_type',
  };

  const getList = (source: PlayerCount | null, tab: TabKey) =>
    getSortedCategory(source?.[countFieldByTab[tab]] as Record<string, {games:number;win:number}> | undefined, nameMapByTab[tab]);

  const allTimeList = getList(allTimeCounts, activeTab);
  const periodList  = isFiltered ? getList(periodCounts, activeTab) : allTimeList;

  const allTimeWR = getTotalWR(allTimeList);
  const periodWR  = getTotalWR(periodList);
  const trendDelta = isFiltered && allTimeWR !== null && periodWR !== null
    ? parseFloat((periodWR - allTimeWR).toFixed(1))
    : null;

  const totalGames = periodList.reduce((s, i) => s + i.games, 0);

  const tabs = [
    { key: 'game_mode'  as TabKey, label: 'Modos de Juego',        icon: Gamepad2 },
    { key: 'lane_role'  as TabKey, label: 'Líneas & Roles',         icon: Swords   },
    { key: 'region'     as TabKey, label: 'Regiones / Servidores',  icon: Globe    },
    { key: 'team'       as TabKey, label: 'Bando (Radiant / Dire)', icon: Shield   },
    { key: 'lobby_type' as TabKey, label: 'Lobbies',                icon: Layers   },
  ];

  const activeFilterOption = FILTER_OPTIONS.find((o) => o.key === activeFilterKey)!;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gradient-to-b from-[#111520]/90 to-[#0c0f16]/95 border border-white/[0.08] hover:border-amber-500/25 rounded-2xl p-6 shadow-xl transition-all duration-300">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 mb-5">

        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Desglose Táctico
              </h2>
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {activeFilterOption.label}
                {filterLoading && (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-1" />
                )}
              </span>
            </div>
          </div>

          {/* ── Period Filter Pills ── */}
          <div className="flex items-center gap-1 bg-[#090b10] p-1 rounded-xl border border-white/[0.08] overflow-x-auto max-w-full">
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

        {/* ── Trend Summary Banner (only when a period is selected) ── */}
        {isFiltered && !filterLoading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#090b10] border border-white/[0.08]">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-400 font-medium">
                WR en {activeFilterOption.label}
              </span>
              <span className="text-2xl font-black text-white tracking-tight">
                {periodWR !== null ? `${periodWR.toFixed(1)}%` : '—'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[11px] text-slate-500">vs historial global</span>
                <span className="text-sm font-bold text-slate-300">
                  {allTimeWR !== null ? `${allTimeWR.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <TrendBadge delta={trendDelta} />
            </div>
          </div>
        )}

        {/* ── Category Tab Switchers ── */}
        <div className="flex items-center gap-1.5 bg-[#090b10] p-1.5 rounded-xl border border-white/[0.08] overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = getList(displayCounts, tab.key).length;
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
                <span className={`text-[10px] px-1.5 rounded-full font-mono ${isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-white/10 text-slate-400'}`}>
                  {count}
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

      {/* ── Loading State ── */}
      {filterLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-sm text-slate-400 font-medium">
              Cargando datos para "{activeFilterOption.label}"…
            </span>
          </div>
        </div>
      ) : periodList.length === 0 ? (
        <div className="text-center py-10 text-slate-500 font-medium">
          No hay partidas registradas en este período para esta categoría.
        </div>
      ) : (
        <>
          {/* Total count */}
          <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <strong className="text-amber-400">{totalGames.toLocaleString()}</strong>
            &nbsp;partidas en este período
            {isFiltered && allTimeList.length > 0 && (
              <span className="text-slate-600">
                &nbsp;· {allTimeList.reduce((s, i) => s + i.games, 0).toLocaleString()} en total
              </span>
            )}
          </div>

          {/* ── Stat Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {periodList.map((item) => {
              const sharePct = totalGames > 0
                ? ((item.games / totalGames) * 100).toFixed(1)
                : '0.0';
              const isHigh = item.winrate >= 55;
              const isLow  = item.winrate < 48;

              // Compare vs all-time WR for this same category entry
              const allTimeItem = allTimeList.find((a) => a.id === item.id);
              const rowDelta = isFiltered && allTimeItem
                ? parseFloat((item.winrate - allTimeItem.winrate).toFixed(1))
                : null;

              return (
                <div
                  key={item.id}
                  className="bg-[#090b10]/80 hover:bg-[#121624] border border-white/[0.06] hover:border-amber-500/40 rounded-xl p-4 transition group shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Name + WR badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                        {item.name}
                      </span>
                      <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${
                        isHigh
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isLow
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-white/[0.06] text-slate-200 border border-white/10'
                      }`}>
                        {item.winrate}%
                      </span>
                    </div>

                    {/* Games + V/D */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-1.5">
                      <span>
                        <strong className="text-white">{item.games}</strong> ({sharePct}%)
                      </span>
                      <span className="text-[11px]">
                        <span className="text-emerald-400 font-semibold">{item.win}V</span>
                        {' '}-{' '}
                        <span className="text-rose-400 font-semibold">{item.losses}D</span>
                      </span>
                    </div>

                    {/* Per-row trend delta vs all-time */}
                    {rowDelta !== null && (
                      <div className="mt-1.5">
                        {Math.abs(rowDelta) < 0.5 ? (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                            <Minus className="w-2.5 h-2.5" /> igual al historial
                          </span>
                        ) : rowDelta > 0 ? (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> +{rowDelta}% vs historial
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-mono flex items-center gap-0.5">
                            <TrendingDown className="w-2.5 h-2.5" /> {rowDelta}% vs historial
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Win-Rate Progress Bar */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : isLow
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
