/**
 * @file opendotaLaning.ts
 * Exact OpenDota laning inference, role assignments, and lane advantage metrics.
 * Source reference: OpenDota UI (https://github.com/odota/ui/blob/master/src/components/Match/Laning/laning.utils.ts)
 */

import type { MatchDetail, MatchPlayer } from '../api/types';

export enum PhysicalLane {
  Bottom = 1,
  Middle = 2,
  Top = 3,
  Jungle = 4,
}

export type OpenDotaLaneRole = 'carry' | 'midlane' | 'offlane' | 'softSupport' | 'hardSupport';

export const OPENDOTA_ROLE_POSITIONS: Record<OpenDotaLaneRole, 1 | 2 | 3 | 4 | 5> = {
  carry: 1,
  midlane: 2,
  offlane: 3,
  softSupport: 4,
  hardSupport: 5,
};

export const OPENDOTA_ROLE_LABELS: Record<OpenDotaLaneRole, { name: string; shortName: string; color: string }> = {
  carry: { name: 'Carry (Pos 1)', shortName: 'Carry', color: '#f59e0b' },
  midlane: { name: 'Midlane (Pos 2)', shortName: 'Mid', color: '#3b82f6' },
  offlane: { name: 'Offlane (Pos 3)', shortName: 'Offlane', color: '#ef4444' },
  softSupport: { name: 'Soft Support (Pos 4)', shortName: 'Pos 4', color: '#a855f7' },
  hardSupport: { name: 'Hard Support (Pos 5)', shortName: 'Pos 5', color: '#10b981' },
};

/**
 * Hero level XP thresholds (Liquipedia Dota 2 Experience).
 */
export const HERO_LEVEL_THRESHOLDS = [
  { level: 1, totalXp: 0 },
  { level: 2, totalXp: 240 },
  { level: 3, totalXp: 640 },
  { level: 4, totalXp: 1160 },
  { level: 5, totalXp: 1760 },
  { level: 6, totalXp: 2440 },
  { level: 7, totalXp: 3200 },
  { level: 8, totalXp: 4000 },
  { level: 9, totalXp: 4900 },
  { level: 10, totalXp: 5900 },
  { level: 11, totalXp: 7000 },
  { level: 12, totalXp: 8200 },
  { level: 13, totalXp: 9500 },
  { level: 14, totalXp: 10900 },
  { level: 15, totalXp: 12400 },
  { level: 16, totalXp: 14000 },
  { level: 17, totalXp: 15700 },
  { level: 18, totalXp: 17500 },
  { level: 19, totalXp: 19400 },
  { level: 20, totalXp: 21400 },
  { level: 21, totalXp: 23600 },
  { level: 22, totalXp: 26000 },
  { level: 23, totalXp: 28600 },
  { level: 24, totalXp: 31400 },
  { level: 25, totalXp: 34400 },
  { level: 26, totalXp: 38400 },
  { level: 27, totalXp: 43400 },
  { level: 28, totalXp: 49400 },
  { level: 29, totalXp: 56400 },
  { level: 30, totalXp: 63900 },
];

export function getHeroLevelFromXp(totalXp: number): number {
  let level = 1;
  for (const threshold of HERO_LEVEL_THRESHOLDS) {
    if (totalXp < threshold.totalXp) break;
    level = threshold.level;
  }
  return level;
}

/**
 * Estimates one team's roles exactly as implemented in OpenDota UI.
 * @param players Full roster.
 * @param isRadiant Whether to inspect Radiant (true) or Dire (false).
 */
export function getLaningRoles(
  players: readonly MatchPlayer[],
  isRadiant: boolean
): Partial<Record<OpenDotaLaneRole, MatchPlayer>> {
  const team = players.filter(
    (player) => (player.player_slot < 128) === isRadiant && !player.is_roaming
  );
  const midPlayers = team.filter((player) => player.lane === PhysicalLane.Middle);

  const assignSideLane = (
    lane: PhysicalLane,
    core: OpenDotaLaneRole,
    support: OpenDotaLaneRole
  ): Partial<Record<OpenDotaLaneRole, MatchPlayer>> => {
    const lanePlayers = team.filter((player) => player.lane === lane);
    if (lanePlayers.length === 1) return { [core]: lanePlayers[0] };
    if (lanePlayers.length !== 2) return {};

    const [first, second] = lanePlayers;
    const lh1 = first.lh_t?.[10] ?? first.last_hits ?? 0;
    const lh2 = second.lh_t?.[10] ?? second.last_hits ?? 0;

    const [corePlayer, supportPlayer] = lh1 >= lh2 ? [first, second] : [second, first];
    return { [core]: corePlayer, [support]: supportPlayer };
  };

  // Physical lanes: Radiant safe is Bottom (1), Dire safe is Top (3)
  const roles: Partial<Record<OpenDotaLaneRole, MatchPlayer>> = {
    ...(midPlayers.length === 1 ? { midlane: midPlayers[0] } : {}),
    ...assignSideLane(isRadiant ? PhysicalLane.Bottom : PhysicalLane.Top, 'carry', 'hardSupport'),
    ...assignSideLane(isRadiant ? PhysicalLane.Top : PhysicalLane.Bottom, 'offlane', 'softSupport'),
  };

  // Missing roaming supports
  const missingSupports = (['hardSupport', 'softSupport'] as const).filter(
    (role) => !roles[role]
  );
  const assignedPlayers = new Set(Object.values(roles));
  const roamers = players.filter(
    (player) =>
      (player.player_slot < 128) === isRadiant &&
      player.is_roaming &&
      !assignedPlayers.has(player)
  );

  if (missingSupports.length === 1 && roamers.length === 1) {
    return { ...roles, [missingSupports[0]]: roamers[0] };
  }

  return roles;
}

export interface LaneOutcome {
  laneName: string;
  physicalLane: PhysicalLane;
  radiantRoles: OpenDotaLaneRole[];
  direRoles: OpenDotaLaneRole[];
  radiantGold10: number;
  direGold10: number;
  goldDiff: number; // positive = Radiant lead
  radiantLevels10: number;
  direLevels10: number;
  levelsDiff: number; // positive = Radiant lead
  radiantWon: boolean | null; // true=Radiant won, false=Dire won, null=Tie
  radiantPlayers: MatchPlayer[];
  direPlayers: MatchPlayer[];
}

export interface LaningSummary {
  minute: number;
  radiantNetWorth10: number;
  direNetWorth10: number;
  netWorthDiff10: number;
  radiantLevels10: number;
  direLevels10: number;
  levelsDiff10: number;
  overallWinner: 'radiant' | 'dire' | 'tie';
  radiantWonLanesCount: number;
  direWonLanesCount: number;
  lanes: LaneOutcome[];
  radiantRoles: Partial<Record<OpenDotaLaneRole, MatchPlayer>>;
  direRoles: Partial<Record<OpenDotaLaneRole, MatchPlayer>>;
}

/**
 * Calculates complete OpenDota Laning advantages and summaries for a parsed match.
 */
export function calculateLaningSummary(match: MatchDetail): LaningSummary {
  const summaryMinute = Math.min(10, Math.floor(match.duration / 60));
  const players = match.players || [];

  const radiantRoles = getLaningRoles(players, true);
  const direRoles = getLaningRoles(players, false);

  const radiantNetWorth10 = players
    .filter((p) => p.player_slot < 128)
    .reduce((sum, p) => sum + (p.gold_t?.[summaryMinute] ?? p.net_worth ?? 0), 0);

  const direNetWorth10 = players
    .filter((p) => p.player_slot >= 128)
    .reduce((sum, p) => sum + (p.gold_t?.[summaryMinute] ?? p.net_worth ?? 0), 0);

  const netWorthDiff10 = radiantNetWorth10 - direNetWorth10;

  const radiantLevels10 = players
    .filter((p) => p.player_slot < 128)
    .reduce((sum, p) => sum + getHeroLevelFromXp(p.xp_t?.[summaryMinute] ?? p.total_xp ?? 0), 0);

  const direLevels10 = players
    .filter((p) => p.player_slot >= 128)
    .reduce((sum, p) => sum + getHeroLevelFromXp(p.xp_t?.[summaryMinute] ?? p.total_xp ?? 0), 0);

  const levelsDiff10 = radiantLevels10 - direLevels10;

  const laneDefinitions: {
    laneName: string;
    physicalLane: PhysicalLane;
    radiant: OpenDotaLaneRole[];
    dire: OpenDotaLaneRole[];
  }[] = [
    {
      laneName: 'Top Lane (Línea Superior)',
      physicalLane: PhysicalLane.Top,
      radiant: ['offlane', 'softSupport'],
      dire: ['carry', 'hardSupport'],
    },
    {
      laneName: 'Mid Lane (Carril Central)',
      physicalLane: PhysicalLane.Middle,
      radiant: ['midlane'],
      dire: ['midlane'],
    },
    {
      laneName: 'Bottom Lane (Línea Inferior)',
      physicalLane: PhysicalLane.Bottom,
      radiant: ['carry', 'hardSupport'],
      dire: ['offlane', 'softSupport'],
    },
  ];

  const lanes: LaneOutcome[] = laneDefinitions.map((def) => {
    const radTeamMembers = def.radiant
      .map((r) => radiantRoles[r])
      .filter((p): p is MatchPlayer => Boolean(p));

    const direTeamMembers = def.dire
      .map((r) => direRoles[r])
      .filter((p): p is MatchPlayer => Boolean(p));

    const radiantGold10 = radTeamMembers.reduce(
      (sum, p) => sum + (p.gold_t?.[summaryMinute] ?? 0),
      0
    );
    const direGold10 = direTeamMembers.reduce(
      (sum, p) => sum + (p.gold_t?.[summaryMinute] ?? 0),
      0
    );
    const goldDiff = radiantGold10 - direGold10;

    const radiantLevels10 = radTeamMembers.reduce(
      (sum, p) => sum + getHeroLevelFromXp(p.xp_t?.[summaryMinute] ?? 0),
      0
    );
    const direLevels10 = direTeamMembers.reduce(
      (sum, p) => sum + getHeroLevelFromXp(p.xp_t?.[summaryMinute] ?? 0),
      0
    );
    const levelsDiff = radiantLevels10 - direLevels10;

    let radiantWon: boolean | null = null;
    if (goldDiff > 200) radiantWon = true;
    else if (goldDiff < -200) radiantWon = false;

    return {
      laneName: def.laneName,
      physicalLane: def.physicalLane,
      radiantRoles: def.radiant,
      direRoles: def.dire,
      radiantGold10,
      direGold10,
      goldDiff,
      radiantLevels10,
      direLevels10,
      levelsDiff,
      radiantWon,
      radiantPlayers: radTeamMembers,
      direPlayers: direTeamMembers,
    };
  });

  const overallWinner =
    netWorthDiff10 > 250 ? 'radiant' : netWorthDiff10 < -250 ? 'dire' : 'tie';

  const radiantWonLanesCount = lanes.filter((l) => l.radiantWon === true).length;
  const direWonLanesCount = lanes.filter((l) => l.radiantWon === false).length;

  return {
    minute: summaryMinute,
    radiantNetWorth10,
    direNetWorth10,
    netWorthDiff10,
    radiantLevels10,
    direLevels10,
    levelsDiff10,
    overallWinner,
    radiantWonLanesCount,
    direWonLanesCount,
    lanes,
    radiantRoles,
    direRoles,
  };
}
