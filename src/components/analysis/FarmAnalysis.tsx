import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Coins, Zap, Crosshair } from 'lucide-react';
import type { RecentMatch } from '../../api/types';
import { useConstants } from '../../hooks/useConstants';

interface FarmAnalysisProps {
  matches: RecentMatch[];
}

export const FarmAnalysis: React.FC<FarmAnalysisProps> = ({ matches }) => {
  const { getHeroName } = useConstants();

  // Reverse matches so they read chronologically left-to-right
  const chronological = [...matches].reverse();

  const chartData = chronological.map((m, idx) => ({
    matchIndex: `#${idx + 1}`,
    hero: getHeroName(m.hero_id),
    gpm: m.gold_per_min || 0,
    xpm: m.xp_per_min || 0,
    lastHits: m.last_hits || 0,
    durationMins: Math.round((m.duration || 0) / 60),
    lhPerMin: m.duration > 0 ? Number(((m.last_hits * 60) / m.duration).toFixed(1)) : 0,
  }));

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

  return (
    <div className="space-y-6">
      {/* Metrics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">GPM Promedio</span>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">{avgGpm}</div>
          <p className="text-xs text-gray-400 mt-1">Oro por minuto en tus últimas partidas</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-sky-400 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">XPM Promedio</span>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">{avgXpm}</div>
          <p className="text-xs text-gray-400 mt-1">Experiencia acumulada por minuto</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Crosshair className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">CS / Minuto</span>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">{avgLhPerMin}</div>
          <p className="text-xs text-gray-400 mt-1">Promedio de Last Hits por minuto de juego</p>
        </div>
      </div>

      {/* GPM / XPM Progression Chart */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight mb-6">
          Evolución de GPM y XPM por Partida
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
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
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FarmAnalysis;
