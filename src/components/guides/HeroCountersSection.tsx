import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useConstants } from '../../hooks/useConstants';

// ─── VISUAL IMAGE HELPERS (STEAM CDN) ─────────────────────────────────────────
const HeroThumb: React.FC<{ heroKey: string; name: string; className?: string }> = ({
  heroKey,
  name,
  className = 'w-10 h-10',
}) => {
  const [error, setError] = useState(false);
  // Clean hero key if it starts with npc_dota_hero_
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
  heroKey: string;
  nameEn: string;
  nameEs: string;
  whyCounter: string;
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

// ─── CURATED TACTICAL DATA FOR MAJOR HEROES ───────────────────────────────────
const CURATED_HERO_PROFILES: Record<string, Partial<HeroTacticalProfile>> = {
  phantom_assassin: {
    nameEs: 'Asesina Fantasma (PA)',
    dangerSummary: 'Daño crítico descomunal con Coup de Grâce y evasión pasiva Blur (50% de probabilidad de esquivar ataques físicos).',
    counters: [
      {
        heroKey: 'axe',
        nameEn: 'Axe',
        nameEs: 'Axe / Hacha',
        whyCounter: 'Con Berserker\'s Call obliga a PA a atacarlo, y al activar Blade Mail, el crítico masivo de PA se refleja directamente hacia ella, matándola en un segundo.',
      },
      {
        heroKey: 'lion',
        nameEn: 'Lion',
        nameEs: 'León (Brujo Demonio)',
        whyCounter: 'El combo de Stun + Hex la deja inmóvil sin poder pulsar su BKB, y Finger of Death le inflige daño mágico puro que ignora por completo su evasión física.',
      },
      {
        heroKey: 'viper',
        nameEn: 'Viper',
        nameEs: 'Víbora',
        whyCounter: 'Nethertoxin aplica Ruptura (Break), lo cual desactiva completamente su evasión de Blur y su probabilidad de golpe crítico.',
      },
      {
        heroKey: 'lina',
        nameEn: 'Lina',
        nameEs: 'Lina',
        whyCounter: 'Laguna Blade con Aghanim\'s Scepter inflige daño puro a través de BKB y la desintegra al instante dada su baja reserva de vida.',
      },
    ],
    antiItems: [
      {
        itemKey: 'monkey_king_bar',
        nameEn: 'Monkey King Bar (MKB)',
        nameEs: 'Vara del Rey Mono',
        cost: 4975,
        tacticalWhy: 'Otorga 80% de True Strike (Golpe Certero). Hace que tus ataques físicos nunca fallen contra la evasión de su pasiva Blur.',
      },
      {
        itemKey: 'blade_mail',
        nameEn: 'Blade Mail',
        nameEs: 'Cota de Cuchillas',
        cost: 2100,
        tacticalWhy: 'Devuelve el 85% del daño recibido. Si PA te asesta un crítico de 1,500 de daño con Blade Mail activo, ella recibirá casi la totalidad de ese golpe.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Aplica Desarme durante 3 segundos. PA no podrá asestar ni un solo ataque, y lo más importante: ¡el desarme no se puede purgar con BKB si se aplica antes!',
      },
      {
        itemKey: 'silver_edge',
        nameEn: 'Silver Edge',
        nameEs: 'Filo Plateado',
        cost: 5450,
        tacticalWhy: 'Al atacar desde la invisibilidad aplica Ruptura (Break) por 5 segundos, anulando su evasión y su crítico.',
      },
      {
        itemKey: 'ghost',
        nameEn: 'Ghost Scepter',
        nameEs: 'Cetro Fantasmal',
        cost: 1500,
        tacticalWhy: 'Para soportes: te vuelve inmune a ataques físicos durante 4 segundos, impidiendo que PA te asesine de una sola daga.',
      },
    ],
    synergies: [
      {
        partnerKey: 'magnataur',
        partnerNameEn: 'Magnus',
        partnerNameEs: 'Magnus',
        comboName: 'La Picadora Polar',
        howToExecute: 'Magnus junta a los 5 rivales con Reverse Polarity (RP) y le otorga Empower a PA; PA entra con BKB y limpia al equipo rival en 2 golpes con cleave.',
      },
      {
        partnerKey: 'omniknight',
        partnerNameEn: 'Omniknight',
        partnerNameEs: 'Caballero Omnisciente',
        comboName: 'Inmunidad Sagrada',
        howToExecute: 'Omniknight le otorga Heavenly Grace (fuerza y regeneración masiva) y Guardian Angel, volviéndola inmune al daño físico.',
      },
      {
        partnerKey: 'vengefulspirit',
        partnerNameEn: 'Vengeful Spirit',
        partnerNameEs: 'Espíritu Vengativo',
        comboName: 'Doble Penetración de Armadura',
        howToExecute: 'Wave of Terror reduce drásticamente la armadura enemiga y Magic Missile asegura el aturdimiento para que PA conecte todos sus golpes.',
      },
      {
        partnerKey: 'slardar',
        partnerNameEn: 'Slardar',
        partnerNameEs: 'Slardar',
        comboName: 'Armadura Negativa Devastadora',
        howToExecute: 'Slardar coloca Corrosive Haze (-16 de armadura); PA lanza Stifling Dagger con crítico que prácticamente hace daño verdadero.',
      },
    ],
  },

  skeleton_king: {
    nameEs: 'Rey Fantasma (Wraith King / WK)',
    dangerSummary: 'Resucita al morir con Reincarnation, regenera vida pasiva para su equipo y cuenta con aturdimiento y críticos demoledores.',
    counters: [
      {
        heroKey: 'antimage',
        nameEn: 'Anti-Mage',
        nameEs: 'Anti-Mago',
        whyCounter: 'Mana Break le drena todo el maná con cada ataque rápido. Si WK no tiene maná para su ultimate Reincarnation (requiere maná antes del Aghanim/Shard), muere de forma definitiva.',
      },
      {
        heroKey: 'lion',
        nameEn: 'Lion',
        nameEs: 'León',
        whyCounter: 'Mana Drain a distancia drena su maná en segundos dejándolo inútil, mientras lo aturde en cadena para impedir su escape.',
      },
      {
        heroKey: 'phantom_lancer',
        nameEn: 'Phantom Lancer',
        nameEs: 'Lancero Fantasma',
        whyCounter: 'Con Diffusal Blade, cientos de ilusiones le vacían la reserva de maná en 1 segundo y WK no tiene suficiente daño de área para matarlas.',
      },
      {
        heroKey: 'necrolyte',
        nameEn: 'Necrophos',
        nameEs: 'Necrófago',
        whyCounter: 'Reaper\'s Scythe inflige daño en base a la vida faltante, forzando la primera muerte de WK muy rápido, y Ghost Shroud lo protege de sus golpes.',
      },
    ],
    antiItems: [
      {
        itemKey: 'diffusal_blade',
        nameEn: 'Diffusal Blade',
        nameEs: 'Hoja Difusora',
        cost: 2500,
        tacticalWhy: 'Quema 40 de maná por golpe. Fundamental para evitar que WK tenga maná suficiente para revivir con su Reincarnation.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Desarma a WK por 3 segundos impidiéndole generar golpes críticos y lifesteal para mantenerse con vida.',
      },
      {
        itemKey: 'solar_crest',
        nameEn: 'Solar Crest',
        nameEs: 'Blasón Solar',
        cost: 2700,
        tacticalWhy: 'Otorga un escudo enorme y armadura a quien WK esté enfocando, o reduce su velocidad de ataque.',
      },
      {
        itemKey: 'spirit_vessel',
        nameEn: 'Spirit Vessel',
        nameEs: 'Receptáculo Espiritual',
        cost: 2780,
        tacticalWhy: 'Reduce la regeneración de vida y el robo de vida (lifesteal) de WK en un 45%, frenando su sustain en peleas largas.',
      },
    ],
    synergies: [
      {
        partnerKey: 'crystal_maiden',
        partnerNameEn: 'Crystal Maiden',
        partnerNameEs: 'Doncella de Cristal',
        comboName: 'Hielo y Huesos',
        howToExecute: 'El aura de CM le proporciona el maná constante que WK necesita en línea; combinan Frostbite con Wraithfire Blast para un stun ineludible.',
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
    dangerSummary: 'Iniciador letal. Salta con Blink, fuerza a los enemigos a atacarlo con Berserker\'s Call (que atraviesa BKB) y ejecuta bajo 300-450 HP con Culling Blade.',
    counters: [
      {
        heroKey: 'viper',
        nameEn: 'Viper',
        nameEs: 'Víbora',
        whyCounter: 'Veneno de rango que desgasta a Axe sin acercarse; Nethertoxin desactiva su pasiva Counter Helix (giro giratorio).',
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
      {
        heroKey: 'ursa',
        nameEn: 'Ursa',
        nameEs: 'Ursa',
        whyCounter: 'Fury Swipes acumula daño exponencial con cada golpe; cuando Axe lo provoca, Ursa le asesta 6 zarpazos y lo derrite a él primero.',
      },
    ],
    antiItems: [
      {
        itemKey: 'urn_of_shadows',
        nameEn: 'Urn of Shadows / Spirit Vessel',
        nameEs: 'Urna de las Sombras',
        cost: 880,
        tacticalWhy: 'Aplica daño por segundo continuo a distancia para desactivarle la Blink Dagger por completo e impedirle saltar.',
      },
      {
        itemKey: 'euls_scepter',
        nameEn: "Eul's Scepter of Divinity",
        nameEs: 'Cetro de la Divinidad de Eul',
        cost: 2625,
        tacticalWhy: 'En cuanto Axe salte y active Blade Mail, lánzale Eul para levantarlo en el aire durante 2.5s, desperdiciando su iniciación.',
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
        tacticalWhy: 'Otorga resistencia a estados (Status Resistance), reduciendo drásticamente la duración de su provocación (Call).',
      },
    ],
    synergies: [
      {
        partnerKey: 'invoker',
        partnerNameEn: 'Invoker',
        partnerNameEs: 'Invocador',
        comboName: 'Cataclismo Berserker',
        howToExecute: 'Axe atrapa a 3 enemigos con Berserker\'s Call; Invoker lanza Cataclysm / Chaos Meteor instantáneamente sobre ellos.',
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

  sniper: {
    nameEs: 'Francotirador (Sniper)',
    dangerSummary: 'Rango de ataque superlativo con Take Aim y Headshot; destruye torres y enemigos desde fuera del campo de visión.',
    counters: [
      {
        heroKey: 'spectre',
        nameEn: 'Spectre',
        nameEs: 'Espectro',
        whyCounter: 'Haunt se teletransporta directamente detrás de Sniper sin importar a cuánta distancia esté, y Desolate lo destroza sin defensas.',
      },
      {
        heroKey: 'spirit_breaker',
        nameEn: 'Spirit Breaker',
        nameEs: 'Espíritu Rompedor (Bara)',
        whyCounter: 'Charge of Darkness cruza todo el mapa directamente hacia Sniper y lo aturde de forma continua sin dejarlo disparar.',
      },
      {
        heroKey: 'storm_spirit',
        nameEn: 'Storm Spirit',
        nameEs: 'Espíritu de la Tormenta',
        whyCounter: 'Ball Lightning cruza pantallas enteras invulnerable, aterriza encima de Sniper y lo encadena con Vortex.',
      },
      {
        heroKey: 'clockwerk',
        nameEn: 'Clockwerk',
        nameEs: 'Mecanismo (Clockwerk)',
        whyCounter: 'Hookshot a larguísima distancia, lo encierra en Power Cogs y Battery Assault interrumpe continuamente sus disparos.',
      },
    ],
    antiItems: [
      {
        itemKey: 'blink',
        nameEn: 'Blink Dagger',
        nameEs: 'Daga de Traslación',
        cost: 2250,
        tacticalWhy: 'La regla número 1 contra Sniper: ¡cerrar la brecha de distancia! Salta directo a su espalda donde no tiene cómo defenderse.',
      },
      {
        itemKey: 'blade_mail',
        nameEn: 'Blade Mail',
        nameEs: 'Cota de Cuchillas',
        cost: 2100,
        tacticalWhy: 'Actívalo mientras corres hacia él; la cadencia y daño de Sniper harán que él mismo se suicide con sus disparos reflejados.',
      },
      {
        itemKey: 'heavens_halberd',
        nameEn: "Heaven's Halberd",
        nameEs: 'Alabarda del Cielo',
        cost: 3550,
        tacticalWhy: 'Desarma a Sniper durante 5 segundos enteros (por ser héroe a distancia); queda completamente anulado en la pelea.',
      },
      {
        itemKey: 'smoke_of_deceit',
        nameEn: 'Smoke of Deceit',
        nameEs: 'Humo del Engaño',
        cost: 50,
        tacticalWhy: 'Permite a tu equipo flanquear su posición detrás de los árboles sin que sus wards lo alerten.',
      },
    ],
    synergies: [
      {
        partnerKey: 'treant_protector',
        partnerNameEn: 'Treant Protector',
        partnerNameEs: 'Protector Arbóreo',
        comboName: 'El Nido de Francotirador',
        howToExecute: 'Overgrowth enraíza a todos los enemigos en el suelo; Sniper se coloca a salvo y los fusila uno a uno con Headshot.',
      },
      {
        partnerKey: 'drow_ranger',
        partnerNameEn: 'Drow Ranger',
        partnerNameEs: 'Guardabosques Oscura',
        comboName: 'Doble Aura de Alcance',
        howToExecute: 'Marksmanship de Drow Ranger otorga agilidad y velocidad extra a Sniper, convirtiéndolo en una torreta ametralladora.',
      },
      {
        partnerKey: 'ogre_magi',
        partnerNameEn: 'Ogre Magi',
        partnerNameEs: 'Ogro Mago',
        comboName: 'Sangre Caliente Multicast',
        howToExecute: 'Bloodlust incrementa su velocidad de movimiento y le otorga +60 de velocidad de ataque permanente.',
      },
    ],
  },

  bristleback: {
    nameEs: 'Espaldaespinada (Bristleback)',
    dangerSummary: 'Recibe hasta 40% menos de daño por la espalda y suelta espinas automáticas con Quill Spray y Warpath acumulativo.',
    counters: [
      {
        heroKey: 'viper',
        nameEn: 'Viper',
        nameEs: 'Víbora',
        whyCounter: 'El contraataque definitivo: Nethertoxin aplica Ruptura (Break), apagando completamente su pasiva; Bristleback se vuelve blando como papel.',
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
        whyCounter: 'Essence Shift le roba Agilidad permanentemente en peleas largas. Cuanto más aguanta Bristleback, más fuerte se hace Slark.',
      },
    ],
    antiItems: [
      {
        itemKey: 'silver_edge',
        nameEn: 'Silver Edge',
        nameEs: 'Filo Plateado',
        cost: 5450,
        tacticalWhy: 'Aplica Ruptura (Break) durante 5 segundos al salir de la invisibilidad. Obligatorio para cualquier core contra Bristleback.',
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
        tacticalWhy: 'Bristleback lanza Quill Spray cada 3 segundos, lo que te carga la varita a 20 acumulaciones en menos de 1 minuto de línea.',
      },
      {
        itemKey: 'shivas_guard',
        nameEn: "Shiva's Guard",
        nameEs: 'Guardia de Shiva',
        cost: 5175,
        tacticalWhy: 'Reduce la velocidad de ataque y la regeneración de vida enemiga en área, mitigando su impacto en peleas.',
      },
    ],
    synergies: [
      {
        partnerKey: 'io',
        partnerNameEn: 'Io (Wisp)',
        partnerNameEs: 'Io (El Fuego Fatuo)',
        comboName: 'La Batería Inmortal',
        howToExecute: 'Io enlaza (Tether) a Bristleback con Overcharge; cura toda su vida y maná haciendo que nunca tenga que retroceder.',
      },
      {
        partnerKey: 'kotl',
        partnerNameEn: 'Keeper of the Light',
        partnerNameEs: 'Guardián de la Luz',
        comboName: 'Maná Infinito de Espinas',
        howToExecute: 'Chakra Magic restaura su maná y reduce el cooldown de Quill Spray a solo 1.5 segundos.',
      },
      {
        partnerKey: 'dazzle',
        partnerNameEn: 'Dazzle',
        partnerNameEs: 'Dazzle',
        comboName: 'Reducción de Armadura en Cadena',
        howToExecute: 'Bad Juju y Shadow Wave curan a Bristleback entre las tropas mientras reducen la armadura de todos los enemigos a su alrededor.',
      },
    ],
  },

  pudge: {
    nameEs: 'Pudge (El Carnicero)',
    dangerSummary: 'Engancha enemigos desde la niebla con Meat Hook, los desintegra con Rot y los incapacita a través de BKB con Dismember.',
    counters: [
      {
        heroKey: 'lifestealer',
        nameEn: 'Lifestealer (Naix)',
        nameEs: 'Ladrón de Vidas',
        whyCounter: 'Feast roba vida en porcentaje de la vida máxima enemiga. Como Pudge acumula 4,000+ de HP, Naix se cura monstruosamente contra él.',
      },
      {
        heroKey: 'clockwerk',
        nameEn: 'Clockwerk',
        nameEs: 'Mecanismo',
        whyCounter: 'Battery Assault cancela continuamente la canalización de su Dismember impidiéndole morder a sus víctimas.',
      },
      {
        heroKey: 'silencer',
        nameEn: 'Silencer',
        nameEs: 'Silenciador',
        whyCounter: 'Global Silence interrumpe a Pudge desde cualquier lugar del mapa en el segundo exacto en que engancha a un compañero.',
      },
    ],
    antiItems: [
      {
        itemKey: 'ward_observer',
        nameEn: 'Observer Ward',
        nameEs: 'Guardián Observador',
        cost: 0,
        tacticalWhy: 'La mayor debilidad de Pudge es la visión. Coloca wards en riscos y detrás de los árboles para verlo antes de que lance el gancho.',
      },
      {
        itemKey: 'lotus_orb',
        nameEn: 'Lotus Orb',
        nameEs: 'Orbe de Loto',
        cost: 3850,
        tacticalWhy: 'Si Pudge usa Dismember sobre el objetivo con escudo de Lotus, ¡Pudge quedará mordido y paralizado a sí mismo!',
      },
      {
        itemKey: 'force_staff',
        nameEn: 'Force Staff',
        nameEs: 'Bastón de Fuerza',
        cost: 2200,
        tacticalWhy: 'Empuja a tu aliado en cuanto el gancho de Pudge impacte para salvarlo de inmediato de su mordisco.',
      },
      {
        itemKey: 'spirit_vessel',
        nameEn: 'Spirit Vessel',
        nameEs: 'Receptáculo Espiritual',
        cost: 2780,
        tacticalWhy: 'Inflige daño basado en el 4% de su vida actual; ideal contra su acumulación de Flesh Heap.',
      },
    ],
    synergies: [
      {
        partnerKey: 'bloodseeker',
        partnerNameEn: 'Bloodseeker',
        partnerNameEs: 'Buscasangre',
        comboName: 'Gancho Desgarrador',
        howToExecute: 'Bloodseeker coloca Rupture; Pudge engancha al rival desde 1300 de distancia: ¡el enemigo muere instantáneamente por la distancia recorrida!',
      },
      {
        partnerKey: 'techies',
        partnerNameEn: 'Techies',
        partnerNameEs: 'Artilleros',
        comboName: 'Gancho a las Minas',
        howToExecute: 'Techies planta Proximity Mines y Pudge engancha a la víctima directamente al centro del campo minado.',
      },
      {
        partnerKey: 'mirana',
        partnerNameEn: 'Mirana',
        partnerNameEs: 'Mirana',
        comboName: 'Flecha Sagrada Garantizada',
        howToExecute: 'En cuanto Pudge muerde con Dismember (inmóvil 3s), Mirana lanza Sacred Arrow a máxima distancia para un stun de 5 segundos.',
      },
    ],
  },
};

// ─── DYNAMIC FALLBACK GENERATOR FOR ALL OTHER HEROES ──────────────────────────
function generateFallbackTactics(heroId: number, heroName: string, attr: string, roles: string[]): HeroTacticalProfile {
  const isMeleeCarry = roles.includes('Carry') && (attr === 'str' || attr === 'agi');
  const isMage = attr === 'int' || roles.includes('Nuker');
  const isSupport = roles.includes('Support');

  return {
    heroId,
    key: heroName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    nameEn: heroName,
    nameEs: heroName,
    attr: (attr as any) || 'str',
    primaryRole: roles.slice(0, 2).join(' / ') || 'Héroe Versátil',
    dangerSummary: `${heroName} destaca como ${roles.join(', ')}. Depende fuertemente de su posicionamiento, timing de ítems y cadena de habilidades.`,
    counters: [
      {
        heroKey: isMeleeCarry ? 'axe' : isMage ? 'antimage' : 'spirit_breaker',
        nameEn: isMeleeCarry ? 'Axe' : isMage ? 'Anti-Mage' : 'Spirit Breaker',
        nameEs: isMeleeCarry ? 'Axe' : isMage ? 'Anti-Mago' : 'Spirit Breaker',
        whyCounter: isMeleeCarry
          ? 'La provocación con armadura masiva anula su libertad de movimiento y refleja su propio daño con Blade Mail.'
          : isMage
          ? 'Quema su reserva de maná rápidamente y lo destruye con Mana Void en base a su maná gastado.'
          : 'Carga global que no le permite esconderse en el mapa ni farmear en solitario.',
      },
      {
        heroKey: 'lion',
        nameEn: 'Lion',
        nameEs: 'León',
        whyCounter: 'Control en cadena con Stun y Hex más drenado de maná; impide que lance sus hechizos defensivos o active BKB.',
      },
      {
        heroKey: isSupport ? 'spectre' : 'viper',
        nameEn: isSupport ? 'Spectre' : 'Viper',
        nameEs: isSupport ? 'Espectro' : 'Víbora',
        whyCounter: isSupport
          ? 'Aparece instantáneamente en la retaguardia (Backline) eliminándolo antes de que pueda lanzar sus poderes.'
          : 'Nethertoxin aplica Ruptura (Break) e inhabilita sus habilidades pasivas más fuertes.',
      },
    ],
    antiItems: [
      {
        itemKey: isMage ? 'black_king_bar' : 'heavens_halberd',
        nameEn: isMage ? 'Black King Bar (BKB)' : "Heaven's Halberd",
        nameEs: isMage ? 'Barra del Rey Negro' : 'Alabarda del Cielo',
        cost: isMage ? 4050 : 3550,
        tacticalWhy: isMage
          ? 'Otorga inmunidad a sus hechizos y daño mágico, permitiéndote entrar a golpearlo con total seguridad.'
          : 'Desarma sus ataques físicos impidiéndole generar daño y robo de vida durante 3 a 5 segundos.',
      },
      {
        itemKey: 'scythe_of_vyse',
        nameEn: 'Scythe of Vyse (Hex)',
        nameEs: 'Guadaña de Vyse',
        cost: 5675,
        tacticalWhy: 'Lo transforma en cerdo por 3.5 segundos sin posibilidad de respuesta, ideal para eliminarlo antes de que active BKB.',
      },
      {
        itemKey: 'glimmer_cape',
        nameEn: 'Glimmer Cape',
        nameEs: 'Capa Fulgurante',
        cost: 2150,
        tacticalWhy: 'Otorga invisibilidad defensiva y 300 de escudo mágico para sobrevivir a sus combos sorpresivos.',
      },
      {
        itemKey: 'spirit_vessel',
        nameEn: 'Spirit Vessel',
        nameEs: 'Receptáculo Espiritual',
        cost: 2780,
        tacticalWhy: 'Reduce la regeneración de vida enemiga en un 45% y castiga a héroes de alta reserva de salud.',
      },
    ],
    synergies: [
      {
        partnerKey: 'crystal_maiden',
        partnerNameEn: 'Crystal Maiden',
        partnerNameEs: 'Doncella de Cristal',
        comboName: 'Cadena de Hielo y Maná',
        howToExecute: 'CM otorga maná global continuo y fija al objetivo con Frostbite para que ambos descarguen su combo de daño.',
      },
      {
        partnerKey: 'axe',
        partnerNameEn: 'Axe',
        partnerNameEs: 'Axe',
        comboName: 'Provocación y Descarga',
        howToExecute: 'Axe salta con Berserker\'s Call para agrupar a los rivales, permitiendo impactar todas las habilidades de área.',
      },
      {
        partnerKey: 'witch_doctor',
        partnerNameEn: 'Witch Doctor',
        partnerNameEs: 'Médico Brujo',
        comboName: 'Maldición Devastadora',
        howToExecute: 'Maledict amplifica todo el daño infligido en 3 pulsos; el combo conjunto garantiza la eliminación del rival.',
      },
    ],
  };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const HeroCountersSection: React.FC = () => {
  const { heroes: heroConstants, loading } = useConstants();
  const [searchTerm, setSearchTerm] = useState('');
  const [attrFilter, setAttrFilter] = useState<'all' | 'str' | 'agi' | 'int' | 'universal'>('all');
  const [selectedHeroId, setSelectedHeroId] = useState<number>(44); // Default to Phantom Assassin (id 44)

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
      return generateFallbackTactics(44, 'Phantom Assassin', 'agi', ['Carry', 'Escape']);
    }

    const curated = CURATED_HERO_PROFILES[hero.key];
    if (curated) {
      const fallback = generateFallbackTactics(hero.id, hero.name, hero.attr, hero.roles);
      return {
        ...fallback,
        ...curated,
        heroId: hero.id,
        key: hero.key,
        nameEn: hero.name,
        attr: hero.attr,
        counters: curated.counters || fallback.counters,
        antiItems: curated.antiItems || fallback.antiItems,
        synergies: curated.synergies || fallback.synergies,
      };
    }

    return generateFallbackTactics(hero.id, hero.name, hero.attr, hero.roles);
  }, [selectedHeroId, heroList]);

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
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Enciclopedia Interactiva de Héroes, Counters y Sinergias
          </h2>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Haz clic en cualquier héroe para desplegar sus <strong className="text-rose-400">counters conocidos</strong>, qué <strong className="text-amber-400">objetos comprar para anularlo</strong>, y sus <strong className="text-emerald-400">mejores combinaciones de equipo</strong> con explicación paso a paso.
        </p>

        {/* Search & Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar héroe por nombre (ej. Axe, Phantom Assassin, Pudge...)"
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
          <span>Selecciona un héroe ({filteredHeroes.length} encontrados):</span>
          {loading && <span className="text-red-400 animate-pulse">Cargando constantes...</span>}
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
            <HeroThumb heroKey={selectedProfile.key} name={selectedProfile.nameEn} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-red-500/40 shadow-xl" />
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

        {/* 1. Counters Conocidos */}
        <div className="rounded-2xl p-5 border border-rose-500/30 bg-slate-900/80 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white">
              Héroes Counter Conocidos <span className="text-xs text-rose-400 font-normal">(¿Quién le gana y por qué?)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedProfile.counters.map((c, idx) => (
              <div
                key={c.heroKey + idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
              >
                <HeroThumb heroKey={c.heroKey} name={c.nameEn} className="w-12 h-12 rounded-xl border border-rose-500/40" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{c.nameEn}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({c.nameEs})</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mt-1">{c.whyCounter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Qué Objetos Comprar Contra Él */}
        <div className="rounded-2xl p-5 border border-amber-500/30 bg-slate-900/80 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Qué Objetos Comprar Para Pelear Contra Él <span className="text-xs text-amber-400 font-normal">(Anti-Builds)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedProfile.antiItems.map((it, idx) => (
              <div
                key={it.itemKey + idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
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
              Combinaciones para Jugar en Equipo <span className="text-xs text-emerald-400 font-normal">(Sinergias & Combos Explicados)</span>
            </h3>
          </div>

          <div className="space-y-3">
            {selectedProfile.synergies.map((syn, idx) => (
              <div
                key={syn.partnerKey + idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center -space-x-2">
                      <HeroThumb heroKey={selectedProfile.key} name={selectedProfile.nameEn} className="w-9 h-9 rounded-lg border border-slate-700" />
                      <HeroThumb heroKey={syn.partnerKey} name={syn.partnerNameEn} className="w-9 h-9 rounded-lg border-2 border-emerald-500" />
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
