import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface SectionProps {
  title: string;
  emoji?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, emoji, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-800/80 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-900/70 hover:bg-slate-800/60 transition text-left"
      >
        <span className="font-bold text-gray-200 flex items-center gap-2 text-base">
          {emoji && <span>{emoji}</span>}
          {title}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 py-4 bg-slate-950/60 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

interface TermProps {
  term: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
}
const Term: React.FC<TermProps> = ({ term, badge, badgeColor = 'bg-slate-700 text-gray-300', children }) => (
  <div className="flex gap-3 text-sm">
    <div className="flex-shrink-0 w-36 pt-0.5">
      <span className="font-mono font-bold text-red-400">{term}</span>
      {badge && (
        <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>{badge}</span>
      )}
    </div>
    <div className="text-gray-400 leading-relaxed">{children}</div>
  </div>
);

const GradeRow: React.FC<{ grade: string; range: string; color: string; label: string; desc: string }> = ({
  grade, range, color, label, desc
}) => (
  <div className="flex items-start gap-3 text-sm">
    <span className={`font-black text-xl w-6 text-center flex-shrink-0 ${color}`}>{grade}</span>
    <div>
      <span className="text-gray-300 font-semibold">{range} — {label}</span>
      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
    </div>
  </div>
);

const PosRow: React.FC<{ pos: string; name: string; color: string; desc: string; examples: string }> = ({
  pos, name, color, desc, examples
}) => (
  <div className="flex gap-3 text-sm">
    <span className={`font-black flex-shrink-0 w-16 ${color}`}>{pos}</span>
    <div>
      <span className="text-gray-200 font-semibold">{name}</span>
      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
      <p className="text-gray-600 text-xs mt-0.5 italic">Ejemplos: {examples}</p>
    </div>
  </div>
);

export const LegendPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-red-600/15 border border-red-500/30">
          <BookOpen className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Leyenda y Glosario</h1>
          <p className="text-sm text-gray-400 mt-0.5">Guía de todos los datos y métricas mostrados en DotaScope</p>
        </div>
      </div>

      {/* ── Estadísticas básicas de partida ── */}
      <Section title="Estadísticas de Partida" emoji="📊" defaultOpen={true}>
        <Term term="KDA">
          <strong className="text-gray-300">Kills / Deaths / Assists</strong> — Bajas logradas / Muertes sufridas / Asistencias.
          Ejemplo: <span className="font-mono text-green-400">8/2/11</span> = 8 kills, 2 muertes, 11 asistencias.
        </Term>
        <Term term="Ratio KDA">
          Fórmula: <span className="font-mono">(Kills + Assists) / max(Deaths, 1)</span>. Un valor mayor indica mejor desempeño relativo.
        </Term>
        <Term term="GPM">
          <strong className="text-gray-300">Gold Per Minute</strong> — Oro ganado por minuto. Refleja la eficiencia del héroe para farmear (creeps, torres, Roshan, etc.).
        </Term>
        <Term term="XPM">
          <strong className="text-gray-300">Experience Per Minute</strong> — Experiencia ganada por minuto. Mayor XPM → sube de nivel más rápido.
        </Term>
        <Term term="LH / DN">
          <strong className="text-gray-300">Last Hits / Denies</strong> — Creeps enemigos rematados (dan oro) / Creeps propios negados (quitan XP al enemigo).
        </Term>
        <Term term="Networth">
          Valor total de oro del héroe: ítems comprados + oro en mano. Principal indicador de ventaja económica.
        </Term>
        <Term term="Héroe DMG">
          <strong className="text-gray-300">Daño a Héroes</strong> — Total de daño infligido a héroes enemigos durante la partida.
        </Term>
        <Term term="Torre DMG">
          <strong className="text-gray-300">Daño a Torres</strong> — Total de daño infligido a estructuras (torres, barracas, ancestro) del equipo rival.
        </Term>
        <Term term="Curación">
          <strong className="text-gray-300">Hero Healing</strong> — Total de puntos de vida restaurados a héroes aliados.
        </Term>
        <Term term="Stuns">
          Segundos totales de aturdimiento/control de masa aplicados sobre héroes enemigos. Solo disponible en partidas parseadas.
        </Term>
      </Section>

      {/* ── Visión y Wards ── */}
      <Section title="Visión y Wards" emoji="👁️">
        <Term term="Obs. Wards" badge="👁" badgeColor="bg-amber-900/40 text-amber-400">
          <strong className="text-gray-300">Observer Wards</strong> — Guardianes de visión. Revelan áreas del mapa para tu equipo durante 6 minutos.
          El número junto al icono indica cuántos ward colocó ese jugador.
        </Term>
        <Term term="Sen. Wards" badge="🛡" badgeColor="bg-sky-900/40 text-sky-400">
          <strong className="text-gray-300">Sentry Wards</strong> — Guardianes de detección. Revelan héroes invisibles y wards enemigos en el área.
          Son clave para la guerra de visión.
        </Term>
        <Term term="Mapa de Wards">
          Vista visual en el mapa de Dota 2 con la ubicación exacta de cada ward colocado/destruido durante la partida.
          Solo disponible cuando la partida ha sido <strong className="text-amber-300">parseada</strong>.
        </Term>
        <Term term="N/D">
          <strong className="text-gray-300">No Disponible</strong> — El dato requiere que la partida esté parseada y aún no lo está.
          Usa el botón "Parsear Partida" para solicitarlo.
        </Term>
      </Section>

      {/* ── Posiciones / Roles ── */}
      <Section title="Posiciones / Roles (Pos 1–5)" emoji="🛡️">
        <p className="text-xs text-gray-500 mb-3">
          En Dota 2, los 5 jugadores de un equipo se distribuyen en roles numerados del 1 al 5 según su prioridad de farm y función.
        </p>
        <div className="space-y-4">
          <PosRow
            pos="Pos 1 · HC"
            name="Hard Carry"
            color="text-yellow-400"
            desc="El héroe que necesita más farm. Su objetivo es acumular ítems costosos para ser imparable al final. Generalmente juega en la Safe Lane (parte inferior de Radiant / parte superior de Dire)."
            examples="Juggernaut, Phantom Assassin, Anti-Mage, Spectre"
          />
          <PosRow
            pos="Pos 2 · Mid"
            name="Midlaner"
            color="text-sky-400"
            desc="Juega solo en el carril central. Tiene acceso rápido a ambos lados del mapa, suele ser un héroe fuerte a niveles medios que puede rotar a apoyar otros carriles (gank)."
            examples="Storm Spirit, Invoker, Templar Assassin, Shadow Fiend"
          />
          <PosRow
            pos="Pos 3 · Off"
            name="Offlaner"
            color="text-orange-400"
            desc="Juega en la Off Lane (carril contrario al HC). Su rol es sobrevivir en condiciones desventajosas, crear presión e iniciar peleas. Usualmente son héroes resistentes o con CC."
            examples="Axe, Dragon Knight, Mars, Tidehunter"
          />
          <PosRow
            pos="Pos 4 · Soporte 4"
            name="Soft Support"
            color="text-purple-400"
            desc="Soporte semibrigada. Apoya al Offlaner en la Off Lane al inicio, luego rota para crear jugadas. Tiene algo de farm y participa en peleas de forma activa."
            examples="Earthshaker, Windranger, Sand King, Clockwerk"
          />
          <PosRow
            pos="Pos 5 · Soporte 5"
            name="Hard Support"
            color="text-emerald-400"
            desc="Soporte puro. Sacrifica su farm para darle seguridad al HC. Coloca wards, compra consumibles (TP, dust, smoke) y protege al carry durante el laning. Tiene el menor networth del equipo."
            examples="Crystal Maiden, Ancient Apparition, Dazzle, Lich"
          />
        </div>
      </Section>

      {/* ── Escala de Calificaciones ── */}
      <Section title="Escala de Calificaciones del Diagnóstico" emoji="🏆">
        <p className="text-xs text-gray-500 mb-3">
          El Diagnóstico de partida asigna una nota de 0–100 puntos a cada jugador según su desempeño en su rol.
          Factores incluyen: GPM/XPM relativo al equipo, KDA, participación en kills, ward colocados, último hit, daño y más.
        </p>
        <div className="space-y-3">
          <GradeRow grade="S" range="90–100" color="text-yellow-400" label="Excepcional"
            desc="Rendimiento de primer nivel. Por encima de todas las métricas esperadas para su rol." />
          <GradeRow grade="A" range="75–89" color="text-green-400" label="Muy Bueno"
            desc="Sólido en su rol. Pocas o ninguna área débil detectada." />
          <GradeRow grade="B" range="60–74" color="text-sky-400" label="Bueno"
            desc="Desempeño aceptable. Algunas métricas por mejorar pero sin fallos críticos." />
          <GradeRow grade="C" range="45–59" color="text-gray-300" label="Regular"
            desc="Varias áreas por debajo de lo esperado. Puede haber impactado negativamente el resultado." />
          <GradeRow grade="D" range="25–44" color="text-orange-400" label="Deficiente"
            desc="Rendimiento notablemente bajo. Múltiples errores o carencias detectadas." />
          <GradeRow grade="F" range="0–24" color="text-rose-500" label="Crítico"
            desc="Desempeño muy por debajo del mínimo esperado para su rol. Factor determinante en la derrota." />
        </div>
        <p className="text-xs text-gray-600 mt-3 italic">
          * Las calificaciones se calculan únicamente con datos reales de la partida. Si la partida no está parseada, algunos factores no se evalúan.
        </p>
      </Section>

      {/* ── Partidas parseadas vs sin parsear ── */}
      <Section title="Telemetría Completa vs. Partida Sin Parsear" emoji="🔬">
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40">
            <p className="font-semibold text-amber-300 mb-1">⚠️ Partida Sin Parsear (datos básicos)</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              OpenDota guarda por defecto estadísticas básicas de todas las partidas públicas: KDA, GPM, XPM, LH, ítems finales, duración, resultado.
              Sin embargo, datos avanzados como ubicación de wards, historial de compras, daño por segundo o habilidades usadas <strong>no están disponibles</strong>.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
            <p className="font-semibold text-emerald-300 mb-1">✅ Partida Parseada (telemetría completa)</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Al parsear, OpenDota descarga y procesa el replay (.dem) de Valve. Esto desbloquea: mapa de wards, historial de ítems con tiempos exactos,
              gráfica de ventaja de oro/XP, segundos de stun, habilidades usadas, posición en el mapa, entre otros.
              El parseo puede tardar de 1 a 5 minutos.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Otros términos ── */}
      <Section title="Otros Términos y Abreviaciones" emoji="📖">
        <Term term="Kill Part.">
          <strong className="text-gray-300">Participación en Kills</strong> — Porcentaje de kills del equipo en los que el jugador estuvo involucrado (kill o asistencia).
          Fórmula: <span className="font-mono">(Kills + Assists) / Kills totales del equipo × 100</span>.
        </Term>
        <Term term="CS">
          <strong className="text-gray-300">Creep Score</strong> — Igual que Last Hits. Término más común en otros juegos, en Dota se dice "last hits".
        </Term>
        <Term term="Radiant / Dire">
          Los dos equipos del juego. Radiant comienza en la parte inferior-izquierda del mapa (base verde), Dire en la superior-derecha (base roja).
        </Term>
        <Term term="Roshan">
          Creep neutral élite ubicado en el río. Al derrotarlo suelta el <em>Aegis of the Immortal</em> (resurrección) y a veces el <em>Cheese</em>.
        </Term>
        <Term term="Gank">
          Rotación sorpresiva hacia otro carril para emboscar y eliminar al enemigo.
        </Term>
        <Term term="Smoke">
          <strong className="text-gray-300">Smoke of Deceit</strong> — Ítem consumible. Hace invisible a todo el equipo y los oculta del minimapa mientras se mueven juntos para intentar una emboscada.
        </Term>
        <Term term="TP">
          <strong className="text-gray-300">Town Portal Scroll</strong> — Permite teletransportarse a cualquier estructura aliada. Fundamental para responder a peleas y defender torres.
        </Term>
        <Term term="Laning Stage">
          Los primeros ~8–10 minutos de la partida donde los héroes farmean en sus carriles respectivos antes de que el mapa se "abra".
        </Term>
        <Term term="Teamfight">
          Pelea de 5v5 (o casi) donde se decide el control del mapa, torres o Roshan.
        </Term>
        <Term term="Networth Diff">
          Diferencia de Networth acumulado entre los dos equipos. Indica quién tiene ventaja económica en un momento dado.
        </Term>
      </Section>

      <p className="text-center text-xs text-gray-600 pt-2">
        DotaScope — Datos provistos por la API pública de{' '}
        <a
          href="https://www.opendota.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-400 hover:underline"
        >
          OpenDota
        </a>
      </p>
    </div>
  );
};

export default LegendPage;
