import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Coins,
  Clock,
  Zap,
  Shield,
  Swords,
  Sparkles,
  Package,
  Layers,
  ShoppingBag,
  ArrowUpDown,
  BookOpen,
  Info,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  AlertTriangle,
  Award,
  Flame,
  Activity,
  Heart,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

// ─── API & TYPE DEFINITIONS ──────────────────────────────────────────────────

export interface RawItemAttribute {
  key?: string;
  header?: string;
  value?: string | string[];
  footer?: string;
}

export interface RawItem {
  id?: number;
  img?: string;
  dname?: string;
  qual?: string;
  cost?: number | null;
  notes?: string;
  attrib?: RawItemAttribute[];
  mc?: number | false | string;
  cd?: number | false | string;
  lore?: string;
  hint?: string[] | string;
  desc?: string;
  components?: string[] | null;
  created?: boolean;
  recipe?: boolean | number;
  secret_shop?: number;
  side_shop?: number;
}

export type CategoryId =
  | 'all'
  | 'consumables'
  | 'attributes'
  | 'weapons'
  | 'armor'
  | 'magical'
  | 'artifacts'
  | 'support'
  | 'secret_shop';

export interface ItemData {
  key: string;
  id: number;
  dname: string;
  spanishName: string;
  cost: number;
  img: string;
  qual: string;
  category: CategoryId;
  notes: string;
  attrib: RawItemAttribute[];
  mc: number | null;
  cd: number | null;
  lore: string;
  hint: string;
  desc: string;
  components: string[] | null;
  created: boolean;
  recipe: boolean;
  recipeCost: number;
}

// ─── LOCAL STORAGE CACHE CONSTANTS ───────────────────────────────────────────

const CACHE_KEY = 'dotascope_items_database_cache_v2';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedPayload {
  timestamp: number;
  items: Record<string, RawItem>;
}

// ─── SPANISH ITEM NAME MAP ───────────────────────────────────────────────────

export const SPANISH_NAME_MAP: Record<string, string> = {
  // Required 20 items from instructions
  blink: 'Daga de Destello',
  black_king_bar: 'Estandarte del Rey Negro',
  bkb: 'Estandarte del Rey Negro',
  bfury: 'Furia de Batalla',
  battle_fury: 'Furia de Batalla',
  battlefury: 'Furia de Batalla',
  manta: 'Estilo Manta',
  manta_style: 'Estilo Manta',
  sange_and_yasha: 'Sange y Yasha',
  power_treads: 'Zapatillas de Poder',
  phase_boots: 'Botas de Fase',
  abyssal_blade: 'Hoja del Abismo',
  abyss_blade: 'Hoja del Abismo',
  sphere: 'Esfera de Linken',
  linkens_sphere: 'Esfera de Linken',
  skadi: 'Ojo de Skadi',
  eye_of_skadi: 'Ojo de Skadi',
  monkey_king_bar: 'Barra del Rey Mono',
  mkb: 'Barra del Rey Mono',
  butterfly: 'Mariposa',
  heart: 'Corazón de Tarrasque',
  heart_of_tarrasque: 'Corazón de Tarrasque',
  sange: 'Sange',
  yasha: 'Yasha',
  kaya: 'Kaya',
  daedalus: 'Dédalo',
  greater_crit: 'Dédalo',
  rapier: 'Estoque',
  divine_rapier: 'Estoque',
  sheepstick: 'Hoz de Vyse',
  scythe_of_vyse: 'Hoz de Vyse',
  ethereal_blade: 'Cuchilla Etérea',

  // Other widely known Dota 2 items
  clarity: 'Claridad',
  faerie_fire: 'Fuego Feérico',
  smoke_of_deceit: 'Humo del Engaño',
  ward_observer: 'Guardián Observador',
  ward_sentry: 'Guardián Centinela',
  enchanted_mango: 'Mango Encantado',
  tango: 'Tango',
  tango_single: 'Tango Compartido',
  flask: 'Bálsamo Curativo',
  healing_salve: 'Bálsamo Curativo',
  dust: 'Polvo de Aparición',
  bottle: 'Botella',
  tpscroll: 'Pergamino de Teletransporte',
  blood_grenade: 'Granada de Sangre',
  branches: 'Rama de Hierro',
  iron_branch: 'Rama de Hierro',
  gauntlets: 'Guanteletes de Fuerza',
  slippers: 'Zapatillas de Agilidad',
  mantle: 'Manto de Inteligencia',
  circlet: 'Diadema',
  belt_of_strength: 'Cinturón de Fuerza',
  boots_of_elves: 'Botas de los Elfos',
  robe: 'Túnica de los Magos',
  crown: 'Corona',
  diadem: 'Diadema Real',
  ogre_axe: 'Hacha de Ogro',
  blade_of_alacrity: 'Espada de Presteza',
  staff_of_wizardry: 'Bastón de Brujería',
  ring_of_protection: 'Anillo de Protección',
  stout_shield: 'Escudo Robusto',
  quelling_blade: 'Cuchilla de Quelling',
  infused_raindrop: 'Gota de Lluvia Infundida',
  orb_of_venom: 'Orbe de Veneno',
  blight_stone: 'Piedra de Corrupción',
  wind_lace: 'Cordones de Viento',
  magic_stick: 'Varita Mágica Básica',
  magic_wand: 'Varita Mágica',
  fluffy_hat: 'Gorro Mullido',
  sobi_mask: 'Máscara de Sobi',
  ring_of_regen: 'Anillo de Regeneración',
  boots: 'Botas de Velocidad',
  gloves: 'Guantes de Prisa',
  cloak: 'Capa',
  ring_of_health: 'Anillo de Salud',
  void_stone: 'Piedra del Vacío',
  gem: 'Gema de la Verdadera Visión',
  lifesteal: 'Máscara Mórbida',
  mask_of_death: 'Máscara Mórbida',
  shadow_amulet: 'Amuleto de las Sombras',
  ghost: 'Cetro Fantasmal',
  ghost_scepter: 'Cetro Fantasmal',
  vanguard: 'Vanguardia',
  blade_mail: 'Malla de Cuchillas',
  soul_booster: 'Potenciador de Alma',
  crimson_guard: 'Guardia Carmesí',
  aeon_disk: 'Disco del Eón',
  lotus_orb: 'Orbe de Loto',
  shivas_guard: 'Guardia de Shiva',
  assault: 'Coraza de Asalto',
  assault_cuirass: 'Coraza de Asalto',
  buckler: 'Broquel',
  ring_of_basilius: 'Anillo de Basilius',
  headdress: 'Tocado',
  urn_of_shadows: 'Urna de las Sombras',
  spirit_vessel: 'Vasija Espiritual',
  medallion_of_courage: 'Medallón de Valor',
  solar_crest: 'Blasón Solar',
  pipe: 'Pipa de Perspicacia',
  pipe_of_insight: 'Pipa de Perspicacia',
  glimmer_cape: 'Capa Fulgurante',
  force_staff: 'Bastón de la Fuerza',
  hurricane_pike: 'Pica Huracán',
  guardian_greaves: 'Grebas del Guardián',
  mekansm: 'Mekansm',
  holy_locket: 'Guardapelo Sagrado',
  boots_of_bearing: 'Botas de Resistencia',
  pavise: 'Pavés',
  vladmir: 'Ofrenda de Vladmir',
  vladmirs_offering: 'Ofrenda de Vladmir',
  arcane_boots: 'Botas Arcanas',
  tranquil_boots: 'Botas Tranquilas',
  travel_boots: 'Botas de Viaje',
  travel_boots_2: 'Botas de Viaje Nivel 2',
  drum_of_endurance: 'Tambor de la Resistencia',
  broadsword: 'Espada Ancha',
  claymore: 'Mandoble',
  mithril_hammer: 'Martillo de Mithril',
  javelin: 'Jabalina',
  blitz_knuckles: 'Nudillos de Asalto',
  blade_of_attack: 'Espada de Ataque',
  lesser_crit: 'Hoja de Cristal',
  crystalys: 'Hoja de Cristal',
  armlet: 'Brazal de Mordiggian',
  invis_sword: 'Filo de las Sombras',
  shadow_blade: 'Filo de las Sombras',
  silver_edge: 'Hoja Plateada',
  echo_sabre: 'Sable del Eco',
  harpoon: 'Arpón',
  maelstrom: 'Maelstrom',
  mjollnir: 'Mjollnir',
  basher: 'Aplastacráneos',
  skull_basher: 'Aplastacráneos',
  desolator: 'Desoladora',
  diffusal_blade: 'Cuchilla Difusora',
  disperser: 'Dispersor',
  mage_slayer: 'Asesino de Magos',
  dragon_lance: 'Lanza del Dragón',
  sange_and_kaya: 'Sange y Kaya',
  kaya_and_sange: 'Kaya y Sange',
  yasha_and_kaya: 'Yasha y Kaya',
  heavens_halberd: 'Alabarda Celestial',
  radiance: 'Radiancia',
  satanic: 'Satánico',
  nullifier: 'Anulador',
  bloodthorn: 'Espina Sangrienta',
  orchid: 'Orquídea Malevolente',
  orchid_malevolence: 'Orquídea Malevolente',
  moon_shard: 'Fragmento Lunar',
  hand_of_midas: 'Mano de Midas',
  mask_of_madness: 'Máscara de la Locura',
  helm_of_the_dominator: 'Yelmo del Dominador',
  helm_of_the_overlord: 'Yelmo del Dominador Supremo',
  meteor_hammer: 'Martillo Meteorítico',
  soul_ring: 'Anillo de Alma',
  arcane_ring: 'Anillo Arcano',
  null_talisman: 'Talismán Nulo',
  wraith_band: 'Banda Espectral',
  bracer: 'Brazalete',
  aether_lens: 'Lente Éter',
  witch_blade: 'Hoja de Bruja',
  phylactery: 'Filacteria',
  khanda: 'Khanda',
  cyclone: 'Cetro de la Divinidad de Eul',
  euls_scepter: 'Cetro de la Divinidad de Eul',
  wind_waker: 'Despertador del Viento',
  rod_of_atos: 'Vara de Atos',
  gleipnir: 'Gleipnir',
  refresher: 'Orbe de Reanudación',
  refresher_orb: 'Orbe de Reanudación',
  octarine_core: 'Núcleo Octarino',
  bloodstone: 'Piedra de Sangre',
  ultimate_scepter: 'Cetro de Aghanim',
  aghanims_scepter: 'Cetro de Aghanim',
  aghanims_shard: 'Fragmento de Aghanim',
  veil_of_discord: 'Velo de la Discordia',
  dagon: 'Dagon Nivel 1',
  dagon_2: 'Dagon Nivel 2',
  dagon_3: 'Dagon Nivel 3',
  dagon_4: 'Dagon Nivel 4',
  dagon_5: 'Dagon Nivel 5',
  demon_edge: 'Filo Demoníaco',
  eagle: 'Canción de Águila',
  eaglesong: 'Canción de Águila',
  reaver: 'Desgarrador',
  mystic_staff: 'Bastón Místico',
  hyperstone: 'Hiperpiedra',
  ring_of_tarrasque: 'Anillo de Tarrasque',
  tiara_of_selemene: 'Tiara de Selemene',
  cornucopia: 'Cornucopia',
  point_booster: 'Potenciador de Puntos',
  platemail: 'Armadura de Placas',
  talisman_of_evasion: 'Talismán de Evasión',
  energy_booster: 'Potenciador de Energía',
  vitality_booster: 'Potenciador de Vitalidad',
  relic: 'Reliquia Sagrada',
  sacred_relic: 'Reliquia Sagrada',
  eternal_shroud: 'Mortaja Eterna',
  revenants_brooch: 'Broche del Retornado',
  orb_of_corrosion: 'Orbe de Corrosión',
  falcon_blade: 'Hoja del Halcón',
};

// ─── CATEGORY DEFINITIONS ────────────────────────────────────────────────────

export interface CategoryTab {
  id: CategoryId;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeClass: string;
}

export const CATEGORIES: CategoryTab[] = [
  {
    id: 'all',
    label: 'Todos',
    badge: 'Todos los Objetos',
    icon: Layers,
    color: 'text-gray-300',
    activeClass: 'bg-red-600/20 text-red-300 border-red-500/50 shadow-sm shadow-red-950/40',
  },
  {
    id: 'consumables',
    label: 'Consumibles',
    badge: 'Consumible',
    icon: Flame,
    color: 'text-emerald-400',
    activeClass: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950/40',
  },
  {
    id: 'attributes',
    label: 'Atributos',
    badge: 'Atributos Básicos',
    icon: Activity,
    color: 'text-sky-400',
    activeClass: 'bg-sky-600/20 text-sky-300 border-sky-500/50 shadow-sm shadow-sky-950/40',
  },
  {
    id: 'weapons',
    label: 'Armamento',
    badge: 'Armamento y Daño',
    icon: Swords,
    color: 'text-orange-400',
    activeClass: 'bg-orange-600/20 text-orange-300 border-orange-500/50 shadow-sm shadow-orange-950/40',
  },
  {
    id: 'armor',
    label: 'Armadura',
    badge: 'Armadura y Defensa',
    icon: Shield,
    color: 'text-slate-300',
    activeClass: 'bg-slate-700/40 text-slate-200 border-slate-500/50 shadow-sm shadow-slate-950/40',
  },
  {
    id: 'magical',
    label: 'Mágicos',
    badge: 'Mágicos y Hechizos',
    icon: Sparkles,
    color: 'text-violet-400',
    activeClass: 'bg-violet-600/20 text-violet-300 border-violet-500/50 shadow-sm shadow-violet-950/40',
  },
  {
    id: 'artifacts',
    label: 'Artefactos',
    badge: 'Artefacto Legendario',
    icon: Award,
    color: 'text-amber-400',
    activeClass: 'bg-amber-600/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-950/40',
  },
  {
    id: 'support',
    label: 'Soporte',
    badge: 'Soporte de Equipo',
    icon: Heart,
    color: 'text-teal-400',
    activeClass: 'bg-teal-600/20 text-teal-300 border-teal-500/50 shadow-sm shadow-teal-950/40',
  },
  {
    id: 'secret_shop',
    label: 'Tienda Secreta',
    badge: 'Tienda Secreta',
    icon: ShoppingBag,
    color: 'text-rose-400',
    activeClass: 'bg-rose-600/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-950/40',
  },
];

// ─── CLASSIFICATION LISTS ────────────────────────────────────────────────────

const SECRET_SHOP_KEYS = new Set([
  'demon_edge',
  'eagle',
  'reaver',
  'mystic_staff',
  'hyperstone',
  'ring_of_tarrasque',
  'tiara_of_selemene',
  'cornucopia',
  'point_booster',
  'platemail',
  'talisman_of_evasion',
  'energy_booster',
  'vitality_booster',
  'void_stone',
  'relic',
]);

const ARTIFACT_KEYS = new Set([
  'rapier',
  'radiance',
  'heart',
  'butterfly',
  'daedalus',
  'greater_crit',
  'monkey_king_bar',
  'abyssal_blade',
  'bloodthorn',
  'nullifier',
  'satanic',
  'moon_shard',
  'skadi',
  'disperser',
  'revenants_brooch',
  'apex',
  'assault',
  'shivas_guard',
  'octarine_core',
  'refresher',
  'wind_waker',
]);

const SUPPORT_KEYS = new Set([
  'ward_observer',
  'ward_sentry',
  'smoke_of_deceit',
  'dust',
  'gem',
  'urn_of_shadows',
  'spirit_vessel',
  'medallion_of_courage',
  'solar_crest',
  'pipe',
  'glimmer_cape',
  'force_staff',
  'guardian_greaves',
  'mekansm',
  'holy_locket',
  'boots_of_bearing',
  'pavise',
  'vladmir',
  'arcane_boots',
  'drum_of_endurance',
  'headdress',
  'buckler',
  'ring_of_basilius',
]);

const ARMOR_KEYS = new Set([
  'ring_of_protection',
  'stout_shield',
  'buckler',
  'vanguard',
  'blade_mail',
  'soul_booster',
  'crimson_guard',
  'aeon_disk',
  'lotus_orb',
  'black_king_bar',
  'bkb',
  'shivas_guard',
  'assault',
  'chainmail',
  'helm_of_iron_will',
  'cloak',
  'hood_of_defiance',
  'eternal_shroud',
  'platemail',
  'pavise',
]);

const MAGICAL_KEYS = new Set([
  'blink',
  'magic_stick',
  'magic_wand',
  'soul_ring',
  'arcane_ring',
  'null_talisman',
  'aether_lens',
  'witch_blade',
  'phylactery',
  'khanda',
  'dagon',
  'dagon_2',
  'dagon_3',
  'dagon_4',
  'dagon_5',
  'cyclone',
  'wind_waker',
  'rod_of_atos',
  'gleipnir',
  'orchid',
  'sheepstick',
  'scythe_of_vyse',
  'refresher',
  'octarine_core',
  'kaya',
  'kaya_and_sange',
  'yasha_and_kaya',
  'veil_of_discord',
  'ethereal_blade',
  'bloodstone',
  'ultimate_scepter',
  'aghanims_shard',
  'meteor_hammer',
  'ghost',
]);

const ATTRIBUTE_KEYS = new Set([
  'branches',
  'iron_branch',
  'gauntlets',
  'slippers',
  'mantle',
  'circlet',
  'belt_of_strength',
  'boots_of_elves',
  'robe',
  'crown',
  'diadem',
  'ogre_axe',
  'blade_of_alacrity',
  'staff_of_wizardry',
  'fluffy_hat',
  'infused_raindrop',
  'wind_lace',
  'quelling_blade',
  'ring_of_regen',
  'sobi_mask',
  'ring_of_health',
  'void_stone',
  'bracer',
  'wraith_band',
]);

// ─── CATEGORY DETECTION FUNCTION ─────────────────────────────────────────────

function detectItemCategory(key: string, item: RawItem): CategoryId {
  const cost = item.cost ?? 0;
  const qual = item.qual ?? '';

  // 1. Consumables rule: qual === 'consumable' OR (cost <= 200 AND no components)
  if (
    qual === 'consumable' ||
    (cost <= 200 && (!item.components || item.components.length === 0)) ||
    key.includes('tango') ||
    key.includes('clarity') ||
    key.includes('flask') ||
    key.includes('mango') ||
    key.includes('dust') ||
    key.includes('smoke') ||
    key.includes('bottle') ||
    key.includes('tpscroll') ||
    key.includes('faerie') ||
    key.includes('grenade') ||
    key.includes('cheese')
  ) {
    return 'consumables';
  }

  // 2. Secret Shop rule: qual === 'secret_shop' or matching secret shop item
  if (qual === 'secret_shop' || item.secret_shop === 1 || SECRET_SHOP_KEYS.has(key)) {
    return 'secret_shop';
  }

  // 3. Artifacts rule: qual === 'artifact' or matching artifact set
  if (qual === 'artifact' || ARTIFACT_KEYS.has(key) || (cost >= 4500 && item.created)) {
    return 'artifacts';
  }

  // 4. Support
  if (
    SUPPORT_KEYS.has(key) ||
    key.includes('ward') ||
    key.includes('gem') ||
    key.includes('smoke') ||
    key.includes('dust')
  ) {
    return 'support';
  }

  // 5. Attributes rule: qual === 'common' AND cost < 500
  if ((qual === 'common' && cost < 500) || ATTRIBUTE_KEYS.has(key)) {
    return 'attributes';
  }

  // 6. Armor
  if (
    ARMOR_KEYS.has(key) ||
    key.includes('armor') ||
    key.includes('buckler') ||
    key.includes('shield') ||
    key.includes('mail') ||
    key.includes('shroud') ||
    key.includes('cloak') ||
    key.includes('guard')
  ) {
    return 'armor';
  }

  // 7. Magical
  if (
    MAGICAL_KEYS.has(key) ||
    key.includes('dagon') ||
    key.includes('lens') ||
    key.includes('wand') ||
    key.includes('stick') ||
    key.includes('orchid') ||
    key.includes('refresher') ||
    key.includes('octarine') ||
    key.includes('kaya') ||
    key.includes('scepter') ||
    key.includes('shard') ||
    key.includes('sheepstick') ||
    key.includes('cyclone') ||
    key.includes('atos') ||
    key.includes('phylactery') ||
    key.includes('khanda')
  ) {
    return 'magical';
  }

  // 8. Weapons & Default
  return 'weapons';
}

// ─── SPANISH NAME GETTER ─────────────────────────────────────────────────────

export function getSpanishItemName(key: string, dname?: string): string {
  if (SPANISH_NAME_MAP[key]) return SPANISH_NAME_MAP[key];

  if (dname) {
    const clean = dname.toLowerCase().trim();
    // Direct match against known names
    if (clean === 'blink dagger') return 'Daga de Destello';
    if (clean === 'black king bar') return 'Estandarte del Rey Negro';
    if (clean === 'battle fury') return 'Furia de Batalla';
    if (clean === 'manta style') return 'Estilo Manta';
    if (clean === 'sange and yasha') return 'Sange y Yasha';
    if (clean === 'power treads') return 'Zapatillas de Poder';
    if (clean === 'phase boots') return 'Botas de Fase';
    if (clean === 'abyssal blade' || clean === 'abyss blade') return 'Hoja del Abismo';
    if (clean === "linken's sphere" || clean === 'linkens sphere') return 'Esfera de Linken';
    if (clean === 'eye of skadi') return 'Ojo de Skadi';
    if (clean === 'monkey king bar') return 'Barra del Rey Mono';
    if (clean === 'butterfly') return 'Mariposa';
    if (clean === 'heart of tarrasque') return 'Corazón de Tarrasque';
    if (clean === 'sange') return 'Sange';
    if (clean === 'yasha') return 'Yasha';
    if (clean === 'kaya') return 'Kaya';
    if (clean === 'daedalus') return 'Dédalo';
    if (clean === 'divine rapier' || clean === 'rapier') return 'Estoque';
    if (clean === 'scythe of vyse') return 'Hoz de Vyse';
    if (clean === 'ethereal blade') return 'Cuchilla Etérea';

    // Reverse lookup in map
    for (const [k, v] of Object.entries(SPANISH_NAME_MAP)) {
      if (k === clean || k.replace(/_/g, ' ') === clean) {
        return v;
      }
    }
    return dname;
  }

  return key.replace(/_/g, ' ');
}

// ─── IMAGE COMPONENT WITH FALLBACKS ──────────────────────────────────────────

export const ItemImage: React.FC<{
  itemKey: string;
  name: string;
  className?: string;
  imgFallbackPath?: string;
}> = ({ itemKey, name, className = 'w-10 h-10', imgFallbackPath }) => {
  const [errorCount, setErrorCount] = useState(0);

  // 1. Primary: Steam CDN React item image
  // 2. Secondary: Provided OpenDota img path
  // 3. Tertiary: Fallback placeholder
  let src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemKey}.png`;
  if (itemKey.includes('recipe')) {
    src = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png`;
  }

  if (errorCount === 1 && imgFallbackPath) {
    src = imgFallbackPath.startsWith('http')
      ? imgFallbackPath
      : `https://cdn.cloudflare.steamstatic.com${imgFallbackPath.startsWith('/') ? '' : '/'}${imgFallbackPath}`;
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 flex items-center justify-center flex-shrink-0 shadow-sm ${className}`}
      title={name}
    >
      {errorCount < 2 ? (
        <img
          src={src}
          alt={name}
          onError={() => setErrorCount((prev) => prev + 1)}
          className="w-full h-full object-cover transition-transform duration-200"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-amber-500/80 font-bold text-[10px]">
          <Package className="w-4 h-4 opacity-70 mb-0.5" />
          <span>{name.slice(0, 2).toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};

// ─── STATIC OFFLINE FALLBACK DATA ─────────────────────────────────────────────

const FALLBACK_ITEMS: Record<string, RawItem> = {
  blink: {
    id: 1,
    dname: 'Blink Dagger',
    cost: 2250,
    qual: 'component',
    cd: 15,
    mc: false,
    lore: 'The fabled dagger used by the fastest assassin that ever walked the lands.',
    hint: ['Active: Blink - Teletransporta hasta 1200 unidades al punto objetivo.'],
    attrib: [],
    notes: 'No puede usarse si has recibido daño de héroes en los últimos 3 segundos.',
  },
  black_king_bar: {
    id: 116,
    dname: 'Black King Bar',
    cost: 4050,
    qual: 'artifact',
    cd: 90,
    mc: 50,
    components: ['ogre_axe', 'mithril_hammer'],
    created: true,
    lore: 'Un poderoso cetro consagrado a los reyes primordiales del combate.',
    hint: ['Active: Avatar - Otorga inmunidad a efectos de control y 50% de resistencia mágica.'],
    attrib: [
      { header: '+', value: '10', footer: 'Fuerza' },
      { header: '+', value: '24', footer: 'Daño de Ataque' },
    ],
  },
  battle_fury: {
    id: 145,
    dname: 'Battle Fury',
    cost: 4100,
    qual: 'artifact',
    components: ['broadsword', 'claymore', 'cornucopia', 'quelling_blade'],
    created: true,
    hint: ['Passive: Cleave - Inflige daño en área a unidades cercanas con ataques cuerpo a cuerpo.'],
    attrib: [
      { header: '+', value: '65', footer: 'Daño de Ataque' },
      { header: '+', value: '7.5', footer: 'Regeneración de Vida' },
      { header: '+', value: '2.75', footer: 'Regeneración de Maná' },
    ],
  },
  manta: {
    id: 147,
    dname: 'Manta Style',
    cost: 4550,
    qual: 'artifact',
    cd: 30,
    mc: 125,
    components: ['yasha', 'diadem'],
    created: true,
    hint: ['Active: Mirror Image - Crea 2 ilusiones de tu héroe y purga perjuicios básicos.'],
    attrib: [
      { header: '+', value: '10', footer: 'Fuerza' },
      { header: '+', value: '26', footer: 'Agilidad' },
      { header: '+', value: '10', footer: 'Inteligencia' },
      { header: '+', value: '12', footer: 'Velocidad de Ataque' },
    ],
  },
  sange_and_yasha: {
    id: 154,
    dname: 'Sange and Yasha',
    cost: 4100,
    qual: 'artifact',
    components: ['sange', 'yasha'],
    created: true,
    attrib: [
      { header: '+', value: '16', footer: 'Fuerza' },
      { header: '+', value: '16', footer: 'Agilidad' },
      { header: '+', value: '12', footer: 'Velocidad de Ataque' },
      { header: '+', value: '12%', footer: 'Velocidad de Movimiento' },
      { header: '+', value: '25%', footer: 'Resistencia a Estados y Curación' },
    ],
  },
  power_treads: {
    id: 63,
    dname: 'Power Treads',
    cost: 1400,
    qual: 'common',
    components: ['boots', 'gloves', 'belt_of_strength'],
    created: true,
    hint: ['Active: Switch Attribute - Cambia el atributo seleccionado entre Fuerza, Agilidad o Inteligencia (+10).'],
    attrib: [
      { header: '+', value: '45', footer: 'Velocidad de Movimiento' },
      { header: '+', value: '25', footer: 'Velocidad de Ataque' },
      { header: '+', value: '10', footer: 'Atributo Seleccionado' },
    ],
  },
  phase_boots: {
    id: 50,
    dname: 'Phase Boots',
    cost: 1500,
    qual: 'common',
    cd: 8,
    mc: false,
    components: ['boots', 'blade_of_attack', 'chainmail'],
    created: true,
    hint: ['Active: Phase - Aumenta la velocidad de movimiento y permite atravesar unidades.'],
    attrib: [
      { header: '+', value: '45', footer: 'Velocidad de Movimiento' },
      { header: '+', value: '18', footer: 'Daño (Cuerpo a cuerpo)' },
      { header: '+', value: '4', footer: 'Armadura' },
    ],
  },
  abyssal_blade: {
    id: 208,
    dname: 'Abyssal Blade',
    cost: 6250,
    qual: 'artifact',
    cd: 35,
    mc: 75,
    components: ['basher', 'vanguard'],
    created: true,
    hint: ['Active: Overwhelm - Aturde a un héroe enemigo durante 2 segundos atravesando inmunidad mágica.'],
    attrib: [
      { header: '+', value: '250', footer: 'Vida' },
      { header: '+', value: '10', footer: 'Fuerza' },
      { header: '+', value: '25', footer: 'Daño' },
    ],
  },
  sphere: {
    id: 123,
    dname: "Linken's Sphere",
    cost: 4600,
    qual: 'artifact',
    cd: 14,
    mc: false,
    components: ['ultimate_orb', 'cornucopia'],
    created: true,
    hint: ['Passive: Spellblock - Bloquea automáticamente un hechizo dirigido al portador.'],
    attrib: [
      { header: '+', value: '16', footer: 'Todos los Atributos' },
      { header: '+', value: '7', footer: 'Regeneración de Vida' },
      { header: '+', value: '5', footer: 'Regeneración de Maná' },
    ],
  },
  skadi: {
    id: 160,
    dname: 'Eye of Skadi',
    cost: 5300,
    qual: 'artifact',
    components: ['ultimate_orb', 'ultimate_orb', 'point_booster'],
    created: true,
    hint: ['Passive: Cold Attack - Ralentiza la velocidad de movimiento, ataque y regeneración enemiga con cada golpe.'],
    attrib: [
      { header: '+', value: '22', footer: 'Todos los Atributos' },
      { header: '+', value: '220', footer: 'Vida' },
      { header: '+', value: '220', footer: 'Maná' },
    ],
  },
  monkey_king_bar: {
    id: 135,
    dname: 'Monkey King Bar',
    cost: 4900,
    qual: 'artifact',
    components: ['demon_edge', 'javelin', 'blitz_knuckles'],
    created: true,
    hint: ['Passive: Pierce - Otorga 80% de probabilidad de atravesar evasión e infligir daño puro adicional.'],
    attrib: [
      { header: '+', value: '40', footer: 'Daño de Ataque' },
      { header: '+', value: '45', footer: 'Velocidad de Ataque' },
    ],
  },
  butterfly: {
    id: 139,
    dname: 'Butterfly',
    cost: 5450,
    qual: 'artifact',
    components: ['eagle', 'talisman_of_evasion', 'claymore'],
    created: true,
    attrib: [
      { header: '+', value: '35', footer: 'Agilidad' },
      { header: '+', value: '35%', footer: 'Evasión' },
      { header: '+', value: '30', footer: 'Velocidad de Ataque' },
      { header: '+', value: '25', footer: 'Daño' },
    ],
  },
  heart: {
    id: 114,
    dname: 'Heart of Tarrasque',
    cost: 5200,
    qual: 'artifact',
    components: ['reaver', 'vitality_booster', 'ring_of_tarrasque'],
    created: true,
    attrib: [
      { header: '+', value: '40', footer: 'Fuerza' },
      { header: '+', value: '250', footer: 'Vida' },
      { header: '+', value: '1.6%', footer: 'Regeneración de Vida Máxima' },
    ],
  },
  daedalus: {
    id: 141,
    dname: 'Daedalus',
    cost: 5150,
    qual: 'artifact',
    components: ['lesser_crit', 'demon_edge'],
    created: true,
    hint: ['Passive: Critical Strike - 30% de probabilidad de asestar un golpe crítico de 225% de daño.'],
    attrib: [{ header: '+', value: '88', footer: 'Daño de Ataque' }],
  },
  rapier: {
    id: 133,
    dname: 'Divine Rapier',
    cost: 5600,
    qual: 'artifact',
    components: ['relic', 'demon_edge'],
    created: true,
    notes: 'Se cae al suelo al morir y puede ser recogida por aliados o enemigos.',
    attrib: [{ header: '+', value: '350', footer: 'Daño de Ataque' }],
  },
  sheepstick: {
    id: 96,
    dname: 'Scythe of Vyse',
    cost: 5675,
    qual: 'artifact',
    cd: 20,
    mc: 250,
    components: ['mystic_staff', 'ultimate_orb', 'void_stone'],
    created: true,
    hint: ['Active: Hex - Transforma a una unidad enemiga en un cerdo indefenso durante 2.8 segundos.'],
    attrib: [
      { header: '+', value: '35', footer: 'Inteligencia' },
      { header: '+', value: '10', footer: 'Fuerza' },
      { header: '+', value: '10', footer: 'Agilidad' },
      { header: '+', value: '8.5', footer: 'Regeneración de Maná' },
    ],
  },
  ethereal_blade: {
    id: 176,
    dname: 'Ethereal Blade',
    cost: 4650,
    qual: 'artifact',
    cd: 20,
    mc: 100,
    components: ['aether_lens', 'ghost'],
    created: true,
    hint: ['Active: Ether Blast - Hace a la unidad objetivo etérea e inflige daño mágico basado en su atributo principal.'],
    attrib: [
      { header: '+', value: '300', footer: 'Maná' },
      { header: '+', value: '5', footer: 'Todos los Atributos' },
      { header: '+', value: '225', footer: 'Alcance de Lanzamiento' },
    ],
  },
  sange: {
    id: 149,
    dname: 'Sange',
    cost: 2050,
    qual: 'component',
    components: ['ogre_axe', 'belt_of_strength'],
    created: true,
    attrib: [
      { header: '+', value: '16', footer: 'Fuerza' },
      { header: '+', value: '20%', footer: 'Resistencia a Estados y Amplificación de Curación' },
    ],
  },
  yasha: {
    id: 151,
    dname: 'Yasha',
    cost: 2050,
    qual: 'component',
    components: ['blade_of_alacrity', 'boots_of_elves'],
    created: true,
    attrib: [
      { header: '+', value: '16', footer: 'Agilidad' },
      { header: '+', value: '12', footer: 'Velocidad de Ataque' },
      { header: '+', value: '8%', footer: 'Velocidad de Movimiento' },
    ],
  },
  kaya: {
    id: 259,
    dname: 'Kaya',
    cost: 2050,
    qual: 'component',
    components: ['staff_of_wizardry', 'robe'],
    created: true,
    attrib: [
      { header: '+', value: '16', footer: 'Inteligencia' },
      { header: '+', value: '10%', footer: 'Amplificación de Daño de Hechizos' },
      { header: '+', value: '25%', footer: 'Regeneración de Maná' },
    ],
  },
  tango: {
    id: 44,
    dname: 'Tango',
    cost: 90,
    qual: 'consumable',
    hint: ['Active: Devour - Consume un árbol para regenerar 112 de vida a lo largo de 16 segundos.'],
    attrib: [],
  },
  clarity: {
    id: 38,
    dname: 'Clarity',
    cost: 50,
    qual: 'consumable',
    hint: ['Active: Restore - Regenera 150 de maná a lo largo de 25 segundos. Se cancela si recibes daño de héroe.'],
    attrib: [],
  },
  boots: {
    id: 29,
    dname: 'Boots of Speed',
    cost: 500,
    qual: 'component',
    attrib: [{ header: '+', value: '45', footer: 'Velocidad de Movimiento' }],
  },
};

// ─── MAIN ITEMS DATABASE PAGE COMPONENT ──────────────────────────────────────

export const ItemsDatabasePage: React.FC = () => {
  // ── States ─────────────────────────────────────────────────────────────────
  const [itemsMap, setItemsMap] = useState<Record<string, RawItem>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'cost_asc' | 'cost_desc' | 'name_asc' | 'name_desc'>('cost_desc');
  const [onlyComponents, setOnlyComponents] = useState<boolean>(false);
  const [onlyBasics, setOnlyBasics] = useState<boolean>(false);

  // Modal / Detail Panel
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // ── Data Fetching with 24h localStorage Cache ──────────────────────────────
  const loadItems = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // 1. Check localStorage Cache if not forcing refresh
    if (!forceRefresh && typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed: CachedPayload = JSON.parse(raw);
          const age = Date.now() - parsed.timestamp;
          if (age < CACHE_TTL_MS && parsed.items && Object.keys(parsed.items).length > 20) {
            setItemsMap(parsed.items);
            setLastUpdated(new Date(parsed.timestamp));
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading items cache:', e);
      }
    }

    // 2. Fetch from OpenDota Constants API
    try {
      const response = await fetch('https://api.opendota.com/api/constants/items');
      if (!response.ok) {
        throw new Error(`Error en servidor OpenDota: ${response.status} ${response.statusText}`);
      }
      const data: Record<string, RawItem> = await response.json();

      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setItemsMap(data);
        const now = Date.now();
        setLastUpdated(new Date(now));

        // Save to cache
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const payload: CachedPayload = {
              timestamp: now,
              items: data,
            };
            window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
          }
        } catch (storageError) {
          console.warn('Storage quota exceeded or error:', storageError);
        }
      } else {
        throw new Error('Respuesta inválida de la API de OpenDota');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al cargar objetos';
      console.warn('Failed to fetch OpenDota items, falling back to embedded database:', msg);
      setError(msg);

      // Gracefully fall back to embedded items so user can continue seamlessly
      setItemsMap(FALLBACK_ITEMS);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems(false);
  }, [loadItems]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeItemKey) {
        handleCloseDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItemKey]);

  // ── Normalize Items & Clean List ───────────────────────────────────────────
  const normalizedItemsList = useMemo<ItemData[]>(() => {
    const list: ItemData[] = [];

    for (const [key, raw] of Object.entries(itemsMap)) {
      if (!raw || typeof raw !== 'object') continue;

      // Filter internal / recipe scrolls / test items
      if (
        key.startsWith('item_recipe') ||
        key.startsWith('recipe_') ||
        raw.recipe === true ||
        raw.recipe === 1
      ) {
        continue;
      }

      // Skip invalid items or mutation artifacts with no name and cost 0
      const dname = raw.dname || key.replace(/_/g, ' ');
      if (!dname || dname.startsWith('recipe') || dname.startsWith('item_recipe')) {
        continue;
      }

      const cost = typeof raw.cost === 'number' ? raw.cost : 0;
      if (cost === 0 && !raw.qual && !raw.desc && !raw.hint && !raw.attrib?.length) {
        continue;
      }

      const spanishName = getSpanishItemName(key, dname);
      const category = detectItemCategory(key, raw);

      // Cooldown
      let cd: number | null = null;
      if (typeof raw.cd === 'number') cd = raw.cd;
      else if (typeof raw.cd === 'string' && !isNaN(Number(raw.cd))) cd = Number(raw.cd);

      // Mana cost
      let mc: number | null = null;
      if (typeof raw.mc === 'number') mc = raw.mc;
      else if (typeof raw.mc === 'string' && !isNaN(Number(raw.mc))) mc = Number(raw.mc);

      // Format hint
      let hintStr = '';
      if (Array.isArray(raw.hint)) {
        hintStr = raw.hint.join(' ');
      } else if (typeof raw.hint === 'string') {
        hintStr = raw.hint;
      }

      // Calculate recipe cost
      let recipeCost = 0;
      if (raw.components && raw.components.length > 0 && cost > 0) {
        let componentsSum = 0;
        for (const compKey of raw.components) {
          const compItem = itemsMap[compKey];
          if (compItem && typeof compItem.cost === 'number') {
            componentsSum += compItem.cost;
          }
        }
        if (cost > componentsSum) {
          recipeCost = cost - componentsSum;
        }
      }

      list.push({
        key,
        id: typeof raw.id === 'number' ? raw.id : 0,
        dname,
        spanishName,
        cost,
        img: raw.img || '',
        qual: raw.qual || 'component',
        category,
        notes: raw.notes || '',
        attrib: Array.isArray(raw.attrib) ? raw.attrib : [],
        mc,
        cd,
        lore: raw.lore || '',
        hint: hintStr,
        desc: raw.desc || '',
        components: Array.isArray(raw.components) ? raw.components : null,
        created: Boolean(raw.created),
        recipe: Boolean(raw.recipe),
        recipeCost,
      });
    }

    return list;
  }, [itemsMap]);

  // ── Reverse Map: Which items can this item be built into? ───────────────────
  const builtIntoMap = useMemo<Record<string, ItemData[]>>(() => {
    const map: Record<string, ItemData[]> = {};

    for (const item of normalizedItemsList) {
      if (item.components && item.components.length > 0) {
        for (const compKey of item.components) {
          // Ignore recipe items in the builtInto keys
          if (compKey.startsWith('recipe_') || compKey.startsWith('item_recipe')) continue;
          if (!map[compKey]) {
            map[compKey] = [];
          }
          if (!map[compKey].some((it) => it.key === item.key)) {
            map[compKey].push(item);
          }
        }
      }
    }

    return map;
  }, [normalizedItemsList]);

  // Map for quick item lookup by key
  const itemsByKey = useMemo<Record<string, ItemData>>(() => {
    const map: Record<string, ItemData> = {};
    for (const item of normalizedItemsList) {
      map[item.key] = item;
    }
    return map;
  }, [normalizedItemsList]);

  // ── Counts per Category ────────────────────────────────────────────────────
  const categoryCounts = useMemo<Record<CategoryId, number>>(() => {
    const counts: Record<CategoryId, number> = {
      all: normalizedItemsList.length,
      consumables: 0,
      attributes: 0,
      weapons: 0,
      armor: 0,
      magical: 0,
      artifacts: 0,
      support: 0,
      secret_shop: 0,
    };

    for (const item of normalizedItemsList) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }

    return counts;
  }, [normalizedItemsList]);

  // ── Filtered & Sorted Items ────────────────────────────────────────────────
  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return normalizedItemsList
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Toggle filters
        if (onlyComponents && (!item.components || item.components.length === 0)) {
          return false;
        }
        if (onlyBasics && item.components && item.components.length > 0) {
          return false;
        }

        // Search text matching (Spanish name, English name, hint, notes)
        if (query) {
          const matchSpanish = item.spanishName.toLowerCase().includes(query);
          const matchEnglish = item.dname.toLowerCase().includes(query);
          const matchKey = item.key.toLowerCase().includes(query);
          const matchHint = item.hint.toLowerCase().includes(query);
          const matchNotes = item.notes.toLowerCase().includes(query);

          if (!matchSpanish && !matchEnglish && !matchKey && !matchHint && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'cost_desc') return b.cost - a.cost;
        if (sortBy === 'cost_asc') return a.cost - b.cost;
        if (sortBy === 'name_asc') return a.spanishName.localeCompare(b.spanishName);
        if (sortBy === 'name_desc') return b.spanishName.localeCompare(a.spanishName);
        return 0;
      });
  }, [normalizedItemsList, selectedCategory, searchQuery, sortBy, onlyComponents, onlyBasics]);

  // ── Modal Actions & Navigation ─────────────────────────────────────────────
  const handleSelectItem = (key: string) => {
    if (activeItemKey && activeItemKey !== key) {
      setNavigationHistory((prev) => [...prev, activeItemKey]);
    }
    setActiveItemKey(key);
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length > 0) {
      const prevKey = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveItemKey(prevKey);
    }
  };

  const handleCloseDetail = () => {
    setActiveItemKey(null);
    setNavigationHistory([]);
  };

  const activeItem = activeItemKey ? itemsByKey[activeItemKey] : null;

  return (
    <div className="space-y-6 pb-16 selection:bg-red-500/30 selection:text-white">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shadow-md shadow-red-950/50">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Base de Datos de Ítems
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-950/70 text-red-400 border border-red-800/50">
                Dota 2
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2">
              <span>Catálogo completo de objetos, recetas, componentes y estadísticas.</span>
              {lastUpdated && (
                <span className="hidden sm:inline text-gray-500">
                  · Caché 24h ({lastUpdated.toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Refresh & Quick Stats */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => loadItems(true)}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-gray-300 hover:text-white border border-slate-700 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            title="Refrescar datos desde OpenDota API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
            <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Search Bar & Sorting */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ítem por nombre en español o inglés (ej: Blink Dagger, BKB, Mariposa...)"
              className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-gray-200 focus:outline-none focus:border-red-500 appearance-none font-medium transition cursor-pointer"
              >
                <option value="cost_desc">Costo: Mayor a Menor</option>
                <option value="cost_asc">Costo: Menor a Mayor</option>
                <option value="name_asc">Nombre: A → Z</option>
                <option value="name_desc">Nombre: Z → A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? cat.activeClass
                    : 'bg-slate-900/80 text-gray-400 border-slate-800/80 hover:bg-slate-800 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? cat.color : 'text-gray-400'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-slate-950/80 text-white'
                      : 'bg-slate-800 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Filters Pill Toggles */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs text-gray-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtros rápidos:
            </span>
            <button
              onClick={() => {
                setOnlyComponents(!onlyComponents);
                if (!onlyComponents) setOnlyBasics(false);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                onlyComponents
                  ? 'bg-red-600/20 text-red-300 border-red-500/50'
                  : 'bg-slate-900 text-gray-400 border-slate-800 hover:text-gray-200'
              }`}
            >
              Compuestos (Con Receta)
            </button>
            <button
              onClick={() => {
                setOnlyBasics(!onlyBasics);
                if (!onlyBasics) setOnlyComponents(false);
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                onlyBasics
                  ? 'bg-red-600/20 text-red-300 border-red-500/50'
                  : 'bg-slate-900 text-gray-400 border-slate-800 hover:text-gray-200'
              }`}
            >
              Básicos (Sin Componentes)
            </button>
          </div>

          <div className="text-gray-500">
            Mostrando <span className="font-bold text-gray-300">{displayedItems.length}</span> objetos
          </div>
        </div>
      </div>

      {/* ── Error Banner if any ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Aviso: No se pudo conectar en tiempo real con OpenDota ({error}). Se está usando el
              catálogo local integrado sin interrupción.
            </span>
          </div>
          <button
            onClick={() => loadItems(true)}
            className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 font-bold transition text-[11px] ml-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Loading Skeleton / State ─────────────────────────────────────────── */}
      {loading && displayedItems.length === 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center space-y-2"
            >
              <div className="w-14 h-11 bg-slate-800 rounded-lg" />
              <div className="w-16 h-3 bg-slate-800 rounded" />
              <div className="w-10 h-2.5 bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        /* ── Empty Search Results ─────────────────────────────────────────── */
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-3">
          <Package className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-300">No se encontraron objetos</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No hay ningún objeto que coincida con "{searchQuery}" en la categoría seleccionada.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyComponents(false);
              setOnlyBasics(false);
            }}
            className="px-4 py-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-600/30 transition"
          >
            Limpiar todos los filtros
          </button>
        </div>
      ) : (
        /* ── Responsive Items Grid: 3 cols mobile, 5 cols md, 7 cols lg ─────── */
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3.5">
          {displayedItems.map((item) => {
            const isSelected = activeItemKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelectItem(item.key)}
                className={`group relative p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? 'bg-red-950/40 border-red-500 ring-2 ring-red-500/40 shadow-lg shadow-red-950/60 -translate-y-0.5'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800/80 hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {/* Item Thumbnail */}
                <div className="flex flex-col items-center text-center w-full">
                  <div className="relative mb-2">
                    <ItemImage
                      itemKey={item.key}
                      name={item.spanishName}
                      className="w-14 h-10 sm:w-16 sm:h-12 rounded-lg group-hover:scale-105 transition-transform duration-200"
                      imgFallbackPath={item.img}
                    />

                    {/* Small Cooldown or Mana pill */}
                    {item.cd && (
                      <span className="absolute -bottom-1 -right-1 bg-slate-950/90 text-gray-300 border border-slate-700 text-[9px] font-mono font-bold px-1 rounded">
                        {item.cd}s
                      </span>
                    )}
                  </div>

                  {/* Item Names */}
                  <div className="w-full">
                    <div
                      className="text-xs sm:text-sm font-bold text-gray-200 group-hover:text-white truncate"
                      title={item.spanishName}
                    >
                      {item.spanishName}
                    </div>
                    <div
                      className="text-[10px] sm:text-[11px] text-gray-400 group-hover:text-gray-300 truncate"
                      title={item.dname}
                    >
                      {item.dname}
                    </div>
                  </div>
                </div>

                {/* Footer: Gold Cost & Brief Hint */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
                    <Coins className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{item.cost > 0 ? item.cost.toLocaleString() : 'Gratis'}</span>
                  </div>

                  {/* Components indicator dot */}
                  {item.components && item.components.length > 0 && (
                    <span
                      className="w-2 h-2 rounded-full bg-sky-400/80 flex-shrink-0"
                      title={`Compuesto por ${item.components.length} partes`}
                    />
                  )}
                </div>

                {/* Hover subtle glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Item Detail Panel Modal (Side Sheet / Modal) ────────────────────── */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Controls & Category */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/90 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {navigationHistory.length > 0 && (
                  <button
                    onClick={handleBackNavigation}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 transition"
                    title="Volver al ítem anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Atrás</span>
                  </button>
                )}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-red-400 border border-slate-700 uppercase tracking-wider">
                  {CATEGORIES.find((c) => c.id === activeItem.category)?.badge || 'Objeto'}
                </span>
                {activeItem.qual && (
                  <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
                    [{activeItem.qual}]
                  </span>
                )}
              </div>

              <button
                onClick={handleCloseDetail}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
              {/* Primary Identity: Image, Names, Cost */}
              <div className="flex items-start gap-4">
                <ItemImage
                  itemKey={activeItem.key}
                  name={activeItem.spanishName}
                  className="w-20 h-15 sm:w-24 sm:h-18 rounded-xl shadow-lg border-2 border-slate-700"
                  imgFallbackPath={activeItem.img}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {activeItem.spanishName}
                      </h2>
                      <div className="text-xs sm:text-sm text-gray-400 font-medium">
                        {activeItem.dname}{' '}
                        <span className="text-gray-600 font-mono text-[11px]">
                          ({activeItem.key})
                        </span>
                      </div>
                    </div>

                    {/* Gold Cost */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono font-black text-base shadow-sm">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>{activeItem.cost > 0 ? activeItem.cost.toLocaleString() : 'Gratis'}</span>
                    </div>
                  </div>

                  {/* Quick Cooldown & Mana Cost Badges */}
                  <div className="flex items-center gap-2.5 mt-2.5 flex-wrap text-xs">
                    {activeItem.cd !== null && activeItem.cd > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-gray-300 font-mono font-bold border border-slate-700">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{activeItem.cd}s Tiempo de recarga</span>
                      </div>
                    )}

                    {activeItem.mc !== null && activeItem.mc > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/60 text-sky-300 font-mono font-bold border border-sky-800/60">
                        <Zap className="w-3.5 h-3.5 text-sky-400" />
                        <span>{activeItem.mc} Maná</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attributes / Stats list (attrib array) */}
              {activeItem.attrib && activeItem.attrib.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>Bonificaciones y Atributos</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {activeItem.attrib.map((attr, idx) => {
                      const val = Array.isArray(attr.value) ? attr.value.join('/') : attr.value;
                      const header = attr.header || '';
                      const footer = attr.footer || '';
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-200 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800"
                        >
                          <span className="text-emerald-400 font-mono font-bold">{val}</span>
                          <span className="text-gray-300">
                            {header} {footer}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active / Passive Abilities & Hint */}
              {(activeItem.hint || activeItem.desc) && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950/80 to-slate-900/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Habilidad / Efecto</span>
                  </div>
                  {activeItem.desc && (
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal whitespace-pre-line">
                      {activeItem.desc}
                    </p>
                  )}
                  {activeItem.hint && (
                    <div className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      {activeItem.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Build Tree: Components (Recipe) */}
              {activeItem.components && activeItem.components.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-orange-400" />
                      <span>Componentes Requeridos ({activeItem.components.length})</span>
                    </span>
                    <span className="text-gray-500 font-mono">
                      Total: {activeItem.cost.toLocaleString()} oro
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeItem.components.map((compKey, idx) => {
                      // Check if it's a recipe scroll
                      const isRecipe =
                        compKey.startsWith('recipe_') || compKey.startsWith('item_recipe');
                      const compItem = itemsByKey[compKey];

                      if (isRecipe) {
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                          >
                            <img
                              src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
                              alt="Receta"
                              className="w-9 h-7 rounded border border-slate-700 object-cover"
                            />
                            <div className="flex-1 truncate">
                              <div className="font-bold text-gray-200">Pergamino de Receta</div>
                              <div className="text-amber-400 font-mono font-semibold">
                                {activeItem.recipeCost > 0
                                  ? `${activeItem.recipeCost.toLocaleString()} oro`
                                  : 'Receta'}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (!compItem) {
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-gray-400"
                          >
                            <span className="font-mono">{compKey}</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectItem(compItem.key)}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 hover:border-slate-700 border border-slate-800 transition text-left group"
                        >
                          <ItemImage
                            itemKey={compItem.key}
                            name={compItem.spanishName}
                            className="w-10 h-8 rounded border border-slate-700 group-hover:scale-105 transition-transform"
                            imgFallbackPath={compItem.img}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-200 group-hover:text-white truncate text-xs">
                              {compItem.spanishName}
                            </div>
                            <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              <span>{compItem.cost.toLocaleString()}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                        </button>
                      );
                    })}

                    {/* Show recipe scroll if item has recipeCost > 0 and no explicit recipe in components */}
                    {activeItem.recipeCost > 0 &&
                      !activeItem.components.some(
                        (c) => c.startsWith('recipe_') || c.startsWith('item_recipe')
                      ) && (
                        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <img
                            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/recipe.png"
                            alt="Receta"
                            className="w-9 h-7 rounded border border-slate-700 object-cover"
                          />
                          <div className="flex-1 truncate">
                            <div className="font-bold text-gray-200">Pergamino de Receta</div>
                            <div className="text-amber-400 font-mono font-semibold">
                              {activeItem.recipeCost.toLocaleString()} oro
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Reverse Build Tree: Used to build into ("Se usa para fabricar") */}
              {builtIntoMap[activeItem.key] && builtIntoMap[activeItem.key].length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-red-400" />
                    <span>
                      Se usa para fabricar ({builtIntoMap[activeItem.key].length} objetos)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {builtIntoMap[activeItem.key].map((parentItem) => (
                      <button
                        key={parentItem.key}
                        onClick={() => handleSelectItem(parentItem.key)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 hover:border-slate-700 border border-slate-800 transition text-left group"
                      >
                        <ItemImage
                          itemKey={parentItem.key}
                          name={parentItem.spanishName}
                          className="w-10 h-8 rounded border border-slate-700 group-hover:scale-105 transition-transform"
                          imgFallbackPath={parentItem.img}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-200 group-hover:text-white truncate text-xs">
                            {parentItem.spanishName}
                          </div>
                          <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            <span>{parentItem.cost.toLocaleString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Mechanics Notes */}
              {activeItem.notes && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300/90 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Info className="w-3.5 h-3.5" />
                    <span>Notas especiales de mecánicas:</span>
                  </div>
                  <p className="leading-relaxed text-gray-300 whitespace-pre-line">
                    {activeItem.notes}
                  </p>
                </div>
              )}

              {/* Lore / Story Text */}
              {activeItem.lore && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/60 text-xs text-gray-400 italic leading-relaxed flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-red-400/80 flex-shrink-0 mt-0.5" />
                  <p>"{activeItem.lore}"</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-gray-500">
              <span>ID del Objeto: {activeItem.id || 'N/D'}</span>
              <button
                onClick={handleCloseDetail}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsDatabasePage;
