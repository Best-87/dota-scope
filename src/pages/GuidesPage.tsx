import React, { useState } from 'react';
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
} from 'lucide-react';

// ─── TYPES & INTERFACES ───────────────────────────────────────────────────────
type TabId =
  | 'fundamentos'
  | 'tecnicas'
  | 'roles'
  | 'heroes'
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
  { id: 'fundamentos', label: 'Fundamentos',      icon: BookOpen,    color: 'text-sky-400'     },
  { id: 'tecnicas',    label: 'Técnicas Pro (Gank, Stack...)', icon: Crosshair,   color: 'text-amber-400'   },
  { id: 'roles',       label: 'Roles (1 al 5)',   icon: Users,       color: 'text-violet-400'  },
  { id: 'heroes',      label: 'Héroes & Fotos',   icon: Swords,      color: 'text-rose-400'    },
  { id: 'items',       label: 'Objetos & Iconos', icon: Package,     color: 'text-yellow-400'  },
  { id: 'mapa',        label: 'Mapa & Visión',    icon: Map,         color: 'text-emerald-400' },
  { id: 'macro',       label: 'Macro & Teamfights', icon: TrendingUp, color: 'text-orange-400'  },
  { id: 'parches',     label: 'Parches & Meta',   icon: Activity,    color: 'text-pink-400'    },
  { id: 'recursos',    label: 'Recursos',         icon: ExternalLink, color: 'text-teal-400'   },
];

// ─── VISUAL IMAGE COMPONENTS (VALVE / STEAM CDN) ──────────────────────────────
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
    info:    'border-sky-500/30 bg-sky-950/40 text-sky-300',
    warning: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
    tip:     'border-violet-500/30 bg-violet-950/40 text-violet-300',
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
        title="Mecánicas Básicas de la Línea"
        subtitle="Last Hit, Deny, Aggro y Control de Oleadas"
        color="text-sky-400"
      />
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Last Hit (Golpe de Gracia)</span>
            </div>
            <Badge color="bg-amber-900/60 text-amber-300">Regla Fundamental de Oro</Badge>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            En Dota 2 <strong className="text-white">NO recibes oro</strong> por dañar a una creatura; únicamente
            obtiene el botín el jugador que asesta el impacto final que le quita la vida restante.
          </p>
          <div className="mt-2 text-[11px] text-amber-300/90 font-mono bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
            💡 Consejo: Espera pacientemente a que la barra de salud del creep enemigo esté en el umbral exacto del daño de tu ataque base.
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-bold text-white">Deny (Negación de Creeps y Torres)</span>
            </div>
            <Badge color="bg-rose-900/60 text-rose-300">Control de Experiencia</Badge>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Puedes atacar a tus propios creeps aliados cuando su vida cae por debajo del 50% (o tus torres bajo el 10%).
            Al matarlos tú mismo, le arrebatas el 100% del oro al rival y reduces la experiencia que recibe al 50%.
          </p>
        </div>
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
        <span className="font-semibold text-emerald-300">Healing Salve</span>, tendrás que regresar caminando a base,
        perdiendo oleadas enteras de oro y experiencia.
      </Tip>
    </div>
  </div>
);

// ─── TAB 2: TÉCNICAS PRO (GLOSARIO VISUAL Y CÓMO HACERLO) ──────────────────────
const TECNICAS_DATA = [
  {
    id: 'stacking',
    titleEs: 'Stackear Campamentos',
    titleEn: 'Camp Stacking',
    difficulty: 'Fácil · Timing',
    difficultyColor: 'bg-emerald-900/60 text-emerald-300',
    queEs:
      'Multiplicar la cantidad de criaturas neutrales dentro de un mismo campamento de la jungla sin destruirlo primero.',
    paraQue:
      'Permite a tus héroes con daño de área (como Axe, Sven, Luna, Bristleback) limpiar 3 o 4 oleadas acumuladas de golpe, ganando entre 400 y 1,000 de oro en 30 segundos.',
    comoHacerlo: [
      'Posiciónate junto al campamento de la jungla alrededor del segundo :50 de cualquier minuto.',
      'Ataca a los monstruos neutrales exactamente al segundo :53 (o :54 para campamentos más pequeños).',
      'Camina inmediatamente en dirección contraria alejándote del campamento para que te persigan.',
      'Al llegar el segundo :00, el área del campamento estará vacía; el motor del juego detectará espacio libre y creará una nueva camada completa.',
    ],
    timing: '⏱️ :53 a :55 de cada minuto',
    keyIcon: Zap,
  },
  {
    id: 'pulling',
    titleEs: 'Jalar la Línea / Tirar Creeps',
    titleEn: 'Creep Pulling',
    difficulty: 'Intermedio · Control de Línea',
    difficultyColor: 'bg-sky-900/60 text-sky-300',
    queEs:
      'Atraer a los monstruos neutrales del bosque para que intercepten a tu propia oleada de creeps aliados que va bajando por el carril.',
    paraQue:
      'Hace que tus creeps peleen contra los neutrales en lugar de ir a la torre enemiga, obligando a la línea a retroceder hacia la seguridad de tu propia torre.',
    comoHacerlo: [
      'Identifica el campamento pequeño (Small Camp) más cercano a tu Safelane.',
      'Al segundo :15 o :45 (según la posición de tus creeps), golpea a los neutrales.',
      'Corre hacia tu carril justo cuando tu oleada de creeps aliados pase cerca.',
      'Tus creeps verán a los neutrales, cambiarán su rumbo y empezarán a luchar en la jungla.',
    ],
    timing: '⏱️ :15 o :45 de cada minuto (Small Camp)',
    keyIcon: Layers,
  },
  {
    id: 'gank',
    titleEs: 'Gankear / Emboscada',
    titleEn: 'Ganking (Gang Kill)',
    difficulty: 'Táctico · Rotación',
    difficultyColor: 'bg-rose-900/60 text-rose-300',
    queEs:
      'Abandonar tu carril por sorpresa para atacar en superioridad numérica (3v1 o 4v2) a un rival en otro carril.',
    paraQue:
      'Matar al carry o midlaner rival, quitarles oro, frenar su racha y permitirle a tu equipo destruir su torre Tier 1 sin resistencia.',
    comoHacerlo: [
      'Empuja primero tu propia oleada para no perder creeps en tu torre.',
      'Usa un Smoke of Deceit (Humo del Engaño) o camina por los árboles fuera del campo de visión (Fog of War) y wards.',
      'Comunica a tu aliado con una señal (Alt + Clic) sobre el objetivo que van a asesinar.',
      'Inicia con tu aturdimiento (Stun) más seguro y descarguen todo el daño combinado.',
    ],
    timing: '⏱️ Tras obtener nivel 6 (Ultimate) o recoger Runa de Poder (min 6:00)',
    keyIcon: Swords,
  },
  {
    id: 'creep_aggro',
    titleEs: 'Manipulación de Hostilidad',
    titleEn: 'Creep Aggro',
    difficulty: 'Avanzado · Micro-mecánica',
    difficultyColor: 'bg-violet-900/60 text-violet-300',
    queEs:
      'Forzar a los creeps enemigos a dejar de atacar a tus tropas y correr hacia tu héroe para reubicarlos donde te sea más seguro farmear.',
    paraQue:
      'Atrae a los creeps a tu terreno elevado o más cerca de tu torre, evitando que el rival te acose con ataques mientras das el last hit.',
    comoHacerlo: [
      'Estando a menos de 500 unidades de distancia de los creeps enemigos, haz clic derecho de ataque directamente sobre cualquier héroe rival (incluso en otra línea si lo haces en el mapa).',
      'Los creeps enemigos se enfurecerán contigo inmediatamente.',
      'Camina 3 pasos hacia atrás; los creeps te seguirán fielmente hasta quedar en una posición óptima y segura para darles el golpe final.',
    ],
    timing: '⏱️ Cada 3 segundos (tiempo de enfriamiento del aggro)',
    keyIcon: Crosshair,
  },
  {
    id: 'tread_switch',
    titleEs: 'Alternancia de Atributos en Botas',
    titleEn: 'Tread Switching',
    difficulty: 'Intermedio · Eficiencia',
    difficultyColor: 'bg-amber-900/60 text-amber-300',
    queEs:
      'Alternar activamente las Power Treads (Botas de Poder) entre Fuerza, Agilidad e Inteligencia según la acción que vas a realizar.',
    paraQue:
      'Permite ahorrar hasta un 25% de maná por cada habilidad lanzada y regenerar vida o atacar más rápido sin comprar ítems extra.',
    comoHacerlo: [
      'Antes de lanzar cualquier hechizo: Cambia tus botas a INTELIGENCIA (aumenta tu reserva y reduce el % de maná gastado).',
      'Antes de tomar pociones o regenerar: Cambia a AGILIDAD (reduce tu vida y maná máximo temporalmente, haciendo que las pociones te llenen un porcentaje mayor).',
      'En combate o ante peligro de emboscada: Cambia a FUERZA (+10 de fuerza = 220 de vida extra para sobrevivir).',
    ],
    timing: '⏱️ Mecánica constante durante toda la partida',
    keyIcon: Zap,
  },
  {
    id: 'dewarding',
    titleEs: 'Dewardear / Quitar Visión Rival',
    titleEn: 'Dewarding',
    difficulty: 'Esencial · Soporte',
    difficultyColor: 'bg-emerald-900/60 text-emerald-300',
    queEs:
      'Plantar un Sentry Ward (Guardián Centinela) para revelar la visión invisible que el enemigo colocó en tu territorio y destruirla.',
    paraQue:
      'Ciega al enemigo en la zona, otorga entre 100 y 250 de oro a quien lo destruye, y permite a tus aliados moverse con libertad.',
    comoHacerlo: [
      'Sospecha de la presencia de un Ward si los enemigos retroceden cuando tú entras a una zona o si te atacan sin verte.',
      'Planta un Sentry Ward ligeramente alejado del risco central para que su radio cubra varias zonas posibles.',
      'Si aparece el Observer Ward enemigo, golpéalo (se destruye con 2 golpes de soporte con Quelling Blade/Hacha o 8 golpes normales).',
    ],
    timing: '⏱️ Cada vez que tomes o asegures una nueva zona del mapa',
    keyIcon: Eye,
  },
  {
    id: 'dispel',
    titleEs: 'Dispel / Purga (Básica vs Fuerte)',
    titleEn: 'Dispel (Basic vs Strong)',
    difficulty: 'Avanzado · Supervivencia',
    difficultyColor: 'bg-purple-900/60 text-purple-300',
    queEs:
      'Habilidad u objeto que retira efectos negativos (debuffs), ralentizaciones, silencios o aturdimientos que tengas encima.',
    paraQue:
      'Salva tu vida cuando el rival te lanza un silencio mortal o una ralentización pesada.',
    comoHacerlo: [
      'Purga Básica (Basic Dispel): Objetos como Eul\'s Scepter, Manta Style o Lotus Orb. Quita silencios, ralentizaciones y raíces (roots), pero NO elimina aturdimientos (Stuns).',
      'Purga Fuerte (Strong Dispel): Habilidades como Aphotic Shield de Abaddon, Press the Attack de Legion Commander o Dark Pact de Slark. ¡PUEDE quitar aturdimientos mientras estás aturdido!',
    ],
    timing: '⏱️ Úsalo de inmediato al recibir una penalización crítica',
    keyIcon: Sparkles,
  },
  {
    id: 'bkb_piercing',
    titleEs: 'Habilidades que Atraviesan BKB',
    titleEn: 'BKB Piercing Spells',
    difficulty: 'Competitivo · Conocimiento',
    difficultyColor: 'bg-red-900/60 text-red-300',
    queEs:
      'Habilidades y ultimates que ignoran la inmunidad a efectos de la Black King Bar (BKB).',
    paraQue:
      'Saber a qué héroes guardar o cómo responder cuando el carry enemigo activa su BKB dorada.',
    comoHacerlo: [
      'No gastes aturdimientos comunes sobre una BKB activa; no surtirán ningún efecto.',
      'Usa las habilidades que sí la atraviesan: Berserker\'s Call (Axe), Primal Roar (Beastmaster), Chronosphere (Faceless Void), Fiend\'s Grip (Bane), Doom (Doom).',
    ],
    timing: '⏱️ Clave en peleas de equipo del minuto 20 en adelante',
    keyIcon: Shield,
  },
];

const TabTecnicas: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Crosshair}
        title="Glosario Técnico de Acción"
        subtitle="Conceptos que separan a un novato de un jugador avanzado"
        color="text-amber-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed">
        En Dota 2, la jerga técnica describe acciones tácticas decisivas. Aquí tienes{' '}
        <strong className="text-white">qué significa cada término en español e inglés</strong> y la{' '}
        <strong className="text-amber-400">guía paso a paso de cómo ejecutarlo</strong>.
      </p>
    </Card>

    <div className="grid gap-3.5">
      {TECNICAS_DATA.map((tec) => {
        const Icon = tec.keyIcon;
        return (
          <Card key={tec.id} className="border border-slate-800 hover:border-slate-700/80 transition-colors">
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{tec.titleEs}</span>
                    <span className="text-xs text-gray-400 font-normal">/ {tec.titleEn}</span>
                  </h3>
                  <div className="text-[11px] text-amber-300 font-mono mt-0.5">{tec.timing}</div>
                </div>
              </div>
              <Badge color={tec.difficultyColor}>{tec.difficulty}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs mb-3">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                <div className="font-semibold text-sky-400 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> ¿Qué es?
                </div>
                <div className="text-gray-300 leading-relaxed">{tec.queEs}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
                <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> ¿Por qué es crucial?
                </div>
                <div className="text-gray-300 leading-relaxed">{tec.paraQue}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-900/30">
              <div className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Cómo hacerlo paso a paso:
              </div>
              <div className="space-y-1.5">
                {tec.comoHacerlo.map((paso, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-xs text-gray-300">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{paso}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
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
    lane: 'Safelane (Línea Segura: Abajo Radiant / Arriba Dire)',
    farm: 'Prioridad 1 (Máxima)',
    colorBorder: 'border-amber-500/40 bg-amber-950/10',
    badge: 'bg-amber-900/60 text-amber-300',
    summary: 'Comienza frágil. Su meta es conseguir oro a ritmo constante para transformarse en la mayor amenaza destructora del juego tardío.',
    heroes: [
      { key: 'skeleton_king', nameEn: 'Wraith King', nameEs: 'Rey Fantasma' },
      { key: 'phantom_assassin', nameEn: 'Phantom Assassin', nameEs: 'Asesina Fantasma' },
      { key: 'juggernaut', nameEn: 'Juggernaut', nameEs: 'Juggernaut' },
      { key: 'luna', nameEn: 'Luna', nameEs: 'Luna' },
      { key: 'antimage', nameEn: 'Anti-Mage', nameEs: 'Anti-Mago' },
    ],
    keyDuties: [
      'No forzar peleas antes de conseguir tu ítem acelerador (Battle Fury / Maelstrom / Yasha).',
      'Aprender rutas de jungla optimizadas para no dejar ningún campamento sin limpiar.',
      'Priorizar siempre las torres y el Trono Ancestral por encima de cazar kills innecesarias.',
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
    summary: 'Gana experiencia y niveles en solitario. Dicta el ritmo del early-mid game y es el encargado de apoyar los carriles laterales.',
    heroes: [
      { key: 'sniper', nameEn: 'Sniper', nameEs: 'Francotirador' },
      { key: 'dragon_knight', nameEn: 'Dragon Knight', nameEs: 'Caballero Dragón' },
      { key: 'viper', nameEn: 'Viper', nameEs: 'Víbora' },
      { key: 'queenofpain', nameEn: 'Queen of Pain', nameEs: 'Reina del Dolor' },
      { key: 'lina', nameEn: 'Lina', nameEs: 'Lina' },
    ],
    keyDuties: [
      'Controlar las Runas de Poder en el río al minuto 6:00, 8:00 y cada 2 minutos.',
      'Rotar a la línea lateral más vulnerable para conseguir un gank en cuanto desbloquees nivel 6.',
      'Presionar la torre central enemiga; derribarla abre todo el mapa para tu equipo.',
    ],
  },
  {
    pos: 3,
    nameEs: 'Offlaner / Tanque Iniciador',
    nameEn: 'Offlaner',
    lane: 'Offlane (Línea Dura: Arriba Radiant / Abajo Dire)',
    farm: 'Prioridad 3 (Media)',
    colorBorder: 'border-rose-500/40 bg-rose-950/10',
    badge: 'bg-rose-900/60 text-rose-300',
    summary: 'Piedra angular de choque. Su objetivo es hostigar al carry rival, iniciar las peleas con salto y aturdimiento, y portar auras protectoras.',
    heroes: [
      { key: 'axe', nameEn: 'Axe', nameEs: 'Axe / Hacha' },
      { key: 'bristleback', nameEn: 'Bristleback', nameEs: 'Espaldaespinada' },
      { key: 'centaur', nameEn: 'Centaur Warrunner', nameEs: 'Centauro' },
      { key: 'mars', nameEn: 'Mars', nameEs: 'Marte' },
      { key: 'tidehunter', nameEn: 'Tidehunter', nameEs: 'Cazador de Mareas' },
    ],
    keyDuties: [
      'Comprar Blink Dagger para iniciar peleas antes de que el rival reaccione.',
      'Armar auras de equipo vitales como Pipe of Insight o Crimson Guard.',
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
    summary: 'El creador de juego táctico. Ayuda a su offlaner pero tiene libertad para rotar a mid, robar runas enemigas y comprar ítems activos como Force Staff o Blink.',
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
      'Contestar el campamento pequeño rival y castigar los pulls del support enemigo.',
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
    summary: 'El protector abnegado. Sacrifica todo su oro personal en comprar visión (Wards), polvo de invisibilidad, curación para el carry y stackear campamentos.',
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
      'Sacrificar tu propia vida en una pelea si con ello logras que tu Carry escape a salvo.',
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
        En Dota 2 el oro en el mapa es un recurso finito. Por eso, los equipos dividen el trabajo entre{' '}
        <strong className="text-amber-400">Cores (Pos 1, 2, 3)</strong>, que reciben el oro, y{' '}
        <strong className="text-sky-400">Supports (Pos 4, 5)</strong>, que operan con bajo presupuesto y generan espacio.
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

// ─── TAB 4: HÉROES & FOTOS ───────────────────────────────────────────────────
interface HeroProfile {
  key: string;
  nameEn: string;
  nameEs: string;
  role: string;
  attribute: 'Fuerza (STR)' | 'Agilidad (AGI)' | 'Inteligencia (INT)' | 'Universal';
  attrColor: string;
  difficulty: 'Fácil ★☆☆' | 'Medio ★★☆' | 'Difícil ★★★';
  diffColor: string;
  whyPlay: string;
  keySkill: string;
  coreItem: { key: string; nameEn: string; nameEs: string };
}

const HEROES_CATALOG: HeroProfile[] = [
  {
    key: 'skeleton_king',
    nameEn: 'Wraith King',
    nameEs: 'Rey Fantasma (ex Rey Esqueleto)',
    role: 'Carry · Posición 1',
    attribute: 'Fuerza (STR)',
    attrColor: 'text-red-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Ideal para novatos: su ultimate Reincarnation lo revive automáticamente al morir, perdonando errores de posicionamiento.',
    keySkill: 'Reincarnation (Reencarnación) & Mortal Strike (Golpe Crítico)',
    coreItem: { key: 'armlet', nameEn: 'Armlet of Mordiggian', nameEs: 'Brazalete de Mordiggian' },
  },
  {
    key: 'juggernaut',
    nameEn: 'Juggernaut (Yurnero)',
    nameEs: 'El Juggernaut',
    role: 'Carry · Posición 1',
    attribute: 'Agilidad (AGI)',
    attrColor: 'text-emerald-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Giro de espada (Blade Fury) que otorga inmunidad mágica y teletransportación segura, más un tótem de curación para todo el equipo.',
    keySkill: 'Blade Fury (Furia de la Hoja) & Omnislash (Omnicorte)',
    coreItem: { key: 'bfury', nameEn: 'Battle Fury', nameEs: 'Furia de Batalla' },
  },
  {
    key: 'sniper',
    nameEn: 'Sniper (Kardel)',
    nameEs: 'El Francotirador',
    role: 'Midlaner / Carry · Pos 2 / 1',
    attribute: 'Agilidad (AGI)',
    attrColor: 'text-emerald-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'El mayor alcance de ataque del juego. Enseña a colocarse en la línea trasera (Backline) sin ser alcanzado por los enemigos.',
    keySkill: 'Take Aim (Apuntar) & Assassinate (Asesinato a distancia)',
    coreItem: { key: 'dragon_lance', nameEn: 'Dragon Lance', nameEs: 'Lanza del Dragón' },
  },
  {
    key: 'dragon_knight',
    nameEn: 'Dragon Knight (Davion)',
    nameEs: 'Caballero Dragón',
    role: 'Midlaner / Offlane · Pos 2 / 3',
    attribute: 'Fuerza (STR)',
    attrColor: 'text-red-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Armadura pasiva monstruosa y regeneración de vida nativa. Se convierte en Dragón para demoler torres enemigas con veneno y fuego.',
    keySkill: 'Dragon Blood (Sangre de Dragón) & Elder Dragon Form',
    coreItem: { key: 'blink', nameEn: 'Blink Dagger', nameEs: 'Daga de Traslación' },
  },
  {
    key: 'axe',
    nameEn: 'Axe (Mogul Khan)',
    nameEs: 'Hacha (Axe)',
    role: 'Offlaner · Posición 3',
    attribute: 'Fuerza (STR)',
    attrColor: 'text-red-400',
    difficulty: 'Medio ★★☆',
    diffColor: 'bg-amber-900/60 text-amber-300',
    whyPlay: 'El rey de la iniciación. Salta con Blink Dagger, provoca a todos los enemigos a atacarlo y los destroza con contraataques giratorios.',
    keySkill: "Berserker's Call (Llamada del Berserker) & Culling Blade (Hoja Asesina)",
    coreItem: { key: 'blade_mail', nameEn: 'Blade Mail', nameEs: 'Cota de Cuchillas' },
  },
  {
    key: 'bristleback',
    nameEn: 'Bristleback (Rigwarl)',
    nameEs: 'Espaldaespinada',
    role: 'Offlaner / Carry · Pos 3 / 1',
    attribute: 'Fuerza (STR)',
    attrColor: 'text-red-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Recibe hasta un 40% menos de daño si los enemigos lo atacan por la espalda, soltando espinas automáticas que diezman grupos enteros.',
    keySkill: 'Bristleback (Reducción de daño trasera) & Quill Spray (Espinas)',
    coreItem: { key: 'vanguard', nameEn: 'Vanguard', nameEs: 'Vanguardia' },
  },
  {
    key: 'crystal_maiden',
    nameEn: 'Crystal Maiden (Rylai)',
    nameEs: 'Doncella de Cristal',
    role: 'Hard Support · Posición 5',
    attribute: 'Inteligencia (INT)',
    attrColor: 'text-sky-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Su aura pasiva regenera maná para TODOS los aliados en el mapa constantemente. Tiene aturdimiento helado y tormenta de nieve brutal.',
    keySkill: 'Arcane Aura (Aura Arcana global) & Freezing Field (Campo Helado)',
    coreItem: { key: 'glimmer_cape', nameEn: 'Glimmer Cape', nameEs: 'Capa Fulgurante' },
  },
  {
    key: 'abaddon',
    nameEn: 'Abaddon',
    nameEs: 'Señor del Averno',
    role: 'Hard Support / Offlane · Pos 5 / 3',
    attribute: 'Universal',
    attrColor: 'text-purple-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Su escudo absorbe daño y aplica Purga Fuerte para salvar a compañeros aturdidos. Su ultimate convierte el daño recibido en curación pura.',
    keySkill: 'Aphotic Shield (Escudo Afótico) & Borrowed Time (Tiempo Prestado)',
    coreItem: { key: 'holy_locket', nameEn: 'Holy Locket', nameEs: 'Relicario Sagrado' },
  },
  {
    key: 'lion',
    nameEn: 'Lion',
    nameEs: 'El Brujo Demonio',
    role: 'Soft Support · Posición 4',
    attribute: 'Inteligencia (INT)',
    attrColor: 'text-sky-400',
    difficulty: 'Fácil ★☆☆',
    diffColor: 'bg-emerald-900/60 text-emerald-300',
    whyPlay: 'Control total: Stun en línea, convierte al rival en rana (Hex), drena su maná y ejecuta con un rayo infernal de 800+ de daño.',
    keySkill: 'Earth Spike (Púas de Tierra) & Finger of Death (Dedo de la Muerte)',
    coreItem: { key: 'blink', nameEn: 'Blink Dagger', nameEs: 'Daga de Traslación' },
  },
  {
    key: 'antimage',
    nameEn: 'Anti-Mage (Magina)',
    nameEs: 'El Anti-Mago',
    role: 'Carry Avanzado · Posición 1',
    attribute: 'Agilidad (AGI)',
    attrColor: 'text-emerald-400',
    difficulty: 'Difícil ★★★',
    diffColor: 'bg-rose-900/60 text-rose-300',
    whyPlay: 'Movilidad suprema con Blink. Quema el maná de los magos y los detona con Mana Void. Exige disciplina extrema de farmeo.',
    keySkill: 'Blink (Traslación corta) & Mana Break (Quema de maná)',
    coreItem: { key: 'manta', nameEn: 'Manta Style', nameEs: 'Estilo Manta' },
  },
];

const TabHeroes: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Swords}
        title="Catálogo Visual de Héroes"
        subtitle="Fotos, nombres bilingües, rol y build inicial recomendado"
        color="text-rose-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed">
        Cada héroe de Dota 2 cuenta con características únicas. Para aprender más rápido, domina{' '}
        <strong className="text-white">1 o 2 héroes con calificación Fácil</strong> antes de saltar a mecánicas complejas.
      </p>
    </Card>

    <div className="grid gap-3.5">
      {HEROES_CATALOG.map((h) => (
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
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ─── TAB 5: OBJETOS & ICONOS ─────────────────────────────────────────────────
interface ItemProfile {
  key: string;
  nameEn: string;
  nameEs: string;
  category: 'Inicial / Consumible' | 'Botas' | 'Iniciación & Resistencia' | 'Daño & Farm' | 'Soporte & Utilidad';
  cost: number;
  catColor: string;
  description: string;
  tacticalUse: string;
}

const ITEMS_CATALOG: ItemProfile[] = [
  // Consumibles
  {
    key: 'tango',
    nameEn: 'Tango',
    nameEs: 'Tango',
    category: 'Inicial / Consumible',
    cost: 90,
    catColor: 'bg-emerald-900/60 text-emerald-300',
    description: 'Consume un árbol para regenerar 7 de vida por segundo durante 16 segundos (hasta 112 de vida por carga).',
    tacticalUse: 'Indispensable en el minuto 0:00 para resistir el acoso enemigo en el carril. Si lo usas con un Iron Branch (Rama de Hierro), duplica su tiempo de regeneración.',
  },
  {
    key: 'flask',
    nameEn: 'Healing Salve',
    nameEs: 'Bálsamo Curativo / Salve',
    category: 'Inicial / Consumible',
    cost: 100,
    catColor: 'bg-emerald-900/60 text-emerald-300',
    description: 'Restaura 350 de salud en 10 segundos. Si un héroe o torre te ataca mientras cura, el efecto se cancela al instante.',
    tacticalUse: 'Úsalo detrás de tus creeps o dentro del bosque donde ningún enemigo pueda cancelarte la curación con un golpe.',
  },
  {
    key: 'clarity',
    nameEn: 'Clarity',
    nameEs: 'Poción de Claridad',
    category: 'Inicial / Consumible',
    cost: 50,
    catColor: 'bg-emerald-900/60 text-emerald-300',
    description: 'Restaura 150 de maná a lo largo de 25 segundos. También se interrumpe si recibes daño de héroes.',
    tacticalUse: 'Fundamental para héroes lanzadores de hechizos como Zeus, Lina o Crystal Maiden para mantener presencia constante en línea.',
  },
  {
    key: 'ward_observer',
    nameEn: 'Observer Ward',
    nameEs: 'Guardián Observador (Ojo Amarillo)',
    category: 'Inicial / Consumible',
    cost: 0,
    catColor: 'bg-amber-900/60 text-amber-300',
    description: 'Proporciona visión amplia de una zona durante 6 minutos. Es completamente GRATUITO en la tienda.',
    tacticalUse: 'Ubícalo en cruces estratégicos, alrededor de Roshan o en las entradas de tu jungla para prevenir ganks y emboscadas.',
  },
  {
    key: 'ward_sentry',
    nameEn: 'Sentry Ward',
    nameEs: 'Guardián Centinela (Ojo Azul)',
    category: 'Inicial / Consumible',
    cost: 50,
    catColor: 'bg-sky-900/60 text-sky-300',
    description: 'Proporciona True Sight (Visión Verdadera) en un radio de 1050 unidades durante 7 minutos. NO da visión normal.',
    tacticalUse: 'Detecta unidades invisibles (Riki, Clinkz, Nyx) y revela los Observer Wards enemigos para poder destruirlos.',
  },
  {
    key: 'smoke_of_deceit',
    nameEn: 'Smoke of Deceit',
    nameEs: 'Humo del Engaño',
    category: 'Inicial / Consumible',
    cost: 50,
    catColor: 'bg-purple-900/60 text-purple-300',
    description: 'Otorga invisibilidad y 15% de velocidad a los héroes aliados cercanos. Es completamente indetectable por wards o True Sight.',
    tacticalUse: 'La herramienta definitiva de los profesionales para moverse juntos por el mapa y atrapar a un carry desprevenido.',
  },

  // Botas
  {
    key: 'power_treads',
    nameEn: 'Power Treads',
    nameEs: 'Botas de Poder',
    category: 'Botas',
    cost: 1400,
    catColor: 'bg-amber-900/60 text-amber-300',
    description: '+45 de velocidad de movimiento, +25 de velocidad de ataque y +10 del atributo que elijas (Fuerza, Agilidad o Inteligencia).',
    tacticalUse: 'La mejor bota para carries. Permite hacer "Tread Switching": cambia a INT antes de usar un poder y vuelve a AGI o STR.',
  },
  {
    key: 'phase_boots',
    nameEn: 'Phase Boots',
    nameEs: 'Botas de Fase',
    category: 'Botas',
    cost: 1500,
    catColor: 'bg-rose-900/60 text-rose-300',
    description: '+50 de velocidad, +18 de daño de ataque, +4 de armadura. Su activa permite atravesar unidades y da un impulso de velocidad.',
    tacticalUse: 'Ideal para héroes de melé agresivos (Axe, Mars, Ursa, Juggernaut) que necesitan perseguir o evitar que los creeps los bloqueen.',
  },
  {
    key: 'arcane_boots',
    nameEn: 'Arcane Boots',
    nameEs: 'Botas Arcanas',
    category: 'Botas',
    cost: 1300,
    catColor: 'bg-sky-900/60 text-sky-300',
    description: '+45 de velocidad y +250 de maná. Su activa restaura 175 de maná a todos los aliados en un área de 1200 unidades.',
    tacticalUse: 'El calzado por excelencia de los supports. En el late game se combinan con Mekansm para forjar Guardian Greaves.',
  },

  // Iniciación y Resistencia
  {
    key: 'blink',
    nameEn: 'Blink Dagger',
    nameEs: 'Daga de Traslación',
    category: 'Iniciación & Resistencia',
    cost: 2250,
    catColor: 'bg-red-900/60 text-red-300',
    description: 'Te teletransporta instantáneamente hasta 1200 unidades de distancia. Si recibes daño de un héroe enemigo, entra en enfriamiento por 3 segundos.',
    tacticalUse: 'El ítem de posicionamiento más poderoso de Dota. Imprescindible en Axe, Tidehunter, Enigma, Earthshaker y Lion.',
  },
  {
    key: 'black_king_bar',
    nameEn: 'Black King Bar (BKB)',
    nameEs: 'Barra del Rey Negro',
    category: 'Iniciación & Resistencia',
    cost: 4050,
    catColor: 'bg-yellow-900/60 text-yellow-300',
    description: 'Otorga Inmunidad a Debuffs (Inmunidad Mágica) y +50% de resistencia mágica durante 9 a 6 segundos según los usos.',
    tacticalUse: 'El objeto más determinante para ganar teamfights. Permite al carry golpear sin ser aturdido, congelado ni ralentizado.',
  },
  {
    key: 'blade_mail',
    nameEn: 'Blade Mail',
    nameEs: 'Cota de Cuchillas',
    category: 'Iniciación & Resistencia',
    cost: 2100,
    catColor: 'bg-rose-900/60 text-rose-300',
    description: 'Al activarse, devuelve el 85% del daño recibido de vuelta al atacante durante 4.5 segundos.',
    tacticalUse: 'Combinación perfecta con el Berserker\'s Call de Axe o héroes con mucha vida como Bristleback y Specter.',
  },

  // Daño y Farm
  {
    key: 'bfury',
    nameEn: 'Battle Fury',
    nameEs: 'Furia de Batalla',
    category: 'Daño & Farm',
    cost: 4100,
    catColor: 'bg-orange-900/60 text-orange-300',
    description: '+60 de daño, regeneración de vida y maná, y daño en hendidura (Cleave) que daña a todos los enemigos frente a ti.',
    tacticalUse: 'Acelera el farmeo de forma exponencial en Anti-Mage, Phantom Assassin y Juggernaut.',
  },
  {
    key: 'ultimate_scepter',
    nameEn: "Aghanim's Scepter",
    nameEs: 'Cetro de Aghanim',
    category: 'Daño & Farm',
    cost: 4200,
    catColor: 'bg-indigo-900/60 text-indigo-300',
    description: 'Otorga una mejora drástica a las habilidades o añade una habilidad completamente nueva al héroe.',
    tacticalUse: 'Verifica la descripción específica en tu héroe; en muchos personajes transforma por completo su impacto en la partida.',
  },

  // Soporte y Utilidad
  {
    key: 'glimmer_cape',
    nameEn: 'Glimmer Cape',
    nameEs: 'Capa Fulgurante',
    category: 'Soporte & Utilidad',
    cost: 2150,
    catColor: 'bg-teal-900/60 text-teal-300',
    description: 'Vuelve invisible a ti o a un aliado durante 5 segundos y otorga un escudo que absorbe 300 de daño mágico.',
    tacticalUse: 'Salva a compañeros que han sido atrapados o permite a Crystal Maiden y Witch Doctor canalizar sus ultimates sin ser cancelados.',
  },
  {
    key: 'guardian_greaves',
    nameEn: 'Guardian Greaves',
    nameEs: 'Grebas de Guardián',
    category: 'Soporte & Utilidad',
    cost: 5100,
    catColor: 'bg-emerald-900/60 text-emerald-300',
    description: 'Restaura 350 de vida y 200 de maná a todos los aliados cercanos, y disipa debuffs del portador al activarse.',
    tacticalUse: 'El ítem definitivo para supports en late game. Mantiene al equipo completo con vida alta durante asedios prolongados.',
  },
];

const TabItems: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Package}
        title="Guía Visual de Objetos de Dota 2"
        subtitle="Iconos oficiales, nombres en inglés y español, costes y valor táctico"
        color="text-yellow-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed">
        Los ítems en Dota 2 otorgan ventajas activas decisivas. Comprar el ítem adecuado para contrarrestar
        la estrategia del rival gana más partidas que la habilidad individual pura.
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
                <Badge color={it.catColor}>{it.category}</Badge>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mt-1.5">{it.description}</p>

              <div className="mt-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-gray-400 leading-relaxed">
                <strong className="text-amber-300">Uso Táctico: </strong> {it.tacticalUse}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ─── TAB 6: MAPA & VISIÓN ─────────────────────────────────────────────────────
const TabMapa: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Map}
        title="Geografía del Campo de Batalla"
        subtitle="Estructura, carriles y zonas críticas"
        color="text-emerald-400"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="text-sm font-bold text-emerald-400 mb-1">The Radiant (Los Radiantes)</div>
          <p className="text-gray-300 leading-relaxed">
            Ocupan el cuadrante suroeste. Su Safelane está abajo y su Offlane arriba. Tienen acceso rápido al foso
            de Roshan durante el día.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <div className="text-sm font-bold text-rose-400 mb-1">The Dire (Los Temibles)</div>
          <p className="text-gray-300 leading-relaxed">
            Ocupan el cuadrante noreste. Su Safelane está arriba y su Offlane abajo. Tienen acceso directo al foso
            de Roshan durante la noche.
          </p>
        </div>
      </div>
    </Card>

    <Card>
      <SectionTitle
        icon={Target}
        title="Objetivos Neutrales Mayores"
        subtitle="Roshan, Tormentor y Runas"
        color="text-emerald-400"
      />
      <div className="space-y-3">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <span className="text-sm font-bold text-amber-400">Roshan</span>
            <Badge color="bg-amber-900/60 text-amber-300">Reaparece cada 8 a 11 min tras morir</Badge>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-2">
            El monstruo supremo. Otorga el <strong className="text-white">Aegis of the Immortal</strong> (resucita al portador con vida y maná completos en el mismo sitio al morir). En muertes posteriores también suelta Queso (curación instantánea masiva), Aghanim\'s Blessing o Refresher Shard.
          </p>
          <div className="text-[11px] text-gray-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800 font-mono">
            🌙 Nota: Roshan se traslada entre los dos fosos según el ciclo día/noche (Día: Foso Sureste / Noche: Foso Noroeste).
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <span className="text-sm font-bold text-violet-400">Tormentor</span>
            <Badge color="bg-violet-900/60 text-violet-300">Minuto 20:00 (reaparece cada 10 min)</Badge>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Estructura defensiva neutral que refleja el 70% del daño recibido a los atacantes cercanos.
            Al derrotarlo, otorga un <strong className="text-white">Aghanim\'s Shard</strong> gratuito al aliado
            con menor valor neto que aún no lo tenga.
          </p>
        </div>
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Clock} title="Cronograma de Runas" color="text-emerald-400" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="font-bold text-yellow-400 mb-1">🪙 Bounty Runes (Recompensa)</div>
          <div className="text-[11px] text-amber-300 mb-1">⏱️ Minuto 0:00 y cada 3 minutos</div>
          <div className="text-gray-400">Dan oro inmediato a los 5 miembros del equipo. ¡Pelearlas al 0:00 es clave!</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="font-bold text-violet-400 mb-1">🧠 Wisdom Runes (Sabiduría)</div>
          <div className="text-[11px] text-amber-300 mb-1">⏱️ Minuto 7:00 y cada 7 minutos (14, 21...)</div>
          <div className="text-gray-400">Otorgan un salto masivo de niveles a los supports del equipo.</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="font-bold text-sky-400 mb-1">⚡ Power Runes (Poder del Río)</div>
          <div className="text-[11px] text-amber-300 mb-1">⏱️ Minuto 6:00 y cada 2 minutos</div>
          <div className="text-gray-400">Daño Doble, Haste (velocidad máxima), Ilusión, Regeneración o Invisibilidad.</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="font-bold text-emerald-400 mb-1">🪷 Lotus Pool (Estanque de Loto)</div>
          <div className="text-[11px] text-amber-300 mb-1">⏱️ Cada 3 minutos en los bordes del mapa</div>
          <div className="text-gray-400">Se combinan para crear lotos gigantes que restauran salud y maná al instante.</div>
        </div>
      </div>
    </Card>
  </div>
);

// ─── TAB 7: MACRO & TEAMFIGHTS ────────────────────────────────────────────────
const TabMacro: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={TrendingUp}
        title="Toma de Decisiones Macro"
        subtitle="Cómo ganar partidas dominando el mapa"
        color="text-orange-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed">
        El macro juego engloba las decisiones globales: cuándo forzar una pelea, cuándo ceder una torre para farmear,
        y cómo romper la base rival (High Ground).
      </p>
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

      <Card className="border border-slate-800">
        <div className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Cómo Asediar y Romper el High Ground (Base Enemiga)</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed mb-3">
          El High Ground es la posición defensiva más poderosa: los ataques desde abajo tienen un 25% de probabilidad de fallar y no tienes visión de la rampa.
        </p>
        <div className="space-y-1.5 text-xs text-gray-300">
          <div>1. Asegura primero a <strong className="text-amber-400">Roshan</strong> y dale el Aegis a tu Carry.</div>
          <div>2. Coloca un Observer Ward en el borde de su base antes de que tus tropas suban la rampa.</div>
          <div>3. Deja que solo el Carry con Aegis golpee la torre mientras los 4 aliados esperan en posición defensiva detrás.</div>
        </div>
      </Card>
    </div>
  </div>
);

// ─── TAB 8: PARCHES & META ───────────────────────────────────────────────────
const TabParches: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={Activity}
        title="Meta del Parche Actual — 7.41f"
        subtitle="Ajustes de balance y héroes dominantes"
        color="text-pink-400"
      />
      <p className="text-sm text-gray-300 leading-relaxed">
        El parche 7.41f prioriza la estabilidad competitiva, balance de costos en recetas de ítems mayores
        y ajustes de supervivencia en héroes de primera línea.
      </p>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {[
        { heroKey: 'skeleton_king', nameEn: 'Wraith King', tier: 'Tier S', pos: 'Carry', winrate: '53.8%' },
        { heroKey: 'bristleback',   nameEn: 'Bristleback', tier: 'Tier S', pos: 'Offlane', winrate: '53.1%' },
        { heroKey: 'axe',           nameEn: 'Axe',         tier: 'Tier A', pos: 'Offlane', winrate: '52.4%' },
        { heroKey: 'crystal_maiden',nameEn: 'Crystal Maiden', tier: 'Tier A', pos: 'Support', winrate: '52.0%' },
        { heroKey: 'lion',          nameEn: 'Lion',        tier: 'Tier A', pos: 'Support', winrate: '51.7%' },
        { heroKey: 'dragon_knight', nameEn: 'Dragon Knight', tier: 'Tier A', pos: 'Midlane', winrate: '51.5%' },
      ].map((meta) => (
        <Card key={meta.heroKey} className="p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HeroImage heroKey={meta.heroKey} name={meta.nameEn} className="w-10 h-10 rounded-lg" />
            <div>
              <div className="text-sm font-bold text-white">{meta.nameEn}</div>
              <div className="text-[11px] text-gray-400">{meta.pos} · Winrate {meta.winrate}</div>
            </div>
          </div>
          <Badge color={meta.tier === 'Tier S' ? 'bg-amber-900/60 text-amber-300 font-bold' : 'bg-slate-800 text-gray-300 font-bold'}>
            {meta.tier}
          </Badge>
        </Card>
      ))}
    </div>
  </div>
);

// ─── TAB 9: RECURSOS OFICIALES & COMUNITARIOS ─────────────────────────────────
const TabRecursos: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle
        icon={ExternalLink}
        title="Fuentes y Herramientas Recomendadas"
        subtitle="Los portales más fiables para seguir aprendiendo"
        color="text-teal-400"
      />
      <div className="grid gap-2.5">
        {[
          { name: 'Portal Oficial de Aprendizaje Valve', url: 'https://www.dota2.com/learn', desc: 'Tutoriales oficiales de Valve en español.' },
          { name: 'Dota 2 Wiki (Fandom / Liquipedia)', url: 'https://liquipedia.net/dota2/Portal:Heroes', desc: 'La enciclopedia más detallada de estadísticas de habilidades y daño.' },
          { name: 'Dotabuff', url: 'https://www.dotabuff.com', desc: 'Estadísticas globales de winrates, mejores builds y meta por medallas.' },
          { name: 'OpenDota', url: 'https://www.opendota.com', desc: 'Análisis de repeticiones y visión de mapa gratuita.' },
          { name: 'r/learndota2', url: 'https://www.reddit.com/r/learndota2', desc: 'Comunidad activa de Reddit dedicada a responder dudas a nuevos jugadores.' },
        ].map((rec) => (
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

// ─── MAIN GUIDES PAGE COMPONENT ──────────────────────────────────────────────
const CONTENT_MAP: Record<TabId, React.FC> = {
  fundamentos: TabFundamentos,
  tecnicas: TabTecnicas,
  roles: TabRoles,
  heroes: TabHeroes,
  items: TabItems,
  mapa: TabMapa,
  macro: TabMacro,
  parches: TabParches,
  recursos: TabRecursos,
};

export const GuidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('tecnicas');
  const Content = CONTENT_MAP[activeTab];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* Sticky Sub-Header with Navigation Pills */}
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
                  <Badge color="bg-red-900/50 text-red-300 border border-red-500/30">Bilingüe ES/EN</Badge>
                </h1>
                <p className="text-[11px] text-gray-400 hidden sm:block">
                  Aprende paso a paso: técnicas pro (Stack, Gank, Pull, Aggro), héroes, objetos y mapa.
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
