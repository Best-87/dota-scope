import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  TrendingUp,
  Search,
  Sparkles,
  BookOpen,
  GraduationCap,
  Sword,
  Package,
  Users,
  BarChart3,
} from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';

export const Sidebar: React.FC = () => {
  const { accountId: paramAccountId } = useParams<{ accountId?: string }>();
  const { accountId: contextAccountId } = usePlayerContext();

  const activeId = paramAccountId || contextAccountId;

  // ── NAV SECTIONS ─────────────────────────────────────────────────────────────
  const sections = [
    {
      label: 'Jugador',
      items: [
        { to: '/search', label: 'Cambiar Jugador', icon: Search, disabled: false },
        { to: activeId ? `/dashboard/${activeId}` : '/search', label: 'Dashboard', icon: LayoutDashboard, disabled: !activeId },
        { to: activeId ? `/heroes/${activeId}` : '/search', label: 'Mis Héroes', icon: Shield, disabled: !activeId },
        { to: activeId ? `/analysis/${activeId}` : '/search', label: 'Análisis Pro', icon: TrendingUp, disabled: !activeId },
      ],
    },
    {
      label: 'Dota 2 Hub',
      items: [
        { to: '/hero-encyclopedia', label: 'Enciclopedia Héroes', icon: Sword, disabled: false },
        { to: '/items', label: 'Base de Ítems', icon: Package, disabled: false },
        { to: '/draft', label: 'Asistente de Draft', icon: Users, disabled: false },
        { to: '/meta', label: 'Meta & Tier List', icon: BarChart3, disabled: false },
      ],
    },
    {
      label: 'Recursos',
      items: [
        { to: '/guides', label: 'Guías Tácticas', icon: GraduationCap, disabled: false },
        { to: '/legend', label: 'Glosario & Leyenda', icon: BookOpen, disabled: false },
      ],
    },
  ];

  return (
    <aside className="hidden sm:flex w-16 md:w-64 bg-[#0a0d14]/70 border-r border-white/[0.06] flex-col py-5 px-2 md:px-3.5 flex-shrink-0 min-h-[calc(100vh-61px)] backdrop-blur-md">
      <div className="space-y-6 flex-1 overflow-y-auto pr-0.5">
        {sections.map((section) => (
          <div key={section.label}>
            {/* Section label */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.18em] mb-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
              <span>{section.label}</span>
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 group relative ${
                        item.disabled
                          ? 'text-slate-600 cursor-not-allowed opacity-35 pointer-events-none'
                          : isActive && item.to !== '/'
                          ? 'bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent text-amber-300 border-l-2 border-amber-500 shadow-sm font-bold pl-3'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                      }`
                    }
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 md:w-4.5 md:h-4.5 flex-shrink-0 transition-transform group-hover:scale-110" />
                    <span className="hidden md:inline truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer badge with gold glow */}
      <div className="mt-auto hidden md:block p-3.5 rounded-2xl bg-gradient-to-b from-amber-950/20 to-black/60 border border-amber-500/20 text-xs shadow-lg">
        <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="tracking-wide">DOTA 2 PRO ENGINE</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Telemetría avanzada sincronizada con OpenDota y Valve.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
