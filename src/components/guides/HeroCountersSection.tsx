import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Target,
  Shield,
  Swords,
  Users,
  Zap,
  Info,
  Sparkles,
  ChevronRight,
  Flame,
  CheckCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { useConstants } from '../../hooks/useConstants';

// ─── VISUAL IMAGE HELPERS (STEAM CDN) ─────────────────────────────────────────
const HeroThumb: React.FC<{ heroKey: string; name: string; className?: string }> = ({
  heroKey,
  name,
  className = 'w-10 h-10',
}) => {
  const [error, setError] = useState(false);
  const cleanKey = heroKey.replace('npc_dota_hero_', '');
  const url = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${cleanKey}.png`;

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 flex-shrink-0 flex items-center justify-center shadow-md ${className}`}
      title={name}
    >
      {!error ? (
        <img
          src={url}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          loading="lazy"
        />
      ) : (
        <span className="text-xs font-bold text-gray-400">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
};

const ItemThumb: React.FC<{ itemKey: string; name: string; className?: string }> = ({
  itemKey,
  name,
  className = 'w-9 h-9',
}) => {
  const [error, setError] = useState(false);
  const url = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemKey}.png`;

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 flex-shrink-0 flex items-center justify-center shadow-sm ${className}`}
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
        <span className="text-[10px] font-bold text-amber-500">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface HeroCounterDetail {
  heroId?: number;
  heroKey: string;
  nameEn: string;
  nameEs: string;
  winrateVs?: string; // e.g. "39.4%" from OpenDota real match data
  whyCounter: string;
  isRealData?: boolean;
}

export interface AntiItemDetail {
  itemKey: string;
  nameEn: string;
  nameEs: string;
  cost: number;
  tacticalWhy: string;
}

export interface TeamSynergyDetail {
  partnerKey: string;
  partnerNameEn: string;
  partnerNameEs: string;
  comboName: string;
  howToExecute: string;
}

export interface HeroTacticalProfile {
  heroId: number;
  key: string;
  nameEn: string;
  nameEs: string;
  attr: 'str' | 'agi' | 'int' | 'all';
  primaryRole: string;
  dangerSummary: string;
  counters: HeroCounterDetail[];
  antiItems: AntiItemDetail[];
  synergies: TeamSynergyDetail[];
}

// ─── RICH SPECIFIC TACTICAL DATABASE ──────────────────────────────────────────
const HERO_MECHANICS_DATA: Record<string, {
  nameEs: string;
  dangerSummary: string;
  threatType: 'evasion' | 'passive_tank' | 'illusions' | 'mana_reliant' | 'invisible' | 'magic_burst' | 'fast_physical' | 'channeling' | 'slippery' | 'healer';
  counters: HeroCounterDetail[];
  antiItems: AntiItemDetail[];
  synergies: TeamSynergyDetail[];
}> = {
  phantom_assassin: {
    nameEs: 'Asesina Fantasma (PA)',
    dangerSummary: 'Críticos letales con Coup de Grâce y 50% de evasión pasiva física con Blur.',
    threatType: 'evasion',
    counters: [
      {
        heroKey: 'axe',
        nameEn: 'Axe',
        nameEs: 'Axe / Hacha',
        whyCounter: "Berserker's Call la fuerza a atacarlo y Blade Mail le devuelve el golpe crítico completo, eliminándola instantáneamente.",
      },
      {
        heroKey: 'viper',
        nameEn: 'Viper',
        nameEs: 'Víbora',
        whyCounter: 'Nethertoxin aplica Ruptura (Break), apagando completamente su pasiva de evasión y su probabilidad de crítico.',
      },
      {
        heroKey: 'lion',
        nameEn: 'Lion',
        nameEs: 'León',
        whyCounter: 'Stun + Hex en cadena le impiden activar BKB, y Finger of Death la desintegra con daño mágico puro ignorando la evasión.',
      },
      {
        heroKey: 'troll_warlord',
        nameEn: 'Troll Warlord',
        nameEs: 'Jefe Trol',
        whyCounter: 'Battle Trance lo vuelve inmortal ante sus golpes y Whirling Axes le aplica ceguera del 60% haciéndola fallar.',
      },
    ],
    antiItems: [
      {
        itemKey: 'monkey_king_bar',
        nameEn: 'Monkey King Bar (MKB)',
        nameEs: 'Vara del Rey Mono',
        cost: 4975,
        tacticalWhy: 'Otorga 80% de Golpe Certero (True Strike), impidiendo que sus evasiones de Blur esquiven tus ataques.',
      },
      {
        itemKey: 'blade_mail',
        nameEn: 'Blade Mail',
        nameEs: 'Cota de Cuchillas',
        cost: 2100,
        tacticalWhy: 'Devuelve el 85% de su daño crítico. La obliga a retroceder o morir con su propio daño reflejado.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Aplica desarme de 3 segundos que no puede purgar con BKB si se lanza antes de que la active.',
      },
      {
        itemKey: 'ghost',
        nameEn: 'Ghost Scepter',
        nameEs: 'Cetro Fantasmal',
        cost: 1500,
        tacticalWhy: 'Te vuelve 100% inmune a ataques físicos durante 4 segundos; salva la vida de los supports.',
      },
    ],
    synergies: [
      {
        partnerKey: 'magnataur',
        partnerNameEn: 'Magnus',
        partnerNameEs: 'Magnus',
        comboName: 'La Picadora Polar',
        howToExecute: 'Magnus junta al equipo rival con Reverse Polarity y le otorga Empower a PA; PA entra y limpia a todos con daño cleave.',
      },
      {
        partnerKey: 'slardar',
        partnerNameEn: 'Slardar',
        partnerNameEs: 'Slardar',
        comboName: 'Armadura Cero',
        howToExecute: 'Slardar aplica Corrosive Haze (-16 de armadura); PA lanza Stifling Dagger con crítico que borra barras de vida de un golpe.',
      },
      {
        partnerKey: 'omniknight',
        partnerNameEn: 'Omniknight',
        partnerNameEs: 'Caballero Omnisciente',
        comboName: 'Ángel Guardián',
        howToExecute: 'Guardian Angel le brinda inmunidad física absoluta y Heavenly Grace le da fuerza y resistencia para atacar sin miedo.',
      },
    ],
  },

  antimage: {
    nameEs: 'Anti-Mago',
    dangerSummary: 'Quema maná rápidamente, cuenta con Blink cada 4s y extermina con Mana Void en proporción al maná faltante.',
    threatType: 'slippery',
    counters: [
      {
        heroKey: 'legion_commander',
        nameEn: 'Legion Commander',
        nameEs: 'Comandante de la Legión',
        whyCounter: 'El Duelo (Duel) con Blade Mail lo encadena sin permitirle usar Blink ni activar Counterspell; muere en el duelo.',
      },
      {
        heroKey: 'slardar',
        nameEn: 'Slardar',
        nameEs: 'Slardar',
        whyCounter: 'Corrosive Haze revela su posición si intenta escapar en la niebla y sus golpes continuos lo aturden en cadena con Bash.',
      },
      {
        heroKey: 'meepo',
        nameEn: 'Meepo',
        nameEs: 'Meepo',
        whyCounter: 'Múltiples redes (Earthbind) le impiden usar Blink y el daño físico masivo de los clones lo destruye en segundos.',
      },
      {
        heroKey: 'bloodseeker',
        nameEn: 'Bloodseeker',
        nameEs: 'Buscasangre',
        whyCounter: 'Rupture castiga su habilidad de Blink: si se teletransporta bajo Rupture, la distancia lo mata al instante.',
      },
    ],
    antiItems: [
      {
        itemKey: 'orchid',
        nameEn: 'Orchid Malevolence',
        nameEs: 'Orquídea de la Malevolencia',
        cost: 3475,
        tacticalWhy: 'Lo silencia durante 5 segundos impidiendo que use Blink para escapar; fuerza una muerte temprana.',
      },
      {
        itemKey: 'abyssal_blade',
        nameEn: 'Abyssal Blade',
        nameEs: 'Hoja Abisal',
        cost: 6250,
        tacticalWhy: 'Aturdimiento cuerpo a cuerpo instantáneo de 2 segundos que atraviesa inmunidad a efectos mágicos.',
      },
      {
        itemKey: 'scythe_of_vyse',
        nameEn: 'Scythe of Vyse (Hex)',
        nameEs: 'Guadaña de Vyse',
        cost: 5675,
        tacticalWhy: 'Lo convierte en cerdo de inmediato sin tiempo de reacción para que no pueda usar Counterspell.',
      },
    ],
    synergies: [
      {
        partnerKey: 'grimstroke',
        partnerNameEn: 'Grimstroke',
        partnerNameEs: 'Pincel Sombrío',
        comboName: 'Doble Vacío de Maná',
        howToExecute: 'Soulbind encadena a dos héroes enemigos; cuando Anti-Mage lanza Mana Void, ¡el ultimate se duplica en ambos provocando daño nuclear!',
      },
      {
        partnerKey: 'disruptor',
        partnerNameEn: 'Disruptor',
        partnerNameEs: 'Disruptor',
        comboName: 'Jaula Eléctrica',
        howToExecute: 'Kinetic Field + Static Storm silencian y encierran a los enemigos mientras Anti-Mage les drena todo el maná con tranquilidad.',
      },
      {
        partnerKey: 'lion',
        partnerNameEn: 'Lion',
        partnerNameEs: 'León',
        comboName: 'Agotamiento Extremo',
        howToExecute: 'Mana Drain de Lion deja al midlaner enemigo sin maná; Anti-Mage lo remata con un Mana Void devastador.',
      },
    ],
  },

  skeleton_king: {
    nameEs: 'Rey Fantasma (Wraith King)',
    dangerSummary: 'Revive con Reincarnation, regenera vida con Vampiric Spirit y genera críticos devastadores con esqueletos.',
    threatType: 'mana_reliant',
    counters: [
      {
        heroKey: 'antimage',
        nameEn: 'Anti-Mage',
        nameEs: 'Anti-Mago',
        whyCounter: 'Mana Break le drena todo el maná en 3 golpes rápidos; sin maná no puede activar Reincarnation y muere definitivamente.',
      },
      {
        heroKey: 'phantom_lancer',
        nameEn: 'Phantom Lancer',
        nameEs: 'Lancero Fantasma',
        whyCounter: 'Con Diffusal Blade, cientos de ilusiones le vacían la reserva de maná en 1 segundo y WK no tiene daño de área para matarlas.',
      },
      {
        heroKey: 'lion',
        nameEn: 'Lion',
        nameEs: 'León',
        whyCounter: 'Mana Drain a distancia drena su maná por completo mientras lo aturde en cadena para impedir su escape.',
      },
      {
        heroKey: 'necrolyte',
        nameEn: 'Necrophos',
        nameEs: 'Necrófago',
        whyCounter: "Reaper's Scythe inflige daño en base a la vida faltante, forzando la primera muerte de WK muy rápido.",
      },
    ],
    antiItems: [
      {
        itemKey: 'diffusal_blade',
        nameEn: 'Diffusal Blade',
        nameEs: 'Hoja Difusora',
        cost: 2500,
        tacticalWhy: 'Quema 40 de maná por golpe. Fundamental para evitar que WK tenga maná suficiente para revivir con Reincarnation.',
      },
      {
        itemKey: 'spirit_vessel',
        nameEn: 'Spirit Vessel',
        nameEs: 'Receptáculo Espiritual',
        cost: 2780,
        tacticalWhy: 'Reduce la regeneración de vida y el robo de vida de WK en un 45%, frenando su sustain en peleas largas.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Lo desarma impidiéndole generar golpes críticos y lifesteal para mantenerse con vida.',
      },
    ],
    synergies: [
      {
        partnerKey: 'crystal_maiden',
        partnerNameEn: 'Crystal Maiden',
        partnerNameEs: 'Doncella de Cristal',
        comboName: 'Hielo y Huesos',
        howToExecute: 'El aura de CM le proporciona el maná constante que WK necesita; combinan Frostbite con Wraithfire Blast para un stun ineludible.',
      },
      {
        partnerKey: 'snapfire',
        partnerNameEn: 'Snapfire',
        partnerNameEs: 'Snapfire',
        comboName: 'Bombardeo Funerario',
        howToExecute: 'WK inicia con Stun; Snapfire descarga Mortimer Kisses sobre el objetivo aturdido mientras los esqueletos de WK devoran al rival.',
      },
      {
        partnerKey: 'witch_doctor',
        partnerNameEn: 'Witch Doctor',
        partnerNameEs: 'Médico Brujo',
        comboName: 'Maldición Resucitada',
        howToExecute: 'Paralyzing Cask + Maledict mientras WK golpea con crítico; si matan a WK, revive mientras Maledict remata a los enemigos.',
      },
    ],
  },

  axe: {
    nameEs: 'Axe / Hacha',
    dangerSummary: 'Provoca a los enemigos con Berserker\'s Call (atraviesa BKB), gira con Counter Helix y ejecuta con Culling Blade.',
    threatType: 'fast_physical',
    counters: [
      {
        heroKey: 'viper',
        nameEn: 'Viper',
        nameEs: 'Víbora',
        whyCounter: 'Ataques venenosos a distancia que desgastan a Axe; Nethertoxin apaga su pasiva Counter Helix dejándolo inofensivo.',
      },
      {
        heroKey: 'ursa',
        nameEn: 'Ursa',
        nameEs: 'Ursa',
        whyCounter: 'Fury Swipes acumula daño exponencial; cuando Axe lo provoca, Ursa le asesta 6 zarpazos y lo derrite a él primero.',
      },
      {
        heroKey: 'venomancer',
        nameEn: 'Venomancer',
        nameEs: 'Venomancer',
        whyCounter: 'Sus plagas y venenos constantes le cancelan la Blink Dagger a Axe de forma permanente, impidiéndole iniciar.',
      },
      {
        heroKey: 'necrolyte',
        nameEn: 'Necrophos',
        nameEs: 'Necrófago',
        whyCounter: 'Heartstopper Aura le drena un porcentaje de su enorme vida máxima y Ghost Shroud anula sus ataques provocados.',
      },
    ],
    antiItems: [
      {
        itemKey: 'euls_scepter',
        nameEn: "Eul's Scepter of Divinity",
        nameEs: 'Cetro de Eul',
        cost: 2625,
        tacticalWhy: 'En cuanto Axe salte y active Blade Mail, levántalo en el aire 2.5s para arruinar su tiempo de provocación.',
      },
      {
        itemKey: 'urn_of_shadows',
        nameEn: 'Urn of Shadows / Spirit Vessel',
        nameEs: 'Urna de las Sombras',
        cost: 880,
        tacticalWhy: 'Aplica daño continuo a distancia para mantener su Blink Dagger en enfriamiento e impedirle iniciar.',
      },
      {
        itemKey: 'silver_edge',
        nameEn: 'Silver Edge',
        nameEs: 'Filo Plateado',
        cost: 5450,
        tacticalWhy: 'Aplica Ruptura (Break) e inhabilita Counter Helix; sin sus giros, la provocación de Axe apenas inflige daño.',
      },
    ],
    synergies: [
      {
        partnerKey: 'invoker',
        partnerNameEn: 'Invoker',
        partnerNameEs: 'Invocador',
        comboName: 'Cataclismo Berserker',
        howToExecute: 'Axe atrapa a 3 enemigos con Berserker\'s Call; Invoker lanza Cataclysm y Chaos Meteor instantáneamente sobre ellos.',
      },
      {
        partnerKey: 'dazzle',
        partnerNameEn: 'Dazzle',
        partnerNameEs: 'Dazzle',
        comboName: 'Giro Inmortal',
        howToExecute: 'Shallow Grave mantiene a Axe con 1 HP mientras gira incansablemente entre 5 enemigos sin poder morir.',
      },
      {
        partnerKey: 'skywrath_mage',
        partnerNameEn: 'Skywrath Mage',
        partnerNameEs: 'Mago Sempiterno',
        comboName: 'Llovizna Mística',
        howToExecute: 'Axe fija a un carry con Call; Skywrath arroja Mystic Flare completo (1600+ de daño) sobre el objetivo inmóvil.',
      },
    ],
  },

  medusa: {
    nameEs: 'Medusa',
    dangerSummary: 'Mana Shield absorbe el 98% del daño entrante con maná, Stone Gaze petrifica y Split Shot golpea a todo el equipo.',
    threatType: 'mana_reliant',
    counters: [
      {
        heroKey: 'antimage',
        nameEn: 'Anti-Mage',
        nameEs: 'Anti-Mago',
        whyCounter: 'Mana Break le arrebata la reserva de maná que constituye su escudo; sin maná, Medusa tiene menos de 1,000 de vida y muere en 3 golpes.',
      },
      {
        heroKey: 'nyx_assassin',
        nameEn: 'Nyx Assassin',
        nameEs: 'Asesino Nyx',
        whyCounter: 'Mind Flare inflige daño masivo proporcional a la inteligencia de Medusa y quema su maná velozmente.',
      },
      {
        heroKey: 'invoker',
        nameEn: 'Invoker',
        nameEs: 'Invocador',
        whyCounter: 'EMP en área le drena hasta 650 de maná de golpe a Medusa y a su equipo, rompiendo su Mana Shield de inmediato.',
      },
    ],
    antiItems: [
      {
        itemKey: 'diffusal_blade',
        nameEn: 'Diffusal Blade',
        nameEs: 'Hoja Difusora',
        cost: 2500,
        tacticalWhy: 'Quema 40 de maná por golpe. Cada punto de maná quemado a Medusa equivale a quitarle más de 2.5 puntos de vida efectiva.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Desarma sus ataques múltiples de Split Shot durante 5 segundos completos por ser héroe a distancia.',
      },
    ],
    synergies: [
      {
        partnerKey: 'enigma',
        partnerNameEn: 'Enigma',
        partnerNameEs: 'Enigma',
        comboName: 'La Mirada del Agujero Negro',
        howToExecute: 'Enigma usa Black Hole; Medusa activa Stone Gaze sobre los enemigos atrapados, petrificándolos para recibir 50% de daño físico extra.',
      },
      {
        partnerKey: 'treant_protector',
        partnerNameEn: 'Treant Protector',
        partnerNameEs: 'Protector Arbóreo',
        comboName: 'Enraizamiento y Petrificación',
        howToExecute: 'Overgrowth inmoviliza a los enemigos forzándolos a mirar de frente a Medusa mientras Stone Gaze los convierte en piedra.',
      },
    ],
  },

  sniper: {
    nameEs: 'Francotirador (Sniper)',
    dangerSummary: 'Ataca desde una distancia descomunal con Take Aim y Headshot; destruye torres y enemigos desde la niebla.',
    threatType: 'slippery',
    counters: [
      {
        heroKey: 'spectre',
        nameEn: 'Spectre',
        nameEs: 'Espectro',
        whyCounter: 'Haunt se teletransporta directamente a la espalda de Sniper sin importar la distancia, y Desolate lo destruye sin defensas.',
      },
      {
        heroKey: 'spirit_breaker',
        nameEn: 'Spirit Breaker',
        nameEs: 'Espíritu Rompedor',
        whyCounter: 'Charge of Darkness cruza todo el mapa directamente hacia Sniper y lo aturde de forma continua.',
      },
      {
        heroKey: 'storm_spirit',
        nameEn: 'Storm Spirit',
        nameEs: 'Espíritu de la Tormenta',
        whyCounter: 'Ball Lightning cruza pantallas enteras invulnerable, aterriza encima de Sniper y lo encadena con Vortex.',
      },
    ],
    antiItems: [
      {
        itemKey: 'blink',
        nameEn: 'Blink Dagger',
        nameEs: 'Daga de Traslación',
        cost: 2250,
        tacticalWhy: 'La regla número 1 contra Sniper: cerrar la brecha de distancia. Salta directo a su espalda donde no tiene cómo defenderse.',
      },
      {
        itemKey: 'blade_mail',
        nameEn: 'Blade Mail',
        nameEs: 'Cota de Cuchillas',
        cost: 2100,
        tacticalWhy: 'Actívalo mientras te acercas a él; su cadencia y daño harán que él mismo se suicide con sus disparos reflejados.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Desarma a Sniper durante 5 segundos enteros (por ser a distancia); queda completamente anulado en la pelea.',
      },
    ],
    synergies: [
      {
        partnerKey: 'treant_protector',
        partnerNameEn: 'Treant Protector',
        partnerNameEs: 'Protector Arbóreo',
        comboName: 'Nido de Francotirador',
        howToExecute: 'Overgrowth enraíza a todos los enemigos en el suelo; Sniper se coloca a salvo y los fusila uno a uno con Headshot.',
      },
      {
        partnerKey: 'ogre_magi',
        partnerNameEn: 'Ogre Magi',
        partnerNameEs: 'Ogro Mago',
        comboName: 'Sangre Caliente',
        howToExecute: 'Bloodlust incrementa su velocidad de movimiento y le otorga +60 de velocidad de ataque permanente.',
      },
    ],
  },

  bristleback: {
    nameEs: 'Espaldaespinada (Bristleback)',
    dangerSummary: 'Recibe hasta 40% menos de daño por la espalda y suelta espinas automáticas con Quill Spray y Warpath.',
    threatType: 'passive_tank',
    counters: [
      {
        heroKey: 'viper',
        nameEn: 'Viper',
        nameEs: 'Víbora',
        whyCounter: 'Nethertoxin aplica Ruptura (Break), apagando completamente su pasiva de reducción de daño por la espalda.',
      },
      {
        heroKey: 'legion_commander',
        nameEn: 'Legion Commander',
        nameEs: 'Comandante de la Legión',
        whyCounter: 'El Duelo (Duel) obliga a Bristleback a girar y dar la cara, impidiéndole usar su espalda para mitigar daño.',
      },
      {
        heroKey: 'slark',
        nameEn: 'Slark',
        nameEs: 'Slark',
        whyCounter: 'Essence Shift le roba Agilidad permanentemente en peleas largas; cuanto más dura el combate, más débil queda Bristleback.',
      },
    ],
    antiItems: [
      {
        itemKey: 'silver_edge',
        nameEn: 'Silver Edge',
        nameEs: 'Filo Plateado',
        cost: 5450,
        tacticalWhy: 'Aplica Ruptura (Break) durante 5 segundos al salir de la invisibilidad. Obligatorio para anular su espalda.',
      },
      {
        itemKey: 'spirit_vessel',
        nameEn: 'Spirit Vessel',
        nameEs: 'Receptáculo Espiritual',
        cost: 2780,
        tacticalWhy: 'Reduce en un 45% la curación masiva de su Bloodstone / Lifesteal y le inflige daño porcentual continuo.',
      },
      {
        itemKey: 'magic_stick',
        nameEn: 'Magic Wand',
        nameEs: 'Varita Mágica',
        cost: 450,
        tacticalWhy: 'Bristleback lanza Quill Spray cada 3 segundos, lo que te carga la varita a 20 acumulaciones en menos de 1 minuto.',
      },
    ],
    synergies: [
      {
        partnerKey: 'io',
        partnerNameEn: 'Io (Wisp)',
        partnerNameEs: 'Io',
        comboName: 'Batería Inmortal',
        howToExecute: 'Io enlaza (Tether) a Bristleback con Overcharge; cura toda su vida y maná haciendo que nunca tenga que retroceder.',
      },
      {
        partnerKey: 'dazzle',
        partnerNameEn: 'Dazzle',
        partnerNameEs: 'Dazzle',
        comboName: 'Armadura Negativa',
        howToExecute: 'Shadow Wave cura a Bristleback entre las tropas enemigas mientras reduce la armadura de todos los enemigos a su alrededor.',
      },
    ],
  },
};

// ─── TACTICAL MATCHUP ENGINE (FOR ANY HERO VIA OPENDOTA API + HEURISTICS) ────
function getDynamicTacticalProfile(
  heroId: number,
  heroName: string,
  heroKey: string,
  attr: string,
  roles: string[],
  apiMatchups: { hero_id: number; games_played: number; wins: number }[],
  allHeroes: Record<number, any>
): HeroTacticalProfile {
  // Check if we have exact curated data
  const curated = HERO_MECHANICS_DATA[heroKey];

  // Calculate Real Statistical Counters from OpenDota Matchups API
  let realStatCounters: HeroCounterDetail[] = [];
  if (apiMatchups && apiMatchups.length > 0) {
    const qualified = apiMatchups
      .filter((m) => m.games_played >= 10 && m.hero_id !== heroId)
      .map((m) => {
        const wr = (m.wins / m.games_played) * 100;
        const enemyConstant = allHeroes[m.hero_id];
        const enemyName = enemyConstant?.localized_name || enemyConstant?.name || `Hero ${m.hero_id}`;
        const enemyKey = (enemyConstant?.name || '').replace('npc_dota_hero_', '');
        return {
          heroId: m.hero_id,
          heroKey: enemyKey,
          nameEn: enemyName,
          nameEs: enemyName,
          winrateVs: `${wr.toFixed(1)}%`,
          games: m.games_played,
          rawWr: wr,
        };
      })
      .sort((a, b) => a.rawWr - b.rawWr) // lowest winrate first = strongest counters!
      .slice(0, 4);

    realStatCounters = qualified.map((c) => {
      // Reason based on why this enemy counters
      let tacticalReason = `Tasa de victoria de solo ${c.winrateVs} en ${c.games} partidas analizadas por OpenDota. `;
      const enemyHero = allHeroes[c.heroId];
      if (enemyHero?.roles?.includes('Disabler')) {
        tacticalReason += 'Su control de masas e incapacitaciones le impiden ejecutar su rotación de habilidades.';
      } else if (enemyHero?.roles?.includes('Initiator')) {
        tacticalReason += 'Inicia primero a distancia con saltos o agarres impidiéndole posicionarse.';
      } else if (enemyHero?.primary_attr === 'str') {
        tacticalReason += 'Su alta reserva de vida y auras mitigan el impacto de sus habilidades.';
      } else {
        tacticalReason += 'Explota directamente sus tiempos de enfriamiento y debilidades de movilidad.';
      }

      return {
        heroId: c.heroId,
        heroKey: c.heroKey,
        nameEn: c.nameEn,
        nameEs: c.nameEs,
        winrateVs: c.winrateVs,
        whyCounter: tacticalReason,
        isRealData: true,
      };
    });
  }

  // If curated data exists, merge with real stats
  if (curated) {
    return {
      heroId,
      key: heroKey,
      nameEn: heroName,
      nameEs: curated.nameEs,
      attr: (attr as any) || 'str',
      primaryRole: roles.slice(0, 2).join(' / ') || 'Héroe',
      dangerSummary: curated.dangerSummary,
      counters: realStatCounters.length > 0 ? realStatCounters : curated.counters,
      antiItems: curated.antiItems,
      synergies: curated.synergies,
    };
  }

  // Heuristic generation based on specific Dota 2 roles & attributes
  const isMelee = roles.includes('Carry') && (attr === 'str' || attr === 'agi');
  const isCaster = attr === 'int' || roles.includes('Nuker');
  const isTank = attr === 'str' || roles.includes('Durable');
  const isSupport = roles.includes('Support');

  // Dynamic Anti-Items strictly tailored to this hero
  const dynamicItems: AntiItemDetail[] = [];
  if (isCaster) {
    dynamicItems.push({
      itemKey: 'black_king_bar',
      nameEn: 'Black King Bar (BKB)',
      nameEs: 'Barra del Rey Negro',
      cost: 4050,
      tacticalWhy: `Otorga inmunidad mágica completa ante el burst de hechizos de ${heroName}.`,
    });
    dynamicItems.push({
      itemKey: 'orchid',
      nameEn: 'Orchid Malevolence',
      nameEs: 'Orquídea de la Malevolencia',
      cost: 3475,
      tacticalWhy: `Silencia a ${heroName} durante 5s impidiéndole lanzar su repertorio de hechizos.`,
    });
    dynamicItems.push({
      itemKey: 'pipe',
      nameEn: 'Pipe of Insight',
      nameEs: 'Pipa de la Perspicacia',
      cost: 3375,
      tacticalWhy: 'Escudo de 450 de daño mágico en área para proteger a todo tu equipo.',
    });
  } else if (isMelee) {
    dynamicItems.push({
      itemKey: 'heavens_halberd',
      nameEn: "Heaven's Halberd",
      nameEs: 'Alabarda del Cielo',
      cost: 3550,
      tacticalWhy: `Desarma a ${heroName} durante 3 segundos impidiéndole asestar golpes físicos.`,
    });
    dynamicItems.push({
      itemKey: 'ghost',
      nameEn: 'Ghost Scepter',
      nameEs: 'Cetro Fantasmal',
      cost: 1500,
      tacticalWhy: `Vuelve a los supports invulnerables a los ataques físicos de ${heroName}.`,
    });
    dynamicItems.push({
      itemKey: 'blade_mail',
      nameEn: 'Blade Mail',
      nameEs: 'Cota de Cuchillas',
      cost: 2100,
      tacticalWhy: `Le devuelve el 85% de su propio daño físico obligándolo a detener sus ataques.`,
    });
  } else if (isTank) {
    dynamicItems.push({
      itemKey: 'spirit_vessel',
      nameEn: 'Spirit Vessel',
      nameEs: 'Receptáculo Espiritual',
      cost: 2780,
      tacticalWhy: `Reduce en 45% su regeneración de vida e inflige daño porcentual continuo a su alta salud.`,
    });
    dynamicItems.push({
      itemKey: 'silver_edge',
      nameEn: 'Silver Edge',
      nameEs: 'Filo Plateado',
      cost: 5450,
      tacticalWhy: `Aplica Ruptura (Break) e inhabilita sus habilidades pasivas de supervivencia.`,
    });
    dynamicItems.push({
      itemKey: 'shivas_guard',
      nameEn: "Shiva's Guard",
      nameEs: 'Guardia de Shiva',
      cost: 5175,
      tacticalWhy: `Reduce su velocidad de ataque en área y amplifica el daño mágico recibido.`,
    });
  } else {
    dynamicItems.push({
      itemKey: 'scythe_of_vyse',
      nameEn: 'Scythe of Vyse (Hex)',
      nameEs: 'Guadaña de Vyse',
      cost: 5675,
      tacticalWhy: `Lo inhabilita durante 3.5 segundos para eliminarlo antes de que active habilidades defensivas.`,
    });
    dynamicItems.push({
      itemKey: 'glimmer_cape',
      nameEn: 'Glimmer Cape',
      nameEs: 'Capa Fulgurante',
      cost: 2150,
      tacticalWhy: `Invisibilidad y resistencia mágica para reposicionarte a salvo de sus emboscadas.`,
    });
  }

  // Dynamic Synergies
  const dynamicSynergies: TeamSynergyDetail[] = [
    {
      partnerKey: isSupport ? 'juggernaut' : 'crystal_maiden',
      partnerNameEn: isSupport ? 'Juggernaut' : 'Crystal Maiden',
      partnerNameEs: isSupport ? 'Juggernaut' : 'Doncella de Cristal',
      comboName: isSupport ? 'Giro de Asesinato' : 'Aura y Control Helado',
      howToExecute: isSupport
        ? `Lanza tu aturdimiento sobre el objetivo; Juggernaut activa Blade Fury y gira encima eliminándolo en línea.`
        : `El aura de Crystal Maiden le proporciona maná inagotable a ${heroName} para presionar sin pausa con sus poderes.`,
    },
    {
      partnerKey: 'axe',
      partnerNameEn: 'Axe',
      partnerNameEs: 'Axe / Hacha',
      comboName: 'Provocación Agrupada',
      howToExecute: `Axe salta con Berserker's Call agrupando a los rivales; ${heroName} descarga su daño máximo en área.`,
    },
    {
      partnerKey: 'witch_doctor',
      partnerNameEn: 'Witch Doctor',
      partnerNameEs: 'Médico Brujo',
      comboName: 'Maldición de Sangre',
      howToExecute: `Witch Doctor aplica Maledict y Paralyzing Cask; ${heroName} remata con burst para que la maldición detone al objetivo.`,
    },
  ];

  return {
    heroId,
    key: heroKey,
    nameEn: heroName,
    nameEs: heroName,
    attr: (attr as any) || 'str',
    primaryRole: roles.slice(0, 2).join(' / ') || 'Héroe Versátil',
    dangerSummary: `${heroName} es un héroe de rol ${roles.join(', ')}. Depende fuertemente de su posicionamiento en peleas y de sus tiempos de enfriamiento.`,
    counters: realStatCounters.length > 0 ? realStatCounters : [
      {
        heroKey: 'viper',
        nameEn: 'Viper',
        nameEs: 'Víbora',
        whyCounter: 'Desgaste continuo a distancia y Ruptura pasiva con Nethertoxin.',
      },
      {
        heroKey: 'lion',
        nameEn: 'Lion',
        nameEs: 'León',
        whyCounter: 'Cadena de incapacitaciones con Stun + Hex que le impiden reaccionar.',
      },
    ],
    antiItems: dynamicItems,
    synergies: dynamicSynergies,
  };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const HeroCountersSection: React.FC = () => {
  const { heroes: heroConstants, loading: constantsLoading } = useConstants();
  const [searchTerm, setSearchTerm] = useState('');
  const [attrFilter, setAttrFilter] = useState<'all' | 'str' | 'agi' | 'int' | 'universal'>('all');
  const [selectedHeroId, setSelectedHeroId] = useState<number>(44); // Phantom Assassin default

  // OpenDota Matchups State
  const [matchupsData, setMatchupsData] = useState<Record<number, any[]>>({});
  const [loadingMatchups, setLoadingMatchups] = useState<boolean>(false);

  // Fetch OpenDota Real Matchups for Selected Hero
  useEffect(() => {
    if (!selectedHeroId) return;

    // Check if already fetched
    if (matchupsData[selectedHeroId]) return;

    let isMounted = true;
    setLoadingMatchups(true);

    fetch(`https://api.opendota.com/api/heroes/${selectedHeroId}/matchups`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setMatchupsData((prev) => ({ ...prev, [selectedHeroId]: data }));
        }
      })
      .catch((err) => {
        console.warn(`[OpenDota] Matchups fetch error for hero ${selectedHeroId}:`, err);
      })
      .finally(() => {
        if (isMounted) setLoadingMatchups(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedHeroId, matchupsData]);

  // Full Hero List sorted alphabetically
  const heroList = useMemo(() => {
    return Object.values(heroConstants)
      .map((h) => ({
        id: h.id,
        name: h.localized_name || h.name || `Hero ${h.id}`,
        key: (h.name || '').replace('npc_dota_hero_', ''),
        attr: (h.primary_attr || 'str') as 'str' | 'agi' | 'int' | 'all',
        roles: h.roles || [],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [heroConstants]);

  // Filtered Hero Grid
  const filteredHeroes = useMemo(() => {
    return heroList.filter((h) => {
      if (attrFilter !== 'all') {
        const matchesAttr =
          attrFilter === 'universal' ? h.attr === 'all' : h.attr === attrFilter;
        if (!matchesAttr) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!h.name.toLowerCase().includes(term) && !h.key.toLowerCase().includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [heroList, attrFilter, searchTerm]);

  // Selected hero tactical profile
  const selectedProfile: HeroTacticalProfile = useMemo(() => {
    const hero = heroList.find((h) => h.id === selectedHeroId) || heroList[0];
    if (!hero) {
      return getDynamicTacticalProfile(
        44,
        'Phantom Assassin',
        'phantom_assassin',
        'agi',
        ['Carry', 'Escape'],
        [],
        heroConstants
      );
    }

    const apiMatchups = matchupsData[hero.id] || [];
    return getDynamicTacticalProfile(
      hero.id,
      hero.name,
      hero.key,
      hero.attr,
      hero.roles,
      apiMatchups,
      heroConstants
    );
  }, [selectedHeroId, heroList, matchupsData, heroConstants]);

  const attrPills = [
    { id: 'all', label: 'Todos' },
    { id: 'str', label: 'Fuerza (STR)' },
    { id: 'agi', label: 'Agilidad (AGI)' },
    { id: 'int', label: 'Inteligencia (INT)' },
    { id: 'universal', label: 'Universal' },
  ];

  return (
    <div className="space-y-5">
      {/* Introduction Card */}
      <div className="rounded-2xl p-5 border border-slate-800/90 bg-slate-900/80 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Análisis Táctico de Héroes: Counters Reales, Objetos y Sinergias
            </h2>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Datos Oficiales OpenDota API
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Toca cualquier héroe para calcular sus <strong className="text-rose-400">peores matchups estadísticos reales</strong> basados en miles de partidas de Valve, los <strong className="text-amber-400">objetos específicos para anularlo</strong>, y sus <strong className="text-emerald-400">mejores combos en equipo</strong>.
        </p>

        {/* Search & Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre (ej. Axe, Phantom Assassin, Pudge, Invoker...)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {attrPills.map((pill) => (
              <button
                key={pill.id}
                onClick={() => setAttrFilter(pill.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  attrFilter === pill.id
                    ? 'bg-red-600/20 text-red-400 border border-red-500/50'
                    : 'bg-slate-950 text-gray-400 hover:text-white border border-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of All Heroes */}
      <div className="rounded-2xl p-4 border border-slate-800 bg-slate-950/70 shadow-inner">
        <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
          <span>Selecciona un héroe ({filteredHeroes.length} disponibles):</span>
          {constantsLoading && <span className="text-red-400 animate-pulse">Cargando catálogo...</span>}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-56 overflow-y-auto pr-1">
          {filteredHeroes.map((h) => {
            const isSelected = selectedHeroId === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHeroId(h.id)}
                className={`flex flex-col items-center p-1.5 rounded-xl border transition-all text-center group ${
                  isSelected
                    ? 'bg-red-600/20 border-red-500 shadow-md shadow-red-950 scale-105'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
                title={h.name}
              >
                <HeroThumb heroKey={h.key} name={h.name} className="w-10 h-10 rounded-lg mb-1" />
                <span
                  className={`text-[10px] font-medium truncate w-full leading-tight ${
                    isSelected ? 'text-red-300 font-bold' : 'text-gray-300 group-hover:text-white'
                  }`}
                >
                  {h.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hero Tactical Dossier */}
      <div className="space-y-4">
        {/* Hero Header Dossier */}
        <div className="rounded-2xl p-5 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 shadow-xl">
          <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            <HeroThumb
              heroKey={selectedProfile.key}
              name={selectedProfile.nameEn}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-red-500/40 shadow-xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{selectedProfile.nameEn}</span>
                    <span className="text-xs text-gray-400 font-normal">/ {selectedProfile.nameEs}</span>
                  </h3>
                  <div className="text-xs text-amber-400 font-medium">{selectedProfile.primaryRole}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-slate-800 text-gray-300 border border-slate-700">
                    {selectedProfile.attr === 'str'
                      ? 'Fuerza (STR)'
                      : selectedProfile.attr === 'agi'
                      ? 'Agilidad (AGI)'
                      : selectedProfile.attr === 'int'
                      ? 'Inteligencia (INT)'
                      : 'Universal'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mt-2">{selectedProfile.dangerSummary}</p>
            </div>
          </div>
        </div>

        {/* 1. Counters Conocidos & Estadísticas Reales */}
        <div className="rounded-2xl p-5 border border-rose-500/30 bg-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-white">
                Counters Conocidos <span className="text-xs text-rose-400 font-normal">(Quién le gana y estadísticas)</span>
              </h3>
            </div>
            {loadingMatchups && (
              <span className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin" /> Consultando OpenDota API...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedProfile.counters.map((c, idx) => (
              <div
                key={c.heroKey + idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 hover:border-rose-500/30 transition-colors"
              >
                <HeroThumb heroKey={c.heroKey} name={c.nameEn} className="w-12 h-12 rounded-xl border border-rose-500/40" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{c.nameEn}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({c.nameEs})</span>
                    </div>
                    {c.winrateVs && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/50">
                        <TrendingDown className="w-3 h-3" /> {c.winrateVs} Winrate
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mt-1">{c.whyCounter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Qué Objetos Comprar Contra Él (Anti-Builds Específicos) */}
        <div className="rounded-2xl p-5 border border-amber-500/30 bg-slate-900/80 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Objetos Específicos Contra {selectedProfile.nameEn} <span className="text-xs text-amber-400 font-normal">(Anti-Builds)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedProfile.antiItems.map((it, idx) => (
              <div
                key={it.itemKey + idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 hover:border-amber-500/30 transition-colors"
              >
                <ItemThumb itemKey={it.itemKey} name={it.nameEn} className="w-11 h-11 rounded-lg border border-amber-500/40" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="text-xs font-bold text-white">
                      {it.nameEn} <span className="text-[10px] text-gray-400 font-normal">({it.nameEs})</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono font-semibold">🪙 {it.cost}g</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mt-1">{it.tacticalWhy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Combinaciones para Jugar en Equipo (Sinergias & Combos) */}
        <div className="rounded-2xl p-5 border border-emerald-500/30 bg-slate-900/80 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Sinergias y Combos de Equipo con {selectedProfile.nameEn} <span className="text-xs text-emerald-400 font-normal">(3 a 5 Combinaciones)</span>
            </h3>
          </div>

          <div className="space-y-3">
            {selectedProfile.synergies.map((syn, idx) => (
              <div
                key={syn.partnerKey + idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center -space-x-2">
                      <HeroThumb
                        heroKey={selectedProfile.key}
                        name={selectedProfile.nameEn}
                        className="w-9 h-9 rounded-lg border border-slate-700"
                      />
                      <HeroThumb
                        heroKey={syn.partnerKey}
                        name={syn.partnerNameEn}
                        className="w-9 h-9 rounded-lg border-2 border-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">
                        {selectedProfile.nameEn} + {syn.partnerNameEn}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1.5">({syn.partnerNameEs})</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    Combo: {syn.comboName}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-gray-300 leading-relaxed">
                  <strong className="text-emerald-400">Cómo ejecutarlo: </strong>
                  {syn.howToExecute}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCountersSection;
