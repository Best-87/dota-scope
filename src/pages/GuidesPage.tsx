import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Swords,
  Package,
  Map,
  Star,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Target,
  Eye,
  Clock,
  ChevronRight,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Crosshair,
  Activity,
  Flame,
  ArrowRight,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Compass,
  BarChart3,
} from 'lucide-react';
import { HeroCountersSection } from '../components/guides/HeroCountersSection';

// ─── TYPES & INTERFACES ───────────────────────────────────────────────────────
type TabId =
  | 'fundamentos'
  | 'tecnicas'
  | 'roles'
  | 'heroes'
  | 'counters'
  | 'items'
  | 'mapa'
  | 'macro'
  | 'parches'
  | 'recursos';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// ─── TABS DEFINITION ──────────────────────────────────────────────────────────
const TABS: Tab[] = [
  { id: 'fundamentos', label: 'Fundamentos', icon: BookOpen, color: 'text-sky-400' },
  { id: 'tecnicas', label: 'Técnicas Pro & Simuladores', icon: Crosshair, color: 'text-amber-400' },
  { id: 'roles', label: 'Roles (1 al 5)', icon: Users, color: 'text-violet-400' },
  { id: 'heroes', label: 'Héroes & Videos', icon: Swords, color: 'text-rose-400' },
  { id: 'counters', label: 'Counters & Sinergias (Todos)', icon: Target, color: 'text-red-400' },
  { id: 'items', label: 'Objetos & Recetas', icon: Package, color: 'text-yellow-400' },
  { id: 'mapa', label: 'Mapa Interactivo', icon: Map, color: 'text-emerald-400' },
  { id: 'macro', label: 'Macro & Pizarra Táctica', icon: TrendingUp, color: 'text-orange-400' },
  { id: 'parches', label: 'Parches & Meta', icon: Activity, color: 'text-pink-400' },
  { id: 'recursos', label: 'Recursos', icon: ExternalLink, color: 'text-teal-400' },
];

// ─── CDN ASSET HELPERS ────────────────────────────────────────────────────────
export const HeroImage: React.FC<{ heroKey: string; name: string; className?: string }> = ({
  heroKey,
  name,
  className = 'w-12 h-12',
}) => {
  const [error, setError] = useState(false);
  const url = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroKey}.png`;
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

export const ItemImage: React.FC<{ itemKey: string; name: string; className?: string }> = ({
  itemKey,
  name,
  className = 'w-10 h-10',
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

// ─── REUSABLE UI CARD UTILITIES ───────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`rounded-2xl p-5 border border-slate-800/90 bg-slate-900/80 shadow-xl ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  color?: string;
}> = ({ icon: Icon, title, subtitle, color = 'text-white' }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <h2 className={`text-base font-bold tracking-tight ${color}`}>{title}</h2>
    </div>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5 ml-7">{subtitle}</p>}
  </div>
);

const Tip: React.FC<{
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'tip';
}> = ({ children, variant = 'tip' }) => {
  const styles: Record<string, string> = {
    info: 'border-sky-500/30 bg-sky-950/40 text-sky-300',
    warning: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
    tip: 'border-violet-500/30 bg-violet-950/40 text-violet-300',
  };
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    tip: Lightbulb,
  };
  const IconC = icons[variant];
  return (
    <div className={`flex gap-2.5 p-3.5 rounded-xl border text-xs leading-relaxed ${styles[variant]}`}>
      <IconC className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = 'bg-slate-800 text-gray-300',
}) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${color}`}>
    {children}
  </span>
);

// ─── INTERACTIVE LAST HIT SIMULATOR COMPONENT ─────────────────────────────────
const LastHitSimulator: React.FC = () => {
  const [healthPercent, setHealthPercent] = useState<number>(35);
  const isKillable = healthPercent <= 18;

  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 my-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-200 flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-amber-400" /> Simulador de Umbral de Last Hit
        </span>
        <Badge color={isKillable ? 'bg-emerald-900/60 text-emerald-300 animate-pulse' : 'bg-rose-900/60 text-rose-300'}>
          {isKillable ? '¡GOLPEA AHORA! (+45g)' : 'DEMASIADO PRONTO'}
        </Badge>
      </div>

      {/* Creep Health Bar */}
      <div className="relative w-full h-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 p-0.5">
        <div
          className={`h-full rounded transition-all duration-300 ${
            isKillable ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-rose-500'
          }`}
          style={{ width: `${healthPercent}%` }}
        />
        {/* Critical threshold line */}
        <div className="absolute top-0 bottom-0 left-[18%] w-0.5 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)] pointer-events-none" />
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
        <span>0 HP</span>
        <span className="text-yellow-400 font-semibold font-mono">Umbral de tu Daño Base (18% HP)</span>
        <span>550 HP (Max)</span>
      </div>

      {/* Interactive slider */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-gray-400">Prueba la vida del creep:</span>
        <input
          type="range"
          min="1"
          max="100"
          value={healthPercent}
          onChange={(e) => setHealthPercent(Number(e.target.value))}
          className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <button
          onClick={() => setHealthPercent(15)}
          className="px-2.5 py-1 text-[11px] rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition"
        >
          Timing Perfecto
        </button>
      </div>
    </div>
  );
};

// ─── INTERACTIVE TREAD SWITCHING SIMULATOR ────────────────────────────────────
const TreadSwitchSimulator: React.FC = () => {
  const [activeStat, setActiveStat] = useState<'str' | 'agi' | 'int'>('str');

  const statData = {
    str: {
      name: 'Fuerza (Strength)',
      color: 'border-red-500/50 bg-red-950/20 text-red-300',
      badge: 'bg-red-900/60 text-red-200',
      bonus: '+10 Fuerza (+220 Salud y regeneración de vida)',
      when: '¡EN PELIGRO O PELEAS! Actívalas cuando te sorprendan, antes de que te stunee un enemigo o cuando recibas daño masivo.',
    },
    agi: {
      name: 'Agilidad (Agility)',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
      badge: 'bg-emerald-900/60 text-emerald-200',
      bonus: '+10 Agilidad (+10 Velocidad de Ataque y +1.7 Armadura)',
      when: '¡AL CURARTE CON POCIONES! Tu vida máxima baja temporalmente, logrando que el Tango o Healing Salve te llenen mucho más porcentaje.',
    },
    int: {
      name: 'Inteligencia (Intelligence)',
      color: 'border-sky-500/50 bg-sky-950/20 text-sky-300',
      badge: 'bg-sky-900/60 text-sky-200',
      bonus: '+10 Inteligencia (+120 Maná y regeneración)',
      when: '¡JUSTO ANTES DE LANZAR UN HECHIZO! Gasta maná sobre una reserva mayor; al volver a Fuerza/Agilidad conservarás un porcentaje mayor.',
    },
  }[activeStat];

  return (
    <div className={`p-4 rounded-xl border ${statData.color} transition-all duration-300 my-3`}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <ItemImage itemKey="power_treads" name="Power Treads" className="w-10 h-10 rounded-lg" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Power Treads</span>
              <Badge color={statData.badge}>{statData.name}</Badge>
            </div>
            <div className="text-[11px] text-gray-300 mt-0.5">{statData.bonus}</div>
          </div>
        </div>

        {/* Buttons to toggle */}
        <div className="flex gap-1.5">
          {(['str', 'agi', 'int'] as const).map((stat) => (
            <button
              key={stat}
              onClick={() => setActiveStat(stat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                activeStat === stat
                  ? stat === 'str'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                    : stat === 'agi'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                    : 'bg-sky-600 text-white shadow-lg shadow-sky-900/50'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {stat === 'str' ? 'Fuerza' : stat === 'agi' ? 'Agilidad' : 'Inteligencia'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs leading-relaxed text-gray-300">
        <strong className="text-amber-400">Cuándo activarla: </strong> {statData.when}
      </div>
    </div>
  );
};

// ─── INTERACTIVE MAP COMPONENT ────────────────────────────────────────────────
interface MapPoint {
  id: string;
  name: string;
  category: 'roshan' | 'tormentor' | 'ward' | 'rune';
  x: number; // percentage 0-100
  y: number;
  desc: string;
  timing?: string;
  image?: string;
}

const MAP_POINTS: MapPoint[] = [
  {
    id: 'roshan_day',
    name: 'Foso de Roshan (Día)',
    category: 'roshan',
    x: 78,
    y: 84,
    desc: 'Roshan habita este foso durante el día (0:00 - 5:00, 10:00 - 15:00...). Otorga el Aegis of the Immortal.',
    timing: '☀️ De Día',
    image: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aegis.png',
  },
  {
    id: 'roshan_night',
    name: 'Foso de Roshan (Noche)',
    category: 'roshan',
    x: 22,
    y: 16,
    desc: 'Roshan camina por el portal gemelo hacia este foso durante la noche (5:00 - 10:00, 15:00 - 20:00...).',
    timing: '🌙 De Noche',
    image: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aegis.png',
  },
  {
    id: 'tormentor_radiant',
    name: 'Tormentor Radiant',
    category: 'tormentor',
    x: 14,
    y: 68,
    desc: 'Estructura neutral que refleja daño. Otorga un Aghanim\'s Shard gratuito al equipo al ser destruido.',
    timing: '⏱️ Minuto 20:00',
  },
  {
    id: 'tormentor_dire',
    name: 'Tormentor Dire',
    category: 'tormentor',
    x: 86,
    y: 32,
    desc: 'Tormentor del bando Temible. Requiere al menos 2 o 3 héroes para repartir el daño reflejado.',
    timing: '⏱️ Minuto 20:00',
  },
  {
    id: 'wisdom_radiant',
    name: 'Runa de Sabiduría Radiant',
    category: 'rune',
    x: 10,
    y: 86,
    desc: 'Otorga un salto masivo de experiencia para nivelar a los supports del equipo.',
    timing: '⏱️ Minuto 7:00 y cada 7 min',
  },
  {
    id: 'wisdom_dire',
    name: 'Runa de Sabiduría Dire',
    category: 'rune',
    x: 90,
    y: 14,
    desc: 'Runa de experiencia del lado Dire. ¡Robarla al enemigo les quita un nivel crucial!',
    timing: '⏱️ Minuto 7:00 y cada 7 min',
  },
  {
    id: 'river_rune_top',
    name: 'Runa de Poder (Río Superior)',
    category: 'rune',
    x: 42,
    y: 38,
    desc: 'Punto de aparición de Runas de Daño Doble, Haste, Invisibilidad, Regeneración o Ilusión.',
    timing: '⏱️ Minuto 6:00 y cada 2 min',
  },
  {
    id: 'river_rune_bot',
    name: 'Runa de Poder (Río Inferior)',
    category: 'rune',
    x: 58,
    y: 62,
    desc: 'Segundo punto en el río. Solo una de las dos runas de río aparece a la vez desde el min 6.',
    timing: '⏱️ Minuto 6:00 y cada 2 min',
  },
  {
    id: 'ward_cliff_mid',
    name: 'Risco de Visión Central (Mid Cliff)',
    category: 'ward',
    x: 52,
    y: 48,
    desc: 'Punto elevado que otorga visión de ambos accesos al río y el carril central.',
    timing: '👁️ Observer Ward',
  },
  {
    id: 'ward_triangle_radiant',
    name: 'Colina del Triángulo Radiant',
    category: 'ward',
    x: 36,
    y: 68,
    desc: 'Protege a tu Carry mientras farmea los campamentos ancianos de la jungla.',
    timing: '👁️ Observer Ward',
  },
];

const InteractiveDotaMap: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint>(MAP_POINTS[0]);
  const [filter, setFilter] = useState<'all' | 'roshan' | 'tormentor' | 'rune' | 'ward'>('all');

  const filteredPoints =
    filter === 'all' ? MAP_POINTS : MAP_POINTS.filter((p) => p.category === filter);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { id: 'all', label: 'Todos los Puntos' },
          { id: 'roshan', label: 'Roshan (Día / Noche)' },
          { id: 'tormentor', label: 'Tormentors' },
          { id: 'rune', label: 'Runas (Wisdom / Power)' },
          { id: 'ward', label: 'Wards Estratégicos' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === f.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-800/80 text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visual Map Representation */}
        <div className="md:col-span-2 relative aspect-square w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl p-4 flex items-center justify-center">
          {/* Base SVG Map Grid */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Radiant Territory (Green Tint) */}
            <polygon points="0,50 50,100 0,100" fill="#064e3b" opacity="0.25" />
            {/* Dire Territory (Red Tint) */}
            <polygon points="50,0 100,0 100,50" fill="#881337" opacity="0.25" />
            {/* River (Diagonal Blue Path) */}
            <line x1="0" y1="20" x2="80" y2="100" stroke="#0284c7" strokeWidth="6" strokeOpacity="0.4" strokeLinecap="round" />
            <line x1="20" y1="0" x2="100" y2="80" stroke="#0284c7" strokeWidth="6" strokeOpacity="0.4" strokeLinecap="round" />
            {/* Lanes */}
            <path d="M 10 90 L 10 15 L 85 15" stroke="#334155" strokeWidth="2" fill="none" strokeDasharray="2,2" />
            <path d="M 15 85 L 85 15" stroke="#334155" strokeWidth="2.5" fill="none" />
            <path d="M 15 85 L 90 85 L 90 10" stroke="#334155" strokeWidth="2" fill="none" strokeDasharray="2,2" />
            {/* Bases */}
            <circle cx="12" cy="88" r="5" fill="#10b981" opacity="0.8" />
            <circle cx="88" cy="12" r="5" fill="#ef4444" opacity="0.8" />
          </svg>

          {/* Interactive Marker Pins */}
          {filteredPoints.map((pt) => {
            const isSelected = selectedPoint.id === pt.id;
            const markerColors = {
              roshan: 'bg-amber-500 border-amber-300 text-amber-950',
              tormentor: 'bg-violet-500 border-violet-300 text-violet-950',
              rune: 'bg-sky-500 border-sky-300 text-sky-950',
              ward: 'bg-emerald-500 border-emerald-300 text-emerald-950',
            }[pt.category];

            return (
              <button
                key={pt.id}
                onClick={() => setSelectedPoint(pt)}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-[10px] transition-all transform hover:scale-125 z-10 ${markerColors} ${
                  isSelected ? 'ring-4 ring-white scale-125 shadow-lg' : 'opacity-85 hover:opacity-100'
                }`}
                title={pt.name}
              >
                {pt.category === 'roshan' ? 'R' : pt.category === 'tormentor' ? 'T' : pt.category === 'ward' ? 'W' : '✦'}
              </button>
            );
          })}
        </div>

        {/* Selected Marker Detail Card */}
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge
                color={
                  selectedPoint.category === 'roshan'
                    ? 'bg-amber-900/60 text-amber-300'
                    : selectedPoint.category === 'tormentor'
                    ? 'bg-violet-900/60 text-violet-300'
                    : selectedPoint.category === 'ward'
                    ? 'bg-emerald-900/60 text-emerald-300'
                    : 'bg-sky-900/60 text-sky-300'
                }
              >
                {selectedPoint.category.toUpperCase()}
              </Badge>
              {selectedPoint.timing && (
                <span className="text-[11px] text-amber-400 font-mono">{selectedPoint.timing}</span>
              )}
            </div>

            <h3 className="text-base font-bold text-white mb-2">{selectedPoint.name}</h3>
            <p className="text-xs text-gray-300 leading-relaxed">{selectedPoint.desc}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-gray-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Toca cualquier punto del mapa para inspeccionar sus características.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TACTICAL TEAMFIGHT BOARD COMPONENT ────────────────────────────────────────
const TacticalTeamfightBoard: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 my-3">
      <div className="text-xs font-bold text-white flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-orange-400" /> Pizarra Táctica: Formación Ideal de Teamfight
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-center">
        {/* 1. Iniciador / Tanque */}
        <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 flex flex-col items-center">
          <Badge color="bg-red-900/60 text-red-300 mb-2">Línea de Choque (Front)</Badge>
          <HeroImage heroKey="axe" name="Axe" className="w-12 h-12 rounded-xl mb-1.5" />
          <div className="text-xs font-bold text-white">Pos 3: Offlaner</div>
          <div className="text-[11px] text-gray-400 mt-1">Salta primero con Blink, absorbe el daño y bloquea al enemigo.</div>
        </div>

        {/* 2. Creador de Juego */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col items-center">
          <Badge color="bg-emerald-900/60 text-emerald-300 mb-2">Flanco / Roamer</Badge>
          <HeroImage heroKey="lion" name="Lion" className="w-12 h-12 rounded-xl mb-1.5" />
          <div className="text-xs font-bold text-white">Pos 4: Soft Support</div>
          <div className="text-[11px] text-gray-400 mt-1">Stuns en cadena y silencio para evitar que los rivales usen BKB.</div>
        </div>

        {/* 3. Daño Principal */}
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col items-center">
          <Badge color="bg-amber-900/60 text-amber-300 mb-2">Núcleo de Daño</Badge>
          <HeroImage heroKey="skeleton_king" name="Wraith King" className="w-12 h-12 rounded-xl mb-1.5" />
          <div className="text-xs font-bold text-white">Pos 1: Carry</div>
          <div className="text-[11px] text-gray-400 mt-1">Entra 2 segundos después del inicio a limpiar con BKB activa.</div>
        </div>

        {/* 4. Soporte Retaguardia */}
        <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 flex flex-col items-center">
          <Badge color="bg-sky-900/60 text-sky-300 mb-2">Retaguardia (Backline)</Badge>
          <HeroImage heroKey="crystal_maiden" name="Crystal Maiden" className="w-12 h-12 rounded-xl mb-1.5" />
          <div className="text-xs font-bold text-white">Pos 5: Hard Support</div>
          <div className="text-[11px] text-gray-400 mt-1">Curación, Glimmer Cape y salvar al carry sin exponerse.</div>
        </div>
      </div>
    </div>
  );
};

// ─── TAB 1: FUNDAMENTOS ───────────────────────────────────────────────────────
const TabFundamentos: React.FC = () => (
  <div className="space-y-5">
    <Card>
      <SectionTitle icon={Star} title="¿Qué es Dota 2?" subtitle="Objetivo esencial de la partida" color="text-sky-400" />
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        Dota 2 es un MOBA de 5 vs 5 desarrollado por Valve. Dos bandos opuestos —{' '}
        <span className="text-emerald-400 font-semibold">The Radiant / Los Radiantes</span> (esquina suroeste) y{' '}
        <span className="text-rose-400 font-semibold">The Dire / Los Temibles</span> (esquina noreste) — compiten
        por destruir el <span className="text-amber-400 font-semibold">Trono Ancestral (Ancient)</span> en el corazón
        de la base enemiga.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="text-xl font-bold text-amber-400">125+ Héroes</div>
          <div className="text-[11px] text-gray-400 mt-1">100% gratuitos y desbloqueados desde el inicio</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="text-xl font-bold text-emerald-400">3 Carriles (Lanes)</div>
          <div className="text-[11px] text-gray-400 mt-1">Safelane, Midlane y Offlane</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="text-xl font-bold text-rose-400">5 Jugadores</div>
          <div className="text-[11px] text-gray-400 mt-1">Posiciones del 1 al 5 por prioridad de oro</div>
        </div>
      </div>
    </Card>

    <Card>
      <SectionTitle
        icon={Target}
        title="Mecánica Fundamental: Last Hit & Deny"
        subtitle="Entrena tu vista para asegurar cada moneda de oro"
        color="text-sky-400"
      />
      <p className="text-xs text-gray-300 leading-relaxed mb-2">
        En Dota 2 <strong className="text-white">NO recibes oro</strong> por desgastar a una creatura enemiga.
        Únicamente el jugador que da el golpe letal recibe la recompensa.
      </p>

      {/* Visual Interactive Simulator */}
      <LastHitSimulator />

      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 mt-3">
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-bold text-white">Deny (Negación de Creeps y Torres)</span>
          </div>
          <Badge color="bg-rose-900/60 text-rose-300">Control de Experiencia</Badge>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Puedes atacar a tus propios creeps aliados cuando su vida cae por debajo del 50% (o tus torres bajo el 10%).
          Al matarlos tú mismo, le arrebatas el 100% del oro al rival y reduces la experiencia que recibe a la mitad.
        </p>
      </div>
    </Card>

    <div className="space-y-2">
      <Tip variant="success">
        <strong>Modo Nuevo Jugador (New Player Mode):</strong> Recomendado para tus primeros 20 juegos. Utiliza un grupo
        restringido de héroes fáciles, reemplaza aliados desconectados con bots inteligentes y no impone penalizaciones.
      </Tip>
      <Tip variant="warning">
        <strong>Consumibles de Línea:</strong> Nunca vayas a tu carril con 0 objetos de curación. Si te dejan con poca vida
        y no tienes <span className="font-semibold text-emerald-300">Tango</span> o{' '}
        <span className="font-semibold text-emerald-300">Healing Salve</span>, perderás minutos enteros caminando a base.
      </Tip>
    </div>
  </div>
);

// ─── TAB 2: TÉCNICAS PRO & SIMULADORES ─────────────────────────────────────────
const TabTecnicas: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Crosshair}
        title="Simuladores y Técnicas de Nivel Profesional"
        subtitle="Mecánicas avanzadas que marcan la diferencia en cada partida"
        color="text-amber-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed">
        Domina los secretos de la micro y macro economía de Dota 2 con explicaciones visuales paso a paso y herramientas interactivas.
      </p>
    </Card>

    {/* Tread Switching Interactive Simulator */}
    <Card className="border border-amber-500/30">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Simulador Interactivo: Tread Switching (Alternancia de Botas)</h3>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed mb-1">
        Toca los botones para ver cómo cambian las estadísticas en tiempo real y cuándo debes utilizar cada modo en partida:
      </p>
      <TreadSwitchSimulator />
    </Card>

    {/* Stacking Guide with Visual Flow */}
    <Card className="border border-slate-800">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Camp Stacking (Stackear Campamentos Neutrales)</h3>
        </div>
        <Badge color="bg-emerald-900/60 text-emerald-300">⏱️ :53 a :55 de cada minuto</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs my-3">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-sm font-bold text-amber-400 mb-1">Paso 1: Segundo :50</div>
          <div className="text-gray-300">Posiciónate junto al campamento de la jungla y prepara tu ataque.</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-sm font-bold text-emerald-400 mb-1">Paso 2: Segundo :53</div>
          <div className="text-gray-300">¡Golpea a los neutrales y sal corriendo en dirección opuesta!</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <div className="text-sm font-bold text-sky-400 mb-1">Paso 3: Segundo :00</div>
          <div className="text-gray-300">El campamento está vacío: el juego genera una nueva camada completa.</div>
        </div>
      </div>
      <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2.5 rounded-xl border border-amber-900/40">
        💡 Impacto: Limpiar un campamento con triple stack le otorga a tu Carry más de 600 de oro instantáneo.
      </div>
    </Card>

    {/* Creep Aggro Visual Guide */}
    <Card className="border border-slate-800">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white">Creep Aggro (Manipulación de Hostilidad)</h3>
        </div>
        <Badge color="bg-violet-900/60 text-violet-300">⏱️ 3 segundos de enfriamiento</Badge>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed mb-3">
        Fuerza a los creeps enemigos a dejar de atacar a tus aliados y caminar hacia ti para poder darles last hit desde un lugar seguro.
      </p>
      <div className="space-y-1.5 text-xs text-gray-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
          <span>Ponte a menos de 500 unidades de los creeps enemigos.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
          <span>Haz clic derecho de ataque directamente sobre cualquier héroe enemigo (incluso en otra línea).</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
          <span>Camina hacia atrás; los creeps te seguirán hasta tu terreno seguro.</span>
        </div>
      </div>
    </Card>
  </div>
);

// ─── TAB 3: ROLES (1 AL 5) ───────────────────────────────────────────────────
interface RoleDef {
  pos: number;
  nameEs: string;
  nameEn: string;
  lane: string;
  farm: string;
  colorBorder: string;
  badge: string;
  summary: string;
  heroes: { key: string; nameEn: string; nameEs: string }[];
  keyDuties: string[];
}

const ROLES_DETAILED: RoleDef[] = [
  {
    pos: 1,
    nameEs: 'Carry / Núcleo Duro',
    nameEn: 'Hard Carry',
    lane: 'Safelane (Línea Segura)',
    farm: 'Prioridad 1 (Máxima)',
    colorBorder: 'border-amber-500/40 bg-amber-950/10',
    badge: 'bg-amber-900/60 text-amber-300',
    summary: 'Comienza débil. Su meta es farmear oro constantemente para convertirse en el arma definitiva del juego tardío.',
    heroes: [
      { key: 'skeleton_king', nameEn: 'Wraith King', nameEs: 'Rey Fantasma' },
      { key: 'phantom_assassin', nameEn: 'Phantom Assassin', nameEs: 'Asesina Fantasma' },
      { key: 'juggernaut', nameEn: 'Juggernaut', nameEs: 'Juggernaut' },
      { key: 'luna', nameEn: 'Luna', nameEs: 'Luna' },
      { key: 'antimage', nameEn: 'Anti-Mage', nameEs: 'Anti-Mago' },
    ],
    keyDuties: [
      'No forzar peleas antes de conseguir tu ítem de aceleración (Battle Fury / Maelstrom / Yasha).',
      'Aprender rutas de jungla optimizadas para no dejar ningún campamento sin limpiar.',
      'Priorizar siempre torres y el Trono Ancestral por encima de cazar kills innecesarias.',
    ],
  },
  {
    pos: 2,
    nameEs: 'Midlaner / Solitario Central',
    nameEn: 'Midlaner',
    lane: 'Midlane (Carril Central)',
    farm: 'Prioridad 2 (Alta)',
    colorBorder: 'border-violet-500/40 bg-violet-950/10',
    badge: 'bg-violet-900/60 text-violet-300',
    summary: 'Gana experiencia y niveles en solitario. Dicta el ritmo del early-mid game y apoya los carriles laterales.',
    heroes: [
      { key: 'sniper', nameEn: 'Sniper', nameEs: 'Francotirador' },
      { key: 'dragon_knight', nameEn: 'Dragon Knight', nameEs: 'Caballero Dragón' },
      { key: 'viper', nameEn: 'Viper', nameEs: 'Víbora' },
      { key: 'queenofpain', nameEn: 'Queen of Pain', nameEs: 'Reina del Dolor' },
      { key: 'lina', nameEn: 'Lina', nameEs: 'Lina' },
    ],
    keyDuties: [
      'Controlar las Runas de Poder en el río al minuto 6:00 y cada 2 minutos.',
      'Rotar a la línea lateral más vulnerable para un gank en cuanto desbloquees nivel 6.',
      'Presionar la torre central enemiga para abrir todo el mapa a tu equipo.',
    ],
  },
  {
    pos: 3,
    nameEs: 'Offlaner / Tanque Iniciador',
    nameEn: 'Offlaner',
    lane: 'Offlane (Línea Dura)',
    farm: 'Prioridad 3 (Media)',
    colorBorder: 'border-rose-500/40 bg-rose-950/10',
    badge: 'bg-rose-900/60 text-rose-300',
    summary: 'Piedra angular de choque. Su objetivo es hostigar al carry rival, iniciar las peleas con salto y portar auras de equipo.',
    heroes: [
      { key: 'axe', nameEn: 'Axe', nameEs: 'Axe / Hacha' },
      { key: 'bristleback', nameEn: 'Bristleback', nameEs: 'Espaldaespinada' },
      { key: 'centaur', nameEn: 'Centaur Warrunner', nameEs: 'Centauro' },
      { key: 'mars', nameEn: 'Mars', nameEs: 'Marte' },
      { key: 'tidehunter', nameEn: 'Tidehunter', nameEs: 'Cazador de Mareas' },
    ],
    keyDuties: [
      'Comprar Blink Dagger para iniciar peleas antes de que el rival reaccione.',
      'Armar auras vitales como Pipe of Insight o Crimson Guard.',
      'Absorber los hechizos del enemigo para que tus aliados no sufran daño.',
    ],
  },
  {
    pos: 4,
    nameEs: 'Soft Support / Soporte Móvil',
    nameEn: 'Soft Support (Roamer)',
    lane: 'Offlane (apoyando al Pos 3)',
    farm: 'Prioridad 4 (Baja)',
    colorBorder: 'border-emerald-500/40 bg-emerald-950/10',
    badge: 'bg-emerald-900/60 text-emerald-300',
    summary: 'El creador de juego. Ayuda a su offlaner pero rota a mid, roba runas y compra ítems activos como Force Staff o Blink.',
    heroes: [
      { key: 'lion', nameEn: 'Lion', nameEs: 'León' },
      { key: 'rubick', nameEn: 'Rubick', nameEs: 'Rubick' },
      { key: 'mirana', nameEn: 'Mirana', nameEs: 'Mirana' },
      { key: 'marci', nameEn: 'Marci', nameEs: 'Marci' },
      { key: 'shadow_shaman', nameEn: 'Shadow Shaman', nameEs: 'Chamán de las Sombras' },
    ],
    keyDuties: [
      'Asegurar las Runas de Sabiduría (Wisdom Runes) al minuto 7:00 y 14:00.',
      'Coordinar emboscadas con Smoke of Deceit junto al Pos 2 o Pos 3.',
      'Contestar el campamento pequeño rival y castigar los pulls enemigos.',
    ],
  },
  {
    pos: 5,
    nameEs: 'Hard Support / Soporte Principal',
    nameEn: 'Hard Support (Ward)',
    lane: 'Safelane (protegiendo al Pos 1)',
    farm: 'Prioridad 5 (Mínima)',
    colorBorder: 'border-sky-500/40 bg-sky-950/10',
    badge: 'bg-sky-900/60 text-sky-300',
    summary: 'El protector abnegado. Sacrifica su oro en visión (Wards), polvo de invisibilidad, curación y stacks para el Carry.',
    heroes: [
      { key: 'crystal_maiden', nameEn: 'Crystal Maiden', nameEs: 'Doncella de Cristal' },
      { key: 'abaddon', nameEn: 'Abaddon', nameEs: 'Abaddon' },
      { key: 'warlock', nameEn: 'Warlock', nameEs: 'Brujo' },
      { key: 'witch_doctor', nameEn: 'Witch Doctor', nameEs: 'Médico Brujo' },
      { key: 'disruptor', nameEn: 'Disruptor', nameEs: 'Disruptor' },
    ],
    keyDuties: [
      'Mantener Observer y Sentry Wards activos permanentemente en el mapa.',
      'Hacer pulls para restablecer el equilibrio de la oleada cerca de tu torre.',
      'Sacrificar tu propia vida en una pelea si con ello logras que tu Carry escape.',
    ],
  },
];

const TabRoles: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Users}
        title="El Sistema de Posiciones (1 al 5)"
        subtitle="División económica y estratégica de un equipo competitivo"
        color="text-violet-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        En Dota 2 el oro en el mapa es finito. Por eso, los equipos dividen el trabajo entre{' '}
        <strong className="text-amber-400">Cores (Pos 1, 2, 3)</strong>, que reciben el oro, y{' '}
        <strong className="text-sky-400">Supports (Pos 4, 5)</strong>, que operan con bajo presupuesto.
      </p>
    </Card>

    {ROLES_DETAILED.map((r) => (
      <Card key={r.pos} className={`border ${r.colorBorder}`}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Badge color={r.badge}>Posición {r.pos}</Badge>
            <h3 className="text-base font-bold text-white">
              {r.nameEs} <span className="text-xs text-gray-400 font-normal">({r.nameEn})</span>
            </h3>
          </div>
          <span className="text-xs font-mono text-gray-400">{r.farm}</span>
        </div>

        <div className="text-xs text-amber-300/90 font-medium mb-3">📍 {r.lane}</div>
        <p className="text-xs text-gray-300 leading-relaxed mb-4">{r.summary}</p>

        {/* Hero visual grid */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-400 mb-2">Héroes emblemáticos recomendados:</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {r.heroes.map((h) => (
              <div
                key={h.key}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80"
              >
                <HeroImage heroKey={h.key} name={h.nameEn} className="w-9 h-9 rounded-lg" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{h.nameEn}</div>
                  <div className="text-[10px] text-gray-400 truncate">{h.nameEs}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
          {r.keyDuties.map((duty, idx) => (
            <div key={idx} className="flex gap-2 items-start text-xs text-gray-300">
              <ChevronRight className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>{duty}</span>
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// ─── TAB 4: HÉROES & VIDEOS ───────────────────────────────────────────────────
interface HeroProfile {
  key: string;
  nameEn: string;
  nameEs: string;
  role: string;
  attribute: 'Fuerza (STR)' | 'Agilidad (AGI)' | 'Inteligencia (INT)' | 'Universal';
  difficulty: 'Fácil ★☆☆' | 'Medio ★★☆' | 'Difícil ★★★';
  diffColor: string;
  whyPlay: string;
  keySkill: string;
  videoUrl?: string;
  coreItem: { key: string; nameEn: string; nameEs: string };
}

const HEROES_CATALOG: HeroProfile[] = [
  {
    key: 'skeleton_king',
    nameEn: 'Wraith King',
    nameEs: 'Rey Fantasma',
    role: 'Carry · Posición 1',
    attribute: 'Fuerza (STR)',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Ideal para novatos: su ultimate Reincarnation lo revive automáticamente al morir en combate.',
    keySkill: 'Reincarnation (Reencarnación)',
    videoUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/abilities/skeleton_king/skeleton_king_reincarnation.mp4',
    coreItem: { key: 'armlet', nameEn: 'Armlet of Mordiggian', nameEs: 'Brazalete de Mordiggian' },
  },
  {
    key: 'juggernaut',
    nameEn: 'Juggernaut (Yurnero)',
    nameEs: 'El Juggernaut',
    role: 'Carry · Posición 1',
    attribute: 'Agilidad (AGI)',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Omnislash devastador que ataca mientras es invulnerable, más giro de espada para escapar con inmunidad mágica.',
    keySkill: 'Omnislash (Omnicorte)',
    videoUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/abilities/juggernaut/juggernaut_omni_slash.mp4',
    coreItem: { key: 'bfury', nameEn: 'Battle Fury', nameEs: 'Furia de Batalla' },
  },
  {
    key: 'sniper',
    nameEn: 'Sniper (Kardel)',
    nameEs: 'El Francotirador',
    role: 'Midlaner · Posición 2',
    attribute: 'Agilidad (AGI)',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'El mayor alcance de ataque del juego. Enseña a atacar desde la línea trasera con total seguridad.',
    keySkill: 'Assassinate (Asesinato)',
    videoUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/abilities/sniper/sniper_assassinate.mp4',
    coreItem: { key: 'dragon_lance', nameEn: 'Dragon Lance', nameEs: 'Lanza del Dragón' },
  },
  {
    key: 'axe',
    nameEn: 'Axe (Mogul Khan)',
    nameEs: 'Hacha (Axe)',
    role: 'Offlaner · Posición 3',
    attribute: 'Fuerza (STR)',
    difficulty: 'Medio ★★☆',
    diffColor: 'bg-amber-900/60 text-amber-300',
    whyPlay: 'El rey de la iniciación. Salta con Blink Dagger, provoca a todos los enemigos a atacarlo y los destroza con contraataques.',
    keySkill: "Berserker's Call (Llamada del Berserker)",
    videoUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/abilities/axe/axe_berserkers_call.mp4',
    coreItem: { key: 'blade_mail', nameEn: 'Blade Mail', nameEs: 'Cota de Cuchillas' },
  },
  {
    key: 'crystal_maiden',
    nameEn: 'Crystal Maiden (Rylai)',
    nameEs: 'Doncella de Cristal',
    role: 'Hard Support · Posición 5',
    attribute: 'Inteligencia (INT)',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Su aura pasiva regenera maná para TODOS los aliados en el mapa. Posee una tormenta de nieve épica.',
    keySkill: 'Freezing Field (Campo Helado)',
    videoUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/abilities/crystal_maiden/crystal_maiden_freezing_field.mp4',
    coreItem: { key: 'glimmer_cape', nameEn: 'Glimmer Cape', nameEs: 'Capa Fulgurante' },
  },
];

const TabHeroes: React.FC = () => {
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(HEROES_CATALOG[0].key);

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          icon={Swords}
          title="Catálogo Visual con Videos de Habilidades Oficiales"
          subtitle="Aprende viendo las habilidades reales en acción alojadas por Valve"
          color="text-rose-400"
        />
        <p className="text-sm text-gray-300 leading-relaxed">
          Cada héroe incluye fotos oficiales, nombres bilingües y clips de video directos de los servidores de Valve.
        </p>
      </Card>

      <div className="grid gap-4">
        {HEROES_CATALOG.map((h) => {
          const isVideoOpen = activeVideoKey === h.key;
          return (
            <Card key={h.key} className="border border-slate-800/90 hover:border-slate-700 transition-all">
              <div className="flex items-start gap-3.5">
                <HeroImage heroKey={h.key} name={h.nameEn} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{h.nameEn}</span>
                        <span className="text-xs text-gray-400 font-normal">/ {h.nameEs}</span>
                      </h3>
                      <div className="text-xs text-amber-400 font-medium">{h.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color="bg-slate-800 text-gray-300 font-mono">{h.attribute}</Badge>
                      <Badge color={h.diffColor}>{h.difficulty}</Badge>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mt-2">{h.whyPlay}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
                    <div className="text-xs">
                      <span className="text-gray-400 font-semibold">Habilidad Clave: </span>
                      <span className="text-white font-medium">{h.keySkill}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 font-semibold">Ítem Esencial: </span>
                      <ItemImage itemKey={h.coreItem.key} name={h.coreItem.nameEn} className="w-6 h-6 rounded" />
                      <span className="text-amber-300 font-medium">
                        {h.coreItem.nameEn} ({h.coreItem.nameEs})
                      </span>
                    </div>
                  </div>

                  {/* Video Toggle Button */}
                  {h.videoUrl && (
                    <button
                      onClick={() => setActiveVideoKey(isVideoOpen ? null : h.key)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-semibold transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                      <span>{isVideoOpen ? 'Ocultar Video' : `Ver Demostración: ${h.keySkill}`}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Embedded Valve Official Video */}
              {isVideoOpen && h.videoUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-red-500/40 bg-black shadow-2xl">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Play className="w-3 h-3 text-red-400 fill-red-400" /> Clip Oficial Valve: {h.keySkill}
                    </span>
                    <span className="text-gray-500 font-mono">1080p MP4</span>
                  </div>
                  <video
                    src={h.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ─── TAB 5: OBJETOS & RECETAS ─────────────────────────────────────────────────
interface ItemProfile {
  key: string;
  nameEn: string;
  nameEs: string;
  category: 'Inicial' | 'Botas' | 'Iniciación' | 'Daño' | 'Soporte';
  cost: number;
  description: string;
  components?: { key: string; name: string; cost: number }[];
}

const ITEMS_CATALOG: ItemProfile[] = [
  {
    key: 'power_treads',
    nameEn: 'Power Treads',
    nameEs: 'Botas de Poder',
    category: 'Botas',
    cost: 1400,
    description: '+45 de velocidad, +25 de ataque y +10 de atributo alternable.',
    components: [
      { key: 'boots', name: 'Boots of Speed', cost: 500 },
      { key: 'gloves', name: 'Gloves of Haste', cost: 450 },
      { key: 'belt_of_strength', name: 'Belt of Strength', cost: 450 },
    ],
  },
  {
    key: 'black_king_bar',
    nameEn: 'Black King Bar (BKB)',
    nameEs: 'Barra del Rey Negro',
    category: 'Iniciación',
    cost: 4050,
    description: 'Inmunidad a Debuffs e inmunidad mágica de 9 a 6 segundos.',
    components: [
      { key: 'ogre_axe', name: 'Ogre Axe', cost: 1000 },
      { key: 'mithril_hammer', name: 'Mithril Hammer', cost: 1600 },
      { key: 'recipe', name: 'Receta de BKB', cost: 1450 },
    ],
  },
  {
    key: 'blink',
    nameEn: 'Blink Dagger',
    nameEs: 'Daga de Traslación',
    category: 'Iniciación',
    cost: 2250,
    description: 'Teletransportación instantánea de 1200 unidades para iniciar peleas.',
  },
  {
    key: 'bfury',
    nameEn: 'Battle Fury',
    nameEs: 'Furia de Batalla',
    category: 'Daño',
    cost: 4100,
    description: 'Daño en hendidura (Cleave) para farmear toda la jungla de golpe.',
    components: [
      { key: 'broadsword', name: 'Broadsword', cost: 1000 },
      { key: 'claymore', name: 'Claymore', cost: 1350 },
      { key: 'ring_of_health', name: 'Ring of Health', cost: 700 },
      { key: 'void_stone', name: 'Void Stone', cost: 700 },
    ],
  },
  {
    key: 'glimmer_cape',
    nameEn: 'Glimmer Cape',
    nameEs: 'Capa Fulgurante',
    category: 'Soporte',
    cost: 2150,
    description: 'Invisibilidad de 5s y escudo mágico de 300 puntos para salvar aliados.',
    components: [
      { key: 'shadow_amulet', name: 'Shadow Amulet', cost: 1000 },
      { key: 'cloak', name: 'Cloak', cost: 800 },
      { key: 'recipe', name: 'Receta', cost: 350 },
    ],
  },
];

const TabItems: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Package}
        title="Guía Visual de Objetos y Árboles de Construcción"
        subtitle="Aprende cómo forjar cada ítem con sus componentes oficiales"
        color="text-yellow-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed">
        Conocer los componentes te permite comprar por partes desde la tienda lateral o secreta mientras farmeas en el carril.
      </p>
    </Card>

    <div className="grid gap-3">
      {ITEMS_CATALOG.map((it) => (
        <Card key={it.key} className="border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-start gap-3">
            <ItemImage itemKey={it.key} name={it.nameEn} className="w-14 h-14 rounded-xl border-amber-500/30" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{it.nameEn}</span>
                    <span className="text-xs text-gray-400 font-normal">/ {it.nameEs}</span>
                  </h3>
                  <div className="text-[11px] text-amber-400 font-mono font-semibold">🪙 {it.cost} de oro</div>
                </div>
                <Badge color="bg-slate-800 text-amber-300">{it.category}</Badge>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mt-1.5">{it.description}</p>

              {/* Recipe tree visualization */}
              {it.components && it.components.length > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[11px] font-semibold text-gray-400 mb-2">Receta / Componentes:</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {it.components.map((comp, idx) => (
                      <React.Fragment key={comp.key + idx}>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                          <ItemImage itemKey={comp.key} name={comp.name} className="w-6 h-6 rounded" />
                          <div>
                            <div className="text-gray-200 font-medium truncate max-w-[100px]">{comp.name}</div>
                            <div className="text-amber-400/90 font-mono text-[10px]">{comp.cost}g</div>
                          </div>
                        </div>
                        {idx < it.components!.length - 1 && <span className="text-gray-600 font-bold">+</span>}
                      </React.Fragment>
                    ))}
                    <span className="text-amber-400 font-bold mx-1">=</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{it.cost}g</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ─── TAB 6: MAPA & VISIÓN (MAPA INTERACTIVO) ──────────────────────────────────
const TabMapa: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Map}
        title="Mapa Táctico Interactivo de Dota 2"
        subtitle="Explora fosos de Roshan, Tormentors, Wards y Runas"
        color="text-emerald-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        Toca los marcadores del mapa para ver los horarios de aparición, funciones y detalles estratégicos.
      </p>

      {/* Interactive Map View */}
      <InteractiveDotaMap />
    </Card>
  </div>
);

// ─── TAB 7: MACRO & PIZARRA TÁCTICA ───────────────────────────────────────────
const TabMacro: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={TrendingUp}
        title="Macro Juego & Pizarra Táctica de Combate"
        subtitle="Posicionamiento visual de los 5 jugadores en una batalla de equipo"
        color="text-orange-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        Una pelea no se gana solo con clics rápidos, sino con el posicionamiento correcto antes del choque.
      </p>

      {/* Tactical Teamfight Board */}
      <TacticalTeamfightBoard />
    </Card>

    <div className="grid gap-3">
      <Card className="border border-slate-800">
        <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Reglas de Oro para Entrar a una Pelea (Fight Timing)</span>
        </div>
        <div className="space-y-1.5 text-xs text-gray-300">
          <div>• <strong className="text-emerald-300">Ventaja numérica:</strong> Si un rival está muerto o en el otro lado del mapa, pelea 5v4 de inmediato.</div>
          <div>• <strong className="text-emerald-300">Picos de poder (Item Spikes):</strong> Pelea en el momento exacto en que tu Carry saca su BKB o tu Offlaner su Blink Dagger.</div>
          <div>• <strong className="text-emerald-300">Ventaja de visión:</strong> Nunca pelees en terreno a oscuras sin haber plantado primero un Sentry Ward en la zona.</div>
        </div>
      </Card>
    </div>
  </div>
);

// ─── TAB 8: PARCHES & META ───────────────────────────────────────────────────
const TabParches: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      {/* Live Meta Banner */}
      <Card className="border border-pink-500/40 bg-gradient-to-br from-pink-950/20 to-slate-900/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6 text-pink-400" />
          </div>
          <div className="flex-1">
            <div className="text-base font-bold text-white mb-1">Meta & Tier List en Tiempo Real</div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Consulta la Tier List actualizada (S/A/B/C/D), los héroes más pickeados, los de mejor y peor winrate
              en cada bracket — desde Heraldo hasta Inmortal — basada en millones de partidas del parche actual.
            </p>
          </div>
          <button
            onClick={() => navigate('/meta')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold transition-all shadow-lg shadow-pink-950/50 flex-shrink-0"
          >
            Ver Meta Ahora <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Tier explanation */}
      <Card>
        <SectionTitle icon={Activity} title="¿Qué significa cada Tier?" color="text-pink-400" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
          {[
            { tier: 'S', label: 'Dominante', color: 'border-amber-500/60 bg-amber-950/30 text-amber-300', desc: 'Winrate ≥54%' },
            { tier: 'A', label: 'Fuerte', color: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300', desc: 'Winrate 52-54%' },
            { tier: 'B', label: 'Equilibrado', color: 'border-sky-500/60 bg-sky-950/30 text-sky-300', desc: 'Winrate 50-52%' },
            { tier: 'C', label: 'Regular', color: 'border-gray-500/60 bg-slate-900/50 text-gray-300', desc: 'Winrate 48-50%' },
            { tier: 'D', label: 'Débil', color: 'border-rose-500/60 bg-rose-950/30 text-rose-300', desc: 'Winrate <48%' },
          ].map(({ tier, label, color, desc }) => (
            <div key={tier} className={`rounded-xl border p-3 text-center ${color}`}>
              <div className="text-2xl font-black mb-1">{tier}</div>
              <div className="text-xs font-bold">{label}</div>
              <div className="text-[11px] opacity-75 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Patch notes context */}
      <Card>
        <SectionTitle icon={Sparkles} title="¿Cómo leer el Meta?" subtitle="Guía rápida de interpretación" color="text-pink-400" />
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-gray-300 leading-relaxed">
            <strong className="text-amber-400">🏆 Tier S:</strong> Héroes que dominan en el parche actual. Generalmente tienen kits que se sinergian fuertemente con los ítems o mecánicas actuales. Son picks prioritarios en el draft.
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-gray-300 leading-relaxed">
            <strong className="text-emerald-400">✅ Tier A:</strong> Excelentes picks. Tienen ventajas claras pero pueden ser countered si el enemigo se prepara. Son héroes seguros y confiables.
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-gray-300 leading-relaxed">
            <strong className="text-sky-400">⚖️ Tier B:</strong> Héroes equilibrados. Su eficacia depende más del skill del jugador que del parche. Buenos picks si los dominas bien.
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-gray-300 leading-relaxed">
            <strong className="text-rose-400">⚠️ Tier C/D:</strong> Héroes que actualmente están en desventaja. Pueden ganar con draft estratégico específico o en manos de especialistas.
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── TAB 9: RECURSOS OFICIALES ────────────────────────────────────────────────
const TabRecursos: React.FC = () => {
  const navigate = useNavigate();

  const internalTools = [
    {
      label: 'Enciclopedia de Héroes',
      desc: '125+ héroes con habilidades, árbol de talentos, builds populares, counters y aliados con winrates reales.',
      icon: Swords,
      color: 'border-amber-500/40 bg-amber-950/10 text-amber-400',
      route: '/hero-encyclopedia',
    },
    {
      label: 'Base de Datos de Ítems',
      desc: 'Catálogo completo de ítems con costos, componentes, efectos activos/pasivos y cooldowns.',
      icon: Package,
      color: 'border-yellow-500/40 bg-yellow-950/10 text-yellow-400',
      route: '/items',
    },
    {
      label: 'Asistente de Draft',
      desc: 'Arma tu lineup 5v5 interactivo. Detecta sinergias, counters y analiza la composición de equipo.',
      icon: Users,
      color: 'border-sky-500/40 bg-sky-950/10 text-sky-400',
      route: '/draft',
    },
    {
      label: 'Meta & Tier List',
      desc: 'Tier list S/A/B/C/D basada en datos reales del parche actual. Filtrable por bracket de MMR.',
      icon: BarChart3,
      color: 'border-pink-500/40 bg-pink-950/10 text-pink-400',
      route: '/meta',
    },
  ];

  const externalLinks = [
    { name: 'Portal Oficial de Aprendizaje Valve', url: 'https://www.dota2.com/learn', desc: 'Tutoriales oficiales de Valve en español.' },
    { name: 'Dota 2 Wiki (Liquipedia)', url: 'https://liquipedia.net/dota2/Portal:Heroes', desc: 'Enciclopedia completa de mecánicas y números.' },
    { name: 'Dotabuff', url: 'https://www.dotabuff.com', desc: 'Estadísticas globales de winrates y builds.' },
    { name: 'OpenDota', url: 'https://www.opendota.com', desc: 'Análisis de repeticiones y visión de mapa gratuita.' },
    { name: 'r/learndota2', url: 'https://www.reddit.com/r/learndota2', desc: 'Comunidad activa de Reddit dedicada al aprendizaje.' },
  ];

  return (
    <div className="space-y-5">
      {/* Internal Tools */}
      <Card>
        <SectionTitle
          icon={Sparkles}
          title="Herramientas de DotaScope"
          subtitle="Funciones integradas con datos reales de OpenDota"
          color="text-red-400"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {internalTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.route}
                onClick={() => navigate(tool.route)}
                className={`flex items-start gap-3.5 p-4 rounded-xl border ${tool.color} hover:opacity-90 transition-all text-left group`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-900/60 border ${tool.color.split(' ')[0]}`}>
                  <Icon className={`w-5 h-5 ${tool.color.split(' ')[2]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white group-hover:text-red-300 transition-colors flex items-center gap-1.5">
                    {tool.label}
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* External Links */}
      <Card>
        <SectionTitle
          icon={ExternalLink}
          title="Portales y Herramientas Externas"
          subtitle="Fuentes fiables para continuar tu progreso"
          color="text-teal-400"
        />
        <div className="grid gap-2.5">
          {externalLinks.map((rec) => (
            <a
              key={rec.name}
              href={rec.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-colors group"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                  {rec.name}
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{rec.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 flex-shrink-0" />
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── MAIN GUIDES PAGE COMPONENT ──────────────────────────────────────────────
const CONTENT_MAP: Record<TabId, React.FC> = {
  fundamentos: TabFundamentos,
  tecnicas: TabTecnicas,
  roles: TabRoles,
  heroes: TabHeroes,
  counters: HeroCountersSection,
  items: TabItems,
  mapa: TabMapa,
  macro: TabMacro,
  parches: TabParches,
  recursos: TabRecursos,
};

export const GuidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('counters');
  const Content = CONTENT_MAP[activeTab];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* Sticky Header with Navigation Pills */}
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600/30 to-amber-600/20 border border-red-500/40 flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Guías Visuales de Dota 2</span>
                  <Badge color="bg-red-900/50 text-red-300 border border-red-500/30">Videos & Simuladores</Badge>
                </h1>
                <p className="text-[11px] text-gray-400 hidden sm:block">
                  Aprende viendo: videos oficiales de Valve, simuladores interactivos, recetas de objetos y mapa táctico.
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Tabs Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-red-600/20 text-red-400 border border-red-500/50 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content View */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Content />
      </main>
    </div>
  );
};

export default GuidesPage;
