import { useState, useEffect, useCallback } from 'react';
import { getMatch, requestParse as apiRequestParse } from '../api/opendota';
import type { MatchDetail } from '../api/types';

export interface UseMatchDetailResult {
  match: MatchDetail | null;
  loading: boolean;
  error: Error | null;
  requestParse: () => Promise<void>;
  parseRequested: boolean;
  isParsing: boolean;
  parseError: Error | null;
  refetch: () => Promise<void>;
}

export const useMatchDetail = (
  matchId: number | string | null | undefined
): UseMatchDetailResult => {
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [parseRequested, setParseRequested] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<Error | null>(null);

  const numericId = matchId ? Number(matchId) : null;
  const isValidId = numericId !== null && !isNaN(numericId) && numericId > 0;

  const fetchMatch = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatch(id);
      setMatch(data ?? null);
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to fetch match details');
      setError(formattedError);
      setMatch(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    // Reset parse status when matchId changes
    setParseRequested(false);
    setParseError(null);

    if (!isValidId || numericId === null) {
      setMatch(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getMatch(numericId)
      .then((data) => {
        if (active) {
          setMatch(data ?? null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const formattedError =
            err instanceof Error ? err : new Error(String(err) || 'Failed to fetch match details');
          setError(formattedError);
          setMatch(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isValidId, numericId]);

  const requestParse = useCallback(async () => {
    if (!isValidId || numericId === null || isParsing) {
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      await apiRequestParse(numericId);
      setParseRequested(true);
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to request match replay parse');
      setParseError(formattedError);
    } finally {
      setIsParsing(false);
    }
  }, [isValidId, numericId, isParsing]);

  const refetch = useCallback(async () => {
    if (isValidId && numericId !== null) {
      await fetchMatch(numericId);
    }
  }, [isValidId, numericId, fetchMatch]);

  return {
    match,
    loading,
    error,
    requestParse,
    parseRequested,
    isParsing,
    parseError,
    refetch,
  };
};

export default useMatchDetail;
