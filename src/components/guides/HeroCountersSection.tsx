import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Target,
  Shield,
  Swords,
  Users,
  Zap,
  Sparkles,
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

// ─── SPECIFIC ANTI-BUILD DATABASE PER INDIVIDUAL HERO ─────────────────────────
const HERO_SPECIFIC_ANTIBUILDS: Record<string, {
  nameEs: string;
  dangerSummary: string;
  items: AntiItemDetail[];
  synergies: TeamSynergyDetail[];
}> = {
  phantom_assassin: {
    nameEs: 'Asesina Fantasma (PA)',
    dangerSummary: 'Críticos letales con Coup de Grâce y 50% de evasión física pasiva con Blur.',
    items: [
      {
        itemKey: 'monkey_king_bar',
        nameEn: 'Monkey King Bar (MKB)',
        nameEs: 'Vara del Rey Mono',
        cost: 4975,
        tacticalWhy: 'Otorga 80% de Golpe Certero (True Strike). Tus ataques nunca fallarán contra su 50% de evasión de Blur.',
      },
      {
        itemKey: 'blade_mail',
        nameEn: 'Blade Mail',
        nameEs: 'Cota de Cuchillas',
        cost: 2100,
        tacticalWhy: 'Devuelve el 85% de su daño crítico instantáneamente; PA se autoelimina si intenta asestar golpes fuertes.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Aplica Desarme de 3 segundos que no puede purgar con BKB si se lanza antes de que la active.',
      },
      {
        itemKey: 'ghost',
        nameEn: 'Ghost Scepter',
        nameEs: 'Cetro Fantasmal',
        cost: 1500,
        tacticalWhy: 'Te vuelve 100% inmune a ataques físicos durante 4 segundos; imprescindible para cualquier support.',
      },
    ],
    synergies: [
      {
        partnerKey: 'magnataur',
        partnerNameEn: 'Magnus',
        partnerNameEs: 'Magnus',
        comboName: 'La Picadora Polar',
        howToExecute: 'Magnus junta a los 5 rivales con Reverse Polarity y le otorga Empower a PA; PA entra y limpia a todos con cleave.',
      },
      {
        partnerKey: 'slardar',
        partnerNameEn: 'Slardar',
        partnerNameEs: 'Slardar',
        comboName: 'Armadura Cero',
        howToExecute: 'Slardar aplica Corrosive Haze (-16 armadura); PA lanza Stifling Dagger con crítico que borra barras de vida de un golpe.',
      },
    ],
  },

  pudge: {
    nameEs: 'Pudge (El Carnicero)',
    dangerSummary: 'Engancha desde la niebla con Meat Hook, desintegra con Rot y muerde a través de BKB con Dismember.',
    items: [
      {
        itemKey: 'force_staff',
        nameEn: 'Force Staff',
        nameEs: 'Bastón de Fuerza',
        cost: 2200,
        tacticalWhy: 'Empuja a tu aliado en el instante en que el gancho impacte para sacarlo de Rot y salvarlo del mordisco.',
      },
      {
        itemKey: 'lotus_orb',
        nameEn: 'Lotus Orb',
        nameEs: 'Orbe de Loto',
        cost: 3850,
        tacticalWhy: 'Si Pudge usa Dismember sobre un objetivo protegido con Lotus, ¡Pudge quedará mordido e inmovilizado a sí mismo!',
      },
      {
        itemKey: 'linkens_sphere',
        nameEn: "Linken's Sphere",
        nameEs: 'Esfera de Linken',
        cost: 4600,
        tacticalWhy: 'Bloquea automáticamente su Dismember o el Meat Hook inicial, arruinando su combo emboscador.',
      },
      {
        itemKey: 'spirit_vessel',
        nameEn: 'Spirit Vessel',
        nameEs: 'Receptáculo Espiritual',
        cost: 2780,
        tacticalWhy: 'Inflige daño basado en el 4% de su vida actual; ideal para quemar sus 4,000+ de salud acumulada de Flesh Heap.',
      },
    ],
    synergies: [
      {
        partnerKey: 'bloodseeker',
        partnerNameEn: 'Bloodseeker',
        partnerNameEs: 'Buscasangre',
        comboName: 'Gancho Desgarrador',
        howToExecute: 'Bloodseeker coloca Rupture; Pudge engancha a la víctima desde 1300 de distancia: ¡muere al instante por la distancia recorrida!',
      },
      {
        partnerKey: 'mirana',
        partnerNameEn: 'Mirana',
        partnerNameEs: 'Mirana',
        comboName: 'Flecha Garantizada',
        howToExecute: 'Durante los 3 segundos de Dismember, Mirana lanza Sacred Arrow a máxima distancia para un stun encadenado de 5 segundos.',
      },
    ],
  },

  axe: {
    nameEs: 'Axe / Hacha',
    dangerSummary: 'Provoca enemigos con Berserker\'s Call (atraviesa BKB), gira con Counter Helix y ejecuta con Culling Blade.',
    items: [
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
      {
        itemKey: 'sange_and_yasha',
        nameEn: 'Sange and Yasha (SnY)',
        nameEs: 'Sange y Yasha',
        cost: 4100,
        tacticalWhy: 'Su resistencia a estados (Status Resistance) reduce drásticamente la duración de su provocación (Call).',
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
    ],
  },

  sniper: {
    nameEs: 'Francotirador (Sniper)',
    dangerSummary: 'Ataca desde una distancia descomunal con Take Aim y Headshot; destruye torres y enemigos desde la niebla.',
    items: [
      {
        itemKey: 'blink',
        nameEn: 'Blink Dagger',
        nameEs: 'Daga de Traslación',
        cost: 2250,
        tacticalWhy: 'Cierra la distancia de golpe. Salta directo a su espalda donde no tiene cómo defenderse cuerpo a cuerpo.',
      },
      {
        itemKey: 'blade_mail',
        nameEn: 'Blade Mail',
        nameEs: 'Cota de Cuchillas',
        cost: 2100,
        tacticalWhy: 'Actívalo mientras corres hacia él; su cadencia y daño harán que él mismo se suicide con sus disparos reflejados.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Desarma a Sniper durante 5 segundos enteros (por ser a distancia); queda completamente anulado en la pelea.',
      },
      {
        itemKey: 'smoke_of_deceit',
        nameEn: 'Smoke of Deceit',
        nameEs: 'Humo del Engaño',
        cost: 50,
        tacticalWhy: 'Permite a tu equipo flanquear su posición detrás de los árboles sin ser detectado por sus wards.',
      },
    ],
    synergies: [
      {
        partnerKey: 'treant_protector',
        partnerNameEn: 'Treant Protector',
        partnerNameEs: 'Protector Arbóreo',
        comboName: 'Nido de Francotirador',
        howToExecute: 'Overgrowth enraíza a los enemigos en el suelo; Sniper se coloca a salvo y los fusila uno a uno con Headshot.',
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
    dangerSummary: 'Mitiga hasta 40% de daño por la espalda y suelta espinas automáticas con Quill Spray y Warpath.',
    items: [
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
        tacticalWhy: 'Bristleback lanza Quill Spray cada 3 segundos, cargando tu varita a 20 acumulaciones en menos de 1 minuto.',
      },
      {
        itemKey: 'shivas_guard',
        nameEn: "Shiva's Guard",
        nameEs: 'Guardia de Shiva',
        cost: 5175,
        tacticalWhy: 'Reduce su velocidad de ataque en área y amplifica el daño mágico recibido.',
      },
    ],
    synergies: [
      {
        partnerKey: 'io',
        partnerNameEn: 'Io (Wisp)',
        partnerNameEs: 'Io',
        comboName: 'Batería Inmortal',
        howToExecute: 'Io enlaza (Tether) a Bristleback con Overcharge; cura toda su vida y maná haciendo que nunca retroceda.',
      },
    ],
  },

  medusa: {
    nameEs: 'Medusa',
    dangerSummary: 'Mana Shield absorbe el 98% del daño entrante con maná, Stone Gaze petrifica y Split Shot golpea a todos.',
    items: [
      {
        itemKey: 'diffusal_blade',
        nameEn: 'Diffusal Blade',
        nameEs: 'Hoja Difusora',
        cost: 2500,
        tacticalWhy: 'Quema 40 de maná por golpe. Cada punto de maná quemado a Medusa equivale a quitarle 2.5 puntos de vida efectiva.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Desarma sus ataques múltiples de Split Shot durante 5 segundos completos por ser héroe a distancia.',
      },
      {
        itemKey: 'blade_mail',
        nameEn: 'Blade Mail',
        nameEs: 'Cota de Cuchillas',
        cost: 2100,
        tacticalWhy: 'Refleja las flechas múltiples de Split Shot haciéndola recibir daño continuo mientras ataca al equipo.',
      },
      {
        itemKey: 'abyssal_blade',
        nameEn: 'Abyssal Blade',
        nameEs: 'Hoja Abisal',
        cost: 6250,
        tacticalWhy: 'Aturdimiento instantáneo que atraviesa su Stone Gaze para bloquearla antes de que dispare.',
      },
    ],
    synergies: [
      {
        partnerKey: 'enigma',
        partnerNameEn: 'Enigma',
        partnerNameEs: 'Enigma',
        comboName: 'Mirada del Agujero Negro',
        howToExecute: 'Enigma usa Black Hole; Medusa activa Stone Gaze sobre los atrapados para petrificarlos con 50% daño físico extra.',
      },
    ],
  },

  skeleton_king: {
    nameEs: 'Rey Fantasma (Wraith King)',
    dangerSummary: 'Revive con Reincarnation, regenera vida con Vampiric Spirit y genera críticos devastadores con esqueletos.',
    items: [
      {
        itemKey: 'diffusal_blade',
        nameEn: 'Diffusal Blade',
        nameEs: 'Hoja Difusora',
        cost: 2500,
        tacticalWhy: 'Quema 40 de maná por golpe. Fundamental para vaciarle el maná y evitar que reviva con Reincarnation.',
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
      {
        itemKey: 'solar_crest',
        nameEn: 'Solar Crest',
        nameEs: 'Blasón Solar',
        cost: 2700,
        tacticalWhy: 'Otorga un escudo enorme y armadura al aliado enfocado por WK, o reduce su velocidad de ataque.',
      },
    ],
    synergies: [
      {
        partnerKey: 'crystal_maiden',
        partnerNameEn: 'Crystal Maiden',
        partnerNameEs: 'Doncella de Cristal',
        comboName: 'Hielo y Huesos',
        howToExecute: 'Aura de CM le da maná constante para stuns infinitos; combinan Frostbite con Wraithfire Blast.',
      },
    ],
  },

  antimage: {
    nameEs: 'Anti-Mago',
    dangerSummary: 'Quema maná rápidamente, cuenta con Blink cada 4s y extermina con Mana Void.',
    items: [
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
      {
        itemKey: 'rod_of_atos',
        nameEn: 'Rod of Atos / Gleipnir',
        nameEs: 'Vara de Atos',
        cost: 2750,
        tacticalWhy: 'Enraíza a distancia impidiendo que use Blink para huir.',
      },
    ],
    synergies: [
      {
        partnerKey: 'grimstroke',
        partnerNameEn: 'Grimstroke',
        partnerNameEs: 'Pincel Sombrío',
        comboName: 'Doble Vacío de Maná',
        howToExecute: 'Soulbind encadena a dos héroes; cuando Anti-Mage lanza Mana Void, ¡se duplica en ambos provocando daño atómico!',
      },
    ],
  },

  faceless_void: {
    nameEs: 'Vacío Sin Rostro (Faceless Void)',
    dangerSummary: 'Encierra a enemigos y aliados en Chronosphere donde solo él se mueve con velocidad extrema.',
    items: [
      {
        itemKey: 'aeon_disk',
        nameEn: 'Aeon Disk',
        nameEs: 'Disco del Eón',
        cost: 3000,
        tacticalWhy: 'Se dispara automáticamente al caer bajo 70% de vida dentro de la Chronosphere, otorgando invulnerabilidad para no morir.',
      },
      {
        itemKey: 'ghost',
        nameEn: 'Ghost Scepter',
        nameEs: 'Cetro Fantasmal',
        cost: 1500,
        tacticalWhy: 'Si lo activas un instante antes de quedar atrapado en la Chrono, serás etéreo e inmune a todos sus golpes físicos.',
      },
      {
        itemKey: 'euls_scepter',
        nameEn: "Eul's Scepter of Divinity",
        nameEs: 'Cetro de Eul',
        cost: 2625,
        tacticalWhy: 'Si te quedas fuera de la Chronosphere, levanta a Faceless Void en el aire 2.5s para arruinar su tiempo de ultimate.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Lánzale desarme desde fuera de la Chrono para que se quede inmóvil sin poder golpear a tus aliados.',
      },
    ],
    synergies: [
      {
        partnerKey: 'witch_doctor',
        partnerNameEn: 'Witch Doctor',
        partnerNameEs: 'Médico Brujo',
        comboName: 'La Danza de la Crono',
        howToExecute: 'Void atrapa a 3 enemigos con Chronosphere; Witch Doctor coloca Death Ward fuera de la cúpula, aniquilando a todos.',
      },
      {
        partnerKey: 'invoker',
        partnerNameEn: 'Invoker',
        partnerNameEs: 'Invocador',
        comboName: 'Cataclismo Temporal',
        howToExecute: 'Void congela a los rivales; Invoker lanza Cataclysm + Chaos Meteor + Sunstrike garantizado al 100%.',
      },
    ],
  },

  slark: {
    nameEs: 'Slark',
    dangerSummary: 'Roba agilidad permanente con Essence Shift, purga stuns con Dark Pact y se vuelve intargeteable en Shadow Dance.',
    items: [
      {
        itemKey: 'bloodthorn',
        nameEn: 'Bloodthorn',
        nameEs: 'Espina Sangrienta',
        cost: 6800,
        tacticalWhy: 'Silencio y golpe certero con crítico; impide que use Pounce o active Shadow Dance.',
      },
      {
        itemKey: 'ghost',
        nameEn: 'Ghost Scepter',
        nameEs: 'Cetro Fantasmal',
        cost: 1500,
        tacticalWhy: 'Inmunidad física para que no pueda robarte agilidad durante sus 4 segundos de niebla.',
      },
      {
        itemKey: 'force_staff',
        nameEn: 'Force Staff',
        nameEs: 'Bastón de Fuerza',
        cost: 2200,
        tacticalWhy: 'Rompe la correa de Pounce para escapar de su rango cuerpo a cuerpo.',
      },
      {
        itemKey: 'shivas_guard',
        nameEn: "Shiva's Guard",
        nameEs: 'Guardia de Shiva',
        cost: 5175,
        tacticalWhy: 'Ralentiza su velocidad de ataque en área para frenar la acumulación de Essence Shift.',
      },
    ],
    synergies: [
      {
        partnerKey: 'omniknight',
        partnerNameEn: 'Omniknight',
        partnerNameEs: 'Caballero Omnisciente',
        comboName: 'El Pez Imparable',
        howToExecute: 'Repel y Heavenly Grace le otorgan inmunidad para entrar a robar stats sin ningún riesgo.',
      },
    ],
  },

  riki: {
    nameEs: 'Riki',
    dangerSummary: 'Invisibilidad permanente con Cloak and Dagger, silencia en área con Smoke Screen y ataca invulnerable en Tricks of the Trade.',
    items: [
      {
        itemKey: 'dust',
        nameEn: 'Dust of Appearance',
        nameEs: 'Polvo de Aparición',
        cost: 80,
        tacticalWhy: 'Ralentiza en 20% y revela a Riki durante 12 segundos; indispensable para matarlo en cuanto sale.',
      },
      {
        itemKey: 'ward_sentry',
        nameEn: 'Sentry Ward',
        nameEs: 'Guardián Centinela',
        cost: 50,
        tacticalWhy: 'Plantado en el carril o detrás de tus torres evita que Riki te sorprenda por la espalda.',
      },
      {
        itemKey: 'force_staff',
        nameEn: 'Force Staff',
        nameEs: 'Bastón de Fuerza',
        cost: 2200,
        tacticalWhy: 'Te empuja fuera de su Smoke Screen para poder lanzar tus hechizos y teletransportarte.',
      },
      {
        itemKey: 'ghost',
        nameEn: 'Ghost Scepter',
        nameEs: 'Cetro Fantasmal',
        cost: 1500,
        tacticalWhy: 'Evita que sus ataques de Tricks of the Trade te toquen mientras estás dentro de su humo.',
      },
    ],
    synergies: [
      {
        partnerKey: 'disruptor',
        partnerNameEn: 'Disruptor',
        partnerNameEs: 'Disruptor',
        comboName: 'Doble Silencio y Jaula',
        howToExecute: 'Kinetic Field encierra al enemigo dentro del Smoke Screen de Riki; no pueden escapar ni usar poderes.',
      },
    ],
  },

  invoker: {
    nameEs: 'Invocador (Invoker)',
    dangerSummary: '10 hechizos distintos que incluyen daño masivo (Cataclysm/Meteor), desarmado (Deafening Blast) y drenado de maná (EMP).',
    items: [
      {
        itemKey: 'black_king_bar',
        nameEn: 'Black King Bar (BKB)',
        nameEs: 'Barra del Rey Negro',
        cost: 4050,
        tacticalWhy: 'El contraataque número 1: anula el 95% de sus 10 hechizos, dejándolo únicamente con daño básico de ataque.',
      },
      {
        itemKey: 'mage_slayer',
        nameEn: 'Mage Slayer',
        nameEs: 'Asesino de Magos',
        cost: 2825,
        tacticalWhy: 'Reduce el daño de todos los hechizos de Invoker en un 40% durante 6 segundos tras golpearlo.',
      },
      {
        itemKey: 'force_staff',
        nameEn: 'Force Staff',
        nameEs: 'Bastón de Fuerza',
        cost: 2200,
        tacticalWhy: 'Te saca a ti o a un aliado del radio de impacto de Chaos Meteor, Ice Wall y EMP.',
      },
      {
        itemKey: 'orchid',
        nameEn: 'Orchid Malevolence',
        nameEs: 'Orquídea de la Malevolencia',
        cost: 3475,
        tacticalWhy: 'Lo silencia antes de que combine Invoke; sin hechizos es un blanco frágil y fácil de eliminar.',
      },
    ],
    synergies: [
      {
        partnerKey: 'axe',
        partnerNameEn: 'Axe',
        partnerNameEs: 'Axe',
        comboName: 'Cataclismo Berserker',
        howToExecute: 'Call agrupa a los rivales; Invoker descarga Cataclysm + Meteor + Blast sobre el grupo.',
      },
      {
        partnerKey: 'faceless_void',
        partnerNameEn: 'Faceless Void',
        partnerNameEs: 'Faceless Void',
        comboName: 'Crono Solar',
        howToExecute: 'Void congela enemigos dentro de Chronosphere; Invoker lanza Sun Strike y Cataclysm infalibles.',
      },
    ],
  },

  legion_commander: {
    nameEs: 'Comandante de la Legión (LC)',
    dangerSummary: 'Fuerza duelos a muerte con Duel, ganando daño permanente por cada victoria; se disipa debuffs con Press the Attack.',
    items: [
      {
        itemKey: 'linkens_sphere',
        nameEn: "Linken's Sphere",
        nameEs: 'Esfera de Linken',
        cost: 4600,
        tacticalWhy: 'Bloquea automáticamente su Duelo (Duel) cuando intenta saltar con Blink sobre ti.',
      },
      {
        itemKey: 'lotus_orb',
        nameEn: 'Lotus Orb',
        nameEs: 'Orbe de Loto',
        cost: 3850,
        tacticalWhy: 'Refleja el Duelo sobre LC; ¡si te ataca a ti con escudo de Lotus, ambos quedan batiéndose en duelo!',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Desarma a LC en cuanto inicie el duelo para que no pueda golpear a tu compañero atrapado.',
      },
      {
        itemKey: 'ethereal_blade',
        nameEn: 'Ethereal Blade',
        nameEs: 'Hoja Etérea',
        cost: 5375,
        tacticalWhy: 'Lánzala sobre el aliado batido en duelo para volverlo inmune a todo el daño físico de LC.',
      },
    ],
    synergies: [
      {
        partnerKey: 'skywrath_mage',
        partnerNameEn: 'Skywrath Mage',
        partnerNameEs: 'Mago Sempiterno',
        comboName: 'Duelo Místico',
        howToExecute: 'LC inicia Duelo; Skywrath arroja Mystic Flare completo sobre el objetivo inmóvil, asegurando victoria y daño permanente.',
      },
    ],
  },
};

// ─── DYNAMIC ANTI-ITEM ENGINE FOR ANY OTHER HERO ──────────────────────────────
function getTailoredAntiItemsForHero(
  heroName: string,
  heroKey: string,
  attr: string,
  roles: string[]
): AntiItemDetail[] {
  // Check exact custom list
  if (HERO_SPECIFIC_ANTIBUILDS[heroKey]) {
    return HERO_SPECIFIC_ANTIBUILDS[heroKey].items;
  }

  const items: AntiItemDetail[] = [];
  const lower = heroName.toLowerCase();

  // 1. Invisibles / Escurridizos
  if (
    lower.includes('bounty') ||
    lower.includes('clinkz') ||
    lower.includes('nyx') ||
    lower.includes('weaver') ||
    lower.includes('sand king')
  ) {
    items.push({
      itemKey: 'dust',
      nameEn: 'Dust of Appearance',
      nameEs: 'Polvo de Aparición',
      cost: 80,
      tacticalWhy: `Revela su invisibilidad y le aplica 20% de ralentización para que no pueda escapar.`,
    });
    items.push({
      itemKey: 'ward_sentry',
      nameEn: 'Sentry Ward',
      nameEs: 'Guardián Centinela',
      cost: 50,
      tacticalWhy: `Visión Verdadera fija en carriles para anticipar sus emboscadas antes de que te ataque.`,
    });
  }

  // 2. Ilusiones / Clones
  if (
    lower.includes('lancer') ||
    lower.includes('naga') ||
    lower.includes('chaos') ||
    lower.includes('terror') ||
    lower.includes('meepo')
  ) {
    items.push({
      itemKey: 'mjollnir',
      nameEn: 'Mjollnir',
      nameEs: 'Mjollnir',
      cost: 5600,
      tacticalWhy: `Escudo estático que electrocuta a todas las ilusiones de ${heroName} con cada golpe recibido.`,
    });
    items.push({
      itemKey: 'crimson_guard',
      nameEn: 'Crimson Guard',
      nameEs: 'Guardia Carmesí',
      cost: 3725,
      tacticalWhy: `Bloquea hasta 75 de daño por golpe físico a todo tu equipo; las ilusiones de ${heroName} no te harán cosquillas.`,
    });
    items.push({
      itemKey: 'shivas_guard',
      nameEn: "Shiva's Guard",
      nameEs: 'Guardia de Shiva',
      cost: 5175,
      tacticalWhy: `Onda de hielo en área que destruye ilusiones y ralentiza la velocidad de ataque.`,
    });
  }

  // 3. Evasión o Ceguera
  if (lower.includes('wind') || lower.includes('brew') || lower.includes('troll')) {
    items.push({
      itemKey: 'monkey_king_bar',
      nameEn: 'Monkey King Bar (MKB)',
      nameEs: 'Vara del Rey Mono',
      cost: 4975,
      tacticalWhy: `Otorga 80% de True Strike para ignorar sus habilidades de evasión y ceguera.`,
    });
  }

  // 4. Pasivas Fuertes / Tanque de Sustain
  if (
    attr === 'str' ||
    roles.includes('Durable') ||
    lower.includes('huskar') ||
    lower.includes('dragon') ||
    lower.includes('tide') ||
    lower.includes('timber') ||
    lower.includes('spectre')
  ) {
    items.push({
      itemKey: 'silver_edge',
      nameEn: 'Silver Edge',
      nameEs: 'Filo Plateado',
      cost: 5450,
      tacticalWhy: `Aplica Ruptura (Break) durante 5 segundos para apagar sus pasivas de regeneración y armadura.`,
    });
    items.push({
      itemKey: 'spirit_vessel',
      nameEn: 'Spirit Vessel',
      nameEs: 'Receptáculo Espiritual',
      cost: 2780,
      tacticalWhy: `Reduce en 45% la curación de ${heroName} e inflige daño porcentual continuo a su alta vida.`,
    });
  }

  // 5. Casters / Magos de daño masivo
  if (attr === 'int' || roles.includes('Nuker')) {
    items.push({
      itemKey: 'black_king_bar',
      nameEn: 'Black King Bar (BKB)',
      nameEs: 'Barra del Rey Negro',
      cost: 4050,
      tacticalWhy: `Inmunidad mágica completa para ignorar la ráfaga de hechizos de ${heroName}.`,
    });
    items.push({
      itemKey: 'pipe',
      nameEn: 'Pipe of Insight',
      nameEs: 'Pipa de la Perspicacia',
      cost: 3375,
      tacticalWhy: `Escudo de absorción mágica de 450 de daño para todo tu equipo.`,
    });
    items.push({
      itemKey: 'mage_slayer',
      nameEn: 'Mage Slayer',
      nameEs: 'Asesino de Magos',
      cost: 2825,
      tacticalWhy: `Reduce el daño de hechizos de ${heroName} en un 40% al conectarle un ataque.`,
    });
  }

  // 6. Carries Físicos Rápidos
  if (roles.includes('Carry') && (attr === 'str' || attr === 'agi')) {
    items.push({
      itemKey: 'heavens_halberd',
      nameEn: "Heaven's Halberd",
      nameEs: 'Alabarda del Cielo',
      cost: 3550,
      tacticalWhy: `Desarma sus ataques físicos durante 3 a 5 segundos impidiéndole generar daño y lifesteal.`,
    });
    items.push({
      itemKey: 'ghost',
      nameEn: 'Ghost Scepter',
      nameEs: 'Cetro Fantasmal',
      cost: 1500,
      tacticalWhy: `Inmunidad física para evitar que ${heroName} elimine a tus soportes en segundos.`,
    });
  }

  // 7. Elusivos / Alta Movilidad
  if (roles.includes('Escape') || lower.includes('storm') || lower.includes('puck') || lower.includes('ember') || lower.includes('queen')) {
    items.push({
      itemKey: 'orchid',
      nameEn: 'Orchid Malevolence',
      nameEs: 'Orquídea de la Malevolencia',
      cost: 3475,
      tacticalWhy: `Silencia a ${heroName} durante 5s impidiéndole saltar o teletransportarse para escapar.`,
    });
    items.push({
      itemKey: 'scythe_of_vyse',
      nameEn: 'Scythe of Vyse (Hex)',
      nameEs: 'Guadaña de Vyse',
      cost: 5675,
      tacticalWhy: `Hex instantáneo de 3.5 segundos para anularlo antes de que active habilidades defensivas.`,
    });
  }

  // Fallback defaults if list is short
  if (items.length < 3) {
    items.push({
      itemKey: 'scythe_of_vyse',
      nameEn: 'Scythe of Vyse (Hex)',
      nameEs: 'Guadaña de Vyse',
      cost: 5675,
      tacticalWhy: `La incapacitación más sólida del juego: 3.5s donde ${heroName} no puede atacar ni lanzar hechizos.`,
    });
  }
  if (items.length < 4) {
    items.push({
      itemKey: 'lotus_orb',
      nameEn: 'Lotus Orb',
      nameEs: 'Orbe de Loto',
      cost: 3850,
      tacticalWhy: `Disipa efectos negativos y refleja cualquier hechizo directo que ${heroName} lance sobre ti.`,
    });
  }

  return items.slice(0, 4);
}

// ─── TACTICAL MATCHUP ENGINE ──────────────────────────────────────────────────
function getDynamicTacticalProfile(
  heroId: number,
  heroName: string,
  heroKey: string,
  attr: string,
  roles: string[],
  apiMatchups: { hero_id: number; games_played: number; wins: number }[],
  allHeroes: Record<number, any>
): HeroTacticalProfile {
  const curated = HERO_SPECIFIC_ANTIBUILDS[heroKey];

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

  // Tailored anti-items
  const antiItems = getTailoredAntiItemsForHero(heroName, heroKey, attr, roles);

  // Curated or dynamic synergies
  const synergies: TeamSynergyDetail[] = curated?.synergies || [
    {
      partnerKey: roles.includes('Support') ? 'juggernaut' : 'crystal_maiden',
      partnerNameEn: roles.includes('Support') ? 'Juggernaut' : 'Crystal Maiden',
      partnerNameEs: roles.includes('Support') ? 'Juggernaut' : 'Doncella de Cristal',
      comboName: roles.includes('Support') ? 'Giro Mortal' : 'Aura y Control Helado',
      howToExecute: roles.includes('Support')
        ? `Lanza tu aturdimiento sobre el objetivo; Juggernaut activa Blade Fury y gira encima eliminándolo en línea.`
        : `El aura de Crystal Maiden le proporciona maná continuo a ${heroName} para presionar sin pausa con sus poderes.`,
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
    nameEs: curated?.nameEs || heroName,
    attr: (attr as any) || 'str',
    primaryRole: roles.slice(0, 2).join(' / ') || 'Héroe Versátil',
    dangerSummary:
      curated?.dangerSummary ||
      `${heroName} es un héroe de rol ${roles.join(', ')}. Depende fuertemente de su posicionamiento en peleas y de sus tiempos de enfriamiento.`,
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
    antiItems,
    synergies,
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
              Análisis Táctico de Héroes: Counters Reales, Anti-Builds y Sinergias
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
              Sinergias y Combos de Equipo con {selectedProfile.nameEn} <span className="text-xs text-emerald-400 font-normal">(Sinergias Explicadas)</span>
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
