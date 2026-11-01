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

  // Calibrated coordinate conversion for Dota 2 minimap (cells 64..192 with inset compensation)
  // Dota 2 OpenDota/Stratz parsed wards range from 64 to 192 (cell coords).
  // The official Valve minimap graphic has an unplayable tree border/vignette.
  // Inset calibration: left=9.07%, right=8.52%, top=7.43%, bottom=10.16%.
  const toPct = (x: number, y: number): { left: number; top: number } => {
    let cellX = x;
    let cellY = y;

    // If coordinates are in game world units (-8192 .. 8192), convert to cell units (64..192)
    if (Math.abs(x) > 256 || Math.abs(y) > 256) {
      cellX = x / 128 + 128;
      cellY = y / 128 + 128;
    }

    // Inset-compensated playable area percentages
    const insetLeft = 9.07;
    const insetRight = 8.52;
    const insetTop = 7.43;
    const insetBottom = 10.16;
    const playableWidth = 100 - insetLeft - insetRight;
    const playableHeight = 100 - insetTop - insetBottom;

    // Normalized progress across 64..192 (span = 128)
    const normX = (cellX - 64) / 128;
    const normY = (192 - cellY) / 128; // Invert Y because screen starts top=0

    const left = insetLeft + normX * playableWidth;
    const top = insetTop + normY * playableHeight;

    // Clamp between 2% and 98% to keep markers visible on screen
    return {
      left: Math.max(2, Math.min(98, left)),
      top: Math.max(2, Math.min(98, top)),
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
                filterTeam === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterTeam('radiant')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterTeam === 'radiant' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Radiant
            </button>
            <button
              onClick={() => setFilterTeam('dire')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterTeam === 'dire' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium' : 'text-gray-400 hover:text-gray-200'
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
                filterType === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Ambos
            </button>
            <button
              onClick={() => setFilterType('obs')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'obs' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Observer
            </button>
            <button
              onClick={() => setFilterType('sen')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterType === 'sen' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-medium' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sentry
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Official Minimap Container with Real In-Game Asset */}
        <div className="relative w-full max-w-[460px] aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl flex-shrink-0">
          {/* Authentic In-Game Dota 2 Minimap Background */}
          <img
            src="./minimap.png"
            alt="Dota 2 Minimap"
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />

          {/* Render Wards placed in their exact in-game locations */}
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
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group transition-transform hover:scale-175"
              >
                {/* Vision range indicator on hover */}
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
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
        <div className="flex-1 space-y-4 max-w-sm w-full">
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
              Leyenda de Visión
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] border border-slate-900" />
                  <span className="text-gray-300 font-medium">Observer Ward (Visión de mapa)</span>
                </div>
                <span className="font-mono text-amber-400 font-bold">{totalObs}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] border border-slate-900" />
                  <span className="text-gray-300 font-medium">Sentry Ward (True Sight)</span>
                </div>
                <span className="font-mono text-sky-400 font-bold">{totalSen}</span>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 space-y-2 text-[11px] text-gray-400 leading-relaxed">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Minimapa oficial del juego con calibración espacial exacta</span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Las coordenadas se calculan con el factor de escala y recorte nativo de Dota 2 (celdas 64..192), reflejando con exactitud cada acantilado, runa y fosa de Roshan.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800/60 text-xs text-gray-400 space-y-1.5 leading-relaxed">
            <p>
              💡 <strong className="text-gray-300">Consejo táctico:</strong> Pasa el cursor sobre cualquier punto en el mapa para ver qué héroe lo colocó y en qué minuto exacto de la partida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardMap;
