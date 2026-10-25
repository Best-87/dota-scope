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
        { to: activeId ? `/analysis/${activeId}` : '/search', label: 'Análisis Avanzado', icon: TrendingUp, disabled: !activeId },
      ],
    },
    {
      label: 'Dota 2 Helper',
      items: [
        { to: '/hero-encyclopedia', label: 'Enciclopedia de Héroes', icon: Sword, disabled: false },
        { to: '/items', label: 'Base de Datos de Ítems', icon: Package, disabled: false },
        { to: '/draft', label: 'Asistente de Draft', icon: Users, disabled: false },
        { to: '/meta', label: 'Meta & Tier List', icon: BarChart3, disabled: false },
      ],
    },
    {
      label: 'Aprender',
      items: [
        { to: '/guides', label: 'Guías de Dota', icon: GraduationCap, disabled: false },
        { to: '/legend', label: 'Leyenda y Glosario', icon: BookOpen, disabled: false },
      ],
    },
  ];

  return (
    <aside className="w-16 md:w-60 bg-slate-950/70 border-r border-slate-800/80 flex flex-col py-4 px-2 md:px-3 flex-shrink-0 min-h-[calc(100vh-57px)]">
      <div className="space-y-5 flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            {/* Section label — desktop only */}
            <div className="hidden md:block px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              {section.label}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        item.disabled
                          ? 'text-gray-600 cursor-not-allowed opacity-40 pointer-events-none'
                          : isActive && item.to !== '/'
                          ? 'bg-red-600/15 text-red-400 border border-red-500/30'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60'
                      }`
                    }
                    title={item.label}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:inline truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer badge */}
      <div className="mt-auto hidden md:block p-3 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800/60 text-xs">
        <div className="flex items-center gap-1.5 text-red-400 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OpenDota API</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Datos en tiempo real directo desde las repeticiones de Valve.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
