import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  Coins,
  TrendingUp,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { useMatches } from '../hooks/useMatches';
import { usePlayer } from '../hooks/usePlayer';
import RoleAnalysis from '../components/analysis/RoleAnalysis';
import FarmAnalysis from '../components/analysis/FarmAnalysis';
import TrendsChart from '../components/analysis/TrendsChart';
import RankComparison from '../components/analysis/RankComparison';
import Loading from '../components/common/Loading';

export const AnalysisPage: React.FC = () => {
  const { accountId: routeAccountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const accountId = routeAccountId ? Number(routeAccountId) : null;

  const { matches, loading: matchesLoading } = useMatches(accountId);
  const { rankings, loading: playerLoading } = usePlayer(accountId);

  const [activeTab, setActiveTab] = useState<'roles' | 'farm' | 'trends' | 'rankings'>('roles');

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

  if (matchesLoading && matches.length === 0) {
    return <Loading message="Cargando análisis avanzado..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Análisis de Rendimiento Avanzado
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Desglose táctico de roles, eficiencia de oro, patrones de victoria y percentil competitivo
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'roles'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Líneas & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('farm')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'farm'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Progresión de Farm</span>
        </button>

        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'trends'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tendencias</span>
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'rankings'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Percentil Global</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'roles' && <RoleAnalysis matches={matches} />}

      {activeTab === 'farm' && <FarmAnalysis matches={matches} />}

      {activeTab === 'trends' && <TrendsChart matches={matches} />}

      {activeTab === 'rankings' && <RankComparison rankings={rankings} />}
    </div>
  );
};

export default AnalysisPage;
