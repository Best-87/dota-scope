import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen,
  ExternalLink,
  PlayCircle,
  FileText,
  Sparkles,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  Youtube,
  ShieldCheck,
} from 'lucide-react';
import {
  useResourceRecommender,
  type ResourceRecommendation,
  type ResourceType,
} from '../../hooks/useResourceRecommender';
import type { MatchAutopsyResult } from '../../utils/matchAutopsy';
import type { MatchDetail } from '../../api/types';

// ─── Resource Card Component ──────────────────────────────────────────────────

const ResourceCard: React.FC<{
  rec: ResourceRecommendation;
  isPlaying: boolean;
  onTogglePlay: () => void;
}> = ({ rec, isPlaying, onTogglePlay }) => {
  const isVideo = rec.type === 'video';

  return (
    <div className="flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-lg">
      {/* Inline YouTube Player if active */}
      {isVideo && rec.youtubeId && isPlaying && (
        <div className="relative w-full aspect-video bg-black">
          <iframe
            className="w-full h-full border-0"
            src={`https://www.youtube.com/embed/${rec.youtubeId}?autoplay=1`}
            title={rec.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        {/* Top Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {isVideo ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
                  <Youtube className="w-3.5 h-3.5" />
                  YouTube
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-600/20 border border-sky-500/40 text-sky-400 text-xs font-bold uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  Lectura
                </span>
              )}
              {rec.creator && (
                <span className="text-xs text-gray-400 font-medium">
                  {rec.creator}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{rec.confidence}% Relevante</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base font-bold text-white leading-snug group-hover:text-red-400 transition">
            {rec.title}
          </h4>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {rec.description}
          </p>
        </div>

        {/* Why this helps (Rationale) */}
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
              <span>¿Por qué te ayudará?</span>
            </div>
            <p className="text-gray-300 leading-relaxed pl-5">
              {rec.rationale}
            </p>
          </div>

          {/* Key Takeaway */}
          {rec.keyTakeaway && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Consejo Clave:</span>
              </div>
              <p className="text-emerald-200 leading-relaxed pl-5">
                {rec.keyTakeaway}
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        {rec.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {rec.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-gray-400"
              >
                <Tag className="w-2.5 h-2.5 text-gray-500" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
          {isVideo && rec.youtubeId && (
            <button
              onClick={onTogglePlay}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isPlaying
                  ? 'bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/40'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isPlaying ? 'Cerrar Reproductor' : 'Reproducir Aquí'}</span>
            </button>
          )}

          <a
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-200 hover:text-white text-xs font-bold transition"
          >
            <span>{isVideo ? 'Abrir en YouTube' : 'Leer Artículo'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export interface ResourceRecommenderProps {
  match: MatchDetail;
  autopsy: MatchAutopsyResult;
  heroNames?: Record<number, string>;
}

export const ResourceRecommender: React.FC<ResourceRecommenderProps> = ({
  match,
  autopsy,
  heroNames = {},
}) => {
  const { status, result, recommend, reset } = useResourceRecommender();
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'article'>('all');
  const [regenCount, setRegenCount] = useState(0);

  // Ref to track current args so the effect can call recommend with fresh values
  const matchRef = useRef(match);
  const autopsyRef = useRef(autopsy);
  const heroNamesRef = useRef(heroNames);
  matchRef.current = match;
  autopsyRef.current = autopsy;
  heroNamesRef.current = heroNames;

  useEffect(() => {
    recommend(matchRef.current, autopsyRef.current, heroNamesRef.current);
    return () => reset();
    // regenCount is the trigger — intentionally not including match/autopsy/heroNames
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.match_id, regenCount, recommend, reset]);

  const handleRegenerate = useCallback(() => {
    setRegenCount((c) => c + 1);
  }, []);

  const allRecs = result?.recommendations || [];
  const filteredRecs = allRecs.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
              <Youtube className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Videos & Guías Tácticas Recomendadas
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  IA Coaching
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {result?.provider
                  ? `Recursos seleccionados por ${result.provider} según lo ocurrido en esta partida`
                  : 'Analizando telemetría para encontrar los videos y lecturas más efectivos...'}
              </p>
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 hover:text-white transition disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span>Regenerar</span>
          </button>
        </div>

        {/* Tactical Summary Box */}
        {result?.matchSummaryTactical && (
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-gray-300 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Diagnóstico del Coach: </span>
              {result.matchSummaryTactical}
            </div>
          </div>
        )}

        {/* Focus Areas Badges */}
        {result?.focusAreas && result.focusAreas.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-semibold">Áreas a mejorar:</span>
            {result.focusAreas.map((area) => (
              <span
                key={area}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800/80 text-gray-400 hover:text-white'
            }`}
          >
            Todos ({allRecs.length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'video'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800/80 text-gray-400 hover:text-white'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Videos YouTube ({allRecs.filter((r) => r.type === 'video').length})
          </button>
          <button
            onClick={() => setFilterType('article')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'article'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800/80 text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Lecturas & Guías ({allRecs.filter((r) => r.type === 'article').length})
          </button>
        </div>
      </div>

      {/* Grid of Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec) => (
          <ResourceCard
            key={rec.id}
            rec={rec}
            isPlaying={activePlayingId === rec.id}
            onTogglePlay={() =>
              setActivePlayingId((current) => (current === rec.id ? null : rec.id))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ResourceRecommender;
