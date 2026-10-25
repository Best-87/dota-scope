/**
 * Steam ID conversion and parsing utilities.
 *
 * Valve uses 64-bit SteamIDs (SteamID64) for Community profiles,
 * and 32-bit Account IDs for Dota 2 player IDs.
 */

export const STEAM64_BASE = 76561197960265728n;

/**
 * Converts a 64-bit Steam ID to a 32-bit Dota 2 Account ID.
 * If the input is already a 32-bit ID or cannot be parsed as BigInt, it is returned as is.
 */
export function toAccountId(steam64: string): string {
  if (!steam64) return '';
  const trimmed = steam64.trim();

  try {
    const val = BigInt(trimmed);
    if (val < STEAM64_BASE) {
      return val.toString();
    }
    return (val - STEAM64_BASE).toString();
  } catch {
    return trimmed;
  }
}

/**
 * Converts a 32-bit Dota 2 Account ID to a 64-bit Steam ID.
 * If the input is already a 64-bit Steam ID or cannot be parsed as BigInt, it is returned as is.
 */
export function toSteam64(accountId: string): string {
  if (!accountId) return '';
  const trimmed = accountId.trim();

  try {
    const val = BigInt(trimmed);
    if (val >= STEAM64_BASE) {
      return val.toString();
    }
    return (val + STEAM64_BASE).toString();
  } catch {
    return trimmed;
  }
}

/**
 * Smart parser that extracts a 32-bit Dota 2 Account ID or vanity name from various inputs:
 * - Direct 32-bit Account ID (e.g., "86745912")
 * - 64-bit Steam ID (e.g., "76561198047011640")
 * - Dotabuff URL (e.g., "https://www.dotabuff.com/players/86745912")
 * - OpenDota URL (e.g., "https://www.opendota.com/players/86745912")
 * - Stratz URL (e.g., "https://stratz.com/players/86745912")
 * - Steam Community Profile URL (e.g., "https://steamcommunity.com/profiles/76561198047011640")
 * - Steam Community Vanity URL (e.g., "https://steamcommunity.com/id/arteezy")
 * - Steam3 format (e.g., "[U:1:86745912]" or "U:1:86745912")
 */
export function parsePlayerId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // Match Dotabuff / OpenDota / Stratz player URLs
  const trackerMatch = trimmed.match(
    /(?:dotabuff\.com|opendota\.com|stratz\.com)\/players\/(\d+)/i
  );
  if (trackerMatch) {
    return trackerMatch[1];
  }

  // Match Steam community profile URL by Steam64
  const steamProfilesMatch = trimmed.match(
    /steamcommunity\.com\/profiles\/(\d+)/i
  );
  if (steamProfilesMatch) {
    return toAccountId(steamProfilesMatch[1]);
  }

  // Match Steam community custom vanity URL
  const steamVanityMatch = trimmed.match(
    /steamcommunity\.com\/id\/([^/?#]+)/i
  );
  if (steamVanityMatch) {
    return steamVanityMatch[1];
  }

  // Match Steam3 ID: [U:1:12345678] or U:1:12345678
  const steam3Match = trimmed.match(/\[?U:1:(\d+)\]?/i);
  if (steam3Match) {
    return steam3Match[1];
  }

  // Match pure digits: determine if 64-bit SteamID or 32-bit Account ID
  if (/^\d+$/.test(trimmed)) {
    try {
      const val = BigInt(trimmed);
      if (val >= STEAM64_BASE) {
        return (val - STEAM64_BASE).toString();
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}
