import React, { useState, useMemo } from 'react';
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
  Flame,
  PlayCircle,
  Coins,
  Compass,
} from 'lucide-react';
import { useMatchDetail } from '../hooks/useMatchDetail';
import MatchDetailComponent from '../components/match/MatchDetail';
import GoldXpGraph from '../components/match/GoldXpGraph';
import WardMap from '../components/match/WardMap';
import ItemTimeline from '../components/match/ItemTimeline';
import MatchAutopsy from '../components/match/MatchAutopsy';
import ResourceRecommender from '../components/match/ResourceRecommender';
import LaningSection from '../components/match/LaningSection';
import Loading from '../components/common/Loading';
import { usePlayerContext } from '../context/PlayerContext';
import { useConstants } from '../hooks/useConstants';
import { analyzeMatchLoss } from '../utils/matchAutopsy';

export const MatchPage: React.FC = () => {
  const { matchId: routeMatchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { accountId } = usePlayerContext();
  const { heroes } = useConstants();

  const matchId = routeMatchId ? Number(routeMatchId) : null;
  const {
    match,
    loading,
    error,
    requestParse,
    parseRequested,
    isParsing,
    parseElapsedSeconds,
    parseJobStatus,
    parseError,
  } = useMatchDetail(matchId);

  const [activeTab, setActiveTab] = useState<
    'autopsy' | 'laning' | 'learning' | 'scoreboard' | 'gold_xp' | 'wards' | 'items'
  >('autopsy');

  const heroNameMap = useMemo(() => {
    const m: Record<number, string> = {};
    if (heroes) {
      Object.values(heroes).forEach((h) => {
        m[h.id] = h.localized_name;
      });
    }
    return m;
  }, [heroes]);

  const matchAutopsy = useMemo(() => {
    if (!match) return null;
    return analyzeMatchLoss(match, accountId);
  }, [match, accountId]);

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-sm">
            <div className="flex items-start sm:items-center gap-3">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-400 animate-spin mt-0.5 sm:mt-0" />
              <div>
                <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
                  <span>Procesando repetición en OpenDota</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    {Math.floor(parseElapsedSeconds / 60)}:
                    {(parseElapsedSeconds % 60).toString().padStart(2, '0')} transcurrido
                  </span>
                </div>
                <div className="text-xs text-emerald-300/80 mt-0.5">
                  {parseJobStatus || 'En cola de descarga y análisis de Valve.'}{' '}
                  Tiempo estimado: <strong>1 a 3 minutos</strong>.
                </div>
              </div>
            </div>
            <div className="text-[11px] font-mono text-emerald-400/70 sm:text-right shrink-0">
              Notificación automática al finalizar
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-amber-900/30 border border-amber-500/40 text-amber-300 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <div>
                <strong className="block sm:inline">Partida sin datos avanzados</strong> —{' '}
                <span className="text-xs text-amber-200">
                  Wards, log segundo a segundo e inventario detallado requieren parsear la repetición (~2 min).
                </span>
                {parseError && (
                  <span className="block text-xs text-rose-400 mt-1">
                    Error al solicitar: {parseError.message}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={requestParse}
              disabled={isParsing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-200 hover:text-white font-semibold text-xs transition flex-shrink-0 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isParsing ? 'animate-spin' : ''}`} />
              <span>{isParsing ? 'Enviando...' : 'Parsear Partida'}</span>
            </button>
          </div>
        )
      ) : null}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('autopsy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'autopsy'
              ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Diagnóstico Táctico</span>
        </button>

        <button
          onClick={() => setActiveTab('laning')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'laning'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Fase de Líneas</span>
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'learning'
              ? 'bg-red-600/20 text-red-400 border border-red-500/30 shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <PlayCircle className="w-4 h-4 text-red-400" />
          <span>Videos & Guías IA</span>
        </button>

        <button
          onClick={() => setActiveTab('scoreboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'gold_xp'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Patrimonio & Oro</span>
        </button>

        <button
          onClick={() => setActiveTab('wards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
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
        <MatchAutopsy match={match} focusAccountId={accountId} onSelectTab={setActiveTab} />
      )}

      {activeTab === 'laning' && (
        <LaningSection
          match={match}
          focusAccountId={accountId}
          onRequestParse={requestParse}
          parseRequested={parseRequested}
        />
      )}

      {activeTab === 'learning' && matchAutopsy && (
        <ResourceRecommender
          match={match}
          autopsy={matchAutopsy}
          heroNames={heroNameMap}
        />
      )}

      {activeTab === 'scoreboard' && (
        <MatchDetailComponent
          match={match}
          onRequestParse={requestParse}
          parseRequested={parseRequested}
          isParsing={isParsing}
          parseElapsedSeconds={parseElapsedSeconds}
          parseJobStatus={parseJobStatus}
        />
      )}

      {activeTab === 'gold_xp' && (
        <GoldXpGraph match={match} focusAccountId={accountId} />
      )}

      {activeTab === 'wards' && <WardMap match={match} />}

      {activeTab === 'items' && <ItemTimeline match={match} />}
    </div>
  );
};

export default MatchPage;
