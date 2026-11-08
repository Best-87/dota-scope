import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Coins, Zap, Crosshair, TrendingUp, Award, Layers } from 'lucide-react';
import type { RecentMatch } from '../../api/types';
import { useConstants } from '../../hooks/useConstants';

interface FarmAnalysisProps {
  matches: RecentMatch[];
}

export const FarmAnalysis: React.FC<FarmAnalysisProps> = ({ matches }) => {
  const { getHeroName } = useConstants();
  const [chartMode, setChartMode] = useState<'gpm_xpm' | 'net_worth'>('net_worth');

  // Reverse matches so they read chronologically left-to-right
  const chronological = [...matches].reverse();

  const chartData = chronological.map((m, idx) => {
    const durMins = Math.round((m.duration || 0) / 60);
    const estimatedNetWorth = Math.round(((m.gold_per_min || 0) * (m.duration || 0)) / 60);
    const won = (m.player_slot < 128) === Boolean(m.radiant_win);
    return {
      matchIndex: `#${idx + 1}`,
      matchId: m.match_id,
      hero: getHeroName(m.hero_id),
      gpm: m.gold_per_min || 0,
      xpm: m.xp_per_min || 0,
      lastHits: m.last_hits || 0,
      durationMins: durMins,
      lhPerMin: m.duration > 0 ? Number(((m.last_hits * 60) / m.duration).toFixed(1)) : 0,
      netWorth: estimatedNetWorth,
      won,
    };
  });

  const avgGpm =
    chartData.length > 0
      ? Math.round(chartData.reduce((acc, c) => acc + c.gpm, 0) / chartData.length)
      : 0;
  const avgXpm =
    chartData.length > 0
      ? Math.round(chartData.reduce((acc, c) => acc + c.xpm, 0) / chartData.length)
      : 0;
  const avgLhPerMin =
    chartData.length > 0
      ? (chartData.reduce((acc, c) => acc + c.lhPerMin, 0) / chartData.length).toFixed(1)
      : '0.0';
  const avgNetWorth =
    chartData.length > 0
      ? Math.round(chartData.reduce((acc, c) => acc + c.netWorth, 0) / chartData.length)
      : 0;

  const peakNetWorthMatch = [...chartData].sort((a, b) => b.netWorth - a.netWorth)[0];

  return (
    <div className="space-y-6">
      {/* Metrics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patrimonio Promedio */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Patrimonio Promedio</span>
          </div>
          <div className="text-3xl font-black font-mono text-amber-300 mt-1">
            {avgNetWorth.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-1">Valor neto final promedio por partida</p>
        </div>

        {/* GPM Promedio */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">GPM Promedio</span>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">{avgGpm}</div>
          <p className="text-xs text-gray-400 mt-1">Oro por minuto en tus últimas partidas</p>
        </div>

        {/* XPM Promedio */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-sky-400 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">XPM Promedio</span>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">{avgXpm}</div>
          <p className="text-xs text-gray-400 mt-1">Experiencia acumulada por minuto</p>
        </div>

        {/* CS / Minuto */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Crosshair className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">CS / Minuto</span>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">{avgLhPerMin}</div>
          <p className="text-xs text-gray-400 mt-1">Last Hits por minuto de juego</p>
        </div>
      </div>

      {/* Main Progression Chart Card */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                {chartMode === 'net_worth'
                  ? 'Evolución del Patrimonio Neto por Partida (Net Worth)'
                  : 'Evolución de GPM y XPM por Partida'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {chartMode === 'net_worth'
                ? `Pico histórico de patrimonio: ${peakNetWorthMatch?.netWorth.toLocaleString()} oro con ${peakNetWorthMatch?.hero}`
                : 'Métricas de ritmo económico y aceleración de nivel'}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setChartMode('net_worth')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                chartMode === 'net_worth'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Gráfico de Patrimonio</span>
            </button>

            <button
              onClick={() => setChartMode('gpm_xpm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                chartMode === 'gpm_xpm'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>GPM & XPM</span>
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'net_worth' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="farmNetWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="matchIndex" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs font-mono">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="font-bold text-white">
                              {data.matchIndex} — {data.hero}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                data.won
                                  ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950/70 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {data.won ? 'Victoria' : 'Derrota'}
                            </span>
                          </div>
                          <div className="text-amber-400 font-bold text-sm">
                            Patrimonio: {data.netWorth.toLocaleString()} oro
                          </div>
                          <div className="text-gray-400 mt-1">
                            GPM: <span className="text-white">{data.gpm}</span> · Duración:{' '}
                            <span className="text-white">{data.durationMins}m</span>
                          </div>
                          <div className="text-emerald-400">
                            Last Hits: {data.lastHits} ({data.lhPerMin} / min)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={avgNetWorth}
                  stroke="#fbbf24"
                  strokeDasharray="3 3"
                  label={{
                    value: `Promedio: ${(avgNetWorth / 1000).toFixed(1)}k`,
                    fill: '#fbbf24',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  name="Patrimonio Neto"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#farmNetWorthGrad)"
                  dot={{ r: 3, fill: '#f59e0b' }}
                  activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="matchIndex" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs font-mono">
                          <div className="font-bold text-white mb-1">
                            Partida {data.matchIndex} — {data.hero}
                          </div>
                          <div className="text-amber-400">GPM: {data.gpm}</div>
                          <div className="text-sky-400">XPM: {data.xpm}</div>
                          <div className="text-emerald-400">
                            Last Hits: {data.lastHits} ({data.lhPerMin} / min)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="gpm"
                  name="Oro / Min (GPM)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="xpm"
                  name="Experiencia / Min (XPM)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FarmAnalysis;
