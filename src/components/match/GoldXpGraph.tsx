import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { MatchDetail } from '../../api/types';

interface GoldXpGraphProps {
  match: MatchDetail;
}

export const GoldXpGraph: React.FC<GoldXpGraphProps> = ({ match }) => {
  const [metric, setMetric] = useState<'gold' | 'xp'>('gold');

  const goldAdv = match.radiant_gold_adv || [];
  const xpAdv = match.radiant_xp_adv || [];

  if (goldAdv.length === 0 && xpAdv.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-gray-500 text-sm">
        Esta partida aún no ha sido parseada o no contiene datos de telemetría minuto a minuto.
      </div>
    );
  }

  // Format data for Recharts
  const maxMinutes = Math.max(goldAdv.length, xpAdv.length);
  const chartData = [];

  for (let min = 0; min < maxMinutes; min++) {
    const goldDiff = goldAdv[min] ?? 0;
    const xpDiff = xpAdv[min] ?? 0;
    chartData.push({
      minute: `${min}m`,
      minNum: min,
      gold: goldDiff,
      xp: xpDiff,
      goldRadiant: goldDiff >= 0 ? goldDiff : 0,
      goldDire: goldDiff < 0 ? Math.abs(goldDiff) : 0,
    });
  }

  const currentAdv = metric === 'gold' ? goldAdv[goldAdv.length - 1] ?? 0 : xpAdv[xpAdv.length - 1] ?? 0;
  const advLeader = currentAdv >= 0 ? 'Radiant' : 'Dire';

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Ventaja de {metric === 'gold' ? 'Oro (Gold Advantage)' : 'Experiencia (XP Advantage)'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Ventaja final:{' '}
            <span
              className={`font-mono font-bold ${
                advLeader === 'Radiant' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {advLeader} +{Math.abs(currentAdv).toLocaleString()}
            </span>
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMetric('gold')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              metric === 'gold'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Oro (Gold)
          </button>
          <button
            onClick={() => setMetric('xp')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              metric === 'xp'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Experiencia (XP)
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="radiantGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="direGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
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
                if (active && payload && payload.length) {
                  const val = payload[0].value as number;
                  const min = payload[0].payload.minute;
                  const isRadiantLeading = val >= 0;
                  return (
                    <div className="bg-slate-950 border border-slate-700/80 p-2.5 rounded-xl shadow-xl text-xs font-mono">
                      <div className="text-gray-400 mb-1">Minuto {min}</div>
                      <div
                        className={`font-bold ${
                          isRadiantLeading ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isRadiantLeading ? 'Radiant' : 'Dire'} +{Math.abs(val).toLocaleString()}{' '}
                        {metric === 'gold' ? 'Oro' : 'XP'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />

            <Area
              type="monotone"
              dataKey={metric}
              stroke={metric === 'gold' ? '#f59e0b' : '#38bdf8'}
              strokeWidth={2}
              fill="url(#radiantGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-3 text-[11px] text-gray-500 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Radiant ventaja (+)
        </span>
        <span className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Dire ventaja (-)
        </span>
      </div>
    </div>
  );
};

export default GoldXpGraph;
