import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Coins,
  TrendingUp,
  BarChart3,
  Scale,
  Award,
  Users,
  Star,
  Check,
  Shield,
  Swords,
} from 'lucide-react';
import type { MatchDetail, MatchPlayer } from '../../api/types';
import { useConstants } from '../../hooks/useConstants';
import HeroIcon from '../common/HeroIcon';

// ─── Player Slot Colors (Authentic Dota 2 palette) ───────────────────────────

const RADIANT_COLORS = [
  '#3b82f6', // Azul (Slot 0)
  '#10b981', // Verde esmeralda (Slot 1)
  '#a855f7', // Púrpura (Slot 2)
  '#eab308', // Amarillo oro (Slot 3)
  '#f97316', // Naranja brillante (Slot 4)
];

const DIRE_COLORS = [
  '#f43f5e', // Rosa fuerte / Rojo (Slot 128)
  '#94a3b8', // Gris oliva (Slot 129)
  '#06b6d4', // Celeste frío (Slot 130)
  '#84cc16', // Verde lima (Slot 131)
  '#b45309', // Ámbar oscuro / Marrón (Slot 132)
];

function getPlayerColor(isRadiant: boolean, indexInTeam: number): string {
  if (isRadiant) {
    return RADIANT_COLORS[indexInTeam % RADIANT_COLORS.length];
  }
  return DIRE_COLORS[indexInTeam % DIRE_COLORS.length];
}

function formatGold(val: number): string {
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)}k`;
  }
  return val.toLocaleString();
}

interface GoldXpGraphProps {
  match: MatchDetail;
  focusAccountId?: number | null;
}

export const GoldXpGraph: React.FC<GoldXpGraphProps> = ({ match, focusAccountId }) => {
  const { getHeroName } = useConstants();

  // Mode: 'networth_lines' (Curva de Patrimonio) | 'ranking_bars' (Ranking Final) | 'advantage_area' (Ventaja de Equipos)
  const [viewMode, setViewMode] = useState<'networth_lines' | 'ranking_bars' | 'advantage_area'>(
    'networth_lines'
  );

  // Advantage metric: 'gold' | 'xp'
  const [advMetric, setAdvMetric] = useState<'gold' | 'xp'>('gold');

  // Filter for Net Worth lines
  const [teamFilter, setTeamFilter] = useState<'all' | 'radiant' | 'dire' | 'cores'>('all');

  // Active / toggled heroes
  const [selectedHeroIds, setSelectedHeroIds] = useState<number[] | null>(null);

  const players = useMemo(() => match.players || [], [match.players]);
  const radiantGoldAdv = useMemo(() => match.radiant_gold_adv || [], [match.radiant_gold_adv]);
  const radiantXpAdv = useMemo(() => match.radiant_xp_adv || [], [match.radiant_xp_adv]);

  // Separate teams and assign stable colors
  const decoratedPlayers = useMemo(() => {
    let rIdx = 0;
    let dIdx = 0;
    return players.map((p) => {
      const isRadiant = p.player_slot < 128;
      const color = isRadiant ? getPlayerColor(true, rIdx++) : getPlayerColor(false, dIdx++);
      const name = p.personaname || p.name || `Héroe #${p.hero_id}`;
      const heroTitle = getHeroName(p.hero_id);
      const isFocus = Boolean(
        focusAccountId &&
          (p.account_id === focusAccountId || Number(p.account_id) === Number(focusAccountId))
      );
      return {
        ...p,
        isRadiant,
        color,
        displayName: name,
        heroTitle,
        isFocus,
      };
    });
  }, [players, getHeroName, focusAccountId]);

  // Rank players by final Net Worth
  const rankedPlayers = useMemo(() => {
    return [...decoratedPlayers].sort((a, b) => (b.net_worth || 0) - (a.net_worth || 0));
  }, [decoratedPlayers]);

  // Identify core players (top 3 net worth of each team)
  const corePlayerHeroIds = useMemo(() => {
    const radiantCores = decoratedPlayers
      .filter((p) => p.isRadiant)
      .sort((a, b) => (b.net_worth || 0) - (a.net_worth || 0))
      .slice(0, 3)
      .map((p) => p.hero_id);
    const direCores = decoratedPlayers
      .filter((p) => !p.isRadiant)
      .sort((a, b) => (b.net_worth || 0) - (a.net_worth || 0))
      .slice(0, 3)
      .map((p) => p.hero_id);
    return new Set([...radiantCores, ...direCores]);
  }, [decoratedPlayers]);

  // Focus player object (if user's account matches)
  const focusPlayer = useMemo(() => {
    return decoratedPlayers.find((p) => p.isFocus);
  }, [decoratedPlayers]);

  // Summary statistics
  const highestNwPlayer = rankedPlayers[0];
  const radiantTotalNw = decoratedPlayers
    .filter((p) => p.isRadiant)
    .reduce((acc, p) => acc + (p.net_worth || 0), 0);
  const direTotalNw = decoratedPlayers
    .filter((p) => !p.isRadiant)
    .reduce((acc, p) => acc + (p.net_worth || 0), 0);
  const totalNwDiff = radiantTotalNw - direTotalNw;

  // Has minute-by-minute time series (gold_t)?
  const hasTimeSeries = useMemo(() => {
    return players.some((p) => Array.isArray(p.gold_t) && p.gold_t.length > 0);
  }, [players]);

  // Prepare minute-by-minute Net Worth progression dataset for Recharts
  const timeSeriesData = useMemo(() => {
    if (!hasTimeSeries) return [];

    // Find max minutes recorded in any player's gold_t
    const maxMinutes = Math.max(
      ...players.map((p) => (Array.isArray(p.gold_t) ? p.gold_t.length : 0))
    );

    const data = [];
    for (let min = 0; min < maxMinutes; min++) {
      const entry: Record<string, any> = {
        minute: `${min}m`,
        minNum: min,
      };

      decoratedPlayers.forEach((p) => {
        const val = Array.isArray(p.gold_t) ? p.gold_t[min] ?? null : null;
        entry[`hero_${p.hero_id}`] = val;
      });

      data.push(entry);
    }
    return data;
  }, [hasTimeSeries, players, decoratedPlayers]);

  // Advantage Area Chart Data (Radiant vs Dire lead)
  const advantageData = useMemo(() => {
    const maxLen = Math.max(radiantGoldAdv.length, radiantXpAdv.length);
    const data = [];
    for (let min = 0; min < maxLen; min++) {
      const g = radiantGoldAdv[min] ?? 0;
      const x = radiantXpAdv[min] ?? 0;
      data.push({
        minute: `${min}m`,
        minNum: min,
        gold: g,
        xp: x,
      });
    }
    return data;
  }, [radiantGoldAdv, radiantXpAdv]);

  // Filter which hero lines to display on the Net Worth chart
  const activeHeroes = useMemo(() => {
    return decoratedPlayers.filter((p) => {
      // If user toggled specific hero selection manually
      if (selectedHeroIds !== null) {
        return selectedHeroIds.includes(p.hero_id);
      }
      // Preset team filters
      if (teamFilter === 'radiant') return p.isRadiant;
      if (teamFilter === 'dire') return !p.isRadiant;
      if (teamFilter === 'cores') return corePlayerHeroIds.has(p.hero_id);
      return true; // 'all'
    });
  }, [decoratedPlayers, selectedHeroIds, teamFilter, corePlayerHeroIds]);

  // Toggle individual hero visibility
  const toggleHero = (heroId: number) => {
    setSelectedHeroIds((prev) => {
      const current = prev !== null ? prev : activeHeroes.map((h) => h.hero_id);
      if (current.includes(heroId)) {
        if (current.length === 1) return current; // Keep at least one
        return current.filter((id) => id !== heroId);
      }
      return [...current, heroId];
    });
  };

  const resetHeroFilters = (preset: 'all' | 'radiant' | 'dire' | 'cores') => {
    setTeamFilter(preset);
    setSelectedHeroIds(null);
  };

  const effectiveViewMode = (!hasTimeSeries && viewMode === 'networth_lines') ? 'ranking_bars' : viewMode;

  return (
    <div className="space-y-6">
      {/* ── Metric Highlights Top Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Highest Net Worth */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          {highestNwPlayer && (
            <HeroIcon heroId={highestNwPlayer.hero_id} size="md" className="shrink-0" />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Mayor Patrimonio</span>
            </div>
            <div className="text-xl font-black font-mono text-white mt-0.5 truncate">
              {highestNwPlayer ? formatGold(highestNwPlayer.net_worth) : '0'}
            </div>
            <p className="text-[11px] text-gray-400 truncate">
              {highestNwPlayer?.heroTitle} ({highestNwPlayer?.displayName})
            </p>
          </div>
        </div>

        {/* Radiant Total Net Worth */}
        <div className="bg-slate-900/80 border border-emerald-950/60 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Patrimonio Radiant</span>
          </div>
          <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
            {formatGold(radiantTotalNw)}
          </div>
          <p className="text-[11px] text-gray-400">
            Promedio: {formatGold(Math.round(radiantTotalNw / 5))} / héroe
          </p>
        </div>

        {/* Dire Total Net Worth */}
        <div className="bg-slate-900/80 border border-rose-950/60 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5" />
            <span>Patrimonio Dire</span>
          </div>
          <div className="text-xl font-black font-mono text-rose-300 mt-0.5">
            {formatGold(direTotalNw)}
          </div>
          <p className="text-[11px] text-gray-400">
            Promedio: {formatGold(Math.round(direTotalNw / 5))} / héroe
          </p>
        </div>

        {/* Focus Player Standing */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Tu Desempeño</span>
          </div>
          {focusPlayer ? (
            <div>
              <div className="text-xl font-black font-mono text-white mt-0.5 flex items-center gap-2">
                <span>{formatGold(focusPlayer.net_worth)}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                  #{rankedPlayers.findIndex((p) => p.hero_id === focusPlayer.hero_id) + 1} de 10
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {focusPlayer.heroTitle} · GPM: {focusPlayer.gold_per_min}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-xl font-black font-mono text-white mt-0.5">
                {totalNwDiff >= 0 ? `+${formatGold(totalNwDiff)}` : `-${formatGold(Math.abs(totalNwDiff))}`}
              </div>
              <p className="text-[11px] text-gray-400">
                Ventaja final para {totalNwDiff >= 0 ? 'Radiant' : 'Dire'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Chart Card ── */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {effectiveViewMode === 'networth_lines'
                  ? 'Gráfico de Patrimonio Minuto a Minuto (Net Worth)'
                  : effectiveViewMode === 'ranking_bars'
                  ? 'Ranking Comparativo de Patrimonio'
                  : 'Diferencia Acumulada de Equipos'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {effectiveViewMode === 'networth_lines'
                ? 'Evolución del valor neto de cada héroe a lo largo de la partida'
                : effectiveViewMode === 'ranking_bars'
                ? 'Distribución y aporte económico de los 10 jugadores al cierre'
                : 'Margen de ventaja neta entre Radiant y Dire a través del tiempo'}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setViewMode('networth_lines')}
              disabled={!hasTimeSeries}
              title={!hasTimeSeries ? 'Requiere parsear la repetición' : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                effectiveViewMode === 'networth_lines'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : !hasTimeSeries
                  ? 'text-gray-600 cursor-not-allowed opacity-50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Curva de Patrimonio {!hasTimeSeries && '(Parsear)'}</span>
            </button>

            <button
              onClick={() => setViewMode('ranking_bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                effectiveViewMode === 'ranking_bars'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Ranking Final</span>
            </button>

            <button
              onClick={() => setViewMode('advantage_area')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
                effectiveViewMode === 'advantage_area'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Ventaja de Equipo</span>
            </button>
          </div>
        </div>

        {/* ── Sub-Controls for Curva de Patrimonio ── */}
        {effectiveViewMode === 'networth_lines' && hasTimeSeries && (
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400 font-semibold mr-1">Mostrar:</span>
                <button
                  onClick={() => resetHeroFilters('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    teamFilter === 'all' && selectedHeroIds === null
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Todos (10)
                </button>
                <button
                  onClick={() => resetHeroFilters('radiant')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    teamFilter === 'radiant' && selectedHeroIds === null
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Radiant
                </button>
                <button
                  onClick={() => resetHeroFilters('dire')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    teamFilter === 'dire' && selectedHeroIds === null
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Swords className="w-3 h-3 text-rose-400" />
                  Dire
                </button>
                <button
                  onClick={() => resetHeroFilters('cores')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    teamFilter === 'cores' && selectedHeroIds === null
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Solo Núcleos (Cores)
                </button>
              </div>

              <div className="text-[11px] text-gray-500 font-mono">
                Toca cualquier héroe abajo para aislar su curva
              </div>
            </div>

            {/* Individual Hero Selector Badges */}
            <div className="flex items-center gap-1.5 flex-wrap p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {decoratedPlayers.map((p) => {
                const isSelected = activeHeroes.some((h) => h.hero_id === p.hero_id);
                return (
                  <button
                    key={p.hero_id}
                    onClick={() => toggleHero(p.hero_id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-slate-800/90 border-slate-600 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/40 text-gray-500 opacity-40 hover:opacity-80'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <HeroIcon heroId={p.hero_id} size="sm" className="!w-5 !h-5" />
                    <span className="truncate max-w-[80px] sm:max-w-[100px]">
                      {p.heroTitle}
                    </span>
                    {p.isFocus && <Star className="w-3 h-3 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── View 1: Net Worth Line Chart (Minute-by-minute) ── */}
        {effectiveViewMode === 'networth_lines' && hasTimeSeries && (
          <div className="h-80 sm:h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="minute"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatGold(val)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;

                    // Sort heroes by gold value at this exact minute descending
                    const minuteEntries = payload
                      .map((p) => {
                        const heroId = Number(String(p.dataKey).replace('hero_', ''));
                        const playerInfo = decoratedPlayers.find((h) => h.hero_id === heroId);
                        return {
                          heroId,
                          name: playerInfo?.heroTitle || `Héroe #${heroId}`,
                          color: p.color || playerInfo?.color || '#94a3b8',
                          isRadiant: playerInfo?.isRadiant ?? true,
                          isFocus: playerInfo?.isFocus ?? false,
                          gold: Number(p.value) || 0,
                        };
                      })
                      .filter((e) => e.gold > 0)
                      .sort((a, b) => b.gold - a.gold);

                    return (
                      <div className="bg-slate-950/95 border border-slate-700/90 p-3.5 rounded-2xl shadow-2xl text-xs font-mono min-w-[220px] max-w-[280px] backdrop-blur-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            Minuto {label}
                          </span>
                          <span className="text-[10px] text-gray-400">Patrimonio</span>
                        </div>

                        <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin">
                          {minuteEntries.map((e, idx) => (
                            <div
                              key={e.heroId}
                              className={`flex items-center justify-between gap-2 px-2 py-0.5 rounded ${
                                e.isFocus
                                  ? 'bg-amber-500/20 border border-amber-500/30'
                                  : 'hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-[10px] font-bold text-gray-500 w-3.5 text-right">
                                  #{idx + 1}
                                </span>
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: e.color }}
                                />
                                <span
                                  className={`truncate ${
                                    e.isFocus ? 'text-amber-300 font-bold' : 'text-gray-200'
                                  }`}
                                >
                                  {e.name}
                                </span>
                              </div>
                              <span className="font-bold font-mono text-white shrink-0">
                                {formatGold(e.gold)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />

                {/* Draw a line for each active hero */}
                {activeHeroes.map((p) => {
                  const strokeWidth = p.isFocus ? 3.5 : 2;
                  return (
                    <Line
                      key={p.hero_id}
                      type="monotone"
                      dataKey={`hero_${p.hero_id}`}
                      name={p.heroTitle}
                      stroke={p.color}
                      strokeWidth={strokeWidth}
                      strokeOpacity={p.isFocus ? 1.0 : 0.85}
                      dot={false}
                      activeDot={{ r: p.isFocus ? 7 : 5, strokeWidth: 1.5, stroke: '#ffffff' }}
                      connectNulls
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── View 2: Ranking Horizontal Bar Chart (Final Net Worth) ── */}
        {effectiveViewMode === 'ranking_bars' && (
          <div className="space-y-4 pt-2">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankedPlayers}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => formatGold(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="heroTitle"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      const teamShare = d.isRadiant
                        ? ((d.net_worth / radiantTotalNw) * 100).toFixed(1)
                        : ((d.net_worth / direTotalNw) * 100).toFixed(1);
                      return (
                        <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs font-mono">
                          <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                d.isRadiant
                                  ? 'bg-emerald-900/50 text-emerald-300'
                                  : 'bg-rose-900/50 text-rose-300'
                              }`}
                            >
                              {d.isRadiant ? 'Radiant' : 'Dire'}
                            </span>
                            <span>{d.heroTitle}</span>
                          </div>
                          <div className="text-gray-300">{d.displayName}</div>
                          <div className="text-amber-400 font-bold text-sm mt-1">
                            Patrimonio: {d.net_worth.toLocaleString()} ({formatGold(d.net_worth)})
                          </div>
                          <div className="text-gray-400 mt-0.5">
                            GPM: <span className="text-white">{d.gold_per_min}</span> · Aporte al equipo:{' '}
                            <span className="text-white">{teamShare}%</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="net_worth" radius={[0, 6, 6, 0]}>
                    {rankedPlayers.map((entry) => (
                      <Cell
                        key={entry.hero_id}
                        fill={entry.color}
                        stroke={entry.isFocus ? '#facc15' : 'transparent'}
                        strokeWidth={entry.isFocus ? 2 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown with Hero Icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
              {rankedPlayers.map((p, idx) => {
                const teamShare = p.isRadiant
                  ? ((p.net_worth / radiantTotalNw) * 100).toFixed(0)
                  : ((p.net_worth / direTotalNw) * 100).toFixed(0);
                return (
                  <div
                    key={p.hero_id}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border ${
                      p.isFocus
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-gray-500 w-4">
                        #{idx + 1}
                      </span>
                      <HeroIcon heroId={p.hero_id} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                          <span>{p.heroTitle}</span>
                          {p.isFocus && <Star className="w-3 h-3 text-amber-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {p.displayName} · GPM {p.gold_per_min}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-amber-300">
                        {p.net_worth.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500">{teamShare}% del equipo</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── View 3: Team Net Advantage (Radiant vs Dire Lead) ── */}
        {effectiveViewMode === 'advantage_area' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                Línea por encima de 0 = ventaja Radiant (verde). Línea por debajo de 0 = ventaja
                Dire (rojo).
              </span>

              {/* Gold vs XP toggle */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setAdvMetric('gold')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    advMetric === 'gold'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Oro
                </button>
                <button
                  onClick={() => setAdvMetric('xp')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    advMetric === 'xp'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Experiencia (XP)
                </button>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={advantageData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="radiantAdvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="minute"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (val === 0) return '0';
                      return `${val > 0 ? '+' : ''}${Math.round(val / 1000)}k`;
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const val = payload[0].value as number;
                      const min = payload[0].payload.minute;
                      const isRad = val >= 0;
                      return (
                        <div className="bg-slate-950 border border-slate-700/80 p-2.5 rounded-xl shadow-xl text-xs font-mono">
                          <div className="text-gray-400 mb-1">Minuto {min}</div>
                          <div className={`font-bold ${isRad ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isRad ? 'Radiant' : 'Dire'} +{Math.abs(val).toLocaleString()}{' '}
                            {advMetric === 'gold' ? 'Oro' : 'XP'}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                  <Area
                    type="monotone"
                    dataKey={advMetric}
                    stroke={advMetric === 'gold' ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={2}
                    fill="url(#radiantAdvGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoldXpGraph;
