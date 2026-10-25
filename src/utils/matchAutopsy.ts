import type { MatchDetail, MatchPlayer } from '../api/types';
import { didWin, isRadiant } from './formatting';

export type DotaPosition = 1 | 2 | 3 | 4 | 5;

export interface RoleEvaluation {
  position: DotaPosition;
  positionName: string;
  heroId: number;
  playerName: string;
  playerSlot: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number; // 0 - 100
  summary: string;
  metrics: {
    label: string;
    value: string | number;
    benchmark: string;
    status: 'good' | 'average' | 'poor';
  }[];
  criticalMistakes: string[];
  keyStrengths: string[];
}

export interface Finding {
  category: 'vision' | 'laning' | 'farming' | 'fighting' | 'items' | 'objectives' | 'macro';
  severity: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp?: string;
  culpritHeroId?: number;
  position?: DotaPosition;
}

export interface TippingPoint {
  minute: number;
  goldSwing: number;
  description: string;
  severity: 'critical' | 'major' | 'moderate';
}

export interface MatchAutopsyResult {
  isVictory: boolean;
  targetPlayer: MatchPlayer | null;
  targetTeamIsRadiant: boolean;
  hasParsedTelemetry: boolean;
  tippingPoint: TippingPoint | null;
  executiveSummary: string[];
  roles: Record<DotaPosition, RoleEvaluation>;
  findings: Finding[];
  recommendations: string[];
  teamScores: {
    laning: number;
    vision: number | null;
    economy: number;
    teamfight: number;
    objectives: number;
    overall: number;
  };
}

// Common item IDs
const ITEM_IDS = {
  BLINK: 1,
  BKB: 116,
  FORCE_STAFF: 102,
  GLIMMER_CAPE: 254,
  GHOST_SCEPTER: 37,
  EUL: 100,
  PIPE: 90,
  CRIMSON_GUARD: 242,
  BLADE_MAIL: 127,
  LOTUS_ORB: 226,
  SPIRIT_VESSEL: 267,
  MEKANSM: 79,
  GREAVES: 231,
  HURRICANE_PIKE: 263,
  DRAGON_LANCE: 240,
  MAELSTROM: 166,
};

const DEFENSIVE_SAVE_ITEMS = new Set([
  ITEM_IDS.FORCE_STAFF,
  ITEM_IDS.GLIMMER_CAPE,
  ITEM_IDS.GHOST_SCEPTER,
  ITEM_IDS.EUL,
  ITEM_IDS.LOTUS_ORB,
  ITEM_IDS.HURRICANE_PIKE,
]);

const OFF_AURA_ITEMS = new Set([
  ITEM_IDS.PIPE,
  ITEM_IDS.CRIMSON_GUARD,
  ITEM_IDS.GREAVES,
  ITEM_IDS.LOTUS_ORB,
  ITEM_IDS.BLADE_MAIL,
]);

/**
 * Standard competitive Dota 2 primary position mappings for heroes.
 * Used for accurate assignment especially when matches are unparsed or lane data is missing.
 */
export const HERO_PRIMARY_ROLE: Record<number, DotaPosition> = {
  // Pos 1 (Hard Carries)
  1: 1,   // Anti-Mage
  6: 1,   // Drow Ranger
  8: 1,   // Juggernaut
  10: 1,  // Morphling
  12: 1,  // Phantom Lancer
  18: 1,  // Sven
  32: 1,  // Riki
  35: 1,  // Sniper
  41: 1,  // Faceless Void
  42: 1,  // Wraith King
  44: 1,  // Phantom Assassin
  48: 1,  // Luna
  54: 1,  // Lifestealer
  56: 1,  // Clinkz
  63: 1,  // Weaver
  67: 1,  // Spectre
  70: 1,  // Ursa
  72: 1,  // Gyrocopter
  81: 1,  // Chaos Knight
  93: 1,  // Slark
  94: 1,  // Medusa
  95: 1,  // Troll Warlord
  109: 1, // Terrorblade
  114: 1, // Monkey King
  138: 1, // Muerta
  145: 1, // Kez

  // Pos 2 (Midlaners)
  9: 2,   // Mirana (Mid tempo / Pos 4)
  11: 2,  // Shadow Fiend
  13: 2,  // Puck
  15: 2,  // Razor
  17: 2,  // Storm Spirit
  22: 2,  // Zeus
  23: 2,  // Kunkka
  25: 2,  // Lina
  34: 2,  // Tinker
  36: 2,  // Necrophos
  39: 2,  // Queen of Pain
  43: 2,  // Death Prophet
  46: 2,  // Templar Assassin
  47: 2,  // Viper
  49: 2,  // Dragon Knight
  52: 2,  // Leshrac
  59: 2,  // Huskar
  65: 2,  // Batrider
  74: 2,  // Invoker
  76: 2,  // Outworld Destroyer
  82: 2,  // Meepo
  92: 2,  // Arc Warden
  106: 2, // Ember Spirit
  120: 2, // Pangolier
  126: 2, // Void Spirit

  // Pos 3 (Offlaners / Lateral Core)
  2: 3,   // Axe
  16: 3,  // Sand King
  28: 3,  // Slardar
  29: 3,  // Tidehunter
  33: 3,  // Enigma
  38: 3,  // Beastmaster
  55: 3,  // Dark Seer
  60: 3,  // Night Stalker
  69: 3,  // Doom
  71: 3,  // Spirit Breaker
  78: 3,  // Brewmaster
  96: 3,  // Centaur Warrunner
  97: 3,  // Magnus
  98: 3,  // Timbersaw
  99: 3,  // Bristleback
  104: 3, // Legion Commander
  108: 3, // Underlord
  129: 3, // Mars
  135: 3, // Dawnbreaker
  137: 3, // Primal Beast

  // Pos 4 (Soft Supports / Lateral Support / Roamers)
  7: 4,   // Earthshaker
  14: 4,  // Pudge
  19: 4,  // Tiny
  21: 4,  // Windranger
  51: 4,  // Clockwerk
  62: 4,  // Bounty Hunter
  86: 4,  // Rubick
  88: 4,  // Nyx Assassin
  100: 4, // Tusk
  105: 4, // Techies
  107: 4, // Earth Spirit
  123: 4, // Hoodwink
  136: 4, // Marci
  139: 4, // Ringmaster

  // Pos 5 (Hard Supports / Babysitters)
  3: 5,   // Bane
  5: 5,   // Crystal Maiden
  26: 5,  // Lion
  27: 5,  // Shadow Shaman
  30: 5,  // Witch Doctor
  31: 5,  // Lich
  37: 5,  // Warlock
  50: 5,  // Dazzle
  57: 5,  // Omniknight
  58: 5,  // Enchantress
  64: 5,  // Jakiro
  66: 5,  // Chen
  68: 5,  // Ancient Apparition
  75: 5,  // Silencer
  79: 5,  // Shadow Demon
  83: 5,  // Treant Protector
  84: 5,  // Ogre Magi
  85: 5,  // Undying
  87: 5,  // Disruptor
  90: 5,  // Keeper of the Light
  91: 5,  // Io
  101: 5, // Skywrath Mage
  102: 5, // Abaddon
  111: 5, // Oracle
  121: 5, // Grimstroke
  128: 5, // Snapfire
};

/**
 * Intelligent and accurate position assigner (Pos 1 to Pos 5).
 * Combines hero archetype affinity with parsed lane role and networth hierarchy.
 */
export function assignPositions(
  teamPlayers: MatchPlayer[],
  customOverrides?: Record<DotaPosition, number>
): Map<DotaPosition, MatchPlayer> {
  const assigned = new Map<DotaPosition, MatchPlayer>();
  const unassigned = [...teamPlayers];

  if (unassigned.length === 0) return assigned;

  // If user provided custom manual role overrides (e.g. from UI selector)
  if (customOverrides) {
    for (const [posStr, playerSlot] of Object.entries(customOverrides)) {
      const pos = Number(posStr) as DotaPosition;
      const player = unassigned.find((p) => p.player_slot === playerSlot);
      if (player) {
        assigned.set(pos, player);
        const idx = unassigned.indexOf(player);
        if (idx !== -1) unassigned.splice(idx, 1);
      }
    }
  }

  // Check if lane telemetry is available
  const hasLaneData = unassigned.some((p) => p.lane !== undefined && p.lane !== null);
  const isRad = isRadiant(teamPlayers[0].player_slot);
  const safeLaneNumber = isRad ? 1 : 3;
  const offLaneNumber = isRad ? 3 : 1;

  // Helper to remove and claim player
  const claim = (predicate: (p: MatchPlayer) => boolean): MatchPlayer | null => {
    const idx = unassigned.findIndex(predicate);
    if (idx !== -1) {
      return unassigned.splice(idx, 1)[0];
    }
    return null;
  };

  // 1. Identify Mid (Pos 2) if not already assigned
  if (!assigned.has(2)) {
    let mid: MatchPlayer | null = null;
    if (hasLaneData) {
      mid = claim((p) => (p.lane === 2 || p.lane_role === 2) && (p.last_hits || 0) >= 20);
      if (!mid) mid = claim((p) => p.lane === 2 || p.lane_role === 2);
    }
    if (!mid) {
      // Check primary hero archetype
      mid = claim((p) => HERO_PRIMARY_ROLE[p.hero_id] === 2);
    }
    if (!mid && unassigned.length > 0) {
      // 2nd highest net worth or solo XP
      unassigned.sort((a, b) => (b.net_worth || 0) - (a.net_worth || 0));
      mid = unassigned.length > 1 ? unassigned.splice(1, 1)[0] : unassigned.shift()!;
    }
    if (mid) assigned.set(2, mid);
  }

  // 2. Identify Carry (Pos 1) if not already assigned
  if (!assigned.has(1)) {
    let carry: MatchPlayer | null = null;
    // Check archetype first or safe lane core
    carry = claim((p) => HERO_PRIMARY_ROLE[p.hero_id] === 1);
    if (!carry && hasLaneData) {
      carry = claim((p) => p.lane === safeLaneNumber || p.lane_role === 1);
    }
    if (!carry && unassigned.length > 0) {
      unassigned.sort((a, b) => (b.last_hits || 0) - (a.last_hits || 0));
      carry = unassigned.shift()!;
    }
    if (carry) assigned.set(1, carry);
  }

  // 3. Identify Offlaner (Pos 3) if not already assigned
  if (!assigned.has(3)) {
    let offlaner: MatchPlayer | null = null;
    offlaner = claim((p) => HERO_PRIMARY_ROLE[p.hero_id] === 3);
    if (!offlaner && hasLaneData) {
      offlaner = claim((p) => p.lane === offLaneNumber || p.lane_role === 3);
    }
    if (!offlaner && unassigned.length > 0) {
      unassigned.sort((a, b) => (b.last_hits || 0) - (a.last_hits || 0));
      offlaner = unassigned.shift()!;
    }
    if (offlaner) assigned.set(3, offlaner);
  }

  // 4. Identify Hard Support (Pos 5) if not already assigned
  if (!assigned.has(5)) {
    let pos5: MatchPlayer | null = null;
    pos5 = claim((p) => HERO_PRIMARY_ROLE[p.hero_id] === 5);
    if (!pos5 && unassigned.length > 0) {
      // The one with fewer last hits or higher wards
      unassigned.sort((a, b) => (a.last_hits || 0) - (b.last_hits || 0));
      pos5 = unassigned.shift()!;
    }
    if (pos5) assigned.set(5, pos5);
  }

  // 5. Remaining player becomes Soft Support (Pos 4)
  if (!assigned.has(4)) {
    if (unassigned.length > 0) {
      assigned.set(4, unassigned.shift()!);
    }
  }

  // Fallback cleanup
  for (let pos = 1; pos <= 5; pos++) {
    if (!assigned.has(pos as DotaPosition)) {
      const leftover = teamPlayers.find((tp) => !Array.from(assigned.values()).includes(tp));
      if (leftover) assigned.set(pos as DotaPosition, leftover);
    }
  }

  return assigned;
}

function getGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 88) return 'S';
  if (score >= 75) return 'A';
  if (score >= 62) return 'B';
  if (score >= 48) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}

const getPlayerItems = (p: MatchPlayer) => [
  p.item_0,
  p.item_1,
  p.item_2,
  p.item_3,
  p.item_4,
  p.item_5,
];

/**
 * Real Post-Match Loss Forensic Analysis & Coach.
 * Analyzes telemetry strictly, never invents unparsed data, and produces distinct role scores.
 */
export function analyzeMatchLoss(
  match: MatchDetail,
  focusAccountId?: number | null,
  customRoleOverrides?: Record<DotaPosition, number>,
  forceTeamIsRadiant?: boolean
): MatchAutopsyResult {
  const players = match.players || [];
  const durationMins = Math.max(1, Math.round(match.duration / 60));
  const radiantWon = Boolean(match.radiant_win);

  // Target team determination
  let focusPlayer = players.find(
    (p) => focusAccountId && p.account_id === focusAccountId
  ) || null;

  let targetTeamIsRadiant = false;
  if (forceTeamIsRadiant !== undefined) {
    targetTeamIsRadiant = forceTeamIsRadiant;
    if (focusPlayer && isRadiant(focusPlayer.player_slot) !== targetTeamIsRadiant) {
      focusPlayer = null;
    }
  } else if (focusPlayer) {
    targetTeamIsRadiant = isRadiant(focusPlayer.player_slot);
  } else {
    targetTeamIsRadiant = !radiantWon;
    focusPlayer =
      players
        .filter((p) => isRadiant(p.player_slot) === targetTeamIsRadiant)
        .sort((a, b) => (b.net_worth || 0) - (a.net_worth || 0))[0] || null;
  }

  const isVictory = targetTeamIsRadiant === radiantWon;

  const teamPlayers = players.filter((p) => isRadiant(p.player_slot) === targetTeamIsRadiant);
  const enemyPlayers = players.filter((p) => isRadiant(p.player_slot) !== targetTeamIsRadiant);

  const teamKills = teamPlayers.reduce((acc, p) => acc + (p.kills || 0), 0);
  const enemyKills = enemyPlayers.reduce((acc, p) => acc + (p.kills || 0), 0);
  const teamHeroDmg = Math.max(1, teamPlayers.reduce((acc, p) => acc + (p.hero_damage || 0), 0));

  // Check if replay was parsed by OpenDota
  const hasParsedTelemetry = teamPlayers.some(
    (p) => p.obs_placed !== undefined || p.stuns !== undefined || (match.radiant_gold_adv && match.radiant_gold_adv.length > 0)
  );

  // Assign roles (Pos 1 to Pos 5)
  const posMap = assignPositions(teamPlayers, customRoleOverrides);
  const enemyPosMap = assignPositions(enemyPlayers);

  const findings: Finding[] = [];
  const recommendations: string[] = [];
  const executiveSummary: string[] = [];

  // --------------------------------------------------------------------------
  // 1. TIPPING POINT (¿Dónde se perdió la partida?)
  // --------------------------------------------------------------------------
  let tippingPoint: TippingPoint | null = null;
  const goldAdv = match.radiant_gold_adv || [];

  if (goldAdv.length > 3) {
    let maxSwing = 0;
    let swingMinute = 0;
    let leadingAdvBeforeSwing = 0;

    for (let i = 3; i < goldAdv.length; i++) {
      const startAdv = targetTeamIsRadiant ? goldAdv[i - 3] : -goldAdv[i - 3];
      const endAdv = targetTeamIsRadiant ? goldAdv[i] : -goldAdv[i];
      const drop = startAdv - endAdv;

      if (drop > maxSwing) {
        maxSwing = drop;
        swingMinute = i;
        leadingAdvBeforeSwing = startAdv;
      }
    }

    if (maxSwing >= 3000) {
      const severity = maxSwing >= 6000 ? 'critical' : maxSwing >= 4200 ? 'major' : 'moderate';
      const hadAdv = leadingAdvBeforeSwing > 800;

      let desc = '';
      if (hadAdv) {
        desc = `En el minuto ${swingMinute}:00 el equipo tenía +${Math.round(
          leadingAdvBeforeSwing
        ).toLocaleString()} de ventaja de oro. En solo 3 minutos se perdieron ${Math.round(
          maxSwing
        ).toLocaleString()} de oro tras una pelea catastrófica o pérdida de Roshan.`;
      } else {
        desc = `En el minuto ${swingMinute}:00 ocurrió el colapso: el rival sacó una ventaja de ${Math.round(
          maxSwing
        ).toLocaleString()} de oro en 3 minutos.`;
      }

      tippingPoint = {
        minute: swingMinute,
        goldSwing: Math.round(maxSwing),
        description: desc,
        severity,
      };

      findings.push({
        category: 'macro',
        severity: 'danger',
        title: `Punto de Inflexión Crítico (Minuto ${swingMinute}:00)`,
        description: desc,
        timestamp: `${swingMinute}:00`,
      });
    }
  }

  // --------------------------------------------------------------------------
  // 2. STATISTICAL EVALUATION BY ROLE (POS 1 TO POS 5)
  // --------------------------------------------------------------------------
  const roles: Record<DotaPosition, RoleEvaluation> = {} as any;

  const getKP = (p: MatchPlayer) =>
    teamKills > 0 ? Math.round(((p.kills + p.assists) / teamKills) * 100) : 0;

  // --- POSITION 1: CARRY ---
  const p1 = posMap.get(1);
  const enemyP1 = enemyPosMap.get(1);
  if (p1) {
    const csPerMin = Number((p1.last_hits / durationMins).toFixed(1));
    const items = getPlayerItems(p1);
    const hasBkb = items.includes(ITEM_IDS.BKB);
    const kp = getKP(p1);
    const kdaRatio = (p1.kills + p1.assists) / Math.max(1, p1.deaths);
    const dmgShare = Math.round((p1.hero_damage / teamHeroDmg) * 100);
    const mistakes: string[] = [];
    const strengths: string[] = [];

    // Distinct continuous score:
    // Farm (35%) + Combat & Damage (35%) + Survival (20%) + Objectives (10%)
    const farmScore = Math.min(100, Math.max(10, Math.round((csPerMin / 8.0) * 55 + (p1.gold_per_min / 600) * 45)));
    const combatScore = Math.min(100, Math.max(10, Math.round((dmgShare / 25) * 50 + (kdaRatio / 3.0) * 50)));
    const survivalScore = Math.min(100, Math.max(10, 100 - p1.deaths * 6));
    const objectiveScore = Math.min(100, Math.max(10, Math.round(((p1.tower_damage || 0) / 2500) * 100)));

    let score = Math.round(farmScore * 0.35 + combatScore * 0.35 + survivalScore * 0.20 + objectiveScore * 0.10);

    // Grounded Diagnostics based on REAL telemetry
    if (csPerMin < 4.5 && durationMins > 18) {
      mistakes.push(`Ritmo de farmeo muy deficiente: solo ${csPerMin} CS/min (${p1.last_hits} Last Hits en ${durationMins}m). Meta: 7.5+ CS/min.`);
      findings.push({
        category: 'farming',
        severity: 'danger',
        title: 'Pos 1 (Carry) con déficit severo de farmeo',
        description: `${p1.personaname || 'El Carry'} acumuló solo ${p1.last_hits} Last Hits (${csPerMin}/min). No pudo acelerar su net worth ni conseguir items mayores de daño.`,
        culpritHeroId: p1.hero_id,
        position: 1,
      });
      recommendations.push(
        'Pos 1 (Carry): Priorizar rutas de farmeo constantes (línea segura + campos neutrales cercanos) para mantener al menos 7.5 CS/min.'
      );
    } else if (csPerMin >= 7.0) {
      strengths.push(`Buen ritmo de farmeo: ${csPerMin} CS/min (${p1.last_hits} Last Hits).`);
    }

    if (p1.deaths >= 10) {
      mistakes.push(`Murió ${p1.deaths} veces, concediendo abundante oro de reinicio y tiempo muerto sin farmear.`);
      findings.push({
        category: 'fighting',
        severity: 'danger',
        title: 'Pos 1 (Carry) con exceso de muertes',
        description: `Un Carry con ${p1.deaths} muertes pierde el control de su escalado y deja a su equipo sin daño físico en peleas de mapa.`,
        culpritHeroId: p1.hero_id,
        position: 1,
      });
    } else if (p1.deaths <= 3 && durationMins >= 20) {
      strengths.push(`Excelente supervivencia: solo ${p1.deaths} muertes en ${durationMins} minutos.`);
    }

    if (!hasBkb && durationMins >= 28) {
      score = Math.max(15, score - 6);
      mistakes.push('No adquirió Black King Bar (BKB) a pesar de ser una partida de más de 28 minutos.');
      findings.push({
        category: 'items',
        severity: 'warning',
        title: 'Pos 1 (Carry) sin BKB en late game',
        description: 'En peleas de más de 28 minutos, la falta de inmunidad a hechizos deja al Carry vulnerable a aturdimientos y ráfagas mágicas.',
        culpritHeroId: p1.hero_id,
        position: 1,
      });
      recommendations.push(
        'Pos 1 (Carry): En partidas de late game contra control rival, sincronizar BKB antes del minuto 28.'
      );
    }

    if (p1.tower_damage === 0 && durationMins > 20) {
      mistakes.push('Causó 0 daño a torres enemigas en toda la partida.');
      findings.push({
        category: 'objectives',
        severity: 'warning',
        title: 'Pos 1 (Carry) sin impacto en demolición de torres',
        description: 'El carry principal no golpeó estructuras enemigas (0 daño a torres), desaprovechando ventanas de empuje tras ganar escaramuzas.',
        culpritHeroId: p1.hero_id,
        position: 1,
      });
    } else if ((p1.tower_damage || 0) >= 3000) {
      strengths.push(`Gran presión a estructuras: ${(p1.tower_damage || 0).toLocaleString()} de daño a torres.`);
    }

    if (enemyP1 && p1.net_worth < enemyP1.net_worth * 0.7) {
      mistakes.push(`Déficit neto frente al Carry rival (${(p1.net_worth / 1000).toFixed(1)}k vs ${(enemyP1.net_worth / 1000).toFixed(1)}k).`);
    }

    score = Math.max(15, Math.min(99, score));
    roles[1] = {
      position: 1,
      positionName: 'Hard Carry (HC / Pos 1)',
      heroId: p1.hero_id,
      playerName: p1.personaname || 'Carry (HC)',
      playerSlot: p1.player_slot,
      grade: getGrade(score),
      score,
      summary: mistakes.length > 0 ? mistakes[0] : 'Desempeño sólido en farmeo y daño sostenido.',
      metrics: [
        { label: 'CS / Min', value: csPerMin, benchmark: '7.5 - 10.0', status: csPerMin >= 7.0 ? 'good' : csPerMin >= 5.0 ? 'average' : 'poor' },
        { label: 'GPM', value: p1.gold_per_min, benchmark: '580+', status: p1.gold_per_min >= 580 ? 'good' : p1.gold_per_min >= 450 ? 'average' : 'poor' },
        { label: 'KDA', value: `${p1.kills}/${p1.deaths}/${p1.assists}`, benchmark: '3.0+', status: p1.deaths <= 5 ? 'good' : 'poor' },
        { label: 'Daño Torres', value: (p1.tower_damage || 0).toLocaleString(), benchmark: '3,000+', status: (p1.tower_damage || 0) >= 3000 ? 'good' : 'poor' },
      ],
      criticalMistakes: mistakes,
      keyStrengths: strengths,
    };
  }

  // --- POSITION 2: MIDLANER ---
  const p2 = posMap.get(2);
  const enemyP2 = enemyPosMap.get(2);
  if (p2) {
    const kp = getKP(p2);
    const kdaRatio = (p2.kills + p2.assists) / Math.max(1, p2.deaths);
    const dmgShare = Math.round((p2.hero_damage / teamHeroDmg) * 100);
    const csPerMin = Number((p2.last_hits / durationMins).toFixed(1));
    const mistakes: string[] = [];
    const strengths: string[] = [];

    // Distinct continuous score for Mid:
    // Tempo (35%) + Damage & Combat (35%) + Laning/Farm (20%) + Survival (10%)
    const tempoScore = Math.min(100, Math.max(10, Math.round((kp / 55) * 55 + (dmgShare / 25) * 45)));
    const combatScore = Math.min(100, Math.max(10, Math.round((kdaRatio / 3.0) * 60 + (p2.kills / (teamKills * 0.25 || 1)) * 40)));
    const laningScore = Math.min(100, Math.max(10, Math.round((csPerMin / 5.5) * 50 + (p2.gold_per_min / 450) * 50)));
    const survivalScore = Math.min(100, Math.max(10, 100 - p2.deaths * 7));

    let score = Math.round(tempoScore * 0.35 + combatScore * 0.35 + laningScore * 0.20 + survivalScore * 0.10);

    if (p2.deaths <= 6 && durationMins > 20) {
      strengths.push(`Posicionamiento disciplinado: solo ${p2.deaths} muertes en ${durationMins} minutos.`);
    } else if (p2.deaths >= 10) {
      mistakes.push(`Acumuló ${p2.deaths} muertes entregando valiosa experiencia de mid al enemigo.`);
      findings.push({
        category: 'fighting',
        severity: 'danger',
        title: 'Pos 2 (Midlaner) con muertes reiteradas',
        description: `Las muertes consecutivas en el mid frenan el tempo y permiten al rival controlar las runas de río.`,
        culpritHeroId: p2.hero_id,
        position: 2,
      });
    }

    if (p2.denies >= 12) {
      strengths.push(`Excelente control de oleada en línea con ${p2.denies} denies.`);
    }

    if (kp < 40 && durationMins > 20) {
      mistakes.push(`Baja presencia en peleas grupales: solo ${kp}% de Kill Participation.`);
      findings.push({
        category: 'fighting',
        severity: 'warning',
        title: 'Pos 2 (Midlaner) con bajo impacto en rotaciones',
        description: `Una participación de ${kp}% en bajas indica pocas rotaciones a las líneas laterales durante el juego temprano y medio.`,
        culpritHeroId: p2.hero_id,
        position: 2,
      });
      recommendations.push(
        'Pos 2 (Mid): Buscar runas activas de río para gankear la línea difícil o segura del rival y crear espacio.'
      );
    } else if (kp >= 55) {
      strengths.push(`Participación activa en combate: ${kp}% de Kill Participation.`);
    }

    if (enemyP2 && p2.net_worth < enemyP2.net_worth * 0.75) {
      mistakes.push(`Desventaja de valor neto frente al Mid rival (${(p2.net_worth / 1000).toFixed(1)}k vs ${(enemyP2.net_worth / 1000).toFixed(1)}k).`);
    }

    score = Math.max(15, Math.min(99, score));
    roles[2] = {
      position: 2,
      positionName: 'Midlaner (Medio / Pos 2)',
      heroId: p2.hero_id,
      playerName: p2.personaname || 'Midlaner',
      playerSlot: p2.player_slot,
      grade: getGrade(score),
      score,
      summary: mistakes.length > 0 ? mistakes[0] : 'Control de carril central y rotaciones consistentes.',
      metrics: [
        { label: 'Participación', value: `${kp}%`, benchmark: '50%+', status: kp >= 50 ? 'good' : kp >= 38 ? 'average' : 'poor' },
        { label: 'Daño Héroe', value: (p2.hero_damage || 0).toLocaleString(), benchmark: '16,000+', status: (p2.hero_damage || 0) >= 16000 ? 'good' : 'poor' },
        { label: 'Denies Línea', value: p2.denies, benchmark: '10+', status: p2.denies >= 10 ? 'good' : 'average' },
        { label: 'KDA', value: `${p2.kills}/${p2.deaths}/${p2.assists}`, benchmark: '3.0+', status: p2.deaths <= 6 ? 'good' : 'poor' },
      ],
      criticalMistakes: mistakes,
      keyStrengths: strengths,
    };
  }

  // --- POSITION 3: OFFLANER ---
  const p3 = posMap.get(3);
  if (p3) {
    const items = getPlayerItems(p3);
    const hasAura = items.some((it) => OFF_AURA_ITEMS.has(it));
    const hasInitiation = items.includes(ITEM_IDS.BLINK) || items.includes(ITEM_IDS.FORCE_STAFF);
    const kp = getKP(p3);
    const kdaRatio = (p3.kills + p3.assists) / Math.max(1, p3.deaths);
    const mistakes: string[] = [];
    const strengths: string[] = [];

    // Distinct continuous score for Offlane:
    // Initiation/Auras (40%) + Combat Impact (35%) + Pressure & Tower Dmg (15%) + Deaths (10%)
    const initScore = (hasAura ? 50 : 20) + (hasInitiation ? 50 : 20);
    const combatScore = Math.min(100, Math.max(10, Math.round((kp / 50) * 55 + (kdaRatio / 2.5) * 45)));
    const pressureScore = Math.min(100, Math.max(10, Math.round(((p3.tower_damage || 0) / 1500) * 50 + (p3.hero_damage / (teamHeroDmg * 0.22)) * 50)));
    const deathScore = Math.min(100, Math.max(10, 100 - p3.deaths * 6));

    let score = Math.round(initScore * 0.40 + combatScore * 0.35 + pressureScore * 0.15 + deathScore * 0.10);

    if (hasAura && hasInitiation) {
      strengths.push('Excelente selección de items: combinó iniciación (Blink) con mitigación de equipo.');
    } else if (!hasAura && !hasInitiation && durationMins > 24) {
      mistakes.push('No armó auras de mitigación (Pipe/Crimson/Greaves) ni herramientas de iniciación (Blink).');
      findings.push({
        category: 'items',
        severity: 'danger',
        title: 'Pos 3 (Offlaner) sin auras ni iniciación',
        description: 'El Offlaner armó items individuales en lugar de items defensivos de equipo para sostener peleas 5v5.',
        culpritHeroId: p3.hero_id,
        position: 3,
      });
      recommendations.push(
        'Pos 3 (Offlaner): Priorizar al menos un item de aura (Crimson Guard contra daño físico, Pipe contra magia) o Blink Dagger.'
      );
    }

    if (p3.deaths >= 11) {
      mistakes.push(`Murió ${p3.deaths} veces, sobreextendiéndose sin suficiente respaldo de su equipo.`);
    }

    if ((p3.tower_damage || 0) >= 1000) {
      strengths.push(`Aportó presión directa a torres: ${(p3.tower_damage || 0).toLocaleString()} de daño a estructuras.`);
    }

    score = Math.max(15, Math.min(99, score));
    roles[3] = {
      position: 3,
      positionName: 'Offlaner (Lateral / Pos 3)',
      heroId: p3.hero_id,
      playerName: p3.personaname || 'Offlaner (Lateral)',
      playerSlot: p3.player_slot,
      grade: getGrade(score),
      score,
      summary: mistakes.length > 0 ? mistakes[0] : 'Frontline sólida e iniciaciones oportunas.',
      metrics: [
        { label: 'Participación', value: `${kp}%`, benchmark: '50%+', status: kp >= 50 ? 'good' : 'poor' },
        { label: 'Daño Héroe', value: (p3.hero_damage || 0).toLocaleString(), benchmark: '14,000+', status: (p3.hero_damage || 0) >= 14000 ? 'good' : 'average' },
        { label: 'Auras / Blink', value: hasAura && hasInitiation ? 'Ambos' : hasAura || hasInitiation ? 'Sí' : 'No', benchmark: 'Requerido', status: hasAura || hasInitiation ? 'good' : 'poor' },
        { label: 'Daño Torres', value: (p3.tower_damage || 0).toLocaleString(), benchmark: '1,000+', status: (p3.tower_damage || 0) >= 1000 ? 'good' : 'average' },
      ],
      criticalMistakes: mistakes,
      keyStrengths: strengths,
    };
  }

  // --- POSITION 4: SOFT SUPPORT (ROAMER) ---
  const p4 = posMap.get(4);
  if (p4) {
    const kp = getKP(p4);
    const items = getPlayerItems(p4);
    const hasUtility = items.some((it) => DEFENSIVE_SAVE_ITEMS.has(it) || it === ITEM_IDS.BLINK || it === ITEM_IDS.SPIRIT_VESSEL);
    const kdaRatio = (p4.kills + p4.assists) / Math.max(1, p4.deaths);
    const dmgShare = Math.round((p4.hero_damage / teamHeroDmg) * 100);
    const mistakes: string[] = [];
    const strengths: string[] = [];

    // Distinct continuous score for Pos 4:
    // Combat presence (40%) + Damage/Disables (35%) + Item utility (15%) + Deaths (10%)
    const combatScore = Math.min(100, Math.max(10, Math.round((kp / 55) * 55 + (kdaRatio / 2.5) * 45)));
    const damageScore = Math.min(100, Math.max(10, Math.round((dmgShare / 20) * 60 + (p4.assists / Math.max(8, teamKills * 0.35)) * 40)));
    const utilScore = hasUtility ? 90 : 45;
    const deathScore = Math.min(100, Math.max(10, 100 - p4.deaths * 6));

    let score = Math.round(combatScore * 0.40 + damageScore * 0.35 + utilScore * 0.15 + deathScore * 0.10);

    if (dmgShare >= 25) {
      strengths.push(`Gran aporte de daño ofensivo: causó el ${dmgShare}% del daño total del equipo.`);
    }

    if (p4.deaths >= 10) {
      mistakes.push(`Murió ${p4.deaths} veces, siendo eliminado al inicio de las peleas.`);
    } else if (p4.deaths <= 5) {
      strengths.push(`Buen posicionamiento defensivo: solo ${p4.deaths} muertes.`);
    }

    if (kp < 40 && durationMins > 20) {
      mistakes.push(`Baja presencia en escaramuzas (${kp}% de Kill Participation).`);
    }

    score = Math.max(15, Math.min(99, score));
    roles[4] = {
      position: 4,
      positionName: 'Soft Support (Soporte 4)',
      heroId: p4.hero_id,
      playerName: p4.personaname || 'Support 4',
      playerSlot: p4.player_slot,
      grade: getGrade(score),
      score,
      summary: mistakes.length > 0 ? mistakes[0] : 'Buen impacto de combate y soporte ofensivo.',
      metrics: [
        { label: 'Participación', value: `${kp}%`, benchmark: '50%+', status: kp >= 50 ? 'good' : 'poor' },
        { label: 'Daño Héroe', value: (p4.hero_damage || 0).toLocaleString(), benchmark: '12,000+', status: (p4.hero_damage || 0) >= 12000 ? 'good' : 'average' },
        { label: 'Asistencias', value: p4.assists, benchmark: '12+', status: p4.assists >= 12 ? 'good' : 'average' },
        { label: 'Item Utilidad', value: hasUtility ? 'Sí' : 'No', benchmark: 'Requerido', status: hasUtility ? 'good' : 'poor' },
      ],
      criticalMistakes: mistakes,
      keyStrengths: strengths,
    };
  }

  // --- POSITION 5: HARD SUPPORT ---
  const p5 = posMap.get(5);
  if (p5) {
    const items = getPlayerItems(p5);
    const hasSaveItem = items.some((it) => DEFENSIVE_SAVE_ITEMS.has(it));
    const kp = getKP(p5);
    const kdaRatio = (p5.kills + p5.assists) / Math.max(1, p5.deaths);
    const mistakes: string[] = [];
    const strengths: string[] = [];

    // Check if vision telemetry exists
    const hasObsData = p5.obs_placed !== undefined;
    const obs = p5.obs_placed || 0;
    const sen = p5.sen_placed || 0;
    const expectedPos5Obs = Math.max(6, Math.round((durationMins / 40) * 12));

    // Continuous score:
    // If vision exists: Vision (40%) + Saves (30%) + Assist/Combat (20%) + Survival (10%)
    // If vision unparsed: Saves & Itemization (45%) + Assist/Combat (35%) + Survival (20%)
    let score = 60;
    if (hasObsData) {
      const visionScore = Math.min(100, Math.max(15, Math.round((obs / expectedPos5Obs) * 65 + (sen / 8) * 35)));
      const saveScore = hasSaveItem ? 90 : 40;
      const combatScore = Math.min(100, Math.max(15, Math.round((kp / 45) * 60 + (kdaRatio / 2.0) * 40)));
      const deathScore = Math.min(100, Math.max(10, 100 - p5.deaths * 5.5));
      score = Math.round(visionScore * 0.40 + saveScore * 0.30 + combatScore * 0.20 + deathScore * 0.10);

      if (obs < expectedPos5Obs && durationMins > 20) {
        mistakes.push(`Colocó solo ${obs} Observer Wards (esperado mínimo: ${expectedPos5Obs}).`);
        findings.push({
          category: 'vision',
          severity: 'danger',
          title: 'Pos 5 (Hard Support) con baja colocación de visión',
          description: `El soporte 5 debe adquirir Observers continuamente sin dejar acumular stock en la tienda. En esta partida solo colocó ${obs} wards en ${durationMins} minutos.`,
          culpritHeroId: p5.hero_id,
          position: 5,
        });
      } else if (obs >= expectedPos5Obs) {
        strengths.push(`Excelente cobertura de visión con ${obs} Observers y ${sen} Sentries.`);
      }
    } else {
      // Unparsed replay: evaluate strictly on available items, assists, and deaths
      const saveScore = hasSaveItem ? 88 : 45;
      const combatScore = Math.min(100, Math.max(15, Math.round((kp / 45) * 60 + (kdaRatio / 2.0) * 40)));
      const deathScore = Math.min(100, Math.max(10, 100 - p5.deaths * 5.5));
      score = Math.round(saveScore * 0.45 + combatScore * 0.35 + deathScore * 0.20);
    }

    if (hasSaveItem) {
      strengths.push('Adquirió items defensivos clave (Force Staff / Glimmer Cape) para proteger a sus cores.');
    } else if (durationMins > 25) {
      mistakes.push('No compró items de rescate (Force Staff, Glimmer Cape ni Ghost Scepter).');
      findings.push({
        category: 'items',
        severity: 'warning',
        title: 'Pos 5 (Hard Support) sin herramientas de salvación',
        description: 'La ausencia de Force Staff o Glimmer Cape impidió reposicionar a los cores cuando fueron atrapados en iniciaciones enemigas.',
        culpritHeroId: p5.hero_id,
        position: 5,
      });
      recommendations.push(
        'Pos 5 (Hard Support): Adquirir al menos un item de rescate (Force Staff o Glimmer Cape) antes del minuto 25.'
      );
    }

    if (p5.deaths >= 12) {
      mistakes.push(`Murió ${p5.deaths} veces, siendo blanco fácil de emboscadas enemigas.`);
      findings.push({
        category: 'fighting',
        severity: 'warning',
        title: 'Pos 5 (Hard Support) cazado reiteradamente',
        description: `${p5.deaths} muertes en un soporte de posición 5 indican falta de posicionamiento en la retaguardia de las peleas.`,
        culpritHeroId: p5.hero_id,
        position: 5,
      });
    }

    score = Math.max(15, Math.min(99, score));
    roles[5] = {
      position: 5,
      positionName: 'Hard Support (Soporte 5)',
      heroId: p5.hero_id,
      playerName: p5.personaname || 'Support 5',
      playerSlot: p5.player_slot,
      grade: getGrade(score),
      score,
      summary: mistakes.length > 0 ? mistakes[0] : 'Protección de cores y soporte efectivo.',
      metrics: [
        { label: 'Participación', value: `${kp}%`, benchmark: '45%+', status: kp >= 45 ? 'good' : 'poor' },
        { label: 'Asistencias', value: p5.assists, benchmark: '14+', status: p5.assists >= 14 ? 'good' : 'average' },
        { label: 'Item Salvación', value: hasSaveItem ? 'Sí' : 'No', benchmark: 'Requerido', status: hasSaveItem ? 'good' : 'poor' },
        { label: 'Muertes', value: p5.deaths, benchmark: '< 8', status: p5.deaths <= 7 ? 'good' : 'poor' },
      ],
      criticalMistakes: mistakes,
      keyStrengths: strengths,
    };
  }

  // --------------------------------------------------------------------------
  // 3. TEAM-WIDE MACRO & STRUCTURAL FINDINGS (Strict real checks)
  // --------------------------------------------------------------------------
  const totalDenies = teamPlayers.reduce((acc, p) => acc + (p.denies || 0), 0);
  if (totalDenies < 8 && durationMins > 15) {
    findings.push({
      category: 'laning',
      severity: 'warning',
      title: 'Líneas descontroladas (Pocos Denies en fase de líneas)',
      description: `El equipo solo sumó ${totalDenies} denies en conjunto. Sin control de la oleada, los creeps quedaron empujados bajo torre enemiga.`,
    });
    recommendations.push(
      'Fase de líneas: Denegar creeps bajo el 50% de vida y hacer pulls a campamentos para mantener la oleada cerca de la propia torre.'
    );
  }

  const teamTowerDmg = teamPlayers.reduce((acc, p) => acc + (p.tower_damage || 0), 0);
  const enemyTowerDmg = enemyPlayers.reduce((acc, p) => acc + (p.tower_damage || 0), 0);
  if (teamTowerDmg < 2500 && durationMins > 25) {
    findings.push({
      category: 'objectives',
      severity: 'danger',
      title: 'Bajo daño a estructuras (No se transformaron bajas en torres)',
      description: `Solo se provocaron ${teamTowerDmg.toLocaleString()} de daño a torres enemigas (contra ${enemyTowerDmg.toLocaleString()} del rival). El equipo ganó peleas pero no presionó edificaciones.`,
    });
    recommendations.push(
      'Objetivos: Cada vez que consigan 2 o más bajas clave, empujar la línea más próxima y destruir la torre antes de volver a dispersarse.'
    );
  }

  // Vision Blackout Check - ONLY IF PARSED TELEMETRY EXISTS!
  if (hasParsedTelemetry) {
    const allObsLogs = teamPlayers
      .flatMap((p) => p.obs_log || [])
      .map((w) => w.time)
      .sort((a, b) => a - b);

    if (allObsLogs.length > 1) {
      let maxGap = 0;
      let gapStart = 0;
      for (let i = 1; i < allObsLogs.length; i++) {
        const gap = allObsLogs[i] - allObsLogs[i - 1];
        if (gap > maxGap) {
          maxGap = gap;
          gapStart = allObsLogs[i - 1];
        }
      }
      if (maxGap >= 450) {
        const minStart = Math.round(gapStart / 60);
        findings.push({
          category: 'vision',
          severity: 'danger',
          title: `Apagón de visión prolongado (Minuto ${minStart}:00)`,
          description: `Durante ${Math.round(maxGap / 60)} minutos seguidos no se plantó ningún Observer Ward. El equipo operó a oscuras facilitando la emboscada enemiga.`,
          timestamp: `${minStart}:00`,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. EXECUTIVE SUMMARY & GROUNDED RECOMMENDATIONS
  // --------------------------------------------------------------------------
  if (findings.some((f) => f.category === 'macro')) {
    executiveSummary.push(
      `Punto de quiebre crítico en el minuto ${tippingPoint?.minute || 25}: caída repentina de ventaja económica tras una pelea desastrosa.`
    );
  }
  if (findings.some((f) => f.position === 1 && f.severity === 'danger')) {
    executiveSummary.push(
      'El Carry (Pos 1) quedó descapitalizado en farm o sufrió un exceso de muertes que impidió liderar peleas en late game.'
    );
  }
  if (findings.some((f) => f.position === 2 && f.severity === 'danger')) {
    executiveSummary.push(
      'El Midlaner (Pos 2) no logró imponer tempo ni rotaciones tempranas para crear espacio a sus líneas laterales.'
    );
  }
  if (findings.some((f) => f.position === 3 && f.severity === 'danger')) {
    executiveSummary.push(
      'El Offlaner (Pos 3) construyó items individuales en lugar de auras defensivas (Pipe/Crimson) o iniciación (Blink).'
    );
  }
  if (findings.some((f) => (f.position === 4 || f.position === 5) && f.severity === 'danger')) {
    executiveSummary.push(
      'Los Soportes sufrieron déficit de visión en el mapa o carecieron de items de salvación para rescatar a sus cores.'
    );
  }

  if (executiveSummary.length === 0) {
    if (isVictory) {
      executiveSummary.push('Buen desempeño colectivo; la ejecución táctica en peleas y toma de objetivos aseguró la victoria.');
    } else {
      executiveSummary.push('La partida fue disputada; el daño en peleas de equipo y la falta de presión a torres enemigas definieron el resultado.');
    }
  }

  const uniqueRecommendations = Array.from(new Set(recommendations));

  // --------------------------------------------------------------------------
  // 5. CALCULATE TEAM SCORES
  // --------------------------------------------------------------------------
  const laningScore = Math.round(((roles[1]?.score || 60) * 0.4 + (roles[2]?.score || 60) * 0.4 + (roles[5]?.score || 60) * 0.2));
  const visionScore = hasParsedTelemetry ? (roles[5]?.score ? Math.round(roles[5].score * 0.7 + (roles[4]?.score || 60) * 0.3) : 55) : null;
  const economyScore = Math.round(((roles[1]?.score || 60) * 0.6 + (roles[2]?.score || 60) * 0.4));
  const teamfightScore = Math.round(((roles[3]?.score || 60) * 0.35 + (roles[4]?.score || 60) * 0.35 + (roles[2]?.score || 60) * 0.3));
  const objectivesScore = Math.min(100, Math.max(15, Math.round((teamTowerDmg / Math.max(5000, enemyTowerDmg)) * 100)));

  const overall = Math.round(
    laningScore * 0.25 + (visionScore ? visionScore * 0.15 : 10) + economyScore * 0.25 + teamfightScore * 0.25 + objectivesScore * 0.15
  );

  return {
    isVictory,
    targetPlayer: focusPlayer,
    targetTeamIsRadiant,
    hasParsedTelemetry,
    tippingPoint,
    executiveSummary,
    roles,
    findings,
    recommendations: uniqueRecommendations,
    teamScores: {
      laning: laningScore,
      vision: visionScore,
      economy: economyScore,
      teamfight: teamfightScore,
      objectives: objectivesScore,
      overall,
    },
  };
}
