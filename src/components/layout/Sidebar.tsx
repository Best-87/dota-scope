import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  TrendingUp,
  Search,
  Sparkles,
  Gamepad2,
  BookOpen,
} from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';

export const Sidebar: React.FC = () => {
  const { accountId: paramAccountId } = useParams<{ accountId?: string }>();
  const { accountId: contextAccountId } = usePlayerContext();

  const activeId = paramAccountId || contextAccountId;

  const navItems = [
    {
      to: activeId ? `/dashboard/${activeId}` : '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      disabled: !activeId,
    },
    {
      to: activeId ? `/heroes/${activeId}` : '/',
      label: 'Héroes & Winrate',
      icon: Shield,
      disabled: !activeId,
    },
    {
      to: activeId ? `/analysis/${activeId}` : '/',
      label: 'Análisis Avanzado',
      icon: TrendingUp,
      disabled: !activeId,
    },
    {
      to: '/search',
      label: 'Cambiar Jugador',
      icon: Search,
      disabled: false,
    },
    {
      to: '/legend',
      label: 'Leyenda y Glosario',
      icon: BookOpen,
      disabled: false,
    },
  ];

  return (
    <aside className="w-16 md:w-56 bg-slate-950/70 border-r border-slate-800/80 flex flex-col py-4 px-2 md:px-3 flex-shrink-0 min-h-[calc(100vh-57px)]">
      <div className="space-y-1.5">
        <div className="hidden md:block px-3 py-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          Menú
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.disabled
                    ? 'text-gray-600 cursor-not-allowed opacity-50'
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
