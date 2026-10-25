/**
 * Formatting and game calculation utilities for DotaScope.
 */

import { GAME_MODES, LANE_ROLES, LOBBY_TYPES, RANK_NAMES } from './constants';

/**
 * Formats match duration in seconds to "MM:SS" or "H:MM:SS".
 * Example: 2535 -> "42:15", 3725 -> "1:02:05"
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const paddedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, '0');
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}

/**
 * Formats a UNIX timestamp (seconds or milliseconds) into relative time.
 * Example: "just now", "45 minutes ago", "2 hours ago", "3 days ago", "1 month ago"
 */
export function formatTimeAgo(timestamp: number): string {
  if (!timestamp || Number.isNaN(timestamp)) {
    return 'Unknown';
  }

  // OpenDota match start_time is in seconds; check if < 10^11 to convert to ms
  const ms = timestamp < 1e11 ? timestamp * 1000 : timestamp;
  const elapsedSeconds = Math.floor((Date.now() - ms) / 1000);

  if (elapsedSeconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Formats kills, deaths, and assists as a slash-delimited string.
 * Example: formatKDA(12, 3, 8) -> "12/3/8"
 */
export function formatKDA(
  kills: number = 0,
  deaths: number = 0,
  assists: number = 0
): string {
  const k = Number.isFinite(kills) ? kills : 0;
  const d = Number.isFinite(deaths) ? deaths : 0;
  const a = Number.isFinite(assists) ? assists : 0;
  return `${k}/${d}/${a}`;
}

/**
 * Calculates Kill-Death-Assist ratio.
 * Formula: (kills + assists) / max(deaths, 1) rounded to 2 decimal places.
 */
export function calculateKDA(
  kills: number = 0,
  deaths: number = 0,
  assists: number = 0
): number {
  const k = Number.isFinite(kills) ? kills : 0;
  const d = Math.max(Number.isFinite(deaths) ? deaths : 0, 1);
  const a = Number.isFinite(assists) ? assists : 0;
  return Number(((k + a) / d).toFixed(2));
}

/**
 * Converts a Dota 2 rank tier number into human-readable medal and stars.
 * Example: 63 -> "Ancient 3", 80 -> "Immortal", null/0 -> "Unranked"
 */
export function getRankName(rankTier?: number | null): string {
  if (!rankTier || rankTier <= 0) {
    return 'Unranked';
  }

  const tier = Math.floor(rankTier / 10);
  const stars = rankTier % 10;

  if (tier >= 8) {
    return 'Immortal';
  }

  const medalName = RANK_NAMES[tier - 1];
  if (!medalName) {
    return 'Unknown';
  }

  return stars > 0 ? `${medalName} ${stars}` : medalName;
}

/**
 * Returns human-readable game mode name.
 * Example: 22 -> "Ranked All Pick", 23 -> "Turbo"
 */
export function getGameModeName(gameMode: number): string {
  return GAME_MODES[gameMode] || `Game Mode ${gameMode}`;
}

/**
 * Returns human-readable lobby type name.
 * Example: 7 -> "Ranked", 0 -> "Normal"
 */
export function getLobbyTypeName(lobbyType: number): string {
  return LOBBY_TYPES[lobbyType] || `Lobby ${lobbyType}`;
}

/**
 * Returns human-readable lane role name.
 * Example: 1 -> "Safe Lane", 2 -> "Mid Lane", 3 -> "Off Lane", 4 -> "Jungle"
 */
export function getLaneRoleName(laneRole: number): string {
  return LANE_ROLES[laneRole] || 'Unknown';
}

/**
 * Determines whether a player slot belongs to Radiant.
 * Radiant slots: 0-4 (player_slot < 128)
 * Dire slots: 128-132 (player_slot >= 128)
 */
export function isRadiant(playerSlot: number): boolean {
  return (playerSlot & 128) === 0;
}

/**
 * Determines whether the player won the match.
 * Compares the player's team against match radiant_win.
 */
export function didWin(playerSlot: number, radiantWin: boolean): boolean {
  return isRadiant(playerSlot) === Boolean(radiantWin);
}
