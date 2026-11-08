import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Trophy,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertCircle,
  Clock,
  Swords,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import type { MatchDetail, MatchPlayer } from '../../api/types';
import HeroIcon from '../common/HeroIcon';
import KDABadge from '../common/KDABadge';
import { useConstants } from '../../hooks/useConstants';
import {
  calculateLaningSummary,
  getHeroLevelFromXp,
  PhysicalLane,
  OPENDOTA_ROLE_LABELS,
  type OpenDotaLaneRole,
  type LaneOutcome,
} from '../../utils/opendotaLaning';

interface LaningSectionProps {
  match: MatchDetail;
  focusAccountId?: number | null;
  onRequestParse?: () => void;
  parseRequested?: boolean;
}

export const LaningSection: React.FC<LaningSectionProps> = ({
  match,
  focusAccountId,
  onRequestParse,
  parseRequested = false,
}) => {
  const { getHeroName } = useConstants();

  const isParsed = Boolean(
    match.players?.some(
      (p) => (p.gold_t && p.gold_t.length > 0) || (p.lane !== null && p.lane !== undefined)
    )
  );

  const laningSummary = useMemo(() => {
    return calculateLaningSummary(match);
  }, [match]);

  const summaryMin = laningSummary.minute;

  // Max net worth at minute 10 across all players for scaling bars
  const maxNetWorth10 = useMemo(() => {
    const values = (match.players || []).map((p) => p.gold_t?.[summaryMin] ?? p.net_worth ?? 0);
    return Math.max(...values, 1);
  }, [match.players, summaryMin]);

  // Map each player to their OpenDota assigned role
  const playerRoleMap = useMemo(() => {
    const map = new Map<number, OpenDotaLaneRole>();
    Object.entries(laningSummary.radiantRoles).forEach(([role, p]) => {
      if (p) map.set(p.player_slot, role as OpenDotaLaneRole);
    });
    Object.entries(laningSummary.direRoles).forEach(([role, p]) => {
      if (p) map.set(p.player_slot, role as OpenDotaLaneRole);
    });
    return map;
  }, [laningSummary]);

  // Map each player to whether their lane was won
  const playerLaneWonMap = useMemo(() => {
    const map = new Map<number, boolean | null>();
    laningSummary.lanes.forEach((lane) => {
      lane.radiantPlayers.forEach((p) => {
        map.set(p.player_slot, lane.radiantWon);
      });
      lane.direPlayers.forEach((p) => {
        const direWon = lane.radiantWon === null ? null : !lane.radiantWon;
        map.set(p.player_slot, direWon);
      });
    });
    return map;
  }, [laningSummary]);

  // Opponents matchup map: for each player, who was on the opposing side of the lane
  const opponentsMap = useMemo(() => {
    const map = new Map<number, MatchPlayer[]>();
    laningSummary.lanes.forEach((lane) => {
      lane.radiantPlayers.forEach((rp) => {
        map.set(rp.player_slot, lane.direPlayers);
      });
      lane.direPlayers.forEach((dp) => {
        map.set(dp.player_slot, lane.radiantPlayers);
      });
    });
    return map;
  }, [laningSummary]);

  const radiantPlayers = (match.players || []).filter((p) => p.player_slot < 128);
  const direPlayers = (match.players || []).filter((p) => p.player_slot >= 128);

  const formatDiff = (num: number, prefix: string = '') => {
    if (num === 0) return '0';
    const sign = num > 0 ? '+' : '';
    return `${sign}${prefix}${num.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Header Card & OpenDota 10-Minute Narrative ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Fase de Líneas (Telemetría Oficial OpenDota)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              Datos analizados exactamente al minuto <strong className="text-white">{summaryMin}:00</strong>{' '}
              con asignación de roles matemáticos por carril y ventajas de oro / niveles.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase text-gray-400 block">
                Ganador Fase de Líneas (@10:00)
              </span>
              <span
                className={`text-base font-black uppercase font-mono ${
                  laningSummary.overallWinner === 'radiant'
                    ? 'text-emerald-400'
                    : laningSummary.overallWinner === 'dire'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {laningSummary.overallWinner === 'radiant'
                  ? 'Radiant'
                  : laningSummary.overallWinner === 'dire'
                  ? 'Dire'
                  : 'Empate'}
              </span>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                laningSummary.overallWinner === 'radiant'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : laningSummary.overallWinner === 'dire'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Narrative text matching OpenDota */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              {laningSummary.netWorthDiff10 > 0 ? (
                <>
                  <strong className="text-emerald-400">Radiant</strong> tenía una ventaja de{' '}
                  <strong className="text-amber-300">
                    +{laningSummary.netWorthDiff10.toLocaleString()}
                  </strong>{' '}
                  de oro y{' '}
                  <strong className="text-sky-300">
                    +{laningSummary.levelsDiff10}
                  </strong>{' '}
                  niveles al minuto 10.
                </>
              ) : laningSummary.netWorthDiff10 < 0 ? (
                <>
                  <strong className="text-rose-400">Dire</strong> tenía una ventaja de{' '}
                  <strong className="text-amber-300">
                    +{Math.abs(laningSummary.netWorthDiff10).toLocaleString()}
                  </strong>{' '}
                  de oro y{' '}
                  <strong className="text-sky-300">
                    +{Math.abs(laningSummary.levelsDiff10)}
                  </strong>{' '}
                  niveles al minuto 10.
                </>
              ) : (
                'Equidad total en patrimonio al minuto 10.'
              )}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
            <div>
              <span className="text-emerald-400 font-bold">Rad:</span>{' '}
              {laningSummary.radiantNetWorth10.toLocaleString()}g (Nv.{laningSummary.radiantLevels10})
            </div>
            <div>
              <span className="text-rose-400 font-bold">Dire:</span>{' '}
              {laningSummary.direNetWorth10.toLocaleString()}g (Nv.{laningSummary.direLevels10})
            </div>
          </div>
        </div>
      </div>

      {/* ── Lane Advantages Table at 10:00 (Exact OpenDota 3-Lane Cards) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Ventajas de Carril al Minuto 10:00
          </h3>
          <span className="text-[11px] text-gray-500 font-mono">
            Radiant vs Dire por Línea
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {laningSummary.lanes.map((lane) => {
            const radLead = lane.goldDiff > 0;
            const direLead = lane.goldDiff < 0;
            const isTie = lane.goldDiff === 0;

            const radXpLead = lane.levelsDiff > 0;
            const direXpLead = lane.levelsDiff < 0;

            return (
              <div
                key={lane.laneName}
                className={`bg-slate-900/90 border rounded-2xl p-4 shadow-lg transition-all ${
                  lane.radiantWon === true
                    ? 'border-emerald-500/40 hover:border-emerald-400/60'
                    : lane.radiantWon === false
                    ? 'border-rose-500/40 hover:border-rose-400/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">
                      {lane.laneName}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      {lane.physicalLane === PhysicalLane.Top
                        ? 'Offlane Rad vs Safe Dire'
                        : lane.physicalLane === PhysicalLane.Middle
                        ? 'Mid vs Mid'
                        : 'Safe Rad vs Offlane Dire'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded border ${
                      lane.radiantWon === true
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : lane.radiantWon === false
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-800 text-gray-400 border-slate-700'
                    }`}
                  >
                    {lane.radiantWon === true
                      ? 'Gana Radiant'
                      : lane.radiantWon === false
                      ? 'Gana Dire'
                      : 'Empate'}
                  </span>
                </div>

                {/* Matchup Heroes Avatars */}
                <div className="bg-slate-950/70 rounded-xl p-3 mb-3 flex items-center justify-between">
                  {/* Radiant side */}
                  <div className="flex items-center gap-1.5">
                    {lane.radiantPlayers.map((p) => (
                      <div key={p.player_slot} className="relative group">
                        <HeroIcon heroId={p.hero_id} size="sm" />
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1 rounded">
                          {p.gold_t?.[summaryMin]
                            ? `${(p.gold_t[summaryMin] / 1000).toFixed(1)}k`
                            : '-'}
                        </span>
                      </div>
                    ))}
                    {lane.radiantPlayers.length === 0 && (
                      <span className="text-xs text-gray-500 italic">Sin asignar</span>
                    )}
                  </div>

                  <span className="text-[10px] font-black text-gray-500 uppercase font-mono px-2">
                    VS
                  </span>

                  {/* Dire side */}
                  <div className="flex items-center gap-1.5 justify-end">
                    {lane.direPlayers.map((p) => (
                      <div key={p.player_slot} className="relative group">
                        <HeroIcon heroId={p.hero_id} size="sm" />
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40 px-1 rounded">
                          {p.gold_t?.[summaryMin]
                            ? `${(p.gold_t[summaryMin] / 1000).toFixed(1)}k`
                            : '-'}
                        </span>
                      </div>
                    ))}
                    {lane.direPlayers.length === 0 && (
                      <span className="text-xs text-gray-500 italic">Sin asignar</span>
                    )}
                  </div>
                </div>

                {/* Advantages Numbers (Net Worth & Levels) */}
                <div className="space-y-2 text-xs">
                  {/* Net Worth Advantage */}
                  <div className="flex items-center justify-between bg-slate-950/40 px-3 py-2 rounded-lg">
                    <span className="text-gray-400">Ventaja de Oro:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold">
                      <span
                        className={
                          radLead
                            ? 'text-emerald-400'
                            : direLead
                            ? 'text-rose-400'
                            : 'text-gray-400'
                        }
                      >
                        {formatDiff(lane.goldDiff)}
                      </span>
                      <span
                        className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-black ${
                          radLead
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : direLead
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        {radLead ? 'Radiant' : direLead ? 'Dire' : 'Empate'}
                      </span>
                    </div>
                  </div>

                  {/* Combined Levels Advantage */}
                  <div className="flex items-center justify-between bg-slate-950/40 px-3 py-2 rounded-lg">
                    <span className="text-gray-400">Ventaja de Niveles:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold">
                      <span
                        className={
                          radXpLead
                            ? 'text-emerald-400'
                            : direXpLead
                            ? 'text-rose-400'
                            : 'text-gray-400'
                        }
                      >
                        {formatDiff(lane.levelsDiff, 'Nv. ')}
                      </span>
                      <span
                        className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-black ${
                          radXpLead
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : direXpLead
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-800 text-gray-400'
                        }`}
                      >
                        {radXpLead ? 'Radiant' : direXpLead ? 'Dire' : 'Empate'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Team Laning Tables (Scoreboards by Team @10:00) ── */}
      <div className="space-y-6">
        {/* Radiant Table */}
        {renderTeamTable(
          'Radiant',
          true,
          radiantPlayers,
          laningSummary.radiantWonLanesCount ?? 0,
          playerRoleMap,
          playerLaneWonMap,
          opponentsMap,
          summaryMin,
          maxNetWorth10,
          getHeroName,
          focusAccountId
        )}

        {/* Dire Table */}
        {renderTeamTable(
          'Dire',
          false,
          direPlayers,
          laningSummary.direWonLanesCount ?? 0,
          playerRoleMap,
          playerLaneWonMap,
          opponentsMap,
          summaryMin,
          maxNetWorth10,
          getHeroName,
          focusAccountId
        )}
      </div>

      {/* Unparsed match warning if applicable */}
      {!isParsed && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <strong className="text-amber-300 block mb-0.5">
                Datos estimados por telemetría base de partida
              </strong>
              <span>
                Para ver el desglose exacto segundo a segundo de oro y XP al minuto 10, es necesario
                que la repetición haya sido procesada en OpenDota.
              </span>
            </div>
          </div>
          {onRequestParse && (
            <button
              onClick={onRequestParse}
              disabled={parseRequested}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold text-xs transition flex-shrink-0 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{parseRequested ? 'Parseando...' : 'Parsear Repetición'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

function renderTeamTable(
  teamName: string,
  isRadiantTeam: boolean,
  players: MatchPlayer[],
  _wonLanes: number,
  playerRoleMap: Map<number, OpenDotaLaneRole>,
  playerLaneWonMap: Map<number, boolean | null>,
  opponentsMap: Map<number, MatchPlayer[]>,
  summaryMin: number,
  maxNetWorth10: number,
  getHeroName: (id: number) => string,
  focusAccountId?: number | null
) {
  const getLaneName = (lane?: number | null, isRoaming?: boolean | null) => {
    if (isRoaming) return 'Roaming (Itinerante)';
    if (lane === PhysicalLane.Middle) return 'Carril Central';
    if (lane === PhysicalLane.Top) {
      return isRadiantTeam ? 'Línea Superior (Off)' : 'Línea Superior (Safe)';
    }
    if (lane === PhysicalLane.Bottom) {
      return isRadiantTeam ? 'Línea Inferior (Safe)' : 'Línea Inferior (Off)';
    }
    return 'Línea';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-3 h-3 rounded-full ${
              isRadiantTeam ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400 shadow-[0_0_8px_#fb7185]'
            }`}
          />
          <h3 className="text-base font-bold text-white tracking-tight">
            {teamName} — Rendimiento en Línea al Minuto {summaryMin}:00
          </h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">5 Jugadores</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-mono uppercase text-gray-400">
              <th className="py-2.5 px-3">Jugador / Héroe</th>
              <th className="py-2.5 px-2">Rol (OpenDota)</th>
              <th className="py-2.5 px-2">Carril Asignado</th>
              <th className="py-2.5 px-2">Enfrentamiento (VS)</th>
              <th className="py-2.5 px-2 text-center">K / D / A</th>
              <th className="py-2.5 px-2 text-center">Nivel @10</th>
              <th className="py-2.5 px-2 text-right">XP @10</th>
              <th className="py-2.5 px-3 text-right">Patrimonio @10</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {players.map((p) => {
              const roleKey = playerRoleMap.get(p.player_slot);
              const roleMeta = roleKey ? OPENDOTA_ROLE_LABELS[roleKey] : null;
              const laneWon = playerLaneWonMap.get(p.player_slot);
              const opponents = opponentsMap.get(p.player_slot) || [];
              const isUser = focusAccountId && p.account_id === focusAccountId;

              const gold10 = p.gold_t?.[summaryMin] ?? p.net_worth ?? 0;
              const xp10 = p.xp_t?.[summaryMin] ?? p.total_xp ?? 0;
              const level10 = getHeroLevelFromXp(xp10);
              const nwPercent = Math.min(100, Math.round((gold10 / maxNetWorth10) * 100));

              return (
                <tr
                  key={p.player_slot}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isUser ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
                  }`}
                >
                  {/* Jugador / Héroe */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <HeroIcon heroId={p.hero_id} size="sm" />
                      <div className="min-w-0">
                        {p.account_id ? (
                          <Link
                            to={`/player/${p.account_id}`}
                            className={`font-bold truncate max-w-[130px] block hover:underline ${
                              isUser ? 'text-amber-300' : 'text-gray-200'
                            }`}
                          >
                            {p.personaname || 'Anónimo'}
                          </Link>
                        ) : (
                          <span className="font-bold text-gray-400 truncate max-w-[130px] block">
                            {p.personaname || 'Anónimo'}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 block truncate">
                          {getHeroName(p.hero_id)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Rol OpenDota */}
                  <td className="py-3 px-2">
                    {roleMeta ? (
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block"
                        style={{
                          backgroundColor: `${roleMeta.color}15`,
                          color: roleMeta.color,
                          borderColor: `${roleMeta.color}40`,
                        }}
                      >
                        {roleMeta.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-mono text-[10px]">No clasificado</span>
                    )}
                  </td>

                  {/* Carril Asignado + Ganó Línea badge */}
                  <td className="py-3 px-2">
                    <div className="space-y-0.5">
                      <span className="text-xs text-gray-300 font-medium block">
                        {getLaneName(p.lane, p.is_roaming)}
                      </span>
                      {laneWon !== undefined && laneWon !== null && (
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded inline-block ${
                            laneWon
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {laneWon ? 'Ganó Línea' : 'Perdió Línea'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Enfrentamiento (Rival en carril) */}
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      {opponents.length > 0 ? (
                        opponents.map((opp) => (
                          <div key={opp.player_slot} title={getHeroName(opp.hero_id)}>
                            <HeroIcon heroId={opp.hero_id} size="sm" />
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500 text-[10px] italic">Sin rival directo</span>
                      )}
                    </div>
                  </td>

                  {/* KDA */}
                  <td className="py-3 px-2 text-center">
                    <KDABadge
                      kills={p.kills}
                      deaths={p.deaths}
                      assists={p.assists}
                    />
                  </td>

                  {/* Nivel @10 */}
                  <td className="py-3 px-2 text-center font-mono font-bold text-sky-300">
                    Nv. {level10}
                  </td>

                  {/* XP @10 */}
                  <td className="py-3 px-2 text-right font-mono text-gray-300">
                    {xp10.toLocaleString()}
                  </td>

                  {/* Patrimonio @10 con progress bar */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-mono font-bold text-amber-400">
                      {gold10.toLocaleString()}g
                    </div>
                    <div className="w-24 ml-auto mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                        style={{ width: `${nwPercent}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LaningSection;
