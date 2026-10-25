import type {
  HeroConstant,
  HeroRanking,
  HeroStats,
  ItemConstant,
  MatchDetail,
  MatchQueryParams,
  ParseResponse,
  Player,
  PlayerCount,
  PlayerTotal,
  RecentMatch,
  SearchResult,
  WardMap,
  WinLoss,
} from './types';

const BASE_URL = 'https://api.opendota.com/api';
const DEFAULT_REQUEST_INTERVAL_MS = 1000;
const MAX_RETRIES = 3;

/**
 * Custom error class for OpenDota API errors.
 */
export class OpenDotaApiError extends Error {
  public status: number;
  public statusText: string;
  public url: string;
  public data?: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    url: string,
    data?: unknown
  ) {
    super(message);
    this.name = 'OpenDotaApiError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.data = data;
    Object.setPrototypeOf(this, OpenDotaApiError.prototype);
  }
}

/**
 * Request queue to rate limit API calls to max 1 per second.
 */
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly intervalMs: number;

  constructor(intervalMs: number = DEFAULT_REQUEST_INTERVAL_MS) {
    this.intervalMs = intervalMs;
  }

  public enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.intervalMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.intervalMs - elapsed)
        );
      }
      this.lastRequestTime = Date.now();

      try {
        await task();
      } catch {
        // Individual task errors are handled via reject() in enqueue
      }
    }

    this.isProcessing = false;
  }
}

const requestQueue = new RequestQueue(DEFAULT_REQUEST_INTERVAL_MS);

/**
 * Serializes query parameters into a query string.
 */
function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/**
 * Internal fetch wrapper with rate limiting queue, 429 retry handling, and error typing.
 */
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  attempt: number = 0
): Promise<T> {
  return requestQueue.enqueue(async () => {
    let response: Response;

    try {
      response = await fetch(url, options);
    } catch (networkError) {
      throw new OpenDotaApiError(
        networkError instanceof Error
          ? networkError.message
          : 'Network request failed',
        0,
        'NetworkError',
        url
      );
    }

    // Handle 429 Rate Limiting
    if (response.status === 429) {
      if (attempt < MAX_RETRIES) {
        let waitMs = Math.pow(2, attempt + 1) * 1000;
        const retryAfterHeader = response.headers.get('Retry-After');
        if (retryAfterHeader) {
          const parsedSeconds = parseInt(retryAfterHeader, 10);
          if (!Number.isNaN(parsedSeconds) && parsedSeconds > 0) {
            waitMs = parsedSeconds * 1000;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return fetchWithRetry<T>(url, options, attempt + 1);
      }
      throw new OpenDotaApiError(
        'Rate limit exceeded (429 Too Many Requests). Please try again shortly.',
        429,
        'Too Many Requests',
        url
      );
    }

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        try {
          errorBody = await response.text();
        } catch {
          errorBody = null;
        }
      }

      const message =
        typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody
          ? String((errorBody as { error: unknown }).error)
          : `OpenDota API request failed with status ${response.status}: ${response.statusText}`;

      throw new OpenDotaApiError(
        message,
        response.status,
        response.statusText,
        url,
        errorBody
      );
    }

    const data = (await response.json()) as T;
    return data;
  });
}

// In-memory caches for static constant data
let heroConstantsCache: Record<number, HeroConstant> | null = null;
let itemConstantsCache: Record<string, ItemConstant> | null = null;

/**
 * Searches for players by persona name or vanity query.
 */
export async function searchPlayers(query: string): Promise<SearchResult[]> {
  const qs = buildQueryString({ q: query });
  return fetchWithRetry<SearchResult[]>(`${BASE_URL}/search${qs}`);
}

/**
 * Fetches player profile information.
 */
export async function getPlayer(accountId: number): Promise<Player> {
  const data = await fetchWithRetry<Player>(`${BASE_URL}/players/${accountId}`);
  return {
    ...data,
    account_id: data.profile?.account_id ?? data.account_id ?? accountId,
    personaname: data.profile?.personaname ?? data.personaname ?? '',
    avatarfull: data.profile?.avatarfull ?? data.avatarfull ?? '',
  };
}

/**
 * Fetches win/loss summary for a player.
 */
export async function getWinLoss(
  accountId: number,
  params?: MatchQueryParams
): Promise<WinLoss> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return fetchWithRetry<WinLoss>(`${BASE_URL}/players/${accountId}/wl${qs}`);
}

/**
 * Fetches recent matches for a player (up to 20 matches).
 */
export async function getRecentMatches(
  accountId: number
): Promise<RecentMatch[]> {
  return fetchWithRetry<RecentMatch[]>(
    `${BASE_URL}/players/${accountId}/recentMatches`
  );
}

/**
 * Fetches matches for a player with optional filters.
 */
export async function getMatches(
  accountId: number,
  params?: MatchQueryParams
): Promise<RecentMatch[]> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return fetchWithRetry<RecentMatch[]>(
    `${BASE_URL}/players/${accountId}/matches${qs}`
  );
}

/**
 * Fetches hero performance stats for a player.
 */
export async function getHeroes(accountId: number): Promise<HeroStats[]> {
  return fetchWithRetry<HeroStats[]>(
    `${BASE_URL}/players/${accountId}/heroes`
  );
}

/**
 * Fetches player totals (kills, deaths, assists, gpm, xpm, etc.).
 */
export async function getTotals(
  accountId: number,
  params?: MatchQueryParams
): Promise<PlayerTotal[]> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return fetchWithRetry<PlayerTotal[]>(
    `${BASE_URL}/players/${accountId}/totals${qs}`
  );
}

/**
 * Fetches match count breakdowns by category (game mode, lane, lobby type, etc.).
 */
export async function getCounts(accountId: number): Promise<PlayerCount> {
  return fetchWithRetry<PlayerCount>(
    `${BASE_URL}/players/${accountId}/counts`
  );
}

/**
 * Fetches player hero rankings.
 */
export async function getRankings(accountId: number): Promise<HeroRanking[]> {
  return fetchWithRetry<HeroRanking[]>(
    `${BASE_URL}/players/${accountId}/rankings`
  );
}

/**
 * Fetches player ward placement heatmap coordinates.
 */
export async function getWardMap(accountId: number): Promise<WardMap> {
  return fetchWithRetry<WardMap>(
    `${BASE_URL}/players/${accountId}/wardmap`
  );
}

/**
 * Fetches full details for a specific match.
 */
export async function getMatch(matchId: number): Promise<MatchDetail> {
  return fetchWithRetry<MatchDetail>(`${BASE_URL}/matches/${matchId}`);
}

/**
 * Requests OpenDota to parse a match replay.
 */
export async function requestParse(
  matchId: number
): Promise<ParseResponse> {
  return fetchWithRetry<ParseResponse>(`${BASE_URL}/request/${matchId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Fetches hero constants. Caches result in memory.
 */
export async function getHeroConstants(): Promise<Record<number, HeroConstant>> {
  if (heroConstantsCache) {
    return heroConstantsCache;
  }

  const raw = await fetchWithRetry<Record<string, HeroConstant>>(
    `${BASE_URL}/constants/heroes`
  );

  const parsed: Record<number, HeroConstant> = {};
  for (const [key, value] of Object.entries(raw)) {
    const heroId = Number(key);
    if (!Number.isNaN(heroId)) {
      parsed[heroId] = value;
    }
  }

  heroConstantsCache = parsed;
  return parsed;
}

/**
 * Fetches item constants. Caches result in memory.
 */
export async function getItemConstants(): Promise<Record<string, ItemConstant>> {
  if (itemConstantsCache) {
    return itemConstantsCache;
  }

  const data = await fetchWithRetry<Record<string, ItemConstant>>(
    `${BASE_URL}/constants/items`
  );

  itemConstantsCache = data;
  return data;
}
