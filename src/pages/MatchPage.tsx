import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  Eye,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useMatchDetail } from '../hooks/useMatchDetail';
import MatchDetailComponent from '../components/match/MatchDetail';
import GoldXpGraph from '../components/match/GoldXpGraph';
import WardMap from '../components/match/WardMap';
import ItemTimeline from '../components/match/ItemTimeline';
import MatchAutopsy from '../components/match/MatchAutopsy';
import Loading from '../components/common/Loading';
import { usePlayerContext } from '../context/PlayerContext';
import { Flame } from 'lucide-react';

export const MatchPage: React.FC = () => {
  const { matchId: routeMatchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { accountId } = usePlayerContext();

  const matchId = routeMatchId ? Number(routeMatchId) : null;
  const { match, loading, error, requestParse, parseRequested } = useMatchDetail(matchId);

  const [activeTab, setActiveTab] = useState<
    'scoreboard' | 'autopsy' | 'gold_xp' | 'wards' | 'items'
  >('autopsy');

  if (!matchId || isNaN(matchId)) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">ID de partida no válido.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-red-600 rounded-lg text-white font-medium text-sm"
        >
          Volver
        </button>
      </div>
    );
  }

  if (loading) {
    return <Loading message="Cargando telemetría de la partida..." size="lg" />;
  }

  if (error || !match) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">No se pudo cargar la partida</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {error?.message || 'Es posible que la partida sea muy antigua o el ID no exista.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Dashboard</span>
        </button>
      </div>

      {/* ── Parse Banner (visible en todas las tabs si la partida no está parseada) ── */}
      {!match.radiant_gold_adv || match.radiant_gold_adv.length === 0 ? (
        parseRequested ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>
              <strong>Análisis solicitado.</strong> OpenDota procesará la repetición en unos minutos.
              Recarga la página para ver los datos completos.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-amber-900/30 border border-amber-500/40 text-amber-300 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>
                <strong>Partida sin datos completos</strong> — Los detalles avanzados (wards, items, gráficas)
                requieren parsear la repetición.
              </span>
            </div>
            <button
              onClick={requestParse}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-200 hover:text-white font-semibold text-xs transition flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Parsear Partida
            </button>
          </div>
        )
      ) : null}


      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('autopsy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'autopsy'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Diagnóstico: ¿Por qué se perdió?</span>
        </button>

        <button
          onClick={() => setActiveTab('scoreboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'scoreboard'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Marcador General</span>
        </button>

        <button
          onClick={() => setActiveTab('gold_xp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'gold_xp'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Ventaja Oro / XP</span>
        </button>

        <button
          onClick={() => setActiveTab('wards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'wards'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Mapa de Wards</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'items'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Timings de Items</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'autopsy' && (
        <MatchAutopsy match={match} focusAccountId={accountId} />
      )}

      {activeTab === 'scoreboard' && (
        <MatchDetailComponent
          match={match}
          onRequestParse={requestParse}
          parseRequested={parseRequested}
        />
      )}

      {activeTab === 'gold_xp' && <GoldXpGraph match={match} />}

      {activeTab === 'wards' && <WardMap match={match} />}

      {activeTab === 'items' && <ItemTimeline match={match} />}
    </div>
  );
};

export default MatchPage;
