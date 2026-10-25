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
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Flame } from 'lucide-react';
import type { RecentMatch } from '../../api/types';
import { didWin, calculateKDA } from '../../utils/formatting';
import { useConstants } from '../../hooks/useConstants';

interface TrendsChartProps {
  matches: RecentMatch[];
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ matches }) => {
  const { getHeroName } = useConstants();

  // Reverse matches so they read chronologically
  const chronological = [...matches].reverse();

  // Calculate rolling winrate & cumulative stats
  let cumulativeWins = 0;
  const chartData = chronological.map((m, idx) => {
    const won = didWin(m.player_slot, m.radiant_win);
    if (won) cumulativeWins += 1;
    const gameNum = idx + 1;
    const rollingWinrate = Number(((cumulativeWins / gameNum) * 100).toFixed(1));
    const kda = calculateKDA(m.kills, m.deaths, m.assists);

    return {
      game: `#${gameNum}`,
      hero: getHeroName(m.hero_id),
      won,
      kda,
      rollingWinrate,
      kills: m.kills,
      deaths: m.deaths,
      assists: m.assists,
    };
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Tendencia de Winrate y Rendimiento KDA
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Evolución acumulativa a lo largo de las últimas {matches.length} partidas jugadas
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="game" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis
              yAxisId="winrate"
              stroke="#22c55e"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="kda"
              orientation="right"
              stroke="#a855f7"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs font-mono">
                      <div className="font-bold text-white mb-1">
                        Partida {data.game} — {data.hero} ({data.won ? 'Victoria' : 'Derrota'})
                      </div>
                      <div className="text-emerald-400">
                        Winrate Acumulado: {data.rollingWinrate}%
                      </div>
                      <div className="text-purple-400">
                        KDA de la partida: {data.kda} ({data.kills}/{data.deaths}/{data.assists})
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <ReferenceLine yAxisId="winrate" y={50} stroke="#475569" strokeDasharray="3 3" />
            <Line
              yAxisId="winrate"
              type="monotone"
              dataKey="rollingWinrate"
              name="Winrate % Acumulado"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 3, fill: '#22c55e' }}
            />
            <Line
              yAxisId="kda"
              type="monotone"
              dataKey="kda"
              name="Ratio KDA Partida"
              stroke="#a855f7"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2, fill: '#a855f7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendsChart;
