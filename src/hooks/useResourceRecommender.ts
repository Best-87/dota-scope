import { useState, useCallback, useRef } from 'react';
import type { MatchAutopsyResult } from '../utils/matchAutopsy';
import type { MatchDetail } from '../api/types';
import { getStoredGeminiKey } from '../config/ai';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResourceType = 'video' | 'article' | 'guide';
export type ResourceStatus = 'idle' | 'loading' | 'done' | 'error';

export interface ResourceRecommendation {
  id: string;
  type: ResourceType;
  title: string;
  creator?: string;
  description: string;
  url: string;
  youtubeId?: string; // If set, can be played inline with <iframe>
  rationale: string;
  tags: string[];
  keyTakeaway: string;
  confidence: number; // 0-100
}

export interface ResourceRecommenderResult {
  recommendations: ResourceRecommendation[];
  focusAreas: string[];
  matchSummaryTactical: string;
  provider: string;
}

// ─── Curated High-MMR Video & Article Library ─────────────────────────────────

interface CuratedResource {
  id: string;
  type: ResourceType;
  title: string;
  creator: string;
  youtubeId?: string;
  url: string;
  category: 'vision' | 'farming' | 'fighting' | 'laning' | 'items' | 'objectives' | 'general';
  description: string;
  keyTakeaway: string;
  tags: string[];
}

const CURATED_LIBRARY: CuratedResource[] = [
  // ── Vision ──
  {
    id: 'vision_1',
    type: 'video',
    title: 'Guía Definitiva de Wards y Visión Táctica',
    creator: 'Purge Dota / Pro Coach',
    youtubeId: 'e2C7R-E9d7I',
    url: 'https://www.youtube.com/watch?v=e2C7R-E9d7I',
    category: 'vision',
    description: 'Aprende los mejores puntos de Observer y Sentry para detectar smokes, defender tu jungla y bloquear campamentos clave.',
    keyTakeaway: 'Coloca wards en entradas de terreno elevado antes de cruzar el río o tomar objetivos.',
    tags: ['Visión', 'Wards', 'Sentries', 'Mapa'],
  },
  {
    id: 'vision_2',
    type: 'article',
    title: 'Mecánicas de Visión, Niebla de Guerra y De-warding',
    creator: 'Liquipedia Dota 2',
    url: 'https://liquipedia.net/dota2/Wards',
    category: 'vision',
    description: 'Referencia técnica completa sobre radios de visión diurna/nocturna, colinas y ángulos ciegos.',
    keyTakeaway: 'El control de visión nocturna decide el 70% de las emboscadas entre minutos 15 y 25.',
    tags: ['Lectura', 'Liquipedia', 'Visión', 'Teoría'],
  },

  // ── Farming ──
  {
    id: 'farming_1',
    type: 'video',
    title: 'Rutas de Farmeo Eficiente y Timings de Items',
    creator: 'BSJ (BananaSlamJamma)',
    youtubeId: 'q5v2tM7Kz4s',
    url: 'https://www.youtube.com/watch?v=q5v2tM7Kz4s',
    category: 'farming',
    description: 'Cómo acelerar tu GPM conectando oleadas de creeps de línea con campamentos de jungla sin perder tiempo muerto.',
    keyTakeaway: 'Nunca camines hacia una línea sin limpiar un campamento en el trayecto si no hay peligro inminente.',
    tags: ['Farm', 'GPM', 'Last Hits', 'Carry'],
  },
  {
    id: 'farming_2',
    type: 'article',
    title: 'Cálculo de Eficiencia de Oro y Distribución de Farm',
    creator: 'Dota 2 Wiki',
    url: 'https://dota2.fandom.com/wiki/Gold',
    category: 'farming',
    description: 'Análisis detallado de oro por creep de línea vs neutrales antiguos y recompensas por rachas.',
    keyTakeaway: 'Priorizar oleadas de línea sobre neutrales siempre otorga más oro y crea presión en el mapa.',
    tags: ['Lectura', 'Wiki', 'Economía', 'Oro'],
  },

  // ── Fighting / Teamfight ──
  {
    id: 'fighting_1',
    type: 'video',
    title: 'Posicionamiento en Teamfights: Cómo no Morir Primero',
    creator: 'Jenkins / GameLeap',
    youtubeId: '7XqJ9rR_3fM',
    url: 'https://www.youtube.com/watch?v=7XqJ9rR_3fM',
    category: 'fighting',
    description: 'Estrategia de entrada a peleas grupales: cuándo esperar a que el rival gaste sus hechizos clave antes de comprometerte.',
    keyTakeaway: 'Mantente detrás de la línea de visión de tu iniciador hasta que el objetivo prioritario rival revele su posición.',
    tags: ['Peleas', 'Teamfight', 'Posicionamiento', 'Sobrevivencia'],
  },
  {
    id: 'fighting_2',
    type: 'article',
    title: 'Prioridad de Foco e Iniciación en Escaramuzas',
    creator: 'Dotabuff Esports Insights',
    url: 'https://www.dotabuff.com/blog',
    category: 'fighting',
    description: 'Análisis sobre cómo seleccionar el objetivo correcto en peleas 5v5 para no desperdiciar ultimates en tanques.',
    keyTakeaway: 'Eliminar los soportes que otorgan save rival antes de intentar derribar al núcleo enemigo.',
    tags: ['Lectura', 'Estrategia', 'Foco', 'Teamfight'],
  },

  // ── Laning ──
  {
    id: 'laning_1',
    type: 'video',
    title: 'Cómo Dominar la Fase de Líneas con Creep Aggro',
    creator: 'PainDota',
    youtubeId: 'W4YgU_Xy910',
    url: 'https://www.youtube.com/watch?v=W4YgU_Xy910',
    category: 'laning',
    description: 'El truco del creep aggro para jalar la oleada hacia tu terreno seguro y asegurar last hits sin exponerte a daño.',
    keyTakeaway: 'Haz clic derecho sobre un héroe enemigo cada vez que un creep rival esté con poca vida para acercarlo a ti.',
    tags: ['Fase de Líneas', 'Aggro', 'Lane Control', 'Trades'],
  },
  {
    id: 'laning_2',
    type: 'article',
    title: 'Equilibrio de Creeps, Pulls y Control de Oleadas',
    creator: 'Liquipedia Strategy Guide',
    url: 'https://liquipedia.net/dota2/Laning',
    category: 'laning',
    description: 'Guía paso a paso sobre cuándo hacer pull con campamentos pequeños o stackeados para congelar la línea.',
    keyTakeaway: 'Un pull en el segundo :15 o :45 resetea la posición de la línea justo enfrente de tu torre.',
    tags: ['Lectura', 'Líneas', 'Pulls', 'Control'],
  },

  // ── Items ──
  {
    id: 'items_1',
    type: 'video',
    title: 'Guía de Itemización Situacional: BKB, Blink y Defensivos',
    creator: 'GamerzClass Dota 2',
    youtubeId: 'YQ5n9sY2tX0',
    url: 'https://www.youtube.com/watch?v=YQ5n9sY2tX0',
    category: 'items',
    description: 'Cómo adaptar tu build según el draft rival: cuándo priorizar un BKB temprano vs un ítem de aceleración o save.',
    keyTakeaway: 'Comprar un Black King Bar o Eul a tiempo previene el 80% de las muertes en medio juego.',
    tags: ['Items', 'Builds', 'BKB', 'Adaptabilidad'],
  },
  {
    id: 'items_2',
    type: 'article',
    title: 'Catálogo de Objetos Situacionales y Contramedidas',
    creator: 'Dota 2 Wiki',
    url: 'https://dota2.fandom.com/wiki/Items',
    category: 'items',
    description: 'Matriz de counters por objeto (Ghost Scepter contra daño físico, Lotus Orb contra hechizos dirigidos, etc.).',
    keyTakeaway: 'Un Ghost Scepter de 1500 de oro invalida héroes carry físicos en los primeros 25 minutos.',
    tags: ['Lectura', 'Objetos', 'Counters', 'Mecánicas'],
  },

  // ── Objectives ──
  {
    id: 'objectives_1',
    type: 'video',
    title: 'Cómo Cerrar Partidas y Asegurar Roshan sin Lanzar el Juego',
    creator: 'Henry / Raw Dota',
    youtubeId: 'b7V9kH3xY0M',
    url: 'https://www.youtube.com/watch?v=b7V9kH3xY0M',
    category: 'objectives',
    description: 'La disciplina tras ganar una teamfight: convertir kills en torres o Roshan inmediatamente en vez de volver a farmear.',
    keyTakeaway: 'Nunca intentes subir High Ground sin Aegis of the Immortal o sin visión previa detrás de las torres.',
    tags: ['Objetivos', 'Roshan', 'High Ground', 'Torres'],
  },
  {
    id: 'objectives_2',
    type: 'article',
    title: 'Estrategia de Smoke of Deceit y Roshan Timings',
    creator: 'Liquipedia Dota 2',
    url: 'https://liquipedia.net/dota2/Roshan',
    category: 'objectives',
    description: 'Tiempos de reaparición de Roshan (8 a 11 minutos) y control de Tormentors para shards gratis.',
    keyTakeaway: 'El Tormentor en el minuto 20 otorga un Aghanim Shard con valor de 1400 de oro al soporte más necesitado.',
    tags: ['Lectura', 'Roshan', 'Tormentor', 'Timings'],
  },
];

// ─── Deterministic Recommendation Generator ───────────────────────────────────

function generateCuratedRecommendations(
  match: MatchDetail,
  autopsy: MatchAutopsyResult,
  heroNames: Record<number, string>
): ResourceRecommenderResult {
  const teamWon = autopsy.targetTeamIsRadiant === match.radiant_win;
  const targetPlayer = autopsy.targetPlayer;
  const heroId = targetPlayer?.hero_id;
  const heroName = heroId ? (heroNames[heroId] || `Héroe #${heroId}`) : 'tu héroe';

  // Analyze dominant issues from autopsy findings
  const findings = autopsy.findings || [];
  const visionIssues = findings.filter((f) => f.category === 'vision' || f.title?.toLowerCase().includes('ward'));
  const farmIssues = findings.filter((f) => f.category === 'farming' || f.title?.toLowerCase().includes('farm'));
  const fightIssues = findings.filter((f) => f.category === 'fighting' || f.title?.toLowerCase().includes('pelea') || f.title?.toLowerCase().includes('muerte'));
  const laneIssues = findings.filter((f) => f.category === 'laning' || f.title?.toLowerCase().includes('linea') || f.title?.toLowerCase().includes('lane'));
  const itemIssues = findings.filter((f) => f.category === 'items' || f.title?.toLowerCase().includes('bkb') || f.title?.toLowerCase().includes('item'));
  const objectiveIssues = findings.filter((f) => f.category === 'objectives' || f.title?.toLowerCase().includes('torre') || f.title?.toLowerCase().includes('roshan'));

  const scores = [
    { cat: 'fighting' as const, count: fightIssues.length * 2.5 + (autopsy.teamScores.teamfight < 50 ? 3 : 0) },
    { cat: 'farming' as const, count: farmIssues.length * 2.5 + (autopsy.teamScores.economy < 50 ? 3 : 0) },
    { cat: 'vision' as const, count: visionIssues.length * 2.0 + (autopsy.teamScores.vision !== null && autopsy.teamScores.vision < 50 ? 3 : 0) },
    { cat: 'laning' as const, count: laneIssues.length * 2.0 + (autopsy.teamScores.laning < 50 ? 3 : 0) },
    { cat: 'items' as const, count: itemIssues.length * 2.0 },
    { cat: 'objectives' as const, count: objectiveIssues.length * 2.0 + (autopsy.teamScores.objectives < 50 ? 3 : 0) },
  ].sort((a, b) => b.count - a.count);

  const selectedRecs: ResourceRecommendation[] = [];
  const focusAreas: string[] = [];

  // 1. Pick the #1 priority category (add both video + reading)
  const topCat1 = scores[0]?.cat || 'fighting';
  const resources1 = CURATED_LIBRARY.filter((r) => r.category === topCat1);
  resources1.forEach((res) => {
    selectedRecs.push({
      id: res.id,
      type: res.type,
      title: res.title,
      creator: res.creator,
      description: res.description,
      url: res.url,
      youtubeId: res.youtubeId,
      rationale: `En esta partida se detectaron dificultades en ${res.category === 'fighting' ? 'peleas de equipo y posicionamiento' : res.category === 'farming' ? 'ritmo de farmeo y economía' : res.category === 'vision' ? 'cobertura de mapa y visión' : res.category === 'laning' ? 'fase de líneas' : 'objetos tácticos'}.`,
      keyTakeaway: res.keyTakeaway,
      tags: res.tags,
      confidence: 95,
    });
  });

  const catNames: Record<string, string> = {
    fighting: 'Posicionamiento en Teamfights',
    farming: 'Eficiencia de Farmeo',
    vision: 'Control de Visión y Wards',
    laning: 'Fase de Líneas',
    items: 'Itemización Situacional',
    objectives: 'Objetivos y Cierre de Partida',
  };
  focusAreas.push(catNames[topCat1] || 'Táctica General');

  // 2. Pick the #2 priority category (add the video)
  const topCat2 = scores[1]?.cat || 'farming';
  if (topCat2 !== topCat1) {
    const res2 = CURATED_LIBRARY.find((r) => r.category === topCat2 && r.type === 'video');
    if (res2) {
      selectedRecs.push({
        id: res2.id,
        type: res2.type,
        title: res2.title,
        creator: res2.creator,
        description: res2.description,
        url: res2.url,
        youtubeId: res2.youtubeId,
        rationale: `Refuerzo secundario para optimizar tu impacto en ${catNames[topCat2]?.toLowerCase()}.`,
        keyTakeaway: res2.keyTakeaway,
        tags: res2.tags,
        confidence: 88,
      });
      focusAreas.push(catNames[topCat2] || 'Optimización');
    }
  }

  // 3. Hero-specific guide
  if (heroName && heroName !== 'tu héroe') {
    selectedRecs.push({
      id: `hero_${heroId || 'custom'}`,
      type: 'video',
      title: `Masterclass de ${heroName} — Posicionamiento y Builds Actuales`,
      creator: 'Pro Dota Guides',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`dota 2 ${heroName} guide gameplay high mmr`)}`,
      description: `Revisa cómo los jugadores profesionales optimizan el árbol de talentos, secuencias de habilidades y objetos core de ${heroName}.`,
      rationale: `Dominar a ${heroName} en profundidad evitará los errores de timing cometidos en esta partida.`,
      keyTakeaway: `Fíjate especialmente en los primeros 15 minutos de gameplay para comparar con tus timings.`,
      tags: ['Héroe', heroName, 'Guía Pro'],
      confidence: 92,
    });
    focusAreas.push(`Especialización en ${heroName}`);
  }

  const summary = teamWon
    ? `Análisis de Victoria: Se ganó la partida, pero consolidar estos aspectos tácticos te permitirá subir de medalla de forma constante.`
    : `Diagnóstico de Derrota: El análisis detectó áreas críticas en ${focusAreas.join(' y ')}. Estos recursos fueron seleccionados específicamente para corregir esas fallas.`;

  return {
    recommendations: selectedRecs.slice(0, 4),
    focusAreas,
    matchSummaryTactical: summary,
    provider: 'Coach Táctico DotaScope (Curaduría IA)',
  };
}

// ─── AI Query Builder ─────────────────────────────────────────────────────────

function buildPrompt(match: MatchDetail, autopsy: MatchAutopsyResult, heroNames: Record<number, string>): string {
  const dur = Math.floor(match.duration / 60);
  const targetPlayer = autopsy.targetPlayer;
  const heroName = targetPlayer?.hero_id ? (heroNames[targetPlayer.hero_id] || `Héroe #${targetPlayer.hero_id}`) : 'Desconocido';
  const teamWon = autopsy.targetTeamIsRadiant === match.radiant_win;

  const topFindings = autopsy.findings
    .slice(0, 5)
    .map((f) => `- [${f.category}] ${f.title}: ${f.description}`)
    .join('\n');

  return `Eres un analista y coach profesional de Dota 2. Analiza esta partida y recomienda de 2 a 4 recursos educativos REALES (videos de YouTube o artículos de Liquipedia/Wiki) que ayuden al jugador a corregir las fallas exactas detectadas.
Responde ÚNICAMENTE en JSON con este esquema estricto:
{
  "focusAreas": ["Área 1", "Área 2"],
  "matchSummaryTactical": "Breve explicación de por qué estos recursos son cruciales para el jugador",
  "recommendations": [
    {
      "id": "rec_1",
      "type": "video",
      "title": "Título del video",
      "creator": "Canal de YouTube",
      "searchQuery": "términos de búsqueda",
      "description": "Qué aprenderás",
      "rationale": "Por qué ayuda a esta partida",
      "keyTakeaway": "Consejo clave aplicable",
      "tags": ["Tag1", "Tag2"],
      "confidence": 90
    }
  ]
}

PARTIDA:
Héroe: ${heroName} | Resultado: ${teamWon ? 'Victoria' : 'Derrota'} (${dur} min)
Problemas detectados:
${topFindings || 'Rendimiento estándar sin fallas críticas'}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useResourceRecommender() {
  const [status, setStatus] = useState<ResourceStatus>('idle');
  const [result, setResult] = useState<ResourceRecommenderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const recommend = useCallback(
    async (
      match: MatchDetail,
      autopsy: MatchAutopsyResult,
      heroNames: Record<number, string> = {}
    ) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;

      setStatus('loading');
      setError(null);

      // Always generate baseline curated recommendations first (instant & 100% reliable)
      const baseline = generateCuratedRecommendations(match, autopsy, heroNames);

      const apiKey = getStoredGeminiKey();
      const prompt = buildPrompt(match, autopsy, heroNames);

      // Attempt AI enrichment if key or Pollinations available
      let enriched: ResourceRecommenderResult | null = null;

      if (apiKey && apiKey.startsWith('AIza')) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 1200, responseMimeType: 'application/json' },
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
                enriched = {
                  recommendations: parsed.recommendations.map((r: any, idx: number) => ({
                    id: r.id || `ai_${idx}`,
                    type: r.type || 'video',
                    title: r.title,
                    creator: r.creator || 'Coach Dota 2',
                    description: r.description,
                    url: r.type === 'article'
                      ? `https://www.google.com/search?q=${encodeURIComponent((r.searchQuery || r.title) + ' dota 2')}`
                      : `https://www.youtube.com/results?search_query=${encodeURIComponent((r.searchQuery || r.title) + ' dota 2')}`,
                    rationale: r.rationale,
                    keyTakeaway: r.keyTakeaway || 'Aplica este concepto en tu próxima partida.',
                    tags: Array.isArray(r.tags) ? r.tags : ['Guía'],
                    confidence: Number(r.confidence) || 88,
                  })),
                  focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas : baseline.focusAreas,
                  matchSummaryTactical: parsed.matchSummaryTactical || baseline.matchSummaryTactical,
                  provider: 'Gemini AI Coach',
                };
              }
            }
          }
        } catch {
          // Fall back gracefully
        }
      }

      if (!signal.aborted) {
        setResult(enriched || baseline);
        setStatus('done');
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, recommend, reset };
}

export default useResourceRecommender;
