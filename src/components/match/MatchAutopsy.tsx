import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Flame,
  Eye,
  ShieldAlert,
  Crosshair,
  Lightbulb,
  CheckCircle2,
  Clock,
  Compass,
  Coins,
  Castle,
  Users,
  TrendingDown,
  Sparkles,
  Zap,
  HelpCircle,
  BookOpen,
  Brain,
  ChevronRight,
  Award,
  RefreshCcw,
  Settings2,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { MatchDetail } from '../../api/types';
import {
  analyzeMatchLoss,
  type Finding,
  type DotaPosition,
  type RoleEvaluation,
} from '../../utils/matchAutopsy';
import HeroIcon from '../common/HeroIcon';
import { useConstants } from '../../hooks/useConstants';
import { useGeminiAnalysis } from '../../hooks/useGeminiAnalysis';
import { getStoredGeminiKey, saveGeminiKey } from '../../config/ai';

interface MatchAutopsyProps {
  match: MatchDetail;
  focusAccountId?: number | null;
}

function buildRadarData(ts: { laning: number; vision: number | null; economy: number; teamfight: number; objectives: number }) {
  return [
    { subject: 'Líneas', score: ts.laning },
    { subject: 'Visión', score: ts.vision ?? 0 },
    { subject: 'Economía', score: ts.economy },
    { subject: 'Teamfight', score: ts.teamfight },
    { subject: 'Objetivos', score: ts.objectives },
  ];
}

function metricColor(status: 'good' | 'average' | 'bad') {
  if (status === 'good') return '#34d399';
  if (status === 'average') return '#fbbf24';
  return '#f87171';
}

export const MatchAutopsy: React.FC<MatchAutopsyProps> = ({ match, focusAccountId }) => {
  const { getHeroName, heroes } = useConstants();
  const [teamFilter, setTeamFilter] = useState<'auto' | 'radiant' | 'dire'>('auto');
  const [showLegend, setShowLegend] = useState(false);
  const [selectedRole, setSelectedRole] = useState<DotaPosition>(1);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const analyzedRef = useRef<string>(''); // track which match+team was analyzed

  const { status: aiStatus, analysis: aiAnalysis, error: aiError, analyze, reset: resetAi } = useGeminiAnalysis();

  // Hero name map for Gemini prompt
  const heroNameMap = React.useMemo(() => {
    const m: Record<number, string> = {};
    if (heroes) Object.values(heroes).forEach((h) => { m[h.id] = h.localized_name; });
    return m;
  }, [heroes]);

  const autopsy = React.useMemo(() => {
    const forceTeam = teamFilter === 'radiant' ? true : teamFilter === 'dire' ? false : undefined;
    return analyzeMatchLoss(match, focusAccountId, undefined, forceTeam);
  }, [match, focusAccountId, teamFilter]);

  const { isVictory, tippingPoint, findings, recommendations, executiveSummary, roles, teamScores, targetTeamIsRadiant } = autopsy;

  // Auto-trigger Gemini when autopsy is ready (once per match+team combo)
  useEffect(() => {
    const key = `${match.match_id}-${targetTeamIsRadiant}`;
    if (analyzedRef.current === key) return;
    analyzedRef.current = key;
    // Small delay so UI renders first
    const timer = setTimeout(() => {
      analyze(match, autopsy, heroNameMap);
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.match_id, targetTeamIsRadiant]);

  const filteredFindings = findings.filter((f) =>
    filterCategory === 'all' ? true : f.category === filterCategory
  );
  const activeRoleEval = roles[selectedRole];
  const radarData = buildRadarData(teamScores);

  const barData = activeRoleEval?.metrics.map((m) => ({
    name: m.label.length > 16 ? m.label.slice(0, 15) + '…' : m.label,
    fullLabel: m.label,
    value: parseFloat(String(m.value)) || 0,
    displayValue: m.value,
    benchmark: parseFloat(String(m.benchmark)) || 0,
    displayBenchmark: m.benchmark,
    status: m.status,
  })) ?? [];

  const getGradeBadge = (grade: RoleEvaluation['grade']) => ({
    S: 'bg-amber-400 text-slate-950 shadow-[0_0_12px_#f59e0b]',
    A: 'bg-emerald-500 text-white shadow-[0_0_10px_#10b981]',
    B: 'bg-sky-500 text-white',
    C: 'bg-indigo-500 text-white',
    D: 'bg-orange-500 text-white',
    F: 'bg-rose-600 text-white animate-pulse',
  }[grade] ?? 'bg-slate-700 text-white');

  const getCategoryIcon = (cat: Finding['category']) => {
    const m: Record<string, React.ReactNode> = {
      vision: <Eye className="w-4 h-4 text-amber-400" />,
      laning: <Compass className="w-4 h-4 text-sky-400" />,
      farming: <Coins className="w-4 h-4 text-emerald-400" />,
      items: <ShieldAlert className="w-4 h-4 text-purple-400" />,
      objectives: <Castle className="w-4 h-4 text-rose-400" />,
      macro: <Flame className="w-4 h-4 text-red-500" />,
    };
    return m[cat] ?? <Crosshair className="w-4 h-4 text-red-400" />;
  };

  const handleSaveKey = () => {
    saveGeminiKey(keyInput.trim());
    setShowKeySettings(false);
    resetAi();
    analyzedRef.current = '';
    setTimeout(() => analyze(match, autopsy, heroNameMap, keyInput.trim()), 200);
  };

  const handleRetryAi = () => {
    resetAi();
    analyzedRef.current = '';
    analyze(match, autopsy, heroNameMap);
  };

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className={`border rounded-2xl p-6 shadow-xl ${isVictory ? 'bg-slate-900/90 border-emerald-500/30' : 'bg-slate-900/90 border-rose-500/40'}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isVictory ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                {isVictory ? 'Auditoría de Victoria' : 'Autopsia Táctica Integral'}
              </span>

              <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 ml-1">
                <button type="button" onClick={() => setTeamFilter('radiant')}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${targetTeamIsRadiant ? 'bg-emerald-500 text-slate-950 font-black' : 'text-gray-400 hover:text-white'}`}>
                  Radiant {match.radiant_win ? '🏆' : '💀'}
                </button>
                <button type="button" onClick={() => setTeamFilter('dire')}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${!targetTeamIsRadiant ? 'bg-rose-600 text-white font-black' : 'text-gray-400 hover:text-white'}`}>
                  Dire {!match.radiant_win ? '🏆' : '💀'}
                </button>
              </div>

              <button type="button" onClick={() => setShowLegend((p) => !p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border transition ml-1 ${showLegend ? 'bg-amber-500/25 text-amber-300 border-amber-500/50' : 'bg-slate-950/80 text-gray-300 border-slate-800 hover:text-white hover:bg-slate-800'}`}>
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                {showLegend ? 'Ocultar' : '📖 Leyenda'}
              </button>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              {isVictory ? '¡Partida Ganada! — Puntos fuertes y áreas a pulir' : '¿Por qué se perdió la partida? (Evaluación Pos 1–5)'}
            </h2>

            <div className="mt-3 space-y-1.5">
              {executiveSummary.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
                  <TrendingDown className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar chart */}
          <div className="w-full lg:w-56 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 4, right: 20, bottom: 4, left: 20 }}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <Radar name="Equipo" dataKey="score" stroke={isVictory ? '#34d399' : '#f87171'} fill={isVictory ? '#34d399' : '#f87171'} fillOpacity={0.25} strokeWidth={2} />
                <Tooltip content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  const color = d.score >= 75 ? '#34d399' : d.score >= 50 ? '#fbbf24' : '#f87171';
                  return (
                    <div className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono">
                      <span className="text-gray-400">{d.subject}: </span>
                      <span style={{ color }}>{d.score}/100</span>
                    </div>
                  );
                }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Legend (collapsible) ── */}
      {showLegend && (
        <div className="bg-slate-900/95 border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Leyenda de Evaluación Táctica</h3>
            </div>
            <button onClick={() => setShowLegend(false)} className="text-xs font-semibold text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition">Cerrar ✕</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {[
              { g: 'S', range: '88–100', cls: 'bg-amber-400 text-slate-950 shadow-[0_0_8px_#f59e0b]', desc: 'Impecable' },
              { g: 'A', range: '75–87', cls: 'bg-emerald-500 text-white', desc: 'Muy bueno' },
              { g: 'B', range: '62–74', cls: 'bg-sky-500 text-white', desc: 'Aceptable' },
              { g: 'C', range: '48–61', cls: 'bg-indigo-500 text-white', desc: 'Deficiente' },
              { g: 'D', range: '35–47', cls: 'bg-orange-500 text-white', desc: 'Crítico' },
              { g: 'F', range: '<35', cls: 'bg-rose-600 text-white', desc: 'Colapso' },
            ].map(({ g, range, cls, desc }) => (
              <div key={g} className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg font-black flex items-center justify-center font-mono text-sm flex-shrink-0 ${cls}`}>{g}</span>
                <div><div className="font-bold text-gray-200">{range}</div><div className="text-gray-500 text-[10px]">{desc}</div></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
            {[
              { k: 'Líneas', v: 'Rendimiento en laning phase' },
              { k: 'Visión', v: 'Wards colocados (necesita parseo)' },
              { k: 'Economía', v: 'GPM/XPM relativo al rival' },
              { k: 'Teamfight', v: 'KDA y kill participation' },
              { k: 'Objetivos', v: 'Daño a torres y estructuras' },
            ].map(({ k, v }) => (
              <div key={k} className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                <div className="font-bold text-gray-200 mb-0.5">{k}</div>
                <div className="text-gray-500 leading-relaxed">{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tipping Point ── */}
      {tippingPoint && (
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-2 border-rose-500/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">Punto de Quiebre</span>
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-500" /> Minuto {tippingPoint.minute}:00</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">El instante donde se desmoronó la victoria</h3>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">{tippingPoint.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-rose-300">
                <span>Desplome:</span>
                <strong className="text-rose-400">-{tippingPoint.goldSwing.toLocaleString()} Oro en 3 min</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Role Matrix ── */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white tracking-tight">Auditoría Individual (Roles 1–5)</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {([1, 2, 3, 4, 5] as DotaPosition[]).map((pos) => {
            const role = roles[pos];
            if (!role) return null;
            const isSelected = selectedRole === pos;
            const labels: Record<DotaPosition, string> = { 1: 'HC · Carry', 2: 'Mid · Medio', 3: 'Offlane', 4: 'Soft Support', 5: 'Hard Support' };
            return (
              <button key={pos} type="button" onClick={() => setSelectedRole(pos)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${isSelected ? 'bg-red-600/20 border-red-500 ring-2 ring-red-500/50 shadow-xl scale-[1.02]' : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-gray-300 font-mono block">POS {pos}</span>
                    <span className="text-[10px] text-red-400 font-semibold block">{labels[pos]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-mono font-black ${role.score >= 75 ? 'text-emerald-400' : role.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {role.score}<span className="text-[9px] text-gray-500 font-normal">/100</span>
                    </span>
                    <span className={`w-6 h-6 rounded-md font-black text-xs flex items-center justify-center font-mono ${getGradeBadge(role.grade)}`}>{role.grade}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HeroIcon heroId={role.heroId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-gray-200 truncate">{getHeroName(role.heroId)}</div>
                    <div className="text-[10px] text-gray-500 truncate">{role.playerName}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Role Detail */}
        {activeRoleEval && (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <HeroIcon heroId={activeRoleEval.heroId} size="lg" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-red-400 font-mono">Posición {activeRoleEval.position}</span>
                    <h4 className="text-base font-bold text-white">{activeRoleEval.positionName} — {getHeroName(activeRoleEval.heroId)}</h4>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Jugador: <strong className="text-gray-200">{activeRoleEval.playerName}</strong></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block">Puntaje</span>
                  <span className="text-2xl font-black font-mono text-white">{activeRoleEval.score}<span className="text-xs text-gray-500 font-normal"> /100</span></span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl font-mono shadow-xl ${getGradeBadge(activeRoleEval.grade)}`}>{activeRoleEval.grade}</div>
              </div>
            </div>

            {/* BarChart: métricas vs benchmark */}
            {barData.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Métricas vs. Estándar Competitivo</h5>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 70, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" domain={[0, 'dataMax']} stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={95} />
                      <Tooltip content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono space-y-1">
                            <div className="text-gray-300 font-bold">{d.fullLabel}</div>
                            <div><span className="text-gray-400">Valor: </span><span style={{ color: metricColor(d.status) }}>{d.displayValue}</span></div>
                            <div><span className="text-gray-400">Meta: </span><span className="text-gray-300">{d.displayBenchmark}</span></div>
                          </div>
                        );
                      }} />
                      <Bar dataKey="benchmark" fill="#334155" radius={[0, 3, 3, 0]} barSize={7} />
                      <Bar dataKey="value" barSize={7} radius={[0, 3, 3, 0]}>
                        {barData.map((e, i) => <Cell key={i} fill={metricColor(e.status)} fillOpacity={0.9} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono mt-1">
                  <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-slate-600 inline-block" /> Meta</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-emerald-400 inline-block" /> Bueno</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-amber-400 inline-block" /> Regular</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded bg-rose-400 inline-block" /> Bajo</span>
                </div>
              </div>
            )}

            {/* Fallos y aciertos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Fallos Identificados</span>
                {activeRoleEval.criticalMistakes.length === 0
                  ? <p className="text-xs text-gray-400 italic">No se detectaron fallos críticos graves.</p>
                  : <ul className="space-y-1.5 text-xs text-gray-300">{activeRoleEval.criticalMistakes.map((m, i) => <li key={i} className="flex items-start gap-2"><span className="text-rose-400 font-bold">•</span><span>{m}</span></li>)}</ul>}
              </div>
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Aciertos</span>
                {activeRoleEval.keyStrengths.length === 0
                  ? <p className="text-xs text-gray-400 italic">No se registraron hitos destacables.</p>
                  : <ul className="space-y-1.5 text-xs text-gray-300">{activeRoleEval.keyStrengths.map((s, i) => <li key={i} className="flex items-start gap-2"><span className="text-emerald-400 font-bold">•</span><span>{s}</span></li>)}</ul>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Findings ── */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Factores Tácticos y Errores ({filteredFindings.length})</h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            {['all', 'macro', 'vision', 'laning', 'farming', 'items', 'objectives'].map((cat) => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize transition whitespace-nowrap ${filterCategory === cat ? 'bg-slate-800 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}>
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>
        {filteredFindings.length === 0
          ? <div className="text-center py-8 text-gray-400 text-sm">No hay observaciones en esta categoría.</div>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFindings.map((f, idx) => (
                <div key={idx} className={`rounded-xl p-4 border flex flex-col justify-between ${f.severity === 'danger' ? 'bg-rose-950/20 border-rose-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">{getCategoryIcon(f.category)}<span className={`text-xs font-bold uppercase tracking-wider ${f.severity === 'danger' ? 'text-rose-400' : 'text-amber-400'}`}>{f.category}</span></div>
                      {f.timestamp && <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3 text-gray-500" />{f.timestamp}</span>}
                    </div>
                    <h4 className="text-sm font-bold text-gray-100">{f.title}</h4>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{f.description}</p>
                  </div>
                  {f.culpritHeroId && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/60">
                      <HeroIcon heroId={f.culpritHeroId} size="sm" />
                      <span className="text-xs text-gray-300 font-medium">{getHeroName(f.culpritHeroId)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>}
      </div>

      {/* ── AI-Powered Coach ── */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
        {/* Section header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Plan de Acción del Coach</h3>
            {/* AI badge */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${aiStatus === 'done' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : aiStatus === 'loading' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' : aiStatus === 'error' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-slate-800 text-gray-500 border-slate-700'}`}>
              <Brain className="w-3 h-3" />
              {aiStatus === 'done' ? (aiAnalysis?.provider || 'IA activa') : aiStatus === 'loading' ? 'Coach IA pensando…' : aiStatus === 'error' ? 'IA no disponible' : 'IA cargando…'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {aiStatus === 'error' && (
              <button onClick={handleRetryAi} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white text-xs font-semibold transition">
                <RefreshCcw className="w-3.5 h-3.5" /> Reintentar IA
              </button>
            )}
            <button onClick={() => setShowKeySettings((p) => !p)} title="Configurar API Key de Gemini"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key settings (collapsible) */}
        {showKeySettings && (
          <div className="bg-slate-950/80 border border-indigo-500/20 rounded-xl p-4 space-y-3">
            <p className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Proveedor de IA
            </p>
            <p className="text-[11px] text-gray-400">
              Por defecto se utiliza una IA gratuita (sin requerir key). Si tienes una clave de Google AI Studio (inicia con <code className="text-amber-400">AIzaSy...</code>), puedes ingresarla aquí:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Pegar Google AI Studio Key (opcional)..."
                className="flex-1 min-w-0 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 font-mono"
                onKeyDown={(e) => { if (e.key === 'Enter' && keyInput.trim()) handleSaveKey(); }}
              />
              <button onClick={handleSaveKey} disabled={!keyInput.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold transition flex-shrink-0">
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* ── AI Result: integrated into coach section ── */}
        {aiStatus === 'loading' && (
          <div className="flex items-center gap-3 py-4 text-sm text-indigo-300">
            <Zap className="w-5 h-5 animate-pulse text-indigo-400" />
            <span>El Coach IA está analizando la telemetría de la partida…</span>
          </div>
        )}

        {aiStatus === 'error' && (
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300 space-y-1">
            <p className="font-semibold">⚠️ No se pudo completar el análisis IA</p>
            <p className="text-rose-400/70 font-mono">{aiError}</p>
            <p className="text-gray-400">Se muestran las recomendaciones automáticas del sistema.</p>
          </div>
        )}

        {/* AI Summary banner */}
        {aiStatus === 'done' && aiAnalysis && (
          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> {aiAnalysis.provider ? `Análisis ${aiAnalysis.provider}` : 'Análisis Coach IA'}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{aiAnalysis.summary}</p>
          </div>
        )}

        {/* Key Moments (IA) */}
        {aiStatus === 'done' && aiAnalysis?.keyMoments?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Momentos Decisivos
            </h4>
            <div className="space-y-2">
              {aiAnalysis.keyMoments.map((m, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-role AI advice (replaces/augments static recommendations) */}
        {aiStatus === 'done' && aiAnalysis?.perRoleAdvice?.length > 0 ? (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Consejos Personalizados por Rol
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {aiAnalysis.perRoleAdvice.map((item, i) => (
                <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="text-xs font-bold text-red-400 font-mono">{item.role}</div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{item.advice}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Fallback: rule-based recommendations cuando IA no está lista */
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3 hover:border-slate-700 transition">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        )}

        {/* General Tips (IA) */}
        {aiStatus === 'done' && aiAnalysis?.generalTips?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Tips Generales del Coach
            </h4>
            <div className="space-y-2">
              {aiAnalysis.generalTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 bg-sky-950/20 border border-sky-500/20 rounded-xl px-4 py-2.5">
                  <ChevronRight className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {aiStatus === 'done' && (
          <p className="text-[11px] text-gray-600 italic pt-1">
            * Análisis generado por Gemini 2.0 Flash basado en datos reales de la partida.
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchAutopsy;
