import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Shield,
  Zap,
  Brain,
  Sparkles,
  Swords,
  Crosshair,
  ArrowLeft,
  Heart,
  Droplets,
  RotateCcw,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Award,
  BookOpen,
  Filter,
  Eye,
  Layers,
  Activity,
  Percent,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';

// ─── INTERFACES & TYPES ───────────────────────────────────────────────────────

export interface HeroData {
  id: number;
  name: string; // e.g. "npc_dota_hero_antimage"
  localized_name: string; // e.g. "Anti-Mage"
  primary_attr: 'str' | 'agi' | 'int' | 'all' | string;
  attack_type: 'Melee' | 'Ranged' | string;
  roles: string[];
  img?: string;
  icon?: string;
  base_health?: number;
  base_health_regen?: number;
  base_mana?: number;
  base_mana_regen?: number;
  base_armor?: number;
  base_mr?: number;
  base_attack_min?: number;
  base_attack_max?: number;
  base_str?: number;
  base_agi?: number;
  base_int?: number;
  str_gain?: number;
  agi_gain?: number;
  int_gain?: number;
  attack_range?: number;
  projectile_speed?: number;
  attack_rate?: number;
  move_speed?: number;
  turn_rate?: number | null;
  cm_enabled?: boolean;
  legs?: number;
}

export interface AbilityConstant {
  dname?: string;
  behavior?: string | string[];
  dmg_type?: string;
  bkbpierce?: string;
  desc?: string;
  attrib?: Array<{ key: string; header: string; value: string | string[] }>;
  cost?: string | string[] | number | number[];
  mc?: string | string[] | number | number[];
  cd?: string | string[] | number | number[];
  img?: string;
  is_talent?: boolean;
  scepter_desc?: string;
  shard_desc?: string;
  aghanims_scepter_desc?: string;
  aghanims_shard_desc?: string;
}

export interface HeroAbilityMapping {
  abilities: string[];
  talents: Array<{
    name: string;
    level: number;
  }>;
}

export interface ItemConstant {
  id: number;
  name?: string;
  dname: string;
  cost?: number | null;
  img: string;
}

export interface ItemPopularityResponse {
  start_game_items?: Record<string, number>;
  early_game_items?: Record<string, number>;
  mid_game_items?: Record<string, number>;
  late_game_items?: Record<string, number>;
}

export interface MatchupEntry {
  hero_id: number;
  games_played: number;
  wins: number;
}

export interface HeroMatchupCardData {
  heroId: number;
  heroKey: string;
  nameEn: string;
  nameEs: string;
  winrate: number;
  games: number;
  primaryAttr: string;
}

// ─── LOCAL STORAGE CACHING HELPERS ───────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = 'dotascope_encyclopedia_';

function getLocalCache<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const payload = {
      timestamp: Date.now(),
      data,
    };
    window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch {
    // Ignore storage limit errors gracefully
  }
}

// ─── HERO SPANISH TRANSLATIONS ────────────────────────────────────────────────

const HERO_NAME_ES: Record<string, string> = {
  'Anti-Mage': 'Anti-Mago',
  'Axe': 'Hacha',
  'Bane': 'Azote',
  'Bloodseeker': 'Buscasangre',
  'Crystal Maiden': 'Doncella de Cristal',
  'Drow Ranger': 'Guardabosques Oscura',
  'Earthshaker': 'Sacudidor de Tierra',
  'Juggernaut': 'Yúgernot',
  'Mirana': 'Mirana',
  'Morphling': 'Mutamorfo',
  'Shadow Fiend': 'Demonio de las Sombras',
  'Phantom Lancer': 'Lancero Fantasma',
  'Puck': 'Puck',
  'Pudge': 'Pudge',
  'Razor': 'Navaja',
  'Sand King': 'Rey de las Arenas',
  'Storm Spirit': 'Espíritu de la Tormenta',
  'Sven': 'Sven',
  'Tiny': 'Pequeñín',
  'Vengeful Spirit': 'Espíritu Vengativo',
  'Windranger': 'Guardabosques del Viento',
  'Zeus': 'Zeus',
  'Kunkka': 'Kunkka',
  'Lina': 'Lina',
  'Lion': 'León',
  'Shadow Shaman': 'Chamán de las Sombras',
  'Slardar': 'Slardar',
  'Tidehunter': 'Cazador de Mareas',
  'Witch Doctor': 'Médico Brujo',
  'Lich': 'Lich',
  'Riki': 'Riki',
  'Enigma': 'Enigma',
  'Tinker': 'Manitas',
  'Sniper': 'Francotirador',
  'Necrophos': 'Necrófago',
  'Warlock': 'Brujo',
  'Beastmaster': 'Maestro de Bestias',
  'Queen of Pain': 'Reina del Dolor',
  'Venomancer': 'Venomante',
  'Faceless Void': 'Vacío Sin Rostro',
  'Wraith King': 'Rey Fantasma',
  'Death Prophet': 'Profeta de la Muerte',
  'Phantom Assassin': 'Asesina Fantasma',
  'Pugna': 'Pugna',
  'Templar Assassin': 'Asesina Templaria',
  'Viper': 'Víbora',
  'Luna': 'Luna',
  'Dragon Knight': 'Caballero Dragón',
  'Dazzle': 'Dazzle',
  'Clockwerk': 'Mecanismo',
  'Leshrac': 'Leshrac',
  "Nature's Prophet": 'Profeta de la Naturaleza',
  'Lifestealer': 'Roba-Vidas',
  'Dark Seer': 'Vidente Oscuro',
  'Clinkz': 'Clinkz',
  'Omniknight': 'Caballero Omnisciente',
  'Enchantress': 'Encantadora',
  'Huskar': 'Huskar',
  'Night Stalker': 'Acechador Nocturno',
  'Broodmother': 'Madre de la Prole',
  'Bounty Hunter': 'Cazarrecompensas',
  'Weaver': 'Tejedor',
  'Jakiro': 'Jakiro',
  'Batrider': 'Jinete de Murciélagos',
  'Chen': 'Chen',
  'Spectre': 'Espectro',
  'Ancient Apparition': 'Aparición Antigua',
  'Doom': 'Condena',
  'Ursa': 'Ursa',
  'Spirit Breaker': 'Rompedor de Espíritus',
  'Gyrocopter': 'Girocóptero',
  'Alchemist': 'Alquimista',
  'Invoker': 'Invocador',
  'Silencer': 'Silenciador',
  'Outworld Destroyer': 'Destructor del Inframundo',
  'Lycan': 'Licano',
  'Brewmaster': 'Maestro Cervecero',
  'Shadow Demon': 'Demonio Sombrío',
  'Lone Druid': 'Druida Solitario',
  'Chaos Knight': 'Caballero del Caos',
  'Meepo': 'Meepo',
  'Treant Protector': 'Protector Arbóreo',
  'Ogre Magi': 'Ogro Mago',
  'Undying': 'Inmortal',
  'Rubick': 'Rubick',
  'Disruptor': 'Disruptor',
  'Nyx Assassin': 'Asesino Nyx',
  'Naga Siren': 'Sirena Naga',
  'Keeper of the Light': 'Guardián de la Luz',
  'Visage': 'Semblante',
  'Slark': 'Slark',
  'Medusa': 'Medusa',
  'Troll Warlord': 'Señor de la Guerra Troll',
  'Centaur Warrunner': 'Centauro',
  'Magnus': 'Magnus',
  'Timbersaw': 'Sierramadera',
  'Bristleback': 'Espaldaespinada',
  'Tusk': 'Colmillo',
  'Skywrath Mage': 'Mago Sempiterno',
  'Abaddon': 'Abaddon',
  'Elder Titan': 'Titán Ancestral',
  'Legion Commander': 'Comandante de la Legión',
  'Techies': 'Artilleros',
  'Ember Spirit': 'Espíritu del Ascuas',
  'Earth Spirit': 'Espíritu de la Tierra',
  'Underlord': 'Señor del Inframundo',
  'Terrorblade': 'Terrorblade',
  'Phoenix': 'Fénix',
  'Oracle': 'Oráculo',
  'Winter Wyvern': 'Draco Invernal',
  'Arc Warden': 'Celador del Arco',
  'Monkey King': 'Rey Mono',
  'Pangolier': 'Pangolier',
  'Dark Willow': 'Sauce Oscuro',
  'Grimstroke': 'Pincel Sombrío',
  'Mars': 'Marte',
  'Void Spirit': 'Espíritu del Vacío',
  'Snapfire': 'Snapfire',
  'Hoodwink': 'Bribona',
  'Dawnbreaker': 'Rompedora del Alba',
  'Marci': 'Marci',
  'Primal Beast': 'Bestia Primordial',
  'Muerta': 'Muerta',
  'Ringmaster': 'Maestro de Ceremonias',
  'Kez': 'Kez',
};

export const getHeroSpanishName = (localizedName: string, heroKey?: string): string => {
  if (HERO_NAME_ES[localizedName]) return HERO_NAME_ES[localizedName];
  if (heroKey) {
    const formatted = heroKey
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    if (HERO_NAME_ES[formatted]) return HERO_NAME_ES[formatted];
  }
  return localizedName;
};

// ─── CDN HELPERS ─────────────────────────────────────────────────────────────

export const getHeroCdnKey = (heroName: string): string => {
  return heroName.replace(/^npc_dota_hero_/, '').toLowerCase();
};

export const getHeroImageUrl = (heroKey: string): string => {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroKey}.png`;
};

export const getItemImageUrl = (itemKey: string): string => {
  const clean = itemKey.replace(/^item_/, '');
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${clean}.png`;
};

export const getAbilityImageUrl = (abilityKey: string): string => {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/${abilityKey}_lg.png`;
};

// ─── ATTRIBUTE CONFIGURATION ──────────────────────────────────────────────────

export const ATTRIBUTE_CONFIG = {
  str: {
    label: 'Fuerza',
    english: 'Strength',
    icon: Shield,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    glow: 'shadow-rose-900/30',
  },
  agi: {
    label: 'Agilidad',
    english: 'Agility',
    icon: Zap,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    glow: 'shadow-emerald-900/30',
  },
  int: {
    label: 'Inteligencia',
    english: 'Intelligence',
    icon: Brain,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    badge: 'bg-sky-950/80 text-sky-300 border-sky-800/80',
    glow: 'shadow-sky-900/30',
  },
  all: {
    label: 'Universal',
    english: 'Universal',
    icon: Sparkles,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    badge: 'bg-violet-950/80 text-violet-300 border-violet-800/80',
    glow: 'shadow-violet-900/30',
  },
};

export const ROLE_TRANSLATIONS: Record<string, string> = {
  Carry: 'Carry',
  Support: 'Apoyo',
  Nuker: 'Nuker (Ráfaga)',
  Disabler: 'Incapacitador',
  Initiator: 'Iniciador',
  Durable: 'Tanque (Durable)',
  Escape: 'Evasivo',
  Pusher: 'Presionador',
};

// ─── ATOM COMPONENTS ─────────────────────────────────────────────────────────

const HeroPortrait: React.FC<{
  heroKey: string;
  name: string;
  className?: string;
  fallbackText?: string;
}> = ({ heroKey, name, className = 'w-12 h-12', fallbackText }) => {
  const [error, setError] = useState(false);
  const url = getHeroImageUrl(heroKey);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700/70 flex-shrink-0 flex items-center justify-center shadow-md select-none ${className}`}
      title={name}
    >
      {!error ? (
        <img
          src={url}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-bold text-gray-400 tracking-wider">
          {fallbackText || name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
};

const ItemPortrait: React.FC<{
  itemKey: string;
  name: string;
  className?: string;
}> = ({ itemKey, name, className = 'w-10 h-10' }) => {
  const [error, setError] = useState(false);
  const url = getItemImageUrl(itemKey);

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center shadow ${className}`}
      title={name}
    >
      {!error ? (
        <img
          src={url}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-[10px] font-mono text-amber-500">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
};

const AbilityPortrait: React.FC<{
  abilityKey: string;
  name: string;
  className?: string;
}> = ({ abilityKey, name, className = 'w-12 h-12' }) => {
  const [error, setError] = useState(false);
  const url = getAbilityImageUrl(abilityKey);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 flex-shrink-0 flex items-center justify-center shadow-lg ${className}`}
      title={name}
    >
      {!error ? (
        <img
          src={url}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-bold text-sky-400">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
};

// ─── TALENT TREE COMPONENT ───────────────────────────────────────────────────

interface TalentTreeProps {
  talents: Array<{ name: string; level: number }>;
  abilitiesDict: Record<string, AbilityConstant>;
}

const TalentTree: React.FC<TalentTreeProps> = ({ talents, abilitiesDict }) => {
  // Dota 2 talents: level 1 = lvl 10, level 2 = lvl 15, level 3 = lvl 20, level 4 = lvl 25
  const levels = [
    { num: 25, tier: 4 },
    { num: 20, tier: 3 },
    { num: 15, tier: 2 },
    { num: 10, tier: 1 },
  ];

  const getTalentName = (talentKey: string): string => {
    const constant = abilitiesDict[talentKey];
    if (constant?.dname) return constant.dname;
    // Clean key formatting fallback
    return talentKey
      .replace(/^special_bonus_unique_/, '')
      .replace(/^special_bonus_/, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background Accent Lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Árbol de Talentos</h3>
        </div>
        <span className="text-xs text-amber-400/90 font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
          Niveles 10 • 15 • 20 • 25
        </span>
      </div>

      <div className="space-y-3 relative z-10">
        {levels.map((lvl) => {
          const tierTalents = talents.filter((t) => t.level === lvl.tier);
          const leftTalent = tierTalents[0] ? getTalentName(tierTalents[0].name) : 'Mejora de Talento A';
          const rightTalent = tierTalents[1] ? getTalentName(tierTalents[1].name) : 'Mejora de Talento B';

          return (
            <div
              key={lvl.num}
              className="grid grid-cols-11 items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition"
            >
              {/* Left Branch */}
              <div className="col-span-5 text-right px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs font-medium text-gray-200 leading-tight">
                {leftTalent}
              </div>

              {/* Central Level Node */}
              <div className="col-span-1 flex justify-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-amber-300">
                  {lvl.num}
                </div>
              </div>

              {/* Right Branch */}
              <div className="col-span-5 text-left px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs font-medium text-gray-200 leading-tight">
                {rightTalent}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── ABILITIES SECTION COMPONENT ─────────────────────────────────────────────

interface AbilitiesSectionProps {
  heroKey: string;
  abilityKeys: string[];
  abilitiesDict: Record<string, AbilityConstant>;
}

const AbilitiesSection: React.FC<AbilitiesSectionProps> = ({
  heroKey,
  abilityKeys,
  abilitiesDict,
}) => {
  // If mapping gave no keys, dynamically find matching keys in abilities dictionary
  const resolvedKeys = useMemo(() => {
    if (abilityKeys && abilityKeys.length > 0) {
      return abilityKeys.filter((key) => {
        // filter out empty / generic / talent keys
        if (!key || key.startsWith('special_bonus_') || key === 'generic_hidden') return false;
        return true;
      });
    }

    // Fallback: search abilities starting with heroKey
    const clean = heroKey.toLowerCase();
    const found: string[] = [];
    for (const key of Object.keys(abilitiesDict)) {
      if (
        key.startsWith(`${clean}_`) &&
        !key.startsWith('special_bonus_') &&
        !key.includes('empty')
      ) {
        found.push(key);
      }
    }
    return found.slice(0, 6);
  }, [abilityKeys, abilitiesDict, heroKey]);

  const formatList = (val: unknown): string => {
    if (!val) return '';
    if (Array.isArray(val)) return val.join(' / ');
    return String(val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-sky-400" />
        <h3 className="text-base font-bold text-white tracking-tight">Habilidades del Héroe</h3>
      </div>

      {resolvedKeys.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-sm text-gray-400">
          Cargando o no se encontraron habilidades registradas para este héroe.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {resolvedKeys.map((key) => {
            const ab = abilitiesDict[key] || {};
            const dname = ab.dname || key.replace(/_/g, ' ');
            const desc = ab.desc || 'Sin descripción disponible para esta habilidad.';
            const cd = formatList(ab.cd);
            const mc = formatList(ab.mc || ab.cost);
            const behavior = Array.isArray(ab.behavior)
              ? ab.behavior.join(', ')
              : ab.behavior || '';
            const dmgType = ab.dmg_type;
            const bkbPierce = ab.bkbpierce;

            // Aghanim upgrades
            const scepterDesc = ab.scepter_desc || ab.aghanims_scepter_desc;
            const shardDesc = ab.shard_desc || ab.aghanims_shard_desc;

            return (
              <div
                key={key}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
              >
                <div>
                  {/* Header: Icon, Name, Behavior */}
                  <div className="flex items-start gap-3">
                    <AbilityPortrait abilityKey={key} name={dname} className="w-14 h-14" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <h4 className="text-base font-bold text-white leading-snug truncate">
                          {dname}
                        </h4>
                        {dmgType && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              dmgType.toLowerCase().includes('mag')
                                ? 'bg-sky-950 text-sky-300 border border-sky-800/60'
                                : dmgType.toLowerCase().includes('phys')
                                ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            Daño: {dmgType}
                          </span>
                        )}
                      </div>

                      {/* Behavior Tags */}
                      {behavior && (
                        <div className="text-[11px] text-gray-400 mt-0.5 capitalize">
                          {behavior}
                        </div>
                      )}

                      {/* BKB Pierce */}
                      {bkbPierce && (
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          Atraviesa BKB:{' '}
                          <strong
                            className={
                              bkbPierce.toLowerCase().includes('yes')
                                ? 'text-emerald-400'
                                : 'text-gray-400'
                            }
                          >
                            {bkbPierce.toLowerCase().includes('yes') ? 'Sí' : 'No'}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-300 mt-3 leading-relaxed">{desc}</p>

                  {/* Attributes detail list if present */}
                  {ab.attrib && ab.attrib.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                      {ab.attrib.slice(0, 6).map((attrItem, idx) => (
                        <div key={idx} className="flex justify-between text-gray-400">
                          <span className="truncate pr-1">{attrItem.header || attrItem.key}:</span>
                          <span className="font-mono text-gray-200 font-semibold flex-shrink-0">
                            {formatList(attrItem.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Aghanim Scepter Upgrade */}
                  {scepterDesc && (
                    <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mejora con Cetro de Aghanim:</span>
                      </div>
                      <p className="text-[11px] text-cyan-200/90 leading-relaxed">{scepterDesc}</p>
                    </div>
                  )}

                  {/* Aghanim Shard Upgrade */}
                  {shardDesc && (
                    <div className="mt-2 p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Mejora con Fragmento de Aghanim (Shard):</span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-relaxed">{shardDesc}</p>
                    </div>
                  )}
                </div>

                {/* Footer: Cooldown & Mana Cost */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  {/* Cooldown */}
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{cd ? `${cd}s` : 'Sin CD'}</span>
                  </div>

                  {/* Mana Cost */}
                  <div className="flex items-center gap-1 text-sky-400">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>{mc ? `${mc} Maná` : '0 Maná'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── ITEM POPULARITY COMPONENT ────────────────────────────────────────────────

interface ItemPopularityProps {
  heroId: number;
  itemsDict: Record<string, ItemConstant>;
}

const ItemPopularity: React.FC<ItemPopularityProps> = ({ heroId, itemsDict }) => {
  const [data, setData] = useState<ItemPopularityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(false);
    const cached = getLocalCache<ItemPopularityResponse>(`item_pop_${heroId}`);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://api.opendota.com/api/heroes/${heroId}/itemPopularity`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLocalCache(`item_pop_${heroId}`, json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [heroId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getItemDName = (key: string): string => {
    const clean = key.replace(/^item_/, '');
    if (itemsDict[clean]?.dname) return itemsDict[clean].dname;
    if (itemsDict[key]?.dname) return itemsDict[key].dname;
    // Format words
    return clean
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const renderPhase = (
    title: string,
    itemsObj?: Record<string, number>,
    color: string = 'text-amber-400'
  ) => {
    if (!itemsObj || Object.keys(itemsObj).length === 0) return null;

    const sortedItems = Object.entries(itemsObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return (
      <div className="space-y-2">
        <h4 className={`text-xs font-bold tracking-wide uppercase ${color}`}>{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {sortedItems.map(([key, count]) => {
            const dname = getItemDName(key);
            return (
              <div
                key={key}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
              >
                <ItemPortrait itemKey={key} name={dname} className="w-9 h-9 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-200 truncate" title={dname}>
                    {dname}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {count.toLocaleString()} partidas
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 text-xs text-gray-400">
        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span>Cargando objetos populares...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          No se pudieron cargar los objetos populares para este héroe.
        </span>
        <button
          onClick={fetchItems}
          className="px-3 py-1.5 text-xs rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Objetos Más Populares (Builds del Meta)
          </h3>
        </div>
        <span className="text-xs text-gray-400">Datos en vivo de partidas de alto MMR</span>
      </div>

      <div className="space-y-4">
        {renderPhase(
          '1. Inicio y Juego Temprano (Early Game)',
          data.early_game_items || data.start_game_items,
          'text-emerald-400'
        )}
        {renderPhase('2. Mitad de Partida (Mid Game)', data.mid_game_items, 'text-sky-400')}
        {renderPhase('3. Juego Tardío (Late Game)', data.late_game_items, 'text-amber-400')}
      </div>
    </div>
  );
};

// ─── COUNTERS & ALLIES COMPONENT ─────────────────────────────────────────────

interface CountersAndAlliesProps {
  heroId: number;
  heroesDict: Record<number, HeroData>;
}

const CountersAndAllies: React.FC<CountersAndAlliesProps> = ({ heroId, heroesDict }) => {
  const [matchups, setMatchups] = useState<MatchupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMatchups = useCallback(async () => {
    setLoading(true);
    setError(false);
    const cached = getLocalCache<MatchupEntry[]>(`matchups_${heroId}`);
    if (cached) {
      setMatchups(cached);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://api.opendota.com/api/heroes/${heroId}/matchups`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setMatchups(json);
        setLocalCache(`matchups_${heroId}`, json);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [heroId]);

  useEffect(() => {
    fetchMatchups();
  }, [fetchMatchups]);

  // Process top 5 counters (lowest winrate) and top 5 best matchups (highest winrate)
  const { topCounters, topAllies } = useMemo(() => {
    if (!matchups || matchups.length === 0) {
      return { topCounters: [], topAllies: [] };
    }

    const valid = matchups
      .filter((m) => m.games_played >= 15 && m.hero_id !== heroId && heroesDict[m.hero_id])
      .map((m) => {
        const wr = (m.wins / m.games_played) * 100;
        const heroConst = heroesDict[m.hero_id];
        const key = getHeroCdnKey(heroConst.name);
        const nameEn = heroConst.localized_name || heroConst.name;
        const nameEs = getHeroSpanishName(nameEn, key);

        return {
          heroId: m.hero_id,
          heroKey: key,
          nameEn,
          nameEs,
          winrate: wr,
          games: m.games_played,
          primaryAttr: heroConst.primary_attr || 'str',
        };
      });

    // Sort ascending for counters (lowest winrate for this hero)
    const counters = [...valid].sort((a, b) => a.winrate - b.winrate).slice(0, 5);

    // Sort descending for best matchups/allies (highest winrate for this hero)
    const allies = [...valid].sort((a, b) => b.winrate - a.winrate).slice(0, 5);

    return { topCounters: counters, topAllies: allies };
  }, [matchups, heroId, heroesDict]);

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 text-xs text-gray-400">
        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span>Cargando estadísticas de enfrentamientos y desventajas...</span>
      </div>
    );
  }

  if (error || (topCounters.length === 0 && topAllies.length === 0)) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          No se pudieron cargar los enfrentamientos de OpenDota.
        </span>
        <button
          onClick={fetchMatchups}
          className="px-3 py-1.5 text-xs rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Top 5 Counters (Lowest winrate) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <TrendingDown className="w-5 h-5" />
            <h4 className="text-sm font-bold text-white">Mayores Counters (Desventaja)</h4>
          </div>
          <span className="text-[11px] text-rose-400 font-mono bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-full">
            Menor Winrate
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Héroes contra los cuales este personaje sufre mayores derrotas en partidas competitivas:
        </p>

        <div className="space-y-2 pt-1">
          {topCounters.map((item) => (
            <div
              key={item.heroId}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-rose-900/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <HeroPortrait heroKey={item.heroKey} name={item.nameEs} className="w-10 h-10" />
                <div>
                  <div className="text-xs font-bold text-gray-200">{item.nameEs}</div>
                  <div className="text-[10px] text-gray-500">{item.nameEn}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-rose-400">
                  {item.winrate.toFixed(1)}% WR
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {item.games.toLocaleString()} partidas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Best Allies / Victories (Highest winrate) */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <h4 className="text-sm font-bold text-white">Mejores Emparejamientos / Ventaja</h4>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
            Mayor Winrate
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Héroes contra los que este personaje obtiene mayor efectividad y porcentaje de victoria:
        </p>

        <div className="space-y-2 pt-1">
          {topAllies.map((item) => (
            <div
              key={item.heroId}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-900/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <HeroPortrait heroKey={item.heroKey} name={item.nameEs} className="w-10 h-10" />
                <div>
                  <div className="text-xs font-bold text-gray-200">{item.nameEs}</div>
                  <div className="text-[10px] text-gray-500">{item.nameEn}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-emerald-400">
                  {item.winrate.toFixed(1)}% WR
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {item.games.toLocaleString()} partidas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── HERO DETAIL VIEW COMPONENT ───────────────────────────────────────────────

interface HeroDetailViewProps {
  hero: HeroData;
  onBack: () => void;
  heroesDict: Record<number, HeroData>;
  abilitiesDict: Record<string, AbilityConstant>;
  heroAbilitiesDict: Record<string, HeroAbilityMapping>;
  itemsDict: Record<string, ItemConstant>;
}

const HeroDetailView: React.FC<HeroDetailViewProps> = ({
  hero,
  onBack,
  heroesDict,
  abilitiesDict,
  heroAbilitiesDict,
  itemsDict,
}) => {
  const heroKey = getHeroCdnKey(hero.name);
  const nameEn = hero.localized_name || hero.name;
  const nameEs = getHeroSpanishName(nameEn, heroKey);

  const attrConfig =
    ATTRIBUTE_CONFIG[hero.primary_attr as keyof typeof ATTRIBUTE_CONFIG] || ATTRIBUTE_CONFIG.str;
  const AttrIcon = attrConfig.icon;

  // Base Stats Calculations
  const baseHealth = (hero.base_health || 120) + (hero.base_str || 0) * 22;
  const healthRegen = (hero.base_health_regen || 0) + (hero.base_str || 0) * 0.1;
  const baseMana = (hero.base_mana || 75) + (hero.base_int || 0) * 12;
  const manaRegen = (hero.base_mana_regen || 0) + (hero.base_int || 0) * 0.05;
  const baseArmor = (hero.base_armor || 0) + (hero.base_agi || 0) * 0.167;

  // Primary attribute bonus to attack
  let primaryBonus = 0;
  if (hero.primary_attr === 'str') primaryBonus = hero.base_str || 0;
  else if (hero.primary_attr === 'agi') primaryBonus = hero.base_agi || 0;
  else if (hero.primary_attr === 'int') primaryBonus = hero.base_int || 0;
  else if (hero.primary_attr === 'all')
    primaryBonus = Math.floor(
      ((hero.base_str || 0) + (hero.base_agi || 0) + (hero.base_int || 0)) * 0.7
    );

  const attackMin = (hero.base_attack_min || 0) + primaryBonus;
  const attackMax = (hero.base_attack_max || 0) + primaryBonus;

  // Abilities mapping from constants
  const mapping = heroAbilitiesDict[hero.name] || heroAbilitiesDict[heroKey];
  const abilityKeys = mapping?.abilities || [];
  const talents = mapping?.talents || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-gray-300 hover:text-white hover:bg-slate-800/80 transition shadow-lg text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4 text-red-400" />
        <span>Volver a la lista de héroes</span>
      </button>

      {/* Hero Header Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        {/* Subtle Ambient Backing Glow */}
        <div
          className={`absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl ${attrConfig.bg}`}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Hero Portrait */}
          <div className="relative">
            <HeroPortrait
              heroKey={heroKey}
              name={nameEs}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 border-slate-700 shadow-2xl"
            />
            {/* Primary Attr Icon Overlay */}
            <div
              className={`absolute -bottom-3 -right-3 p-2 rounded-xl border ${attrConfig.badge} shadow-lg`}
              title={`Atributo Principal: ${attrConfig.label}`}
            >
              <AttrIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Hero Titles & Meta */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${attrConfig.badge} flex items-center gap-1.5`}>
                <AttrIcon className="w-3.5 h-3.5" />
                <span>{attrConfig.label} ({attrConfig.english})</span>
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-gray-300 border border-slate-700/80 flex items-center gap-1.5">
                {hero.attack_type === 'Melee' ? (
                  <>
                    <Swords className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cuerpo a cuerpo</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                    <span>A distancia ({hero.attack_range || 600})</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {nameEs}
            </h1>
            <p className="text-sm font-medium text-gray-400">
              Nombre oficial en inglés: <span className="text-gray-200 font-semibold">{nameEn}</span>
            </p>

            {/* Roles Chips */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-2">
              {hero.roles.map((role) => (
                <span
                  key={role}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-950/80 text-gray-300 border border-slate-800"
                >
                  {ROLE_TRANSLATIONS[role] || role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Base Stats & Stat Growth Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attributes & Growth Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Atributos & Crecimiento
            </h3>
          </div>

          <div className="space-y-3">
            {/* Strength */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-300">Fuerza (STR)</div>
                  <div className="text-[10px] text-gray-400">+22 HP por punto</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black font-mono text-white">{hero.base_str || 0}</div>
                <div className="text-[10px] font-mono text-gray-400">
                  +{hero.str_gain?.toFixed(1) || '0.0'}/nivel
                </div>
              </div>
            </div>

            {/* Agility */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">Agilidad (AGI)</div>
                  <div className="text-[10px] text-gray-400">+1 vel. ataque & armadura</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black font-mono text-white">{hero.base_agi || 0}</div>
                <div className="text-[10px] font-mono text-gray-400">
                  +{hero.agi_gain?.toFixed(1) || '0.0'}/nivel
                </div>
              </div>
            </div>

            {/* Intelligence */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-300">Inteligencia (INT)</div>
                  <div className="text-[10px] text-gray-400">+12 maná & resistencia mágica</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black font-mono text-white">{hero.base_int || 0}</div>
                <div className="text-[10px] font-mono text-gray-400">
                  +{hero.int_gain?.toFixed(1) || '0.0'}/nivel
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vitality & Defense Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Vitalidad & Defensa
            </h3>
          </div>

          <div className="space-y-2.5">
            {/* HP */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Puntos de Vida (HP):</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {baseHealth}{' '}
                <span className="text-[11px] text-gray-400 font-normal">
                  (+{healthRegen.toFixed(1)}/s)
                </span>
              </span>
            </div>

            {/* Mana */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Puntos de Maná (MP):</span>
              <span className="text-sm font-bold font-mono text-sky-400">
                {baseMana}{' '}
                <span className="text-[11px] text-gray-400 font-normal">
                  (+{manaRegen.toFixed(1)}/s)
                </span>
              </span>
            </div>

            {/* Armor */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Armadura Inicial:</span>
              <span className="text-sm font-bold font-mono text-gray-200">
                {baseArmor.toFixed(1)}
              </span>
            </div>

            {/* Magic Resistance */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Resistencia Mágica Base:</span>
              <span className="text-sm font-bold font-mono text-violet-400">
                {hero.base_mr || 25}%
              </span>
            </div>
          </div>
        </div>

        {/* Combat & Mobility Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Combate & Movilidad
            </h3>
          </div>

          <div className="space-y-2.5">
            {/* Damage */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Daño Base de Ataque:</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {attackMin} - {attackMax}
              </span>
            </div>

            {/* Move Speed */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Velocidad de Movimiento:</span>
              <span className="text-sm font-bold font-mono text-white">
                {hero.move_speed || 300} ms
              </span>
            </div>

            {/* Attack Range */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Alcance de Ataque:</span>
              <span className="text-sm font-bold font-mono text-gray-200">
                {hero.attack_range || 150} u
              </span>
            </div>

            {/* Turn Rate */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">Velocidad de Giro (Turn Rate):</span>
              <span className="text-sm font-bold font-mono text-gray-300">
                {hero.turn_rate ? hero.turn_rate.toFixed(1) : '0.6'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Abilities Section */}
      <AbilitiesSection
        heroKey={heroKey}
        abilityKeys={abilityKeys}
        abilitiesDict={abilitiesDict}
      />

      {/* Talent Tree */}
      <TalentTree talents={talents} abilitiesDict={abilitiesDict} />

      {/* Item Popularity Builds */}
      <ItemPopularity heroId={hero.id} itemsDict={itemsDict} />

      {/* Counters & Allies Section */}
      <CountersAndAllies heroId={hero.id} heroesDict={heroesDict} />
    </div>
  );
};

// ─── MAIN HERO ENCYCLOPEDIA PAGE ─────────────────────────────────────────────

export const HeroEncyclopediaPage: React.FC = () => {
  // Data Sources
  const [heroes, setHeroes] = useState<Record<number, HeroData>>({});
  const [abilitiesDict, setAbilitiesDict] = useState<Record<string, AbilityConstant>>({});
  const [heroAbilitiesDict, setHeroAbilitiesDict] = useState<Record<string, HeroAbilityMapping>>({});
  const [itemsDict, setItemsDict] = useState<Record<string, ItemConstant>>({});

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View States
  const [selectedHeroId, setSelectedHeroId] = useState<number | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [attrFilter, setAttrFilter] = useState<'all' | 'str' | 'agi' | 'int' | 'universal'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [attackFilter, setAttackFilter] = useState<'all' | 'Melee' | 'Ranged'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'hp' | 'speed' | 'damage'>('name');

  // Fetch all constants with 24h LocalStorage caching
  const loadConstants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Heroes
      let cachedHeroes = getLocalCache<Record<number, HeroData>>('heroes_constants');
      if (!cachedHeroes) {
        const res = await fetch('https://api.opendota.com/api/constants/heroes');
        if (!res.ok) throw new Error(`Error al obtener héroes: HTTP ${res.status}`);
        const raw = await res.json();
        cachedHeroes = {};
        if (Array.isArray(raw)) {
          for (const h of raw) {
            if (h && typeof h.id === 'number') cachedHeroes[h.id] = h;
          }
        } else if (raw && typeof raw === 'object') {
          for (const [k, v] of Object.entries(raw)) {
            const num = Number(k);
            if (!isNaN(num) && v) cachedHeroes[num] = v as HeroData;
          }
        }
        setLocalCache('heroes_constants', cachedHeroes);
      }
      setHeroes(cachedHeroes || {});

      // 2. Abilities
      let cachedAbilities = getLocalCache<Record<string, AbilityConstant>>('abilities_constants');
      if (!cachedAbilities) {
        const res = await fetch('https://api.opendota.com/api/constants/abilities');
        if (res.ok) {
          cachedAbilities = await res.json();
          setLocalCache('abilities_constants', cachedAbilities);
        }
      }
      setAbilitiesDict(cachedAbilities || {});

      // 3. Hero Abilities & Talents Mapping
      let cachedHeroAbilities =
        getLocalCache<Record<string, HeroAbilityMapping>>('hero_abilities_constants');
      if (!cachedHeroAbilities) {
        const res = await fetch('https://api.opendota.com/api/constants/hero_abilities');
        if (res.ok) {
          cachedHeroAbilities = await res.json();
          setLocalCache('hero_abilities_constants', cachedHeroAbilities);
        }
      }
      setHeroAbilitiesDict(cachedHeroAbilities || {});

      // 4. Items
      let cachedItems = getLocalCache<Record<string, ItemConstant>>('items_constants');
      if (!cachedItems) {
        const res = await fetch('https://api.opendota.com/api/constants/items');
        if (res.ok) {
          cachedItems = await res.json();
          setLocalCache('items_constants', cachedItems);
        }
      }
      setItemsDict(cachedItems || {});
    } catch (err) {
      console.error('[DotaScope] Error loading constants:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron conectar los servicios de OpenDota. Revisa tu conexión.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConstants();
  }, [loadConstants]);

  // Selected Hero Record
  const selectedHero = selectedHeroId ? heroes[selectedHeroId] : null;

  // Filtered & Sorted Hero List
  const filteredHeroes = useMemo(() => {
    const list = Object.values(heroes);

    return list
      .filter((hero) => {
        // Attribute filter
        if (attrFilter !== 'all') {
          if (attrFilter === 'universal' && hero.primary_attr !== 'all') return false;
          if (attrFilter !== 'universal' && hero.primary_attr !== attrFilter) return false;
        }

        // Role filter
        if (roleFilter !== 'all' && !hero.roles?.includes(roleFilter)) {
          return false;
        }

        // Attack type filter
        if (attackFilter !== 'all' && hero.attack_type !== attackFilter) {
          return false;
        }

        // Search term (matches Spanish name, English name, and key)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const heroKey = getHeroCdnKey(hero.name);
          const enName = (hero.localized_name || hero.name).toLowerCase();
          const esName = getHeroSpanishName(hero.localized_name || hero.name, heroKey).toLowerCase();

          if (!enName.includes(term) && !esName.includes(term) && !heroKey.includes(term)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'hp') {
          const hpA = (a.base_health || 120) + (a.base_str || 0) * 22;
          const hpB = (b.base_health || 120) + (b.base_str || 0) * 22;
          return hpB - hpA;
        }
        if (sortBy === 'speed') {
          return (b.move_speed || 300) - (a.move_speed || 300);
        }
        if (sortBy === 'damage') {
          return (b.base_attack_max || 0) - (a.base_attack_max || 0);
        }
        // default: name A-Z by Spanish name
        const keyA = getHeroCdnKey(a.name);
        const keyB = getHeroCdnKey(b.name);
        const nameA = getHeroSpanishName(a.localized_name || a.name, keyA);
        const nameB = getHeroSpanishName(b.localized_name || b.name, keyB);
        return nameA.localeCompare(nameB, 'es');
      });
  }, [heroes, attrFilter, roleFilter, attackFilter, searchTerm, sortBy]);

  // Total Counts for Badges
  const heroCounts = useMemo(() => {
    const all = Object.values(heroes);
    return {
      total: all.length,
      str: all.filter((h) => h.primary_attr === 'str').length,
      agi: all.filter((h) => h.primary_attr === 'agi').length,
      int: all.filter((h) => h.primary_attr === 'int').length,
      all: all.filter((h) => h.primary_attr === 'all').length,
    };
  }, [heroes]);

  return (
    <div className="space-y-6">
      {/* If a hero is selected, render the Hero Detail View */}
      {selectedHero ? (
        <HeroDetailView
          hero={selectedHero}
          onBack={() => setSelectedHeroId(null)}
          heroesDict={heroes}
          abilitiesDict={abilitiesDict}
          heroAbilitiesDict={heroAbilitiesDict}
          itemsDict={itemsDict}
        />
      ) : (
        /* Otherwise render the Grid View */
        <div className="space-y-6">
          {/* Header Title Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Enciclopedia de Héroes
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Guía de referencia completa con habilidades, talentos, builds y counters de Dota 2
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl shadow-lg">
              <span className="text-gray-400">Total en catálogo:</span>
              <strong className="text-white font-bold">{heroCounts.total} Héroes</strong>
            </div>
          </div>

          {/* Control Bar: Search & Primary Filters */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-3.5">
            {/* Top row: Search input + Attack Type + Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre en español o inglés (ej. Anti-Mago, Pudge, Axe)..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 transition shadow-inner"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Role Filter Dropdown */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Rol:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-red-500"
                >
                  <option value="all">Todos los Roles</option>
                  <option value="Carry">Carry</option>
                  <option value="Support">Support (Apoyo)</option>
                  <option value="Nuker">Nuker (Daño Mágico)</option>
                  <option value="Disabler">Disabler (Incapacitador)</option>
                  <option value="Initiator">Initiator (Iniciador)</option>
                  <option value="Durable">Durable (Tanque)</option>
                  <option value="Escape">Escape (Evasivo)</option>
                  <option value="Pusher">Pusher (Presionador)</option>
                </select>
              </div>

              {/* Attack Type Filter */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Ataque:</span>
                <select
                  value={attackFilter}
                  onChange={(e) => setAttackFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-red-500"
                >
                  <option value="all">Melee & Distancia</option>
                  <option value="Melee">Cuerpo a cuerpo (Melee)</option>
                  <option value="Ranged">A distancia (Ranged)</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Orden:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-red-500"
                >
                  <option value="name">Alfabético (A-Z)</option>
                  <option value="hp">Mayor Salud (HP)</option>
                  <option value="speed">Velocidad de Movimiento</option>
                  <option value="damage">Daño de Ataque Máx.</option>
                </select>
              </div>
            </div>

            {/* Bottom Row: Attribute Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Atributo:
              </span>

              {/* All */}
              <button
                onClick={() => setAttrFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  attrFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-gray-400 hover:text-white bg-slate-950/60'
                }`}
              >
                <span>Todos</span>
                <span className="text-[10px] opacity-75 font-mono">({heroCounts.total})</span>
              </button>

              {/* Strength */}
              <button
                onClick={() => setAttrFilter('str')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  attrFilter === 'str'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 border border-rose-500'
                    : 'text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Fuerza</span>
                <span className="text-[10px] opacity-75 font-mono">({heroCounts.str})</span>
              </button>

              {/* Agility */}
              <button
                onClick={() => setAttrFilter('agi')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  attrFilter === 'agi'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-500'
                    : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-900/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Agilidad</span>
                <span className="text-[10px] opacity-75 font-mono">({heroCounts.agi})</span>
              </button>

              {/* Intelligence */}
              <button
                onClick={() => setAttrFilter('int')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  attrFilter === 'int'
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/50 border border-sky-500'
                    : 'text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-900/40'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Inteligencia</span>
                <span className="text-[10px] opacity-75 font-mono">({heroCounts.int})</span>
              </button>

              {/* Universal */}
              <button
                onClick={() => setAttrFilter('universal')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  attrFilter === 'universal'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50 border border-violet-500'
                    : 'text-violet-400 hover:text-violet-300 bg-violet-950/40 border border-violet-900/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Universal</span>
                <span className="text-[10px] opacity-75 font-mono">({heroCounts.all})</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-medium">
                Cargando base de datos de héroes de OpenDota...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Error de Conexión</h3>
              <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
              <button
                onClick={loadConstants}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-500 transition inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reintentar Carga
              </button>
            </div>
          )}

          {/* Empty Search Result State */}
          {!loading && !error && filteredHeroes.length === 0 && (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-gray-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No se encontraron héroes</h3>
              <p className="text-xs text-gray-400">
                Ningún héroe coincide con tus filtros de búsqueda actuales.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setAttrFilter('all');
                  setRoleFilter('all');
                  setAttackFilter('all');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-gray-200 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Restablecer Filtros
              </button>
            </div>
          )}

          {/* Responsive Hero Cards Grid: 2 cols on mobile, 4 on md, 6 on lg */}
          {!loading && !error && filteredHeroes.length > 0 && (
            <div>
              <div className="text-xs text-gray-400 font-medium mb-3 flex items-center justify-between">
                <span>
                  Mostrando <strong className="text-white">{filteredHeroes.length}</strong> héroes
                </span>
                <span className="text-[11px] text-gray-500">
                  Toca cualquier tarjeta para ver habilidades, talentos y counters
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filteredHeroes.map((hero) => {
                  const heroKey = getHeroCdnKey(hero.name);
                  const nameEn = hero.localized_name || hero.name;
                  const nameEs = getHeroSpanishName(nameEn, heroKey);
                  const attrConfig =
                    ATTRIBUTE_CONFIG[hero.primary_attr as keyof typeof ATTRIBUTE_CONFIG] ||
                    ATTRIBUTE_CONFIG.str;
                  const AttrIcon = attrConfig.icon;

                  const isMelee = hero.attack_type === 'Melee';

                  return (
                    <div
                      key={hero.id}
                      onClick={() => setSelectedHeroId(hero.id)}
                      className="group cursor-pointer rounded-2xl p-3 bg-slate-900/80 border border-slate-800/90 hover:border-red-500/50 hover:bg-slate-850 hover:shadow-xl hover:shadow-red-950/20 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Hero Image Container */}
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 mb-2.5 shadow">
                          <HeroPortrait
                            heroKey={heroKey}
                            name={nameEs}
                            className="w-full h-full rounded-none border-none"
                          />

                          {/* Attribute Badge in Corner */}
                          <div
                            className={`absolute top-1.5 right-1.5 p-1 rounded-lg ${attrConfig.badge} shadow-md backdrop-blur-sm`}
                            title={`Atributo: ${attrConfig.label}`}
                          >
                            <AttrIcon className="w-3.5 h-3.5" />
                          </div>

                          {/* Attack Type Badge */}
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-gray-300 border border-slate-700/60 backdrop-blur-sm flex items-center gap-1">
                            {isMelee ? (
                              <Swords className="w-2.5 h-2.5 text-amber-400" />
                            ) : (
                              <Crosshair className="w-2.5 h-2.5 text-sky-400" />
                            )}
                            <span>{isMelee ? 'Melee' : 'Rango'}</span>
                          </div>
                        </div>

                        {/* Hero Names */}
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-bold text-gray-100 group-hover:text-red-400 transition truncate leading-snug">
                            {nameEs}
                          </h3>
                          <p className="text-[11px] text-gray-400 truncate font-medium">
                            {nameEn}
                          </p>
                        </div>
                      </div>

                      {/* Footer Card: Roles & Quick Arrow */}
                      <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="truncate pr-1">
                          {hero.roles.slice(0, 2).map((r) => ROLE_TRANSLATIONS[r] || r).join(', ')}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-400 group-hover:translate-x-0.5 transition flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroEncyclopediaPage;
