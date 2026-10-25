import { useState, useCallback, useRef } from 'react';
import type { MatchDetail } from '../api/types';
import type { MatchAutopsyResult as AutopsyResult } from '../utils/matchAutopsy';
import { getStoredGeminiKey } from '../config/ai';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiAnalysis {
  summary: string;
  keyMoments: string[];
  perRoleAdvice: { role: string; advice: string }[];
  generalTips: string[];
  provider?: string;
}

export type AiStatus = 'idle' | 'loading' | 'done' | 'error';

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(match: MatchDetail, autopsy: AutopsyResult, heroNames: Record<number, string>): string {
  const winner = match.radiant_win ? 'Radiant' : 'Dire';
  const dur = `${Math.floor(match.duration / 60)}m ${match.duration % 60}s`;
  const team = autopsy.targetTeamIsRadiant ? 'Radiant' : 'Dire';
  const teamWon = autopsy.targetTeamIsRadiant === match.radiant_win;

  const roles = ([1, 2, 3, 4, 5] as const)
    .map((p) => {
      const r = autopsy.roles[p];
      if (!r) return null;
      const hero = heroNames[r.heroId] || `Hero#${r.heroId}`;
      const metrics = r.metrics.map((m) => `${m.label}=${m.value}(meta:${m.benchmark},${m.status})`).join(' | ');
      const mistakes = r.criticalMistakes.join('; ') || 'ninguno';
      const strengths = r.keyStrengths.join('; ') || 'ninguno';
      return `Pos${p} [${r.positionName}] ${hero} — Nota:${r.grade}(${r.score}/100)\n  Métricas: ${metrics}\n  Fallos: ${mistakes}\n  Fortalezas: ${strengths}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const findings = autopsy.findings
    .slice(0, 10)
    .map((f) => `- [${f.severity}][${f.category}] ${f.title}: ${f.description}`)
    .join('\n');

  const tipping = autopsy.tippingPoint
    ? `Punto de quiebre en minuto ${autopsy.tippingPoint.minute}: ${autopsy.tippingPoint.description} (caída de ${autopsy.tippingPoint.goldSwing.toLocaleString()} oro)`
    : 'No se detectó punto de quiebre claro.';

  return `Eres un coach experto de Dota 2 (nivel 8k MMR) con conocimiento profundo de estrategia, drafting y análisis estadístico. Responde SIEMPRE en español.

PARTIDA ANALIZADA:
Match ID: ${match.match_id} | Ganador: ${winner} | Duración: ${dur}
Equipo analizado: ${team} → ${teamWon ? '✅ VICTORIA' : '❌ DERROTA'}
Kills: Radiant ${match.radiant_score} — Dire ${match.dire_score}

EVALUACIÓN POR ROL (datos reales de la partida):
${roles}

FACTORES TÁCTICOS DETECTADOS:
${findings}

${tipping}

RESUMEN AUTOMÁTICO:
${autopsy.executiveSummary.join('\n')}

INSTRUCCIONES:
Analiza esta partida como un coach profesional de Dota 2 usando EXCLUSIVAMENTE los datos reales presentados arriba.
Responde ÚNICAMENTE en formato JSON válido (sin explicaciones antes ni después, sin bloques markdown):
{
  "summary": "Párrafo de 3 a 4 oraciones explicando claramente por qué se ganó o perdió la partida.",
  "keyMoments": [
    "Momento decisivo 1 con contexto del juego",
    "Momento decisivo 2",
    "Momento decisivo 3"
  ],
  "perRoleAdvice": [
    {"role": "Pos 1 · HC", "advice": "Consejo específico y accionable basado en sus métricas reales."},
    {"role": "Pos 2 · Mid", "advice": "..."},
    {"role": "Pos 3 · Offlaner", "advice": "..."},
    {"role": "Pos 4 · Soft Support", "advice": "..."},
    {"role": "Pos 5 · Hard Support", "advice": "..."}
  ],
  "generalTips": [
    "Tip de mejora de equipo 1",
    "Tip de mejora de equipo 2",
    "Tip de mejora de equipo 3"
  ]
}`;
}

// ─── Helpers: Parser ──────────────────────────────────────────────────────────

function parseAiJson(rawText: string, providerName: string): GeminiAnalysis {
  let clean = rawText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  const startIdx = clean.indexOf('{');
  const endIdx = clean.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    clean = clean.substring(startIdx, endIdx + 1);
  }

  const parsed = JSON.parse(clean);

  return {
    summary: parsed.summary || 'Análisis táctico completado por el Coach.',
    keyMoments: Array.isArray(parsed.keyMoments) ? parsed.keyMoments : [],
    perRoleAdvice: Array.isArray(parsed.perRoleAdvice) ? parsed.perRoleAdvice : [],
    generalTips: Array.isArray(parsed.generalTips) ? parsed.generalTips : [],
    provider: providerName,
  };
}

// ─── Local Tactical Coach Generator (Zero external network dependencies) ─────

function generateLocalCoachAnalysis(
  match: MatchDetail,
  autopsy: AutopsyResult,
  heroNames: Record<number, string>
): GeminiAnalysis {
  const { isVictory, tippingPoint, roles, teamScores, findings } = autopsy;
  const teamLabel = autopsy.targetTeamIsRadiant ? 'Radiant' : 'Dire';
  const durationMin = Math.floor(match.duration / 60);

  // 1. Synthesize summary
  let summary = '';
  if (isVictory) {
    summary = `Victoria convincente de ${teamLabel} tras ${durationMin} minutos de juego. El equipo logró mantener una ventaja económica sostenida (Puntaje de economía: ${teamScores.economy}/100) y cerrar objetivos clave con buena coordinación en peleas grupales.`;
  } else {
    const weakestArea = Object.entries(teamScores)
      .filter(([k, v]) => v !== null && k !== 'vision')
      .sort((a, b) => (a[1] as number) - (b[1] as number))[0];
    const weakLabel = weakestArea ? {
      laning: 'la fase de líneas temprana',
      economy: 'el déficit económico y ritmo de farmeo',
      teamfight: 'la ejecución en peleas grupales y exceso de muertes',
      objectives: 'la falta de daño a estructuras rivales',
    }[weakestArea[0]] || 'la ejecución táctica' : 'la ejecución táctica';

    summary = `La partida se complicó principalmente debido a ${weakLabel} (puntaje: ${weakestArea ? weakestArea[1] : 40}/100) frente a la escuadra rival. ${tippingPoint ? `El colapso decisivo ocurrió alrededor del minuto ${tippingPoint.minute}:00 con un desplome de ${tippingPoint.goldSwing.toLocaleString()} oro que otorgó control total del mapa al enemigo.` : 'Las ventajas rivales se acumularon hasta hacer insostenible la defensa de base.'}`;
  }

  // 2. Key Moments
  const keyMoments: string[] = [];
  if (tippingPoint) {
    keyMoments.push(`Minuto ${tippingPoint.minute}:00: ${tippingPoint.description} (-${tippingPoint.goldSwing.toLocaleString()} de ventaja neta)`);
  }
  const dangerFindings = findings.filter((f) => f.severity === 'danger').slice(0, 2);
  dangerFindings.forEach((df) => {
    keyMoments.push(`${df.timestamp ? `Alrededor del ${df.timestamp}: ` : ''}${df.title} — ${df.description}`);
  });
  if (keyMoments.length === 0) {
    keyMoments.push(`Minuto 10:00: Cierre de la fase de líneas con balance de ${teamScores.laning}/100.`);
    keyMoments.push(`Minuto ${Math.floor(durationMin * 0.6)}:00: Escaramuzas de medio juego determinantes.`);
  }

  // 3. Per Role Advice
  const posLabels: Record<number, string> = {
    1: 'Pos 1 · HC',
    2: 'Mid · Pos 2',
    3: 'Offlane · Pos 3',
    4: 'Soft Support · Pos 4',
    5: 'Hard Support · Pos 5',
  };

  const perRoleAdvice = ([1, 2, 3, 4, 5] as const).map((pos) => {
    const r = roles[pos];
    const label = posLabels[pos];
    if (!r) return { role: label, advice: 'Mantener comunicación constante y priorizar objetivos.' };
    const hName = heroNames[r.heroId] || `Héroe`;

    if (r.criticalMistakes.length > 0) {
      return {
        role: `${label} (${hName})`,
        advice: `${r.criticalMistakes[0]}. ${r.score < 50 ? 'Necesita enfocar las prioridades básicas de su rol antes de sumarse a escaramuzas arriesgadas.' : 'Ajustar timings de ítems de supervivencia para no perder presencia.'}`
      };
    }
    if (r.score >= 75) {
      return {
        role: `${label} (${hName})`,
        advice: `Gran desempeño (${r.score}/100). Mantener este nivel de impacto y capitalizar las ventajas para forzar torres enemigas y control de Roshan.`
      };
    }
    return {
      role: `${label} (${hName})`,
      advice: `Rendimiento aceptable (${r.score}/100). Optimizar tiempos muertos entre oleadas de creeps para acelerar la llegada a sus objetos centrales.`
    };
  });

  // 4. General Tips
  const generalTips = [
    teamScores.vision === null || teamScores.vision < 50
      ? 'Guerra de Visión: Colocar Observer Wards en entradas de jungla antes de farmear zonas alejadas para evitar ganks sorpresa.'
      : 'Control de Visión: Mantener centinelas (Sentries) en cuellos de botella del mapa para denegar visión rival.',
    'Sincronización de Objetivos: Tras ganar una escaramuza, convertir las bajas enemigas en torres o Roshan inmediatamente en vez de volver a la jungla.',
    'Smoke of Deceit: Utilizar Smoke en minutos pares (cuando salen runas) para forzar peleas con ventaja numérica antes de que el carry rival complete ítems.'
  ];

  return {
    summary,
    keyMoments,
    perRoleAdvice,
    generalTips,
    provider: 'Coach Táctico DotaScope',
  };
}

// ─── Provider: Pollinations AI (via internal proxy or direct) ─────────────────

async function callPollinationsAi(prompt: string, signal: AbortSignal): Promise<GeminiAnalysis> {
  const payload = {
    messages: [
      {
        role: 'system',
        content: 'Eres un analista profesional de Dota 2. Responde ÚNICAMENTE con código JSON válido respetando el esquema pedido, sin texto adicional.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    jsonMode: true,
    model: 'openai'
  };

  // Try local proxy first to avoid browser 403, fallback to direct
  const urls = ['/api/ai-text/', 'https://text.pollinations.ai/'];
  let lastErr: Error | null = null;

  for (const url of urls) {
    if (signal.aborted) break;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const raw = await response.text();
      return parseAiJson(raw, 'AI Coach (Pollinations)');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') throw err;
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastErr || new Error('No se pudo conectar al servicio externo de IA');
}

// ─── Provider: Gemini API (if user provides Google AI Studio key) ───────────

async function callGeminiApi(prompt: string, apiKey: string, signal: AbortSignal): Promise<GeminiAnalysis> {
  const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    if (signal.aborted) break;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            maxOutputTokens: 1500,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body.slice(0, 100)}`);
      }

      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!raw) throw new Error('Respuesta vacía');

      return parseAiJson(raw, `Gemini (${model})`);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') throw err;
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('No se pudo conectar con Gemini');
}

// ─── Main Hook ────────────────────────────────────────────────────────────────

export function useGeminiAnalysis() {
  const [status, setStatus] = useState<AiStatus>('idle');
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (
    match: MatchDetail,
    autopsy: AutopsyResult,
    heroNames: Record<number, string>,
    customKey?: string,
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setStatus('loading');
    setAnalysis(null);
    setError(null);

    const prompt = buildPrompt(match, autopsy, heroNames);
    const key = customKey?.trim() || getStoredGeminiKey();
    const isGoogleKey = Boolean(key && key.startsWith('AIza'));

    // 1. Try Gemini if official Google key is provided
    if (isGoogleKey) {
      try {
        const result = await callGeminiApi(prompt, key, signal);
        if (!signal.aborted) {
          setAnalysis(result);
          setStatus('done');
          return;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.warn('Gemini falló, probando IA secundaria...', err);
      }
    }

    // 2. Try Pollinations AI (via Vite proxy or direct)
    try {
      const result = await callPollinationsAi(prompt, signal);
      if (!signal.aborted) {
        setAnalysis(result);
        setStatus('done');
        return;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.warn('Pollinations AI falló, activando Coach Táctico Local...', err);
    }

    // 3. Resilient Local Engine: Always succeeds and generates rich tailored analysis
    if (!signal.aborted) {
      const localResult = generateLocalCoachAnalysis(match, autopsy, heroNames);
      setAnalysis(localResult);
      setStatus('done');
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setAnalysis(null);
    setError(null);
  }, []);

  return { status, analysis, error, analyze, reset };
}
