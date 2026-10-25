import { useState, useEffect, useCallback } from 'react';
import { getHeroConstants, getItemConstants } from '../api/opendota';
import type { HeroConstant, ItemConstant } from '../api/types';

const CACHE_KEY = 'dotascope_constants_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedPayload {
  heroes: Record<number, HeroConstant>;
  items: Record<string, ItemConstant>;
  timestamp: number;
}

const normalizeHeroes = (raw: unknown): Record<number, HeroConstant> => {
  const result: Record<number, HeroConstant> = {};
  if (!raw || typeof raw !== 'object') return result;

  if (Array.isArray(raw)) {
    for (const hero of raw) {
      if (hero && typeof hero.id === 'number') {
        result[hero.id] = hero as HeroConstant;
      }
    }
  } else {
    for (const [key, val] of Object.entries(raw)) {
      if (val && typeof val === 'object') {
        const hero = val as HeroConstant;
        const id = typeof hero.id === 'number' ? hero.id : Number(key);
        if (!isNaN(id)) {
          result[id] = hero;
        }
      }
    }
  }

  return result;
};

const normalizeItems = (raw: unknown): Record<string, ItemConstant> => {
  const result: Record<string, ItemConstant> = {};
  if (!raw || typeof raw !== 'object') return result;

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === 'object') {
        const itemRecord = item as ItemConstant & { name?: string; id?: number };
        const key = itemRecord.name || (itemRecord.id !== undefined ? String(itemRecord.id) : '');
        if (key) {
          result[key] = itemRecord;
        }
      }
    }
  } else {
    for (const [key, val] of Object.entries(raw)) {
      if (val && typeof val === 'object') {
        result[key] = val as ItemConstant;
      }
    }
  }

  return result;
};

const loadFromCache = (): CachedPayload | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const item = window.localStorage.getItem(CACHE_KEY);
    if (!item) return null;

    const parsed: CachedPayload = JSON.parse(item);
    if (!parsed || typeof parsed !== 'object') return null;

    const now = Date.now();
    if (typeof parsed.timestamp !== 'number' || now - parsed.timestamp > CACHE_TTL_MS) {
      window.localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const saveToCache = (heroes: Record<number, HeroConstant>, items: Record<string, ItemConstant>): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const payload: CachedPayload = {
      heroes,
      items,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Gracefully handle storage errors (e.g. storage full)
  }
};

export interface UseConstantsResult {
  heroes: Record<number, HeroConstant>;
  items: Record<string, ItemConstant>;
  loading: boolean;
  error: Error | null;
  getHeroName: (id: number) => string;
  getHeroIcon: (id: number) => string;
  getItemName: (key: string) => string;
  refetch: () => Promise<void>;
}

export const useConstants = (): UseConstantsResult => {
  const [heroes, setHeroes] = useState<Record<number, HeroConstant>>(() => {
    const cached = loadFromCache();
    return cached ? cached.heroes : {};
  });

  const [items, setItems] = useState<Record<string, ItemConstant>>(() => {
    const cached = loadFromCache();
    return cached ? cached.items : {};
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const cached = loadFromCache();
    return cached === null;
  });

  const [error, setError] = useState<Error | null>(null);

  const fetchConstants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rawHeroes, rawItems] = await Promise.all([
        getHeroConstants(),
        getItemConstants(),
      ]);

      const normalizedHeroes = normalizeHeroes(rawHeroes);
      const normalizedItems = normalizeItems(rawItems);

      setHeroes(normalizedHeroes);
      setItems(normalizedItems);
      saveToCache(normalizedHeroes, normalizedItems);
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to fetch Dota 2 constants');
      setError(formattedError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = loadFromCache();
    if (!cached) {
      fetchConstants();
    }
  }, [fetchConstants]);

  const getHeroName = useCallback(
    (id: number): string => {
      const hero = heroes[id] as (HeroConstant & { localized_name?: string; name?: string }) | undefined;
      if (!hero) return `Hero ${id}`;
      return hero.localized_name || hero.name || `Hero ${id}`;
    },
    [heroes]
  );

  const getHeroIcon = useCallback(
    (id: number): string => {
      const hero = heroes[id] as (HeroConstant & { icon?: string; img?: string }) | undefined;
      if (!hero) return '';
      const iconPath = hero.icon || hero.img || '';
      if (!iconPath) return '';
      if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
        return iconPath;
      }
      const cleanPath = iconPath.startsWith('/') ? iconPath : `/${iconPath}`;
      return `https://cdn.cloudflare.steamstatic.com${cleanPath}`;
    },
    [heroes]
  );

  const getItemName = useCallback(
    (key: string): string => {
      if (!key) return '';

      // Direct match by item key
      const direct = items[key] as (ItemConstant & { dname?: string; name?: string }) | undefined;
      if (direct?.dname) return direct.dname;
      if (direct?.name) return direct.name;

      // Match by numeric id if key is a stringified number or ID match
      const numericId = Number(key);
      if (!isNaN(numericId)) {
        for (const item of Object.values(items)) {
          const itemRecord = item as ItemConstant & { id?: number; dname?: string; name?: string };
          if (itemRecord?.id === numericId) {
            return itemRecord.dname || itemRecord.name || key;
          }
        }
      }

      return key;
    },
    [items]
  );

  return {
    heroes,
    items,
    loading,
    error,
    getHeroName,
    getHeroIcon,
    getItemName,
    refetch: fetchConstants,
  };
};

export default useConstants;
