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
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'fundamentos' | 'roles' | 'heroes' | 'items' | 'mapa' | 'macro' | 'parches' | 'recursos';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS: Tab[] = [
  { id: 'fundamentos', label: 'Fundamentos', icon: BookOpen,   color: 'text-sky-400'     },
  { id: 'roles',       label: 'Roles',        icon: Users,      color: 'text-violet-400'  },
  { id: 'heroes',      label: 'Héroes',       icon: Swords,     color: 'text-rose-400'    },
  { id: 'items',       label: 'Objetos',      icon: Package,    color: 'text-amber-400'   },
  { id: 'mapa',        label: 'Mapa & Visión',icon: Map,        color: 'text-emerald-400' },
  { id: 'macro',       label: 'Macro & Team', icon: TrendingUp, color: 'text-orange-400'  },
  { id: 'parches',     label: 'Parches',      icon: Activity,   color: 'text-pink-400'    },
  { id: 'recursos',    label: 'Recursos',     icon: ExternalLink,color: 'text-teal-400'   },
];

// ─── Reusable card components ─────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl p-5 border border-slate-800/90 bg-slate-900/80 shadow-xl ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ icon: React.ComponentType<{ className?: string }>; title: string; color?: string }> = ({
  icon: Icon, title, color = 'text-white',
}) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className={`w-5 h-5 ${color}`} />
    <h2 className={`text-base font-bold tracking-tight ${color}`}>{title}</h2>
  </div>
);

const Tip: React.FC<{ children: React.ReactNode; variant?: 'info' | 'warning' | 'success' | 'tip' }> = ({
  children, variant = 'tip',
}) => {
  const styles: Record<string, string> = {
    info:    'border-sky-500/30 bg-sky-950/40 text-sky-300',
    warning: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
    tip:     'border-violet-500/30 bg-violet-950/40 text-violet-300',
  };
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    info: Info, warning: AlertTriangle, success: CheckCircle, tip: Lightbulb,
  };
  const IconC = icons[variant];
  return (
    <div className={`flex gap-2 p-3 rounded-xl border text-xs leading-relaxed ${styles[variant]}`}>
      <IconC className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
};

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-slate-800 text-gray-300' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${color}`}>
    {children}
  </span>
);

// ─── TAB CONTENT ──────────────────────────────────────────────────────────────

// ---------- FUNDAMENTOS ----------
const TabFundamentos: React.FC = () => (
  <div className="space-y-5">
    {/* Intro */}
    <Card>
      <SectionTitle icon={Star} title="¿Qué es Dota 2?" color="text-sky-400" />
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        Dota 2 es un MOBA (Multiplayer Online Battle Arena) de 5 vs 5 desarrollado por Valve. Dos equipos — <span className="text-emerald-400 font-semibold">Radiant</span> y <span className="text-rose-400 font-semibold">Dire</span> — compiten para destruir el <span className="text-amber-400 font-semibold">Trono Ancestral</span> del equipo contrario ubicado en su base.
      </p>
      <p className="text-sm text-gray-300 leading-relaxed">
        Todos los más de <strong className="text-white">125+ héroes</strong> están disponibles gratuitamente desde el primer día. No hay que desbloquear personajes.
      </p>
    </Card>

    {/* Mecánicas principales */}
    <Card>
      <SectionTitle icon={Target} title="Mecánicas Esenciales" color="text-sky-400" />
      <div className="grid gap-3">
        {[
          {
            title: 'Last Hit (Golpe de Gracia)',
            icon: Crosshair,
            color: 'text-amber-400',
            desc: 'Solo obtienes oro si eres TÚ quien da el último golpe a una creatura. Practica el timing atacando creeps cuando su barra de vida esté baja. Es la mecánica más importante del juego temprano.',
          },
          {
            title: 'Deny (Negar)',
            icon: Shield,
            color: 'text-rose-400',
            desc: 'Puedes atacar tus propias criaturas cuando están por debajo del 50% de vida. Al hacerlo, el enemigo NO recibe oro ni experiencia completa. Niega torres al 10% de vida.',
          },
          {
            title: 'Oro & Experiencia',
            icon: Star,
            color: 'text-yellow-400',
            desc: 'El oro se usa para comprar ítems. La experiencia sube tus niveles y desbloquea/mejora habilidades. Morir hace que pierdas oro y das una ventaja de experiencia al asesino.',
          },
          {
            title: 'Runas',
            icon: Zap,
            color: 'text-violet-400',
            desc: 'Runas de Recompensa (Bounty) aparecen a los 0:00 y cada 3 min en los 4 rincones del mapa. Runas de Poder (Power, Double Damage, Haste, Illusion, etc.) aparecen en el río a los 6:00 y cada 6 min.',
          },
          {
            title: 'Torres y Objetivos',
            icon: Target,
            color: 'text-emerald-400',
            desc: 'Hay 3 niveles de torres por carril (Tier 1, 2, 3) más las Rax (Barracks) dentro de la base. Destruir Rax da ventaja de criaturas superiores. El objetivo final es el Ancestral (Ancient).',
          },
        ].map(({ title, icon: Icon, color, desc }) => (
          <div key={title} className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
            <div>
              <div className="text-sm font-semibold text-white mb-1">{title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* Errores comunes */}
    <Card>
      <SectionTitle icon={AlertTriangle} title="Errores Comunes del Principiante" color="text-amber-400" />
      <div className="space-y-2">
        {[
          'Morir innecesariamente: cada muerte da oro y XP al enemigo.',
          'Olvidar comprar consumibles (Tango, Poción): te sacan de la línea.',
          'Comprar ítems aleatorios sin seguir una guía.',
          'Ignorar las runas de recompensa al inicio (son oro gratis).',
          'Pushear demasiado la línea sin visión — exponiéndote a ganks.',
          'No comprar Wards: sin visión, tu equipo muere en emboscadas.',
          'Abandonar la partida — afecta a tus compañeros y penaliza tu cuenta.',
        ].map((err) => (
          <div key={err} className="flex gap-2 items-start text-xs text-gray-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>{err}</span>
          </div>
        ))}
      </div>
    </Card>

    {/* Tips */}
    <div className="space-y-2">
      <Tip variant="success">
        <strong>Para principiantes:</strong> Usa primero el Modo Nuevo Jugador — tiene un pool de héroes reducido, bots cooperativos y no aplica penalizaciones si sales.
      </Tip>
      <Tip variant="tip">
        En la tienda del juego puedes seleccionar guías comunitarias que te indican automáticamente qué ítems comprar y qué habilidades subir.
      </Tip>
    </div>
  </div>
);

// ---------- ROLES ----------
const ROLES_DATA = [
  {
    pos: 1, name: 'Carry', lane: 'Línea Segura',
    color: 'border-amber-500/40 bg-amber-950/20',
    badge: 'bg-amber-900/60 text-amber-300',
    farm: 'Máxima prioridad',
    goal: 'Farmear para escalar al late game y convertirse en el principal destructor.',
    early: 'Foca en last hits con ayuda del Pos 5. Evita peleas innecesarias.',
    mid: 'Mueve al jungle para acelerar ítems clave.',
    late: 'Lidera las peleas y destruye torres.',
    heroes: ['Wraith King', 'Phantom Assassin', 'Luna', 'Anti-Mage', 'Faceless Void'],
    tips: ['Aprende tread switching para ahorrar maná.', 'Farm de forma eficiente: no pares entre campamentos.', 'Comunica cuándo necesitas ayuda en la línea.'],
  },
  {
    pos: 2, name: 'Midlaner', lane: 'Línea Central',
    color: 'border-violet-500/40 bg-violet-950/20',
    badge: 'bg-violet-900/60 text-violet-300',
    farm: 'Alta prioridad',
    goal: 'Ganar el 1v1, subir niveles rápido y generar ventaja temprana para el equipo.',
    early: 'Controla las runas de poder. Gana el matchup de línea o al menos empatalo.',
    mid: 'Rota a los carriles laterales para hacer kills y presionar torres.',
    late: 'Apoya al carry en peleas con tus habilidades potenciadas.',
    heroes: ['Sniper', 'Dragon Knight', 'Viper', 'Queen of Pain', 'Lina'],
    tips: ['Controla las runas del río cada 6 min.', 'Un gank exitoso al safelane da muchísima ventaja.', 'Aprende el conteo de ondas y cuándo pushear.'],
  },
  {
    pos: 3, name: 'Offlaner', lane: 'Offlane / Línea Dura',
    color: 'border-rose-500/40 bg-rose-950/20',
    badge: 'bg-rose-900/60 text-rose-300',
    farm: 'Prioridad media',
    goal: 'Perturbar al carry enemigo, tankear daño y ser el iniciador en peleas.',
    early: 'Sobrevive y acosa al carry rival sin morir. Deniega XP.',
    mid: 'Compra ítems de utilidad (Blink Dagger, Pipe, Crimson Guard) e inicia peleas.',
    late: 'Salta primero al equipo enemigo para que tu carry llegue limpio.',
    heroes: ['Axe', 'Bristleback', 'Mars', 'Centaur Warrunner', 'Tidehunter'],
    tips: ['Blink Dagger es casi siempre tu primer ítem clave.', 'Tu trabajo es absorber daño, no darlo.', 'Coordina el engage con tu equipo por chat o pings.'],
  },
  {
    pos: 4, name: 'Soft Support', lane: 'Offlane (junto al Pos 3)',
    color: 'border-emerald-500/40 bg-emerald-950/20',
    badge: 'bg-emerald-900/60 text-emerald-300',
    farm: 'Baja prioridad',
    goal: 'Hacer jugadas por el mapa, asegurar objetivos y crear espacio.',
    early: 'Ayuda al Pos 3 y rota al mid para hacer gank.',
    mid: 'Compra Blink/Force Staff y asegura runas de Tormentor y Roshan.',
    late: 'Pega debuffs, controla multitudes y protege a tu carry.',
    heroes: ['Lion', 'Rubick', 'Mirana', 'Marci', 'Shadow Shaman'],
    tips: ['Comunica tus rotaciones — un gank sorpresa cambia la partida.', 'Compra Smoke para emboscadas organizadas.', 'Roba hechizos con Rubick para momentos épicos.'],
  },
  {
    pos: 5, name: 'Hard Support', lane: 'Línea Segura (junto al Pos 1)',
    color: 'border-sky-500/40 bg-sky-950/20',
    badge: 'bg-sky-900/60 text-sky-300',
    farm: 'Mínima prioridad',
    goal: 'Proteger al carry, comprar visión (Wards) y asegurar la línea.',
    early: 'Coloca Observer/Sentry Wards, usa stack/pull de campamentos.',
    mid: 'Mantén el mapa wardado. Muere TÚ para salvar a tus cores.',
    late: 'Compra Guardian Greaves, Glimmer Cape u otros ítems de soporte.',
    heroes: ['Crystal Maiden', 'Abaddon', 'Warlock', 'Witch Doctor', 'Disruptor'],
    tips: ['Stack los campamentos neutrales para que tu carry los farmee.', 'Siempre tendrás Wards. No hay excusa para tener 0 visión.', 'Cura/protege a tus aliados en peleas aunque eso te mate.'],
  },
];

const TabRoles: React.FC = () => (
  <div className="space-y-4">
    <Card>
      <SectionTitle icon={Users} title="El Sistema de Posiciones" color="text-violet-400" />
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        Dota 2 usa un sistema del <strong className="text-white">1 al 5</strong> que define la prioridad de oro y el rol de cada jugador. Las posiciones 1-3 son <span className="text-amber-400 font-semibold">Cores</span> (necesitan farmear ítems). Las 4 y 5 son <span className="text-sky-400 font-semibold">Supports</span> (funcionan con poco oro).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-slate-800">
              <th className="text-left py-2 pr-4">Pos</th>
              <th className="text-left py-2 pr-4">Rol</th>
              <th className="text-left py-2 pr-4">Línea</th>
              <th className="text-left py-2">Prioridad de Farm</th>
            </tr>
          </thead>
          <tbody>
            {ROLES_DATA.map(r => (
              <tr key={r.pos} className="border-b border-slate-800/50">
                <td className="py-2 pr-4 font-bold text-white">{r.pos}</td>
                <td className="py-2 pr-4 text-gray-300">{r.name}</td>
                <td className="py-2 pr-4 text-gray-400">{r.lane}</td>
                <td className="py-2 text-gray-400">{r.farm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    {ROLES_DATA.map(r => (
      <Card key={r.pos} className={`border ${r.color}`}>
        <div className="flex items-center gap-2 mb-3">
          <Badge color={r.badge}>Posición {r.pos}</Badge>
          <span className="text-base font-bold text-white">{r.name}</span>
          <span className="text-xs text-gray-500 ml-auto">{r.lane}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-3">{r.goal}</p>

        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          {[['Early Game', r.early], ['Mid Game', r.mid], ['Late Game', r.late]].map(([phase, desc]) => (
            <div key={phase} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
              <div className="font-semibold text-gray-400 mb-1">{phase}</div>
              <div className="text-gray-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {r.heroes.map(h => (
            <Badge key={h} color="bg-slate-800 text-gray-300">{h}</Badge>
          ))}
        </div>

        <div className="space-y-1">
          {r.tips.map(tip => (
            <div key={tip} className="flex gap-2 items-start text-xs text-gray-400">
              <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-violet-400" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// ---------- HEROES ----------
const HERO_CATEGORIES = [
  {
    title: 'Héroes para Principiantes — Carry (Pos 1)',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    heroes: [
      { name: 'Wraith King', dificultad: 'Fácil ★☆☆', motivo: 'Resucita al morir (ultimate). Lifesteal y crit pasivos. Muy tolerante a errores de posicionamiento.' },
      { name: 'Juggernaut', dificultad: 'Fácil ★☆☆', motivo: 'Omnislash devastador. Blade Fury da invulnerabilidad. Healing Ward salva teamfights.' },
      { name: 'Luna', dificultad: 'Fácil ★☆☆', motivo: 'Fácil de farmear con Eclipse. Mucho daño AOE en late game. Gran alcance de ataque.' },
    ],
  },
  {
    title: 'Héroes para Principiantes — Mid (Pos 2)',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    heroes: [
      { name: 'Sniper', dificultad: 'Fácil ★☆☆', motivo: 'Enorme rango de ataque. Enseña posicionamiento en el backline. Assassinate da kills fáciles.' },
      { name: 'Dragon Knight', dificultad: 'Fácil ★☆☆', motivo: 'Muy resistente. Stun confiable. Forma dragón da stat poderoso para presionar torres.' },
      { name: 'Viper', dificultad: 'Fácil ★☆☆', motivo: 'Ataques con slow pasivo. Corrosive Skin castiga a enemigos que atacan. Domina la línea fácilmente.' },
    ],
  },
  {
    title: 'Héroes para Principiantes — Offlane (Pos 3)',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    heroes: [
      { name: 'Bristleback', dificultad: 'Fácil ★☆☆', motivo: 'Muy difícil de matar. Spinas pasivas reducen daño recibido. Excelente en peleas de equipo.' },
      { name: 'Axe', dificultad: 'Media ★★☆', motivo: 'Berserker\'s Call crea ventaja instantánea. Counter Helix hace daño AOE. Culling Blade mata instántaneamente.' },
      { name: 'Centaur Warrunner', dificultad: 'Fácil ★☆☆', motivo: 'Enorme cantidad de vida. Stamp hace daño al devolver golpes. Hoof Stomp es un stun AOE confiable.' },
    ],
  },
  {
    title: 'Héroes para Principiantes — Soporte (Pos 4 & 5)',
    color: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    heroes: [
      { name: 'Crystal Maiden', dificultad: 'Fácil ★☆☆', motivo: 'Crystal Nova hace slow+daño AOE. Frostbite congela un objetivo. Su aura pasiva da maná a TODO el equipo.' },
      { name: 'Abaddon', dificultad: 'Fácil ★☆☆', motivo: 'Mist Coil cura aliados. Aphotic Shield absorbe daño y se detona. Ultimate activo automáticamente lo salva.' },
      { name: 'Lich', dificultad: 'Fácil ★☆☆', motivo: 'Sacrifice transforma su maná en experiencia para aliados. Chain Frost rebota entre enemigos. Fácil de jugar.' },
    ],
  },
  {
    title: 'Héroes Avanzados — Cuando Subas de Nivel',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    heroes: [
      { name: 'Anti-Mage', dificultad: 'Media ★★☆', motivo: 'Requiere mucho farm pero es devastador. Blink propio para escapar. Mana Void destruye en late game.' },
      { name: 'Invoker', dificultad: 'Muy Difícil ★★★', motivo: 'El héroe más complejo: 14 habilidades. Recompensa enorme para quienes lo dominan. No recomendado inicialmente.' },
      { name: 'Meepo', dificultad: 'Extrema ★★★', motivo: 'Controlas múltiples clones simultáneamente. El carry más difícil del juego. Solo para jugadores avanzados.' },
    ],
  },
];

const TabHeroes: React.FC = () => (
  <div className="space-y-4">
    <Tip variant="info">
      Valve clasifica los héroes por complejidad (★ Fácil, ★★ Medio, ★★★ Difícil). Para empezar, elige héroes de <strong>complejidad 1</strong> hasta que entiendas bien las mecánicas base del juego.
    </Tip>

    {HERO_CATEGORIES.map(cat => (
      <Card key={cat.title} className={`border ${cat.borderColor}`}>
        <SectionTitle icon={Swords} title={cat.title} color={cat.color} />
        <div className="space-y-3">
          {cat.heroes.map(h => (
            <div key={h.name} className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-lg font-bold text-gray-400">
                {h.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">{h.name}</span>
                  <Badge color="bg-slate-800/80 text-gray-400">{h.dificultad}</Badge>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">{h.motivo}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    ))}

    <Tip variant="tip">
      Elige <strong>1 o 2 héroes</strong> y juégalos repetidamente hasta dominarlos. La especialización es más efectiva que saber jugar muchos héroes de forma mediocre.
    </Tip>
  </div>
);

// ---------- ITEMS ----------
const ITEM_SECTIONS = [
  {
    title: 'Objetos Iniciales (Starting Items)',
    icon: Package,
    color: 'text-amber-400',
    items: [
      { name: 'Tango', cost: 90, desc: 'Consume un árbol para regenerar vida. Esencial para sobrevivir en línea.' },
      { name: 'Clarity', cost: 50, desc: 'Poción de maná. Para héroes dependientes de habilidades en línea.' },
      { name: 'Iron Branch', cost: 50, desc: 'Da pequeños stats. Se convierte en árboles con Tango (doble duración).' },
      { name: 'Faerie Fire', cost: 75, desc: 'Proporciona daño y una carga de vida de emergencia en combate.' },
      { name: 'Healing Salve', cost: 115, desc: 'Regenera toda la vida rápidamente. Úsala donde no te ataquen enemigos.' },
      { name: 'Observer Ward', cost: 0, desc: 'GRATIS. Dan visión del mapa. Compra siempre como support.' },
    ],
  },
  {
    title: 'Botas — Elige Según tu Rol',
    icon: Zap,
    color: 'text-sky-400',
    items: [
      { name: 'Power Treads (1400g)', cost: 1400, desc: 'Velocidad de ataque, movimiento y stats switcheables. Ideal para carries que farmean mucho.' },
      { name: 'Phase Boots (1500g)', cost: 1500, desc: 'Daño plano, armadura y activa para atravesar unidades. Perfectas para melee agresivos (Axe, Mars).' },
      { name: 'Arcane Boots (1300g)', cost: 1300, desc: 'Dan maná al equipo en área. El boot favorito de supports mágicos (Crystal Maiden, Lich).' },
      { name: 'Tranquil Boots (975g)', cost: 975, desc: 'Regeneración de vida masiva fuera de combate. Excelente para supports que mueven el mapa.' },
      { name: 'Boots of Travel (2500g)', cost: 2500, desc: 'Se teletransportan a cualquier edificio aliado. Para carries en late game extremo (Anti-Mage).' },
    ],
  },
  {
    title: 'Ítems Clave por Posición',
    icon: Shield,
    color: 'text-rose-400',
    items: [
      { name: 'Blink Dagger (2250g)', cost: 2250, desc: 'Iniciación o escape instantáneos. Imprescindible para Axe, Centaur, Brewmaster. El ítem de movilidad más poderoso.' },
      { name: 'Black King Bar (4050g)', cost: 4050, desc: 'Inmunidad mágica temporal. Permite pelear sin temer los stuns y habilidades del enemigo.' },
      { name: 'Battle Fury (4100g)', cost: 4100, desc: 'Cleave en área para farmear campamentos de neutrales rápidamente. Core para Anti-Mage, Juggernaut.' },
      { name: 'Aghanim\'s Scepter (4200g)', cost: 4200, desc: 'Mejora el ultimate de casi todos los héroes. Verifica siempre qué hace en tu héroe específico.' },
      { name: 'Guardian Greaves (5400g)', cost: 5400, desc: 'Aura de curación masiva al equipo. El ítem definitivo del support. Se hace con Arcane Boots + Mekansm.' },
    ],
  },
  {
    title: 'Ítems Situacionales',
    icon: Target,
    color: 'text-emerald-400',
    items: [
      { name: 'Pipe of Insight', cost: 3325, desc: 'Reduce daño mágico de área para el equipo. Compra si el enemigo tiene mucho nuking mágico.' },
      { name: 'Crimson Guard', cost: 3725, desc: 'Escudo de bloqueo de daño físico para tus aliados. Vital contra ataques físicos AOE.' },
      { name: 'Glimmer Cape', cost: 1950, desc: 'Invisibilidad breve para ti o un aliado. Excelente para salvarte o salvar a tu carry en peleas.' },
      { name: 'Lotus Orb', cost: 3850, desc: 'Refleja habilidades lanzadas sobre un aliado. Devastador contra equipos con muchos target spells.' },
      { name: 'Scythe of Vyse', cost: 5700, desc: 'Convierte un enemigo en cerdo (hex). El control de mayor duración del juego. Para supports con oro.' },
    ],
  },
];

const TabItems: React.FC = () => (
  <div className="space-y-4">
    <Tip variant="info">
      Los ítems son cruciales. Siempre sigue una guía comunitaria seleccionada en la tienda del juego, especialmente hasta que entiendas la lógica de cada ítem.
    </Tip>

    {ITEM_SECTIONS.map(sec => (
      <Card key={sec.title}>
        <SectionTitle icon={sec.icon} title={sec.title} color={sec.color} />
        <div className="grid gap-2">
          {sec.items.map(item => (
            <div key={item.name} className="flex gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{item.name}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    ))}

    <Tip variant="tip">
      <strong>Tread Switching:</strong> Con Power Treads, cambia a Inteligencia antes de lanzar una habilidad para conservar maná, y regresa a Agilidad/Fuerza después. Esta micro-mecánica aumenta tu eficiencia sustancialmente.
    </Tip>
  </div>
);

// ---------- MAPA ----------
const TabMapa: React.FC = () => (
  <div className="space-y-5">
    <Card>
      <SectionTitle icon={Map} title="Estructura del Mapa" color="text-emerald-400" />
      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        El mapa de Dota 2 es simétrico y se divide en <span className="text-emerald-400 font-semibold">territorio Radiant</span> (abajo-izquierda) y <span className="text-rose-400 font-semibold">territorio Dire</span> (arriba-derecha). Hay 3 carriles, una jungla por lado, y el río central donde aparecen las runas.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Safelane', desc: 'Línea donde el Carry (Pos 1) y Hard Support (Pos 5) lanean. Relativamente fácil de defender.' },
          { name: 'Mid Lane', desc: 'El carril central. Solo para el Midlaner (Pos 2). Acceso a runas de poder del río.' },
          { name: 'Offlane', desc: 'La línea difícil donde van Pos 3 y Pos 4. Es más expuesta y peligrosa.' },
          { name: 'Jungla', desc: 'Campamentos de neutrales que dan oro y XP. Acceso a Roshan y runas de Sabiduria.' },
        ].map(({ name, desc }) => (
          <div key={name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="text-sm font-bold text-white mb-1">{name}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Eye} title="Sistema de Visión — Wards" color="text-emerald-400" />
      <div className="grid gap-3 mb-4">
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">Observer Ward (GRATIS)</span>
          </div>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• Dan visión normal del área durante <strong className="text-white">6 minutos</strong></li>
            <li>• Máximo 4 en la tienda al mismo tiempo</li>
            <li>• Úsalos para ver rotaciones enemigas, rutas al Roshan y jungle</li>
            <li>• Son invisibles para el enemigo (excepto con True Sight)</li>
          </ul>
        </div>
        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-bold text-rose-300">Sentry Ward (50g)</span>
          </div>
          <ul className="space-y-1 text-xs text-gray-400">
            <li>• Dan <strong className="text-white">True Sight</strong> — revelan héroes invisibles y wards enemigos</li>
            <li>• Duran <strong className="text-white">7 minutos</strong>. No dan visión normal por sí solos</li>
            <li>• Úsalos para dewardear y contrarrestar invis (Clinkz, Riki, Invoker EMP)</li>
            <li>• En pushes: siempre pon Sentries alrededor del Roshan</li>
          </ul>
        </div>
      </div>

      <div className="text-sm font-semibold text-white mb-3">Posiciones Clave de Wards</div>
      <div className="space-y-2">
        {[
          { fase: 'Early Game (0-8 min)', desc: 'Warda los carriles laterales para ver rotaciones de supports enemigos. Bloquea el campamento fácil/mediano del enemigo con un Sentry.', color: 'text-sky-400' },
          { fase: 'Mid Game (9-20 min)', desc: 'Cambia el foco a entradas de jungla y zonas de Tormentor y Roshan. Pon Observers ANTES de que los timers importantes activen (1-2 min antes).', color: 'text-amber-400' },
          { fase: 'Late Game (20+ min)', desc: 'Visión ofensiva: wards DENTRO del territorio enemigo para ver respawns y retros compras (buybacks). Siempre dewardea antes de plantar los tuyos.', color: 'text-rose-400' },
        ].map(({ fase, desc, color }) => (
          <div key={fase} className="flex gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <Clock className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
            <div>
              <div className={`text-xs font-bold mb-0.5 ${color}`}>{fase}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Target} title="Objetivos del Mapa" color="text-emerald-400" />
      <div className="space-y-3">
        {[
          { name: 'Roshan', time: 'Primera vez: 8-11 min. Reaparece 8-11 min después de morir.', desc: 'El monstruo más poderoso del mapa. Al morir suelta el Aegis of the Immortal (resurección extra) y otros ítems. Controlar Roshan es crucial para los pushes.', color: 'text-amber-400' },
          { name: 'Tormentor', time: '20:00 min (y cada 10 min tras ser derrotado)', desc: 'Nuevo objetivo del mapa que otorga Aghanim\'s Shard al héroe que no tenga Scepter. Da ventaja de ítems significativa. Siempre priorízalo.', color: 'text-violet-400' },
          { name: 'Torres Tier 1', time: 'Early game — destrúyelas antes del min 10 si puedes', desc: 'Destruir la Tier 1 abre el mapa para rotaciones y da Bonus Gold al equipo. La primera torre muerta vale oro extra para todos.', color: 'text-sky-400' },
          { name: 'Barracks (Rax)', time: 'Mid-Late game', desc: 'Al destruir las Barracas de un carril, tus criaturas en ese carril se vuelven Mega Creeps — mucho más poderosas. Objetivo que prácticamente gana la partida.', color: 'text-rose-400' },
        ].map(({ name, time, desc, color }) => (
          <div key={name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
              <span className={`text-sm font-bold ${color}`}>{name}</span>
              <Badge color="bg-slate-800 text-gray-500">{time}</Badge>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Clock} title="Runas — Timings Importantes" color="text-emerald-400" />
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Runas de Recompensa (Bounty)', schedule: 'Cada 3 min desde 0:00', desc: '4 runas en las esquinas del mapa. Dan oro y XP. Siempre recógelas, especialmente como support.', color: 'text-yellow-400' },
          { name: 'Runas de Sabiduría (Wisdom)', schedule: '7:00, 17:00, 27:00...', desc: 'Aparecen en los flancos del río. Dan XP masiva. Prioriza recogerlas si estás cerca.', color: 'text-violet-400' },
          { name: 'Runas de Poder', schedule: 'Cada 6 min desde 6:00', desc: 'Double Damage, Regeneración, Haste, Ilusión, etc. El mid debe controlarlas o negarlas al enemigo.', color: 'text-sky-400' },
          { name: 'Runas de Loto', schedule: 'Cada 3 min en el río', desc: 'Aparecen en el lago central. Curan vida, maná o dan XP. Muy útiles para supports en el río.', color: 'text-emerald-400' },
        ].map(({ name, schedule, desc, color }) => (
          <div key={name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className={`text-xs font-bold mb-1 ${color}`}>{name}</div>
            <div className="text-[11px] text-amber-300 mb-1.5">⏱ {schedule}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{desc}</div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ---------- MACRO ----------
const TabMacro: React.FC = () => (
  <div className="space-y-5">
    <Card>
      <SectionTitle icon={TrendingUp} title="Conceptos de Macro Juego" color="text-orange-400" />
      <p className="text-sm text-gray-300 leading-relaxed">
        El <strong className="text-white">macro juego</strong> es todo lo que ocurre más allá de tu línea individual: rotaciones, timing de objetivos, decisiones de mapa y coordinación de equipo. Es lo que separa a jugadores buenos de jugadores excelentes.
      </p>
    </Card>

    <Card>
      <SectionTitle icon={Activity} title="Stack & Pull de Campamentos" color="text-orange-400" />
      <p className="text-sm text-gray-300 mb-3">
        El <strong className="text-white">stacking</strong> consiste en sacar las criaturas neutrales de su campamento en el segundo exacto (entre :52-:54) para que el campamento vuelva a generarse, duplicando la cantidad de oro disponible. El <strong className="text-white">pulling</strong> usa esos campamentos para nivelar y farmear de forma más eficiente.
      </p>
      <div className="space-y-2">
        <Tip variant="tip">El Pos 5 debería stackar campamentos dobles o triples para que el Carry los limpie cuando se mueva al jungle. Un stack bien hecho puede valer 400-800g extra.</Tip>
        <div className="flex gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
          <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-white font-semibold mb-1">Timing de Stack:</div>
            <div className="text-gray-400">Ataca o mueve al neutral a las <strong className="text-orange-300">:52-:53</strong> segundos de cada minuto. El campamento se vacía y a las :00 se regenera uno nuevo adicional.</div>
          </div>
        </div>
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Users} title="Peleas de Equipo (Teamfights)" color="text-orange-400" />
      <div className="space-y-3">
        {[
          { title: 'Cuándo Pelear', desc: 'Pelea cuando tengas ventaja numérica, cuando el enemigo está out of position, cuando tienes ultimates disponibles y el enemigo no, o cuando has ganado visión del área.', color: 'text-emerald-400' },
          { title: 'Cuándo NO Pelear', desc: 'Evita pelear cuando tu carry no tiene ítems, cuando el enemigo tiene buybacks y tú no, cuando estás disperso por el mapa, o cuando el enemigo tiene ventaja en cooldowns.', color: 'text-rose-400' },
          { title: 'Positioning', desc: 'Carries van al backline — nunca al frente. Supports usan habilidades de área. Offlaners inician. El orden correcto gana o pierde teamfights.', color: 'text-amber-400' },
          { title: 'Focus Target', desc: 'Enfoca el mismo héroe hasta matarlo. Un equipo que divide el daño entre 5 enemigos raramente mata a alguno. Acaba a uno y luego al siguiente.', color: 'text-sky-400' },
        ].map(({ title, desc, color }) => (
          <div key={title} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className={`text-sm font-bold mb-1 ${color}`}>{title}</div>
            <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Target} title="Smoke of Deceit — Jugadas de Humo" color="text-orange-400" />
      <p className="text-sm text-gray-300 mb-3">
        El <strong className="text-white">Smoke of Deceit</strong> (cost: 70g) vuelve invisible a tu equipo y los hace indetectables en el minimapa para el enemigo. Es la herramienta para organizar ganks coordinados.
      </p>
      <div className="space-y-2 text-xs text-gray-400">
        <div className="flex gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" /><span>Júntate con 3-5 compañeros antes de usar el Smoke.</span></div>
        <div className="flex gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" /><span>Aléjate del área de visión de las torres enemigas antes de activar.</span></div>
        <div className="flex gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" /><span>Usa Smoke antes de entrar a pelear por Roshan para evitar que el enemigo lo sepa.</span></div>
        <div className="flex gap-2"><ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" /><span>El efecto se rompe si te detecta un ward enemigo o si atacas.</span></div>
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Zap} title="High Ground & Pushes Finales" color="text-orange-400" />
      <p className="text-sm text-gray-300 mb-3">
        Atacar desde <strong className="text-white">terreno elevado</strong> sin visión te hace fallar el 25% de tus ataques. La defensa del High Ground es muy poderosa. Para romperla:
      </p>
      <div className="space-y-2">
        {[
          'Asegúrate de tener visión del High Ground antes de entrar (wards, Clairvoyance).',
          'Espera a tener las ultis del equipo disponibles simultáneamente.',
          'Negocia el Roshan antes del push para tener Aegis como seguro.',
          'Usa BKB (Black King Bar) para ignorar el burst mágico de la defensa.',
          'Si pierdes el primer intento de High Ground, farmea más y vuelve con mejor timing.',
        ].map(tip => (
          <div key={tip} className="flex gap-2 items-start text-xs text-gray-400">
            <ChevronRight className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ---------- PARCHES ----------
const TabParches: React.FC = () => (
  <div className="space-y-5">
    <Card>
      <SectionTitle icon={Activity} title="Parche Actual — 7.41 Series" color="text-pink-400" />
      <div className="flex items-center gap-3 mb-4">
        <Badge color="bg-pink-900/60 text-pink-300 text-sm px-3 py-1">Parche 7.41f</Badge>
        <span className="text-xs text-gray-500">Activo · 2025</span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        La serie de parches 7.41 ha traído ajustes significativos al balance de héroes, economía de ítems neutrales y geometría del mapa alrededor de los pozos de Roshan y rutas laterales.
      </p>
    </Card>

    <Card>
      <SectionTitle icon={Package} title="Cambios en Ítems" color="text-pink-400" />
      <div className="space-y-2">
        {[
          { item: 'Heart of Tarrasque', cambio: 'Pequeños incrementos en costo de receta. Ajuste del % de vida regenerada.', tipo: 'nerf' },
          { item: 'Daedalus', cambio: 'Cambios en el porcentaje de daño crítico. Verifica el costo de componentes.', tipo: 'nerf' },
          { item: 'Octarine Core', cambio: 'Ajuste de reducción de cooldown. Sigue siendo core para héroes de habilidades.', tipo: 'neutral' },
          { item: 'Satanic', cambio: 'Cambios en lifesteal. Evalúa vs. otros ítems de late game.', tipo: 'neutral' },
          { item: 'Guardian Greaves', cambio: 'Ajuste de la curación del aura. Sigue siendo el ítem de support definitivo.', tipo: 'buff' },
        ].map(({ item, cambio, tipo }) => {
          const colors: Record<string, string> = {
            buff: 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30',
            nerf: 'text-rose-400 bg-rose-950/30 border-rose-500/30',
            neutral: 'text-amber-400 bg-amber-950/30 border-amber-500/30',
          };
          return (
            <div key={item} className={`flex gap-3 p-2.5 rounded-lg border ${colors[tipo]}`}>
              <Package className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">{item}</div>
                <div className="text-xs text-gray-400">{cambio}</div>
              </div>
              <Badge color={tipo === 'buff' ? 'bg-emerald-900/60 text-emerald-300' : tipo === 'nerf' ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'}>
                {tipo.toUpperCase()}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>

    <Card>
      <SectionTitle icon={Zap} title="Héroes Fuertes en el Meta Actual" color="text-pink-400" />
      <p className="text-xs text-gray-500 mb-3">Basado en estadísticas de Dotabuff y análisis de la comunidad — meta de parche 7.41</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: 'Wraith King', pos: 'Pos 1', tier: 'S', color: 'bg-amber-900/40 text-amber-300 border-amber-500/30' },
          { name: 'Axe', pos: 'Pos 3', tier: 'A', color: 'bg-rose-900/40 text-rose-300 border-rose-500/30' },
          { name: 'Crystal Maiden', pos: 'Pos 5', tier: 'A', color: 'bg-sky-900/40 text-sky-300 border-sky-500/30' },
          { name: 'Dragon Knight', pos: 'Pos 2', tier: 'A', color: 'bg-violet-900/40 text-violet-300 border-violet-500/30' },
          { name: 'Bristleback', pos: 'Pos 3', tier: 'S', color: 'bg-orange-900/40 text-orange-300 border-orange-500/30' },
          { name: 'Lion', pos: 'Pos 4', tier: 'A', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30' },
        ].map(({ name, pos, tier, color }) => (
          <div key={name} className={`flex items-center justify-between p-2.5 rounded-xl border ${color}`}>
            <div>
              <div className="text-sm font-bold">{name}</div>
              <div className="text-xs opacity-70">{pos}</div>
            </div>
            <div className="text-lg font-black">{tier}</div>
          </div>
        ))}
      </div>
    </Card>

    <Tip variant="info">
      Los parches de Dota 2 cambian frecuentemente el meta. Consulta Dotabuff.com o Stratz.com para estadísticas de winrate actualizadas en tiempo real.
    </Tip>

    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 text-center">
      <div className="text-sm text-gray-400 mb-2">Ver las notas de parche oficiales más recientes:</div>
      <a
        href="https://www.dota2.com/patches"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-sm font-semibold hover:bg-red-600/30 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        dota2.com/patches
      </a>
    </div>
  </div>
);

// ---------- RECURSOS ----------
const LINKS = [
  {
    cat: 'Fuentes Oficiales',
    color: 'text-amber-400',
    links: [
      { name: 'Dota 2 Oficial', url: 'https://www.dota2.com/learn', desc: 'Guías oficiales de Valve para principiantes' },
      { name: 'Notas de Parche', url: 'https://www.dota2.com/patches', desc: 'Historial de todos los parches oficiales' },
      { name: 'Dota 2 Wiki', url: 'https://dota2.fandom.com/wiki/Dota_2_Wiki', desc: 'La wiki más completa de héroes, ítems y mecánicas' },
    ],
  },
  {
    cat: 'Estadísticas & Análisis',
    color: 'text-sky-400',
    links: [
      { name: 'Dotabuff', url: 'https://www.dotabuff.com', desc: 'Estadísticas de héroes, winrates y guías de la comunidad' },
      { name: 'OpenDota', url: 'https://www.opendota.com', desc: 'Datos de partidas open source con análisis profundo' },
      { name: 'STRATZ', url: 'https://www.stratz.com', desc: 'Análisis avanzados con machine learning' },
    ],
  },
  {
    cat: 'Guías de la Comunidad',
    color: 'text-emerald-400',
    links: [
      { name: 'r/learndota2', url: 'https://www.reddit.com/r/learndota2', desc: 'Subreddit dedicado a aprender Dota 2' },
      { name: 'r/DotaAcademy', url: 'https://www.reddit.com/r/DotaAcademy', desc: 'Análisis de partidas y consejos avanzados' },
      { name: 'Liquipedia Dota 2', url: 'https://liquipedia.net/dota2', desc: 'Meta competitivo, torneos y parches analizados' },
    ],
  },
  {
    cat: 'Herramientas & Coaches',
    color: 'text-violet-400',
    links: [
      { name: 'Dota Coach', url: 'https://dotacoach.gg', desc: 'Guías detalladas por héroe con timings y consejos de laning' },
      { name: 'DotaFire', url: 'https://www.dotafire.com', desc: 'Guías comunitarias detalladas con builds de ítems' },
      { name: 'ProDota.com', url: 'https://prodota.com', desc: 'Builds de jugadores profesionales' },
    ],
  },
];

const TabRecursos: React.FC = () => (
  <div className="space-y-4">
    <Tip variant="info">
      Consulta siempre fuentes actualizadas al parche vigente. La wiki oficial y Dotabuff son los recursos más fiables y mejor mantenidos.
    </Tip>

    {LINKS.map(({ cat, color, links }) => (
      <Card key={cat}>
        <SectionTitle icon={ExternalLink} title={cat} color={color} />
        <div className="space-y-2">
          {links.map(({ name, url, desc }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/80 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700 transition-colors">
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{name}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const CONTENT_MAP: Record<TabId, React.FC> = {
  fundamentos: TabFundamentos,
  roles: TabRoles,
  heroes: TabHeroes,
  items: TabItems,
  mapa: TabMapa,
  macro: TabMacro,
  parches: TabParches,
  recursos: TabRecursos,
};

const GuidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('fundamentos');
  const Content = CONTENT_MAP[activeTab];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Guías de Dota 2</h1>
              <p className="text-xs text-gray-500">Para nuevos jugadores y los que quieren perfeccionarse</p>
            </div>
          </div>

          {/* Tabs — scrollable on small screens */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Content />
      </div>
    </div>
  );
};

export default GuidesPage;
