import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Lock, ExternalLink } from 'lucide-react';
import { usePlayer } from '../hooks/usePlayer';
import { useMatches } from '../hooks/useMatches';
import { usePlayerContext } from '../context/PlayerContext';
import OverviewCard from '../components/dashboard/OverviewCard';
import HeroGrid from '../components/dashboard/HeroGrid';
import RecentMatches from '../components/dashboard/RecentMatches';
import PlayerBreakdownStats from '../components/dashboard/PlayerBreakdownStats';
import Loading from '../components/common/Loading';

export const DashboardPage: React.FC = () => {
  const { accountId: routeAccountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { player, loading: playerLoading, error: playerError, setAccountId } = usePlayerContext();

  const accountId = routeAccountId ? Number(routeAccountId) : null;

  useEffect(() => {
    if (accountId && !isNaN(accountId)) {
      setAccountId(accountId);
    }
  }, [accountId, setAccountId]);

  const {
    winLoss,
    heroes,
    totals,
    counts,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = usePlayer(accountId);

  const {
    matches,
    loading: matchesLoading,
    loadingMore,
    hasMore,
    loadMore,
    error: matchesError,
    refetch: refetchMatches,
  } = useMatches(accountId);

  if (!accountId || isNaN(accountId)) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">No se ha especificado un jugador válido.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium text-sm transition"
        >
          Ir a Búsqueda
        </button>
      </div>
    );
  }

  // Only block the entire screen if the player profile itself has not loaded yet and has no error
  const isLoading = playerLoading && !player && !playerError;

  if (isLoading) {
    return <Loading message="Cargando perfil del jugador..." size="lg" />;
  }

  // Player profile loaded but all stats timed out / errored — private account
  const statsAllFailed = !statsLoading && statsError !== null && !winLoss && heroes.length === 0 && totals.length === 0;
  const matchesAllFailed = !matchesLoading && matchesError !== null && matches.length === 0;
  const isPrivateProfile = statsAllFailed && matchesAllFailed;

  const hasPartialError = (statsError || matchesError || playerError) && !isPrivateProfile;

  return (
    <div className="space-y-6">
      {/* Partial data error banner */}
      {hasPartialError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Algunos datos no pudieron cargarse desde OpenDota. Las estadísticas pueden estar incompletas.
            </span>
          </div>
          <button
            onClick={() => {
              refetchStats();
              refetchMatches();
            }}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}

      {/* Private / no-data profile warning */}
      {isPrivateProfile && (
        <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-200 mb-1">Perfil sin datos públicos</p>
              <p className="text-sm text-amber-400/90 leading-relaxed">
                OpenDota no tiene datos de historial para esta cuenta (<span className="font-mono text-amber-300">{accountId}</span>).
                Esto ocurre cuando el jugador tiene el historial de partidas configurado como
                <strong className="text-amber-200"> privado</strong> en Dota 2, o si la cuenta nunca expuso sus partidas a la API de OpenDota.
              </p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <a
                  href={`https://www.opendota.com/players/${accountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver en OpenDota.com
                </a>
                <button
                  onClick={() => {
                    refetchStats();
                    refetchMatches();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-gray-300 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-xs font-semibold text-red-300 transition"
                >
                  Buscar otro jugador
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Overview Card — always shown if player loaded */}
      <OverviewCard
        player={player}
        winLoss={winLoss}
        totals={totals}
        loading={statsLoading}
      />

      {/* Most Played Heroes Grid */}
      <HeroGrid heroes={heroes} accountId={accountId} limit={6} loading={statsLoading} />

      {/* OpenDota Breakdown Stats (Game Mode, Role, Team, Region, Lobby) */}
      <PlayerBreakdownStats counts={counts} loading={statsLoading} accountId={accountId} />

      {/* Recent Matches List with pagination */}
      <RecentMatches
        matches={matches}
        loading={matchesLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        loadingMore={loadingMore}
      />
    </div>
  );
};

export default DashboardPage;
