import React, { useState, useMemo } from 'react';
import { Eye, Shield, Filter, Clock } from 'lucide-react';
import type { MatchDetail, MatchPlayer, WardEvent } from '../../api/types';
import { formatDuration, isRadiant } from '../../utils/formatting';
import { useConstants } from '../../hooks/useConstants';

interface WardMapProps {
  match: MatchDetail;
}

interface PlacedWard {
  type: 'observer' | 'sentry';
  time: number;
  x: number;
  y: number;
  heroId: number;
  playerSlot: number;
  isRadiantTeam: boolean;
}

export const WardMap: React.FC<WardMapProps> = ({ match }) => {
  const { getHeroName } = useConstants();
  const [filterType, setFilterType] = useState<'all' | 'obs' | 'sen'>('all');
  const [filterTeam, setFilterTeam] = useState<'all' | 'radiant' | 'dire'>('all');
  const [hoveredWard, setHoveredWard] = useState<PlacedWard | null>(null);

  // Extract all wards placed across all players
  const allWards: PlacedWard[] = useMemo(() => {
    const list: PlacedWard[] = [];
    if (!match.players) return list;

    for (const p of match.players) {
      const isRad = isRadiant(p.player_slot);

      // Observers
      if (Array.isArray(p.obs_log)) {
        for (const w of p.obs_log) {
          list.push({
            type: 'observer',
            time: w.time,
            x: w.x,
            y: w.y,
            heroId: p.hero_id,
            playerSlot: p.player_slot,
            isRadiantTeam: isRad,
          });
        }
      }

      // Sentries
      if (Array.isArray(p.sen_log)) {
        for (const w of p.sen_log) {
          list.push({
            type: 'sentry',
            time: w.time,
            x: w.x,
            y: w.y,
            heroId: p.hero_id,
            playerSlot: p.player_slot,
            isRadiantTeam: isRad,
          });
        }
      }
    }

    return list.sort((a, b) => a.time - b.time);
  }, [match]);

  const filteredWards = allWards.filter((w) => {
    if (filterType === 'obs' && w.type !== 'observer') return false;
    if (filterType === 'sen' && w.type !== 'sentry') return false;
    if (filterTeam === 'radiant' && !w.isRadiantTeam) return false;
    if (filterTeam === 'dire' && w.isRadiantTeam) return false;
    return true;
  });

  const toPct = (x: number, y: number): { left: number; top: number } => {
    let px = 50;
    let py = 50;

    // OpenDota coordinates are standard cell coordinates (0..255)
    if (x <= 256 && y <= 256) {
      px = (x / 256) * 100;
      py = (1 - y / 256) * 100;
    } else {
      // World coordinates (-8000 .. 8000)
      px = ((x + 8000) / 16000) * 100;
      py = (1 - (y + 8000) / 16000) * 100;
    }

    // Clamp between 4% and 96% to keep inside bounds
    return {
      left: Math.max(4, Math.min(96, px)),
      top: Math.max(4, Math.min(96, py)),
    };
  };

  const totalObs = allWards.filter((w) => w.type === 'observer').length;
  const totalSen = allWards.filter((w) => w.type === 'sentry').length;

  if (allWards.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 text-center text-gray-500">
        <Eye className="w-8 h-8 mx-auto text-gray-600 mb-2" />
        <p className="font-medium text-sm text-gray-400">No hay telemetría de visión para esta partida.</p>
        <p className="text-xs text-gray-500 mt-1">
          La repetición debe estar parseada para mostrar el mapa de wards.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Mapa de Visión & Warding
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Total wards colocados: <span className="text-amber-400 font-mono font-semibold">{totalObs} Observers</span>{' '}
            y <span className="text-sky-400 font-mono font-semibold">{totalSen} Sentries</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Team filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterTeam('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterTeam === 'all' ? 'bg-slate-800 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterTeam('radiant')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterTeam === 'radiant' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Radiant
            </button>
            <button
              onClick={() => setFilterTeam('dire')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterTeam === 'dire' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Dire
            </button>
          </div>

          {/* Ward type filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Ambos
            </button>
            <button
              onClick={() => setFilterType('obs')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'obs' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Observer
            </button>
            <button
              onClick={() => setFilterType('sen')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'sen' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sentry
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Minimap Container */}
        <div className="relative w-full max-w-[440px] aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl flex-shrink-0">
          {/* Styled Detailed Dota 2 Minimap Background */}
          <svg className="w-full h-full absolute inset-0 select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {/* Gradients */}
              <linearGradient id="radiantTerritory" x1="0%" y1="100%" x2="50%" y2="50%">
                <stop offset="0%" stopColor="#062d16" />
                <stop offset="60%" stopColor="#0b3d20" />
                <stop offset="100%" stopColor="#143825" />
              </linearGradient>
              <linearGradient id="direTerritory" x1="100%" y1="0%" x2="50%" y2="50%">
                <stop offset="0%" stopColor="#38090c" />
                <stop offset="60%" stopColor="#2b0d10" />
                <stop offset="100%" stopColor="#20141a" />
              </linearGradient>
              <linearGradient id="riverGradient" x1="0%" y1="35%" x2="65%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#0369a1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#075985" stopOpacity="0.75" />
              </linearGradient>
              <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#22c55e" />
              </filter>
              <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#ef4444" />
              </filter>
            </defs>

            {/* Base ground fill */}
            <rect width="100" height="100" fill="#0f172a" />

            {/* Radiant jungle territory (bottom-left triangle/quad) */}
            <polygon points="0,32 0,100 68,100 50,50" fill="url(#radiantTerritory)" />
            {/* Dire jungle territory (top-right triangle/quad) */}
            <polygon points="32,0 100,0 100,68 50,50" fill="url(#direTerritory)" />

            {/* Highground elevations / Jungle plateaus */}
            {/* Radiant primary jungle elevation */}
            <path d="M 18,72 Q 28,68 36,76 Q 30,86 20,84 Z" fill="#052e16" stroke="#15803d" strokeWidth="0.5" opacity="0.8" />
            {/* Radiant safelane jungle / triangle */}
            <path d="M 38,62 Q 46,65 42,75 Q 35,70 38,62 Z" fill="#064e3b" stroke="#10b981" strokeWidth="0.4" opacity="0.7" />
            {/* Dire primary jungle elevation */}
            <path d="M 64,24 Q 72,14 82,28 Q 72,32 64,24 Z" fill="#450a0a" stroke="#b91c1c" strokeWidth="0.5" opacity="0.8" />
            {/* Dire triangle elevation */}
            <path d="M 58,38 Q 62,25 54,25 Q 52,35 58,38 Z" fill="#3f0f15" stroke="#f43f5e" strokeWidth="0.4" opacity="0.7" />

            {/* River water corridor (winding diagonal) */}
            <path
              d="M -2,30 Q 15,36 30,38 Q 50,50 62,62 Q 64,85 70,102 L 64,102 Q 58,82 45,54 Q 28,42 12,38 L -2,34 Z"
              fill="url(#riverGradient)"
            />
            {/* Top river fork towards secret shop */}
            <path
              d="M 30,0 L 34,0 Q 32,18 42,28 L 38,32 Q 28,20 30,0 Z"
              fill="url(#riverGradient)"
              opacity="0.6"
            />

            {/* Safe / Mid / Off Lane Roads (High contrast terrain paths) */}
            {/* Top Lane path */}
            <path
              d="M 13,87 L 13,13 L 87,13"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
            />
            <path
              d="M 13,87 L 13,13 L 87,13"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* Mid Lane path */}
            <path
              d="M 13,87 L 87,13"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.8"
              strokeLinecap="round"
              opacity="0.25"
            />
            <path
              d="M 13,87 L 87,13"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Bot Lane path */}
            <path
              d="M 13,87 L 87,87 L 87,13"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
            />
            <path
              d="M 13,87 L 87,87 L 87,13"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* Base boundaries / Ancient structures */}
            {/* Radiant Ancient Base */}
            <polygon points="6,94 14,84 20,89 12,98" fill="#15803d" stroke="#22c55e" strokeWidth="1" filter="url(#glowGreen)" />
            <circle cx="13" cy="89" r="2.5" fill="#4ade80" />
            <text x="13" y="85" fill="#86efac" fontSize="3" fontWeight="bold" textAnchor="middle">RADIANT</text>

            {/* Dire Ancient Base */}
            <polygon points="80,11 86,6 94,14 88,19" fill="#991b1b" stroke="#ef4444" strokeWidth="1" filter="url(#glowRed)" />
            <circle cx="87" cy="11" r="2.5" fill="#f87171" />
            <text x="87" y="24" fill="#fca5a5" fontSize="3" fontWeight="bold" textAnchor="middle">DIRE</text>

            {/* Roshan Pits (Top-left & Bottom-right in modern Dota) */}
            {/* Roshan Pit Top-Left */}
            <circle cx="21" cy="19" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.8" />
            <text x="21" y="20" fill="#fde68a" fontSize="2.2" fontWeight="bold" textAnchor="middle">ROSH</text>
            {/* Roshan Pit Bot-Right */}
            <circle cx="81" cy="79" r="3.2" fill="#451a03" stroke="#d97706" strokeWidth="0.8" />
            <text x="81" y="80" fill="#fde68a" fontSize="2.2" fontWeight="bold" textAnchor="middle">ROSH</text>

            {/* Tormentors & Watchers landmarks */}
            {/* Tormentor Radiant */}
            <rect x="7" y="66" width="3" height="3" rx="0.5" fill="#701a75" stroke="#e879f9" strokeWidth="0.5" />
            {/* Tormentor Dire */}
            <rect x="90" y="31" width="3" height="3" rx="0.5" fill="#701a75" stroke="#e879f9" strokeWidth="0.5" />

            {/* River Runes (Top & Bot Power Runes) */}
            <circle cx="36" cy="38" r="1.6" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.6" />
            <circle cx="64" cy="62" r="1.6" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.6" />

            {/* Radiant Towers (Green squares) */}
            {/* Top Lane T1, T2, T3 */}
            <rect x="11.5" y="44" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            <rect x="11.5" y="62" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            <rect x="11.5" y="77" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            {/* Mid Lane T1, T2, T3 */}
            <rect x="42.5" y="56" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            <rect x="33.5" y="65" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            <rect x="23.5" y="75" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            {/* Bot Lane T1, T2, T3 */}
            <rect x="56" y="85.5" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            <rect x="38" y="85.5" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />
            <rect x="23" y="85.5" width="2.4" height="2.4" rx="0.4" fill="#16a34a" stroke="#bbf7d0" strokeWidth="0.5" />

            {/* Dire Towers (Red squares) */}
            {/* Top Lane T1, T2, T3 */}
            <rect x="44" y="11.8" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            <rect x="62" y="11.8" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            <rect x="76" y="11.8" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            {/* Mid Lane T1, T2, T3 */}
            <rect x="55" y="42" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            <rect x="64" y="33" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            <rect x="74" y="23" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            {/* Bot Lane T1, T2, T3 */}
            <rect x="85.8" y="56" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            <rect x="85.8" y="38" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />
            <rect x="85.8" y="23" width="2.4" height="2.4" rx="0.4" fill="#dc2626" stroke="#fecaca" strokeWidth="0.5" />

            {/* Outposts */}
            <circle cx="25" cy="40" r="1.8" fill="#eab308" stroke="#fef08a" strokeWidth="0.5" />
            <circle cx="75" cy="60" r="1.8" fill="#eab308" stroke="#fef08a" strokeWidth="0.5" />
          </svg>

          {/* Render Wards */}
          {filteredWards.map((w, idx) => {
            const { left, top } = toPct(w.x, w.y);
            const isObs = w.type === 'observer';
            const color = isObs ? '#f59e0b' : '#38bdf8';

            return (
              <div
                key={`${w.type}-${w.time}-${idx}`}
                style={{ left: `${left}%`, top: `${top}%` }}
                onMouseEnter={() => setHoveredWard(w)}
                onMouseLeave={() => setHoveredWard(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group transition-transform hover:scale-150"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg border border-slate-900"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                </div>
              </div>
            );
          })}

          {/* Hover Tooltip Overlay */}
          {hoveredWard && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/95 border border-slate-700/80 p-2.5 rounded-xl shadow-2xl text-xs z-20 pointer-events-none backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: hoveredWard.type === 'observer' ? '#f59e0b' : '#38bdf8',
                    }}
                  />
                  {hoveredWard.type === 'observer' ? 'Observer Ward' : 'Sentry Ward'}
                </span>
                <span className="text-gray-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {formatDuration(hoveredWard.time)}
                </span>
              </div>
              <div className="text-gray-300 mt-1 flex items-center justify-between">
                <span>Colocado por: {getHeroName(hoveredWard.heroId)}</span>
                <span
                  className={`font-semibold ${
                    hoveredWard.isRadiantTeam ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {hoveredWard.isRadiantTeam ? 'Radiant' : 'Dire'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend and Info */}
        <div className="flex-1 space-y-4 max-w-sm">
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
              Leyenda de Visión
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-gray-300">Observer Ward (Visión de mapa)</span>
                </div>
                <span className="font-mono text-amber-400 font-bold">{totalObs}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                  <span className="text-gray-300">Sentry Ward (True Sight / Deswardeo)</span>
                </div>
                <span className="font-mono text-sky-400 font-bold">{totalSen}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-300" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 border border-rose-300" />
                  <span>Torres de Radiant & Dire (T1, T2, T3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-800 border border-amber-500" />
                  <span>Fosas de Roshan (Noroeste y Sureste)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-sky-400" />
                  <span>Río central & Runas de poder</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800/60 text-xs text-gray-400 space-y-1 leading-relaxed">
            <p>
              💡 <strong className="text-gray-300">Consejo de análisis:</strong> Pasa el cursor por encima de cualquier punto en el mapa para ver qué héroe lo colocó y en qué minuto exacto de la partida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardMap;
