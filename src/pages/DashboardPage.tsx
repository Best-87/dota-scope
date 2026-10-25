import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { usePlayer } from '../hooks/usePlayer';
import { useMatches } from '../hooks/useMatches';
import { usePlayerContext } from '../context/PlayerContext';
import OverviewCard from '../components/dashboard/OverviewCard';
import HeroGrid from '../components/dashboard/HeroGrid';
import RecentMatches from '../components/dashboard/RecentMatches';
import Loading from '../components/common/Loading';

export const DashboardPage: React.FC = () => {
  const { accountId: routeAccountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { player, loading: playerLoading, setAccountId } = usePlayerContext();

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
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = usePlayer(accountId);

  const {
    matches,
    loading: matchesLoading,
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

  const isLoading = playerLoading || (statsLoading && !winLoss);

  if (isLoading) {
    return <Loading message="Cargando estadísticas del jugador..." size="lg" />;
  }

  const hasError = statsError || matchesError;

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Hubo un problema al cargar algunos datos de OpenDota. Las estadísticas pueden estar incompletas.
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

      {/* Profile Overview Card */}
      <OverviewCard
        player={player}
        winLoss={winLoss}
        totals={totals}
        loading={statsLoading}
      />

      {/* Most Played Heroes Grid */}
      <HeroGrid heroes={heroes} accountId={accountId} limit={6} />

      {/* Recent Matches List */}
      <RecentMatches matches={matches} loading={matchesLoading} />
    </div>
  );
};

export default DashboardPage;
