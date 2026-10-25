/**
 * DotaScope application-level constants and asset helper utilities.
 */

export const OPENDOTA_CDN = 'https://cdn.cloudflare.steamstatic.com';

/**
 * Standard rank medal names ordered from tier 1 (Herald) to tier 8 (Immortal).
 */
export const RANK_NAMES = [
  'Herald',
  'Guardian',
  'Crusader',
  'Archon',
  'Legend',
  'Ancient',
  'Divine',
  'Immortal',
] as const;

export type RankName = (typeof RANK_NAMES)[number];

/**
 * Color palette for Dota 2 ranks.
 */
export const RANK_COLORS: Record<number, string> = {
  1: '#9e9e9e', // Herald: Grey
  2: '#a07d57', // Guardian: Bronze
  3: '#5e94b2', // Crusader: Teal/Silver
  4: '#81b570', // Archon: Green
  5: '#d1a84f', // Legend: Gold
  6: '#b371b2', // Ancient: Purple
  7: '#e5b741', // Divine: Amber
  8: '#e65842', // Immortal: Red
};

/**
 * Match outcome and faction color constants.
 */
export const WIN_COLOR = '#22c55e'; // Green
export const LOSS_COLOR = '#ef4444'; // Red
export const RADIANT_COLOR = '#4ade80'; // Radiant faction green
export const DIRE_COLOR = '#f87171'; // Dire faction red

/**
 * Dota 2 primary attribute colors.
 */
export const ATTRIBUTE_COLORS: Record<string, string> = {
  str: '#ec3d06', // Strength (Red)
  agi: '#26e030', // Agility (Green)
  int: '#00d9ff', // Intelligence (Blue)
  all: '#dfdfdf', // Universal (Prismatic/Silver)
};

/**
 * Common Dota 2 game modes.
 */
export const GAME_MODES: Record<number, string> = {
  0: 'Unknown',
  1: 'All Pick',
  2: "Captains Mode",
  3: 'Random Draft',
  4: 'Single Draft',
  5: 'All Random',
  6: 'Intro',
  7: 'Diretide',
  8: 'Reverse Captains Mode',
  9: 'The Greeviling',
  10: 'Tutorial',
  11: 'Mid Only',
  12: 'Least Played',
  13: 'Limited Heroes',
  14: 'Compendium Matchmaking',
  15: 'Custom',
  16: 'Captains Draft',
  17: 'Balanced Draft',
  18: 'Ability Draft',
  19: 'Event',
  20: 'All Random Deathmatch',
  21: '1v1 Solo Mid',
  22: 'Ranked All Pick',
  23: 'Turbo',
  24: 'Mutation',
};

/**
 * Common Dota 2 lobby types.
 */
export const LOBBY_TYPES: Record<number, string> = {
  0: 'Normal',
  1: 'Practice',
  2: 'Tournament',
  3: 'Tutorial',
  4: 'Co-op Bots',
  5: 'Team Match',
  6: 'Solo Queue',
  7: 'Ranked',
  8: '1v1 Solo Mid',
  9: 'Battle Cup',
  12: 'Battle Cup',
};

/**
 * Common Dota 2 lane roles.
 */
export const LANE_ROLES: Record<number, string> = {
  1: 'Safe Lane',
  2: 'Mid Lane',
  3: 'Off Lane',
  4: 'Jungle',
};

/**
 * Constructs a full image URL for hero portraits.
 * Handles absolute URLs, protocol-relative URLs, and relative CDN paths.
 */
export function getHeroImageUrl(heroImg?: string | null): string {
  if (!heroImg) {
    return '';
  }

  if (heroImg.startsWith('http://') || heroImg.startsWith('https://')) {
    return heroImg;
  }

  if (heroImg.startsWith('//')) {
    return `https:${heroImg}`;
  }

  const cleanPath = heroImg.startsWith('/') ? heroImg : `/${heroImg}`;
  return `${OPENDOTA_CDN}${cleanPath}`;
}

/**
 * Constructs a full image URL for item icons.
 * Handles absolute URLs, protocol-relative URLs, and relative CDN paths.
 */
export function getItemImageUrl(itemImg?: string | null): string {
  if (!itemImg) {
    return '';
  }

  if (itemImg.startsWith('http://') || itemImg.startsWith('https://')) {
    return itemImg;
  }

  if (itemImg.startsWith('//')) {
    return `https:${itemImg}`;
  }

  const cleanPath = itemImg.startsWith('/') ? itemImg : `/${itemImg}`;
  return `${OPENDOTA_CDN}${cleanPath}`;
}
