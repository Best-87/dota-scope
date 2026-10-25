import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Shield,
  Award,
  Sparkles,
  RefreshCw,
  Search,
  Layers,
  Zap,
  Info,
  X,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  Swords,
  Heart,
  Droplet,
  Gauge,
  Activity,
} from 'lucide-react';
import Loading from '../components/common/Loading';

// ==========================================
// Types & Interfaces
// ==========================================

export type BracketKey = '7' | '20' | '40' | '80';
export type AttributeKey = 'all_attrs' | 'str' | 'agi' | 'int' | 'all';
export type TierKey = 'S' | 'A' | 'B' | 'C' | 'D';

export interface RawHeroStat {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: 'str' | 'agi' | 'int' | 'all';
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  base_health?: number;
  base_mana?: number;
  base_armor?: number;
  base_attack_min?: number;
  base_attack_max?: number;
  move_speed?: number;
  pro_ban?: number;
  pro_win?: number;
  pro_pick?: number;
  turbo_picks?: number;
  turbo_wins?: number;
  // Standard and bracket fields
  '1_pick'?: number;
  '1_win'?: number;
  '2_pick'?: number;
  '2_win'?: number;
  '3_pick'?: number;
  '3_win'?: number;
  '4_pick'?: number;
  '4_win'?: number;
  '5_pick'?: number;
  '5_win'?: number;
  '6_pick'?: number;
  '6_win'?: number;
  '7_pick'?: number;
  '7_win'?: number;
  '8_pick'?: number;
  '8_win'?: number;
  '10_pick'?: number;
  '10_win'?: number;
  '20_pick'?: number;
  '20_win'?: number;
  '30_pick'?: number;
  '30_win'?: number;
  '40_pick'?: number;
  '40_win'?: number;
  '50_pick'?: number;
  '50_win'?: number;
  '60_pick'?: number;
  '60_win'?: number;
  '70_pick'?: number;
  '70_win'?: number;
  '80_pick'?: number;
  '80_win'?: number;
  [key: string]: unknown;
}

export interface ProcessedHero {
  id: number;
  name: string;
  heroKey: string;
  localized_name: string;
  primary_attr: 'str' | 'agi' | 'int' | 'all';
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  base_health: number;
  base_mana: number;
  base_armor: number;
  move_speed: number;
  pro_pick: number;
  pro_win: number;
  pro_ban: number;
  picks: number;
  wins: number;
  winrate: number;
  tier: TierKey | 'UNRANKED';
  bracketStats: Record<BracketKey, { picks: number; wins: number; winrate: number }>;
}

interface CachedMetaPayload {
  heroes: RawHeroStat[];
  patch: string;
  timestamp: number;
}

// ==========================================
// Constants & Configuration
// ==========================================

const CACHE_KEY = 'dotascope_meta_stats_cache_v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const DEFAULT_PATCH = '7.37d';
const MIN_PICKS_THRESHOLD = 100;

interface BracketConfig {
  key: BracketKey;
  label: string;
  rankBadge: string;
  description: string;
}

const BRACKET_OPTIONS: BracketConfig[] = [
  {
    key: '80',
    label: 'Divino - Inmortal',
    rankBadge: '5.6k+ MMR',
    description: 'Nivel competitivo profesional y élite',
  },
  {
    key: '40',
    label: 'Leyenda - Ancestral',
    rankBadge: '3.8k - 5.5k MMR',
    description: 'Partidas avanzadas y juego estratégico',
  },
  {
    key: '20',
    label: 'Cruzado - Arconte',
    rankBadge: '1.8k - 3.7k MMR',
    description: 'La mayoría de la comunidad competitiva',
  },
  {
    key: '7',
    label: 'Heraldo - Guardián',
    rankBadge: '0 - 1.7k MMR',
    description: 'Iniciación y partidas introductorias',
  },
];

interface AttributeMeta {
  key: AttributeKey;
  label: string;
  shortLabel: string;
  colorName: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  barColor: string;
}

const ATTRIBUTES_MAP: Record<AttributeKey, AttributeMeta> = {
  all_attrs: {
    key: 'all_attrs',
    label: 'Todos los Atributos',
    shortLabel: 'Todos',
    colorName: 'gray',
    textColor: 'text-gray-300',
    borderColor: 'border-slate-700',
    bgColor: 'bg-slate-800/60',
    badgeBg: 'bg-slate-800 text-gray-200 border-slate-700',
    barColor: 'bg-slate-500',
  },
  str: {
    key: 'str',
    label: 'Fuerza',
    shortLabel: 'Fuerza',
    colorName: 'rose',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-950/30',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    barColor: 'bg-rose-500',
  },
  agi: {
    key: 'agi',
    label: 'Agilidad',
    shortLabel: 'Agilidad',
    colorName: 'emerald',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/30',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    barColor: 'bg-emerald-500',
  },
  int: {
    key: 'int',
    label: 'Inteligencia',
    shortLabel: 'Inteligencia',
    colorName: 'sky',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/40',
    bgColor: 'bg-sky-950/30',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    barColor: 'bg-sky-500',
  },
  all: {
    key: 'all',
    label: 'Universal',
    shortLabel: 'Universal',
    colorName: 'purple',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-950/30',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    barColor: 'bg-purple-500',
  },
};

interface TierMeta {
  key: TierKey;
  label: string;
  threshold: string;
  minWr: number;
  maxWr: number;
  theme: {
    pill: string;
    cardBorder: string;
    text: string;
    gradient: string;
    badge: string;
  };
  description: string;
}

const TIERS_MAP: Record<TierKey, TierMeta> = {
  S: {
    key: 'S',
    label: 'Tier S',
    threshold: '≥ 54.0% WR',
    minWr: 54.0,
    maxWr: 100,
    theme: {
      pill: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      cardBorder: 'border-amber-500/40 hover:border-amber-500/70',
      text: 'text-amber-400',
      gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
      badge: 'bg-amber-500 text-slate-950 font-black',
    },
    description: 'Héroes dominantes del parche. Elección o baneo de máxima prioridad.',
  },
  A: {
    key: 'A',
    label: 'Tier A',
    threshold: '52.0% - 53.9% WR',
    minWr: 52.0,
    maxWr: 54.0,
    theme: {
      pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      cardBorder: 'border-emerald-500/40 hover:border-emerald-500/70',
      text: 'text-emerald-400',
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      badge: 'bg-emerald-500 text-slate-950 font-black',
    },
    description: 'Opciones muy sólidas y consistentes con alto porcentaje de victoria.',
  },
  B: {
    key: 'B',
    label: 'Tier B',
    threshold: '50.0% - 51.9% WR',
    minWr: 50.0,
    maxWr: 52.0,
    theme: {
      pill: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
      cardBorder: 'border-sky-500/40 hover:border-sky-500/70',
      text: 'text-sky-400',
      gradient: 'from-sky-500/20 via-sky-500/5 to-transparent',
      badge: 'bg-sky-500 text-slate-950 font-black',
    },
    description: 'Héroes equilibrados y estables. Rinden según la composición y habilidad.',
  },
  C: {
    key: 'C',
    label: 'Tier C',
    threshold: '48.0% - 49.9% WR',
    minWr: 48.0,
    maxWr: 50.0,
    theme: {
      pill: 'bg-slate-700/40 text-slate-300 border-slate-600/50',
      cardBorder: 'border-slate-700/60 hover:border-slate-600/70',
      text: 'text-slate-300',
      gradient: 'from-slate-700/20 via-slate-800/5 to-transparent',
      badge: 'bg-slate-600 text-white font-black',
    },
    description: 'Héroes situacionales. Requieren drafts específicos o gran dominio.',
  },
  D: {
    key: 'D',
    label: 'Tier D',
    threshold: '< 48.0% WR',
    minWr: 0,
    maxWr: 48.0,
    theme: {
      pill: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      cardBorder: 'border-rose-500/40 hover:border-rose-500/70',
      text: 'text-rose-400',
      gradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
      badge: 'bg-rose-500 text-slate-950 font-black',
    },
    description: 'Héroes con bajo rendimiento actual. Desfavorecidos por el parche.',
  },
};

// ==========================================
// Helper Functions
// ==========================================

function getHeroImageUrl(name: string, fallbackImg?: string): string {
  if (name) {
    const heroKey = name.replace(/^npc_dota_hero_/, '');
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroKey}.png`;
  }
  if (fallbackImg) {
    if (fallbackImg.startsWith('http')) return fallbackImg;
    const clean = fallbackImg.startsWith('/') ? fallbackImg : `/${fallbackImg}`;
    return `https://cdn.cloudflare.steamstatic.com${clean}`;
  }
  return '';
}

function formatNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toLocaleString('es-ES');
}

function formatRelativeTimeSpanish(timestamp: number): string {
  if (!timestamp || isNaN(timestamp)) return 'Recientemente';
  const elapsed = Math.floor((Date.now() - timestamp) / 1000);
  if (elapsed < 60) return 'Hace instantes';
  const minutes = Math.floor(elapsed / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

function extractBracketStats(hero: RawHeroStat, bracket: BracketKey): { picks: number; wins: number; winrate: number } {
  let picks = 0;
  let wins = 0;

  if (bracket === '7') {
    // Herald (1) + Guardian (2)
    const p1 = Number(hero['1_pick']) || Number(hero['10_pick']) || 0;
    const w1 = Number(hero['1_win']) || Number(hero['10_win']) || 0;
    const p2 = Number(hero['2_pick']) || Number(hero['20_pick']) || 0;
    const w2 = Number(hero['2_win']) || Number(hero['20_win']) || 0;

    if (p1 + p2 > 0) {
      picks = p1 + p2;
      wins = w1 + w2;
    } else if (typeof hero['7_pick'] === 'number' && hero['7_pick'] > 0) {
      picks = hero['7_pick'];
      wins = Number(hero['7_win']) || 0;
    }
  } else if (bracket === '20') {
    // Crusader (3) + Archon (4)
    const p3 = Number(hero['3_pick']) || Number(hero['30_pick']) || 0;
    const w3 = Number(hero['3_win']) || Number(hero['30_win']) || 0;
    const p4 = Number(hero['4_pick']) || Number(hero['40_pick']) || 0;
    const w4 = Number(hero['4_win']) || Number(hero['40_win']) || 0;

    if (p3 + p4 > 0) {
      picks = p3 + p4;
      wins = w3 + w4;
    } else if (typeof hero['20_pick'] === 'number' && hero['20_pick'] > 0) {
      picks = hero['20_pick'];
      wins = Number(hero['20_win']) || 0;
    }
  } else if (bracket === '40') {
    // Legend (5) + Ancient (6)
    const p5 = Number(hero['5_pick']) || Number(hero['50_pick']) || 0;
    const w5 = Number(hero['5_win']) || Number(hero['50_win']) || 0;
    const p6 = Number(hero['6_pick']) || Number(hero['60_pick']) || 0;
    const w6 = Number(hero['6_win']) || Number(hero['60_win']) || 0;

    if (p5 + p6 > 0) {
      picks = p5 + p6;
      wins = w5 + w6;
    } else if (typeof hero['40_pick'] === 'number' && hero['40_pick'] > 0) {
      picks = hero['40_pick'];
      wins = Number(hero['40_win']) || 0;
    }
  } else if (bracket === '80') {
    // Divine (7) + Immortal (8)
    const p80 = Number(hero['80_pick']) || 0;
    const w80 = Number(hero['80_win']) || 0;
    const p60 = Number(hero['60_pick']) || Number(hero['70_pick']) || 0;
    const w60 = Number(hero['60_win']) || Number(hero['70_win']) || 0;

    const p7 = Number(hero['7_pick']) || 0;
    const w7 = Number(hero['7_win']) || 0;
    const p8 = Number(hero['8_pick']) || 0;
    const w8 = Number(hero['8_win']) || 0;

    if (p80 > 0) {
      picks = p80 + p60;
      wins = w80 + w60;
    } else if (p7 + p8 > 0) {
      picks = p7 + p8;
      wins = w7 + w8;
    } else if (typeof hero['8_pick'] === 'number' && hero['8_pick'] > 0) {
      picks = hero['8_pick'];
      wins = Number(hero['8_win']) || 0;
    }
  }

  // General fallback
  if (picks === 0 && typeof hero.pro_pick === 'number' && hero.pro_pick > 0) {
    picks = hero.pro_pick;
    wins = Number(hero.pro_win) || 0;
  }

  const winrate = picks > 0 ? (wins / picks) * 100 : 0;
  return { picks, wins, winrate };
}

function calculateTier(winrate: number, picks: number): TierKey | 'UNRANKED' {
  if (picks < MIN_PICKS_THRESHOLD) {
    return 'UNRANKED';
  }
  if (winrate >= 54.0) return 'S';
  if (winrate >= 52.0) return 'A';
  if (winrate >= 50.0) return 'B';
  if (winrate >= 48.0) return 'C';
  return 'D';
}

// ==========================================
// Subcomponent: Hero Card Item
// ==========================================

interface HeroItemProps {
  hero: ProcessedHero;
  onSelect: (hero: ProcessedHero) => void;
  showRank?: number;
  highlightWr?: boolean;
}

const HeroCardItem: React.FC<HeroItemProps> = ({
  hero,
  onSelect,
  showRank,
  highlightWr = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const heroImg = getHeroImageUrl(hero.name, hero.img);
  const attrInfo = ATTRIBUTES_MAP[hero.primary_attr] || ATTRIBUTES_MAP.all_attrs;

  const isPositiveWr = hero.winrate >= 50.0;
  const isHighWr = hero.winrate >= 54.0;
  const isLowWr = hero.winrate < 48.0;

  return (
    <button
      onClick={() => onSelect(hero)}
      className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-left shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
      title={`${hero.localized_name} - ${hero.winrate.toFixed(1)}% Winrate (${formatNumber(hero.picks)} partidas)`}
    >
      {/* Primary attribute indicator line on left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${attrInfo.barColor}`} />

      {/* Optional Rank Badge */}
      {showRank !== undefined && (
        <div className="flex-shrink-0 w-6 text-center font-black text-xs font-mono text-gray-400 group-hover:text-white">
          #{showRank}
        </div>
      )}

      {/* Hero Thumbnail */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 group-hover:border-slate-600 transition shadow">
        {!imgError && heroImg ? (
          <img
            src={heroImg}
            alt={hero.localized_name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-xs uppercase text-gray-400">
            {hero.localized_name.slice(0, 2)}
          </div>
        )}

        {/* Mini Attribute Icon overlay */}
        <span
          className={`absolute bottom-0 right-0 px-1 py-0.2 text-[8px] font-black uppercase rounded-tl ${attrInfo.badgeBg}`}
        >
          {hero.primary_attr === 'str'
            ? 'STR'
            : hero.primary_attr === 'agi'
            ? 'AGI'
            : hero.primary_attr === 'int'
            ? 'INT'
            : 'UNI'}
        </span>
      </div>

      {/* Hero Info */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-1">
          <span className="font-semibold text-xs text-gray-100 group-hover:text-white truncate">
            {hero.localized_name}
          </span>
          <span
            className={`font-mono text-xs font-bold ${
              highlightWr
                ? isHighWr
                  ? 'text-amber-400'
                  : isPositiveWr
                  ? 'text-emerald-400'
                  : isLowWr
                  ? 'text-rose-400'
                  : 'text-gray-300'
                : 'text-gray-200'
            }`}
          >
            {hero.winrate.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
          <span className="truncate max-w-[90px]">{hero.roles[0] || 'Hero'}</span>
          <span className="font-mono text-[10px] text-gray-400">
            {formatNumber(hero.picks)} picks
          </span>
        </div>
      </div>
    </button>
  );
};

// ==========================================
// Subcomponent: Hero Detail Modal
// ==========================================

interface HeroModalProps {
  hero: ProcessedHero | null;
  onClose: () => void;
  activeBracket: BracketKey;
}

const HeroDetailModal: React.FC<HeroModalProps> = ({
  hero,
  onClose,
  activeBracket,
}) => {
  if (!hero) return null;

  const heroImg = getHeroImageUrl(hero.name, hero.img);
  const attrInfo = ATTRIBUTES_MAP[hero.primary_attr] || ATTRIBUTES_MAP.all_attrs;
  const tierInfo = hero.tier !== 'UNRANKED' ? TIERS_MAP[hero.tier] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Hero Banner */}
        <div className="relative h-32 sm:h-40 bg-slate-950 overflow-hidden">
          {heroImg && (
            <img
              src={heroImg}
              alt={hero.localized_name}
              className="w-full h-full object-cover object-top opacity-50 blur-sm scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-gray-300 hover:text-white transition border border-slate-700/80"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero Avatar & Name Overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3.5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-xl flex-shrink-0">
              <img
                src={heroImg}
                alt={hero.localized_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {hero.localized_name}
                </h3>
                {tierInfo && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-black uppercase ${tierInfo.theme.pill}`}
                  >
                    {tierInfo.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                <span className={`font-semibold ${attrInfo.textColor}`}>
                  {attrInfo.label}
                </span>
                <span>•</span>
                <span className="capitalize">{hero.attack_type || 'Melee'}</span>
                <span>•</span>
                <span className="truncate">{hero.roles.slice(0, 3).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Active Bracket Performance Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Rendimiento en Bracket Seleccionado
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-gray-300">
                {BRACKET_OPTIONS.find((b) => b.key === activeBracket)?.label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[11px] text-gray-400 block mb-0.5">Winrate</span>
                <span
                  className={`text-lg sm:text-xl font-mono font-bold ${
                    hero.winrate >= 54.0
                      ? 'text-amber-400'
                      : hero.winrate >= 50.0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {hero.winrate.toFixed(1)}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[11px] text-gray-400 block mb-0.5">Partidas</span>
                <span className="text-lg sm:text-xl font-mono font-bold text-white">
                  {formatNumber(hero.picks)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                <span className="text-[11px] text-gray-400 block mb-0.5">Victorias</span>
                <span className="text-lg sm:text-xl font-mono font-bold text-emerald-400">
                  {formatNumber(hero.wins)}
                </span>
              </div>
            </div>
          </div>

          {/* Winrate Across All Skill Brackets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold uppercase tracking-wider text-gray-400">
                Winrate por Rango de Habilidad
              </span>
              <span className="text-[11px] text-gray-500">Comparativa Global</span>
            </div>

            <div className="space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
              {BRACKET_OPTIONS.map((bracket) => {
                const bStats = hero.bracketStats[bracket.key];
                const wr = bStats ? bStats.winrate : 0;
                const picks = bStats ? bStats.picks : 0;
                const isCurrent = bracket.key === activeBracket;

                return (
                  <div
                    key={bracket.key}
                    className={`flex items-center gap-3 p-2 rounded-lg text-xs transition ${
                      isCurrent
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-36 flex-shrink-0">
                      <div className="font-medium text-gray-200 truncate">
                        {bracket.label}
                      </div>
                      <div className="text-[10px] text-gray-500">{bracket.rankBadge}</div>
                    </div>

                    <div className="flex-1">
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            wr >= 54
                              ? 'bg-amber-400'
                              : wr >= 50
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(Math.max(wr, 0), 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-20 text-right flex-shrink-0 font-mono">
                      <span
                        className={`font-bold ${
                          wr >= 50 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {wr.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-gray-500 block">
                        {formatNumber(picks)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Base Stats Highlights */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
              Atributos & Estadísticas Base
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="text-[10px] text-gray-500 block">Vida Base</span>
                  <span className="font-mono font-bold text-gray-200">
                    {hero.base_health || 120}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-[10px] text-gray-500 block">Maná Base</span>
                  <span className="font-mono font-bold text-gray-200">
                    {hero.base_mana || 75}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-gray-500 block">Armadura</span>
                  <span className="font-mono font-bold text-gray-200">
                    {typeof hero.base_armor === 'number' ? hero.base_armor.toFixed(1) : '0'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="text-[10px] text-gray-500 block">Velocidad</span>
                  <span className="font-mono font-bold text-gray-200">
                    {hero.move_speed || 300}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Fuente: OpenDota Live Meta Data
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Main Component: MetaPage
// ==========================================

export const MetaPage: React.FC = () => {
  // State
  const [rawHeroes, setRawHeroes] = useState<RawHeroStat[]>([]);
  const [patchVersion, setPatchVersion] = useState<string>(DEFAULT_PATCH);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Controls State
  const [activeBracket, setActiveBracket] = useState<BracketKey>('80');
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeKey>('all_attrs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHero, setSelectedHero] = useState<ProcessedHero | null>(null);

  // ------------------------------------------
  // Cache & Fetch Logic
  // ------------------------------------------

  const loadCachedData = useCallback((): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return false;

      const parsed: CachedMetaPayload = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.heroes) || parsed.heroes.length === 0) {
        return false;
      }

      const now = Date.now();
      const isExpired = now - parsed.timestamp > CACHE_TTL_MS;

      // Even if expired, use as fast initial render while background revalidating
      setRawHeroes(parsed.heroes);
      setPatchVersion(parsed.patch || DEFAULT_PATCH);
      setLastUpdated(parsed.timestamp);

      if (!isExpired) {
        setLoading(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const saveCacheData = useCallback((heroes: RawHeroStat[], patch: string) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const payload: CachedMetaPayload = {
        heroes,
        patch,
        timestamp: Date.now(),
      };
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, []);

  const fetchMetaData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch hero stats from OpenDota API
      const heroStatsResponse = await fetch('https://api.opendota.com/api/heroStats');
      if (!heroStatsResponse.ok) {
        throw new Error(`Error de OpenDota API (${heroStatsResponse.status}): ${heroStatsResponse.statusText}`);
      }
      const heroStatsData: RawHeroStat[] = await heroStatsResponse.json();

      if (!Array.isArray(heroStatsData) || heroStatsData.length === 0) {
        throw new Error('No se recibieron datos válidos de héroes desde OpenDota.');
      }

      // Try fetching latest patch info if available, otherwise default
      let detectedPatch = DEFAULT_PATCH;
      try {
        const patchRes = await fetch('https://api.opendota.com/api/constants/patch');
        if (patchRes.ok) {
          const patchList = await patchRes.json();
          if (Array.isArray(patchList) && patchList.length > 0) {
            const lastPatch = patchList[patchList.length - 1];
            if (lastPatch?.name) {
              detectedPatch = lastPatch.name;
            }
          }
        }
      } catch {
        // Silently keep default patch
      }

      setRawHeroes(heroStatsData);
      setPatchVersion(detectedPatch);
      setLastUpdated(Date.now());
      saveCacheData(heroStatsData, detectedPatch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos del meta';
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [saveCacheData]);

  useEffect(() => {
    const hasFreshCache = loadCachedData();
    if (!hasFreshCache) {
      fetchMetaData(false);
    }
  }, [loadCachedData, fetchMetaData]);

  // ------------------------------------------
  // Processed Heroes for Active Bracket
  // ------------------------------------------

  const processedHeroes: ProcessedHero[] = useMemo(() => {
    if (!rawHeroes || rawHeroes.length === 0) return [];

    return rawHeroes.map((hero) => {
      // Calculate stats for all 4 brackets
      const bracketStats: Record<BracketKey, { picks: number; wins: number; winrate: number }> = {
        '7': extractBracketStats(hero, '7'),
        '20': extractBracketStats(hero, '20'),
        '40': extractBracketStats(hero, '40'),
        '80': extractBracketStats(hero, '80'),
      };

      const currentStats = bracketStats[activeBracket];
      const tier = calculateTier(currentStats.winrate, currentStats.picks);

      return {
        id: hero.id,
        name: hero.name,
        heroKey: hero.name ? hero.name.replace(/^npc_dota_hero_/, '') : '',
        localized_name: hero.localized_name || 'Desconocido',
        primary_attr: hero.primary_attr || 'str',
        attack_type: hero.attack_type || 'Melee',
        roles: Array.isArray(hero.roles) ? hero.roles : [],
        img: hero.img || '',
        icon: hero.icon || '',
        base_health: hero.base_health || 120,
        base_mana: hero.base_mana || 75,
        base_armor: hero.base_armor || 0,
        move_speed: hero.move_speed || 300,
        pro_pick: hero.pro_pick || 0,
        pro_win: hero.pro_win || 0,
        pro_ban: hero.pro_ban || 0,
        picks: currentStats.picks,
        wins: currentStats.wins,
        winrate: currentStats.winrate,
        tier,
        bracketStats,
      };
    });
  }, [rawHeroes, activeBracket]);

  // ------------------------------------------
  // Filtered Heroes (Search & Attribute)
  // ------------------------------------------

  const filteredHeroes = useMemo(() => {
    return processedHeroes.filter((hero) => {
      // Attribute filter
      if (selectedAttribute !== 'all_attrs' && hero.primary_attr !== selectedAttribute) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = hero.localized_name.toLowerCase().includes(query);
        const matchesRole = hero.roles.some((r) => r.toLowerCase().includes(query));
        if (!matchesName && !matchesRole) return false;
      }
      return true;
    });
  }, [processedHeroes, selectedAttribute, searchQuery]);

  // ------------------------------------------
  // Tier List Grouping
  // ------------------------------------------

  const tierGroups = useMemo(() => {
    const groups: Record<TierKey, ProcessedHero[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
    };

    filteredHeroes.forEach((hero) => {
      if (hero.tier !== 'UNRANKED' && groups[hero.tier]) {
        groups[hero.tier].push(hero);
      }
    });

    // Sort heroes in each tier by winrate descending
    (Object.keys(groups) as TierKey[]).forEach((tier) => {
      groups[tier].sort((a, b) => b.winrate - a.winrate);
    });

    return groups;
  }, [filteredHeroes]);

  // ------------------------------------------
  // Top 10 Leaders
  // ------------------------------------------

  const top10MostPicked = useMemo(() => {
    return [...processedHeroes]
      .sort((a, b) => b.picks - a.picks)
      .slice(0, 10);
  }, [processedHeroes]);

  const top10BestWinrate = useMemo(() => {
    return [...processedHeroes]
      .filter((h) => h.picks >= MIN_PICKS_THRESHOLD)
      .sort((a, b) => b.winrate - a.winrate)
      .slice(0, 10);
  }, [processedHeroes]);

  const top10WorstWinrate = useMemo(() => {
    return [...processedHeroes]
      .filter((h) => h.picks >= MIN_PICKS_THRESHOLD)
      .sort((a, b) => a.winrate - b.winrate)
      .slice(0, 10);
  }, [processedHeroes]);

  // ------------------------------------------
  // Attribute Distribution for S + A Tier
  // ------------------------------------------

  const attributeDistribution = useMemo(() => {
    const saHeroes = processedHeroes.filter(
      (h) => (h.tier === 'S' || h.tier === 'A') && h.picks >= MIN_PICKS_THRESHOLD
    );

    const total = saHeroes.length;
    const counts = {
      str: 0,
      agi: 0,
      int: 0,
      all: 0,
    };

    saHeroes.forEach((h) => {
      if (counts[h.primary_attr] !== undefined) {
        counts[h.primary_attr]++;
      }
    });

    return {
      total,
      str: {
        count: counts.str,
        pct: total > 0 ? (counts.str / total) * 100 : 0,
      },
      agi: {
        count: counts.agi,
        pct: total > 0 ? (counts.agi / total) * 100 : 0,
      },
      int: {
        count: counts.int,
        pct: total > 0 ? (counts.int / total) * 100 : 0,
      },
      all: {
        count: counts.all,
        pct: total > 0 ? (counts.all / total) * 100 : 0,
      },
    };
  }, [processedHeroes]);

  // ------------------------------------------
  // Summary Stats
  // ------------------------------------------

  const totalPicksInBracket = useMemo(() => {
    return processedHeroes.reduce((sum, h) => sum + h.picks, 0);
  }, [processedHeroes]);

  // ------------------------------------------
  // Render: Loading State
  // ------------------------------------------

  if (loading && rawHeroes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loading message="Cargando estadísticas del Meta de Dota 2..." size="lg" />
        <p className="text-xs text-gray-500 mt-2 max-w-sm">
          Analizando datos de victorias, selecciones y distribución de héroes en todos los brackets...
        </p>
      </div>
    );
  }

  // ------------------------------------------
  // Render: Error State (No data available)
  // ------------------------------------------

  if (error && rawHeroes.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
          <TrendingDown className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          No se pudieron cargar las estadísticas del Meta
        </h2>
        <p className="text-sm text-gray-400 mb-6 max-w-md">
          {error}. Verifica tu conexión a internet o intenta nuevamente en unos momentos.
        </p>
        <button
          onClick={() => fetchMetaData(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition shadow-lg shadow-red-900/30"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar Carga</span>
        </button>
      </div>
    );
  }

  // ------------------------------------------
  // Render: Main View
  // ------------------------------------------

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header: Patch Info & Overview */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Main Title & Patch Badge */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Flame className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Meta & Tier List
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-red-950">
                  Parche {patchVersion}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-gray-300 text-xs font-medium">
                  {rawHeroes.length} Héroes Analizados
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Analítica competitiva en tiempo real basada en partidas oficiales y clasificatorias.
              Descubre los héroes más dominantes, tasas de victoria y distribución de atributos por rango.
            </p>
          </div>

          {/* Sync status & Refresh button */}
          <div className="flex items-center sm:items-end flex-col gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchMetaData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-gray-200 hover:text-white transition shadow disabled:opacity-50 cursor-pointer"
                title="Actualizar datos desde OpenDota API"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-red-400 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>{isRefreshing ? 'Actualizando...' : 'Refrescar'}</span>
              </button>
            </div>

            <span className="text-[11px] text-gray-500 font-mono">
              Actualizado {formatRelativeTimeSpanish(lastUpdated)}
            </span>
          </div>
        </div>

        {/* Global Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-gray-400 block mb-0.5">Partidas Analizadas</span>
            <span className="text-lg font-mono font-bold text-white">
              {formatNumber(totalPicksInBracket)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-gray-400 block mb-0.5">Héroes en Tier S</span>
            <span className="text-lg font-mono font-bold text-amber-400">
              {tierGroups.S.length} Héroes
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-gray-400 block mb-0.5">Mejor Winrate</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {top10BestWinrate[0] ? `${top10BestWinrate[0].winrate.toFixed(1)}%` : '0%'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] text-gray-400 block mb-0.5">Héroe Más Popular</span>
            <span className="text-sm font-semibold text-gray-200 truncate block">
              {top10MostPicked[0]?.localized_name || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Bracket Selector: Toggle MMR Rank */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
            <span>Seleccionar Rango de Habilidad (Bracket)</span>
          </label>
          <span className="text-[11px] text-gray-500">
            Datos calibrados por división de medallas
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {BRACKET_OPTIONS.map((bracket) => {
            const isSelected = activeBracket === bracket.key;
            return (
              <button
                key={bracket.key}
                onClick={() => setActiveBracket(bracket.key)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-red-600/20 to-red-950/40 border-red-500/80 shadow-lg shadow-red-950/40 text-white'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-gray-300 hover:text-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/20 rounded-bl-xl flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  </div>
                )}
                <span className="font-bold text-sm tracking-tight">{bracket.label}</span>
                <span
                  className={`text-[11px] font-mono mt-0.5 ${
                    isSelected ? 'text-red-300 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {bracket.rankBadge}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                  {bracket.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Attribute Distribution Chart (S + A Tier Heroes) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Distribución de Atributos en Tier S y A
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Porcentaje de héroes dominantes (Winrate ≥ 52%) clasificados por su atributo principal
            </p>
          </div>

          <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-gray-300 flex-shrink-0 self-start sm:self-auto">
            Total S+A: <strong className="text-white">{attributeDistribution.total}</strong> héroes
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            {attributeDistribution.total > 0 ? (
              <>
                <div
                  className="h-full bg-rose-500 rounded-l-full transition-all duration-500"
                  style={{ width: `${attributeDistribution.str.pct}%` }}
                  title={`Fuerza: ${attributeDistribution.str.pct.toFixed(1)}%`}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${attributeDistribution.agi.pct}%` }}
                  title={`Agilidad: ${attributeDistribution.agi.pct.toFixed(1)}%`}
                />
                <div
                  className="h-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${attributeDistribution.int.pct}%` }}
                  title={`Inteligencia: ${attributeDistribution.int.pct.toFixed(1)}%`}
                />
                <div
                  className="h-full bg-purple-500 rounded-r-full transition-all duration-500"
                  style={{ width: `${attributeDistribution.all.pct}%` }}
                  title={`Universal: ${attributeDistribution.all.pct.toFixed(1)}%`}
                />
              </>
            ) : (
              <div className="h-full w-full bg-slate-800 rounded-full" />
            )}
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-rose-300 uppercase block">
                  Fuerza (STR)
                </span>
                <span className="text-lg font-mono font-bold text-rose-400">
                  {attributeDistribution.str.pct.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400 px-2 py-1 rounded bg-slate-950/80">
                {attributeDistribution.str.count} héroes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-300 uppercase block">
                  Agilidad (AGI)
                </span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {attributeDistribution.agi.pct.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400 px-2 py-1 rounded bg-slate-950/80">
                {attributeDistribution.agi.count} héroes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-sky-300 uppercase block">
                  Inteligencia (INT)
                </span>
                <span className="text-lg font-mono font-bold text-sky-400">
                  {attributeDistribution.int.pct.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400 px-2 py-1 rounded bg-slate-950/80">
                {attributeDistribution.int.count} héroes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-purple-300 uppercase block">
                  Universal (UNI)
                </span>
                <span className="text-lg font-mono font-bold text-purple-400">
                  {attributeDistribution.all.pct.toFixed(1)}%
                </span>
              </div>
              <span className="text-xs font-mono text-gray-400 px-2 py-1 rounded bg-slate-950/80">
                {attributeDistribution.all.count} héroes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4, 5, 6. Top 10 Statistical Leaders */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-red-500" />
            <span>Líderes Estadísticos del Bracket</span>
          </h2>
          <p className="text-xs text-gray-400">
            Los diez mejores y peores exponentes según volumen de partidas y tasa de victoria (mínimo 100 partidas)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Top 10 Más Pickeados */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Top 10 Más Pickeados</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Por volumen</span>
            </div>

            <div className="space-y-2 flex-1">
              {top10MostPicked.map((hero, idx) => (
                <HeroCardItem
                  key={hero.id}
                  hero={hero}
                  showRank={idx + 1}
                  onSelect={setSelectedHero}
                  highlightWr={false}
                />
              ))}
            </div>
          </div>

          {/* Top 10 Mejor Winrate */}
          <div className="bg-slate-900/80 border border-emerald-950/60 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-emerald-300">Top 10 Mejor Winrate</h3>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Mayor victoria</span>
            </div>

            <div className="space-y-2 flex-1">
              {top10BestWinrate.map((hero, idx) => (
                <HeroCardItem
                  key={hero.id}
                  hero={hero}
                  showRank={idx + 1}
                  onSelect={setSelectedHero}
                  highlightWr={true}
                />
              ))}
            </div>
          </div>

          {/* Top 10 Peor Winrate */}
          <div className="bg-slate-900/80 border border-rose-950/60 rounded-2xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-rose-300">Top 10 Peor Winrate</h3>
              </div>
              <span className="text-[10px] text-rose-400/80 font-mono">Bajo rendimiento</span>
            </div>

            <div className="space-y-2 flex-1">
              {top10WorstWinrate.map((hero, idx) => (
                <HeroCardItem
                  key={hero.id}
                  hero={hero}
                  showRank={idx + 1}
                  onSelect={setSelectedHero}
                  highlightWr={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tier List Section (S, A, B, C, D) with Search & Attribute Filter */}
      <div className="space-y-5 pt-4">
        {/* Tier List Filter Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar héroe por nombre o rol..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Attribute Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(Object.keys(ATTRIBUTES_MAP) as AttributeKey[]).map((attrKey) => {
              const attr = ATTRIBUTES_MAP[attrKey];
              const isSelected = selectedAttribute === attrKey;

              return (
                <button
                  key={attrKey}
                  onClick={() => setSelectedAttribute(attrKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-950 text-gray-400 hover:text-gray-200 hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  {attr.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier Rows: S, A, B, C, D */}
        <div className="space-y-6">
          {(Object.keys(TIERS_MAP) as TierKey[]).map((tierKey) => {
            const tier = TIERS_MAP[tierKey];
            const heroesInTier = tierGroups[tierKey];

            return (
              <div
                key={tierKey}
                className={`bg-slate-900/80 border ${tier.theme.cardBorder} rounded-2xl overflow-hidden shadow-xl transition`}
              >
                {/* Tier Row Header */}
                <div
                  className={`bg-gradient-to-r ${tier.theme.gradient} bg-slate-950/60 p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    {/* Big Tier Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md ${tier.theme.badge}`}
                    >
                      {tier.key}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-base ${tier.theme.text}`}>
                          {tier.label}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-gray-300">
                          {tier.threshold}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400 self-end sm:self-auto">
                    <span>
                      <strong className="text-white">{heroesInTier.length}</strong>{' '}
                      {heroesInTier.length === 1 ? 'héroe' : 'héroes'}
                    </span>
                    {heroesInTier.length > 0 && (
                      <span className="text-[11px] text-gray-500">
                        (
                        {(
                          heroesInTier.reduce((sum, h) => sum + h.winrate, 0) /
                          heroesInTier.length
                        ).toFixed(1)}
                        % WR prom.)
                      </span>
                    )}
                  </div>
                </div>

                {/* Heroes in Tier */}
                <div className="p-4">
                  {heroesInTier.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                      {heroesInTier.map((hero) => (
                        <HeroCardItem
                          key={hero.id}
                          hero={hero}
                          onSelect={setSelectedHero}
                          highlightWr={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      No hay héroes en este tier con los filtros actuales.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Detail Modal */}
      <HeroDetailModal
        hero={selectedHero}
        onClose={() => setSelectedHero(null)}
        activeBracket={activeBracket}
      />
    </div>
  );
};

export default MetaPage;
