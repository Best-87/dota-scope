import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Swords,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
  Eye,
  Coins,
} from 'lucide-react';
import type { MatchDetail, MatchPlayer } from '../../api/types';
import HeroIcon from '../common/HeroIcon';
import ItemIcon from '../common/ItemIcon';
import KDABadge from '../common/KDABadge';
import {
  formatDuration,
  formatTimeAgo,
  getGameModeName,
  getLobbyTypeName,
  isRadiant,
} from '../../utils/formatting';
import { useConstants } from '../../hooks/useConstants';
import { assignPositions, type DotaPosition } from '../../utils/matchAutopsy';

interface MatchDetailProps {
  match: MatchDetail;
  onRequestParse?: () => void;
  parseRequested?: boolean;
}

export const MatchDetailComponent: React.FC<MatchDetailProps> = ({
  match,
  onRequestParse,
  parseRequested = false,
}) => {
  const { getHeroName } = useConstants();

  const radiantPlayers = match.players?.filter((p) => isRadiant(p.player_slot)) || [];
  const direPlayers = match.players?.filter((p) => !isRadiant(p.player_slot)) || [];

  const radiantWon = match.radiant_win;

  const radiantRoles = React.useMemo(() => assignPositions(radiantPlayers), [radiantPlayers]);
  const direRoles = React.useMemo(() => assignPositions(direPlayers), [direPlayers]);

  const radRoleBySlot = React.useMemo(() => {
    const map = new Map<number, DotaPosition>();
    for (const [pos, player] of radiantRoles.entries()) {
      map.set(player.player_slot, pos);
    }
    return map;
  }, [radiantRoles]);

  const direRoleBySlot = React.useMemo(() => {
    const map = new Map<number, DotaPosition>();
    for (const [pos, player] of direRoles.entries()) {
      map.set(player.player_slot, pos);
    }
    return map;
  }, [direRoles]);

  const getRoleTag = (pos?: DotaPosition) => {
    switch (pos) {
      case 1:
        return { label: 'Pos 1 · HC', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 2:
        return { label: 'Pos 2 · Mid', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' };
      case 3:
        return { label: 'Pos 3 · Lateral', color: 'bg-red-500/15 text-red-300 border-red-500/30' };
      case 4:
        return { label: 'Pos 4 · Soft', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 5:
        return { label: 'Pos 5 · Hard', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return null;
    }
  };

  const renderTeamTable = (teamPlayers: MatchPlayer[], isRadiantTeam: boolean) => {
    const isWinner = isRadiantTeam ? radiantWon : !radiantWon;
    const teamName = isRadiantTeam ? 'Radiant' : 'Dire';
    const teamScore = isRadiantTeam ? match.radiant_score : match.dire_score;

    return (
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl mb-6">
        {/* Team Banner */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isRadiantTeam
              ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
              : 'bg-rose-950/30 border-rose-900/40 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl font-black uppercase tracking-wider">{teamName}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${
                isWinner
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-gray-400'
              }`}
            >
              {isWinner ? 'Ganador' : 'Derrotado'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-mono">Bajas:</span>
            <span className="text-2xl font-black font-mono text-white">{teamScore ?? '-'}</span>
          </div>
        </div>

        {/* Players Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 pl-4">Jugador / Héroe</th>
                <th className="py-3">KDA</th>
                <th className="py-3 text-right">Networth</th>
                <th className="py-3 text-right">GPM / XPM</th>
                <th className="py-3 text-right">LH / DN</th>
                <th className="py-3 text-right">Daño Héroe</th>
                <th className="py-3 pl-4">Items</th>
                <th className="py-3 text-center pr-4">Wards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {teamPlayers.map((player) => {
                const playerName = player.personaname || `Anónimo`;
                const heroName = getHeroName(player.hero_id);
                const rolePos = isRadiantTeam
                  ? radRoleBySlot.get(player.player_slot)
                  : direRoleBySlot.get(player.player_slot);
                const roleTag = getRoleTag(rolePos);

                return (
                  <tr key={player.player_slot} className="hover:bg-slate-800/30 transition">
                    {/* Player / Hero */}
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <HeroIcon heroId={player.hero_id} size="md" />
                        <div className="min-w-0">
                          {player.account_id ? (
                            <Link
                              to={`/dashboard/${player.account_id}`}
                              className="font-bold text-gray-200 hover:text-red-400 transition truncate max-w-[140px] block"
                            >
                              {playerName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-400 truncate max-w-[140px] block">
                              {playerName}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[11px] text-gray-500">{heroName}</span>
                            {roleTag && (
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${roleTag.color}`}
                              >
                                {roleTag.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* KDA */}
                    <td className="py-3">
                      <KDABadge
                        kills={player.kills}
                        deaths={player.deaths}
                        assists={player.assists}
                      />
                    </td>

                    {/* Networth */}
                    <td className="py-3 text-right font-mono font-bold text-amber-400">
                      {player.net_worth ? `${(player.net_worth / 1000).toFixed(1)}k` : '-'}
                    </td>

                    {/* GPM / XPM */}
                    <td className="py-3 text-right font-mono">
                      <div className="text-amber-400">{player.gold_per_min}</div>
                      <div className="text-sky-400 text-[11px]">{player.xp_per_min}</div>
                    </td>

                    {/* LH / DN */}
                    <td className="py-3 text-right font-mono text-gray-300">
                      <span>{player.last_hits}</span>
                      <span className="text-gray-500"> / {player.denies ?? 0}</span>
                    </td>

                    {/* Hero Damage */}
                    <td className="py-3 text-right font-mono text-rose-300 font-medium">
                      {player.hero_damage ? player.hero_damage.toLocaleString() : '-'}
                    </td>

                    {/* Items Grid */}
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-1">
                        {/* 6 Inventory Slots */}
                        <div className="grid grid-cols-3 gap-0.5">
                          <ItemIcon itemId={player.item_0} size="sm" />
                          <ItemIcon itemId={player.item_1} size="sm" />
                          <ItemIcon itemId={player.item_2} size="sm" />
                          <ItemIcon itemId={player.item_3} size="sm" />
                          <ItemIcon itemId={player.item_4} size="sm" />
                          <ItemIcon itemId={player.item_5} size="sm" />
                        </div>

                        {/* Neutral Item */}
                        {player.item_neutral !== undefined && (
                          <div className="ml-1 pl-1 border-l border-slate-700">
                            <ItemIcon itemId={player.item_neutral} size="sm" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Wards placed */}
                    <td className="py-3 text-center pr-4 font-mono text-[11px]">
                      <span className="text-amber-400" title="Observer Wards">
                        👁 {player.obs_placed ?? 0}
                      </span>
                      <span className="text-sky-400 ml-2" title="Sentry Wards">
                        🛡 {player.sen_placed ?? 0}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Match Header Information */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-bold px-3 py-1 rounded-lg uppercase ${
                radiantWon
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              Victoria de {radiantWon ? 'Radiant' : 'Dire'}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              ID Partida: {match.match_id}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              Duración: <strong className="text-gray-200">{formatDuration(match.duration)}</strong>
            </span>
            <span>•</span>
            <span>{getGameModeName(match.game_mode)}</span>
            <span>•</span>
            <span>{getLobbyTypeName(match.lobby_type)}</span>
            <span>•</span>
            <span>{formatTimeAgo(match.start_time)}</span>
          </div>
        </div>

        {/* Request Replay Parse action */}
        {onRequestParse && (
          <button
            onClick={onRequestParse}
            disabled={parseRequested}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-gray-200 hover:text-white border border-slate-700 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            {parseRequested ? 'Parseo solicitado...' : 'Solicitar Parseo Completo'}
          </button>
        )}
      </div>

      {/* Render Radiant Team */}
      {renderTeamTable(radiantPlayers, true)}

      {/* Render Dire Team */}
      {renderTeamTable(direPlayers, false)}
    </div>
  );
};

export default MatchDetailComponent;
