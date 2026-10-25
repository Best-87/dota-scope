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
import { Shield, Target, Award, Compass } from 'lucide-react';
import type { RecentMatch } from '../../api/types';
import { didWin, calculateKDA } from '../../utils/formatting';

interface RoleAnalysisProps {
  matches: RecentMatch[];
}

export const RoleAnalysis: React.FC<RoleAnalysisProps> = ({ matches }) => {
  // Group matches by lane_role (1: Safe, 2: Mid, 3: Off, 4: Jungle/Roam)
  const roleStats = React.useMemo(() => {
    const roles: Record<number, { name: string; games: number; wins: number; kills: number; deaths: number; assists: number; gpm: number; xpm: number }> = {
      1: { name: 'Safe Lane (Pos 1/5)', games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0 },
      2: { name: 'Mid Lane (Pos 2)', games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0 },
      3: { name: 'Off Lane (Pos 3/4)', games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0 },
      4: { name: 'Jungle / Roamer', games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0 },
    };

    for (const m of matches) {
      const roleId = m.lane_role && roles[m.lane_role] ? m.lane_role : (m.lane ? m.lane : 1);
      const target = roles[roleId] || roles[1];
      target.games += 1;
      if (didWin(m.player_slot, m.radiant_win)) {
        target.wins += 1;
      }
      target.kills += m.kills || 0;
      target.deaths += m.deaths || 0;
      target.assists += m.assists || 0;
      target.gpm += m.gold_per_min || 0;
      target.xpm += m.xp_per_min || 0;
    }

    return Object.entries(roles).map(([id, data]) => {
      const winrate = data.games > 0 ? Number(((data.wins / data.games) * 100).toFixed(1)) : 0;
      const kda = calculateKDA(data.kills, data.deaths, data.assists);
      const avgGpm = data.games > 0 ? Math.round(data.gpm / data.games) : 0;
      const avgXpm = data.games > 0 ? Math.round(data.xpm / data.games) : 0;
      return {
        id: Number(id),
        name: data.name,
        games: data.games,
        wins: data.wins,
        winrate,
        kda,
        avgGpm,
        avgXpm,
      };
    });
  }, [matches]);

  const chartData = roleStats.map((r) => ({
    name: r.name.split(' (')[0],
    winrate: r.winrate,
    games: r.games,
    kda: r.kda,
  }));

  return (
    <div className="space-y-6">
      {/* Cards per role */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleStats.map((r) => {
          const isHigh = r.winrate >= 50;

          return (
            <div
              key={r.id}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {r.name}
                </span>
                <span className="text-xs font-mono text-gray-500">{r.games} partidas</span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className={`text-2xl font-black font-mono ${
                    isHigh ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {r.winrate}%
                </span>
                <span className="text-xs text-gray-400">Winrate</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full ${isHigh ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${r.winrate}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800">
                <div>
                  <span className="text-gray-500 block text-[10px]">KDA</span>
                  <span className="text-gray-200 font-semibold">{r.kda}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">GPM</span>
                  <span className="text-amber-400 font-semibold">{r.avgGpm}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart comparison */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight mb-6">
          Comparativa de Winrate % por Línea / Rol
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
    </div>
  );
};

export default RoleAnalysis;
