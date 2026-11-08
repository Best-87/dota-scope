import { useState, useEffect, useCallback, useRef } from 'react';
import { getMatch, requestParse as apiRequestParse } from '../api/opendota';
import type { MatchDetail } from '../api/types';
import { useNotifications } from '../context/NotificationContext';

export interface UseMatchDetailResult {
  match: MatchDetail | null;
  loading: boolean;
  error: Error | null;
  requestParse: () => Promise<void>;
  parseRequested: boolean;
  isParsing: boolean;
  parseElapsedSeconds: number;
  parseJobStatus: string | null;
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
  const [parseElapsedSeconds, setParseElapsedSeconds] = useState<number>(0);
  const [parseJobStatus, setParseJobStatus] = useState<string | null>(null);
  const [parseError, setParseError] = useState<Error | null>(null);

  const { sendNotification, requestPermission, permission } = useNotifications();
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const clearPollers = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // Cleanup poll timer on unmount or matchId change
  useEffect(() => {
    return () => {
      clearPollers();
    };
  }, [matchId, clearPollers]);

  // Initial fetch
  useEffect(() => {
    let active = true;
    clearPollers();

    setParseRequested(false);
    setIsParsing(false);
    setParseError(null);
    setParseElapsedSeconds(0);
    setParseJobStatus(null);

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
  }, [isValidId, numericId, clearPollers]);

  const requestParse = useCallback(async () => {
    if (!isValidId || numericId === null || isParsing) {
      return;
    }

    // Automatically request permission if still default
    if (permission === 'default') {
      requestPermission().catch(() => {});
    }

    setIsParsing(true);
    setParseError(null);
    setParseElapsedSeconds(0);
    setParseJobStatus('Enviando solicitud a OpenDota...');

    try {
      const parseResponse = await apiRequestParse(numericId);
      const jobId = parseResponse?.job?.jobId;
      setParseRequested(true);
      setParseJobStatus('En cola en OpenDota (1 a 4 minutos aprox.)...');

      // Immediate notification to user that request was accepted
      sendNotification(
        '⏳ Análisis Solicitado',
        `OpenDota está analizando la repetición de la partida #${numericId}. Suele tardar entre 1 y 4 minutos en descargarse de Valve y procesarse.`,
        { tag: 'parse_requested', data: { matchId: numericId } }
      );

      clearPollers();

      // Tick elapsed seconds
      const startTime = Date.now();
      elapsedTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setParseElapsedSeconds(elapsed);
      }, 1000);

      // Start active poller every 6 seconds up to 8 minutes (80 attempts)
      let attempts = 0;
      const maxAttempts = 80;

      pollTimerRef.current = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearPollers();
          setParseJobStatus('El parseo tardó más de lo habitual. Puedes recargar o volver más tarde.');
          return;
        }

        try {
          // If we have jobId, check job status
          if (jobId) {
            try {
              const jobRes = await fetch(`https://api.opendota.com/api/request/${jobId}`);
              if (jobRes.ok) {
                const jobData = await jobRes.json();
                if (jobData === null) {
                  setParseJobStatus('Procesando repetición...');
                } else if (jobData && jobData.attempts) {
                  setParseJobStatus(`En cola de OpenDota (intento ${jobData.attempts})...`);
                }
              }
            } catch {
              // Ignore job poll failure
            }
          }

          const updated = await getMatch(numericId);
          const hasParsedData =
            Boolean(updated?.radiant_gold_adv && updated.radiant_gold_adv.length > 0) ||
            Boolean((updated as any)?.version && (updated as any).version > 0);

          if (hasParsedData && updated) {
            // Successfully parsed!
            clearPollers();
            setMatch(updated);
            setParseRequested(false);
            setParseJobStatus('¡Completado con éxito!');
            sendNotification(
              '🎉 ¡Partida Analizada con Éxito!',
              `La partida #${numericId} ya cuenta con mapa de wards, items y autopsia táctica completa.`,
              { tag: 'parsed', data: { matchId: numericId } }
            );
          }
        } catch {
          // Ignore network glitch during poll
        }
      }, 6000);
    } catch (err: unknown) {
      const formattedError =
        err instanceof Error ? err : new Error(String(err) || 'Failed to request match replay parse');
      setParseError(formattedError);
      clearPollers();
    } finally {
      setIsParsing(false);
    }
  }, [isValidId, numericId, isParsing, permission, requestPermission, sendNotification, clearPollers]);

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
    parseElapsedSeconds,
    parseJobStatus,
    parseError,
    refetch,
  };
};

export default useMatchDetail;
