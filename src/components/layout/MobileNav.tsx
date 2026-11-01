import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Sword,
  Package,
  TrendingUp,
} from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';

export const MobileNav: React.FC = () => {
  const { accountId: paramAccountId } = useParams<{ accountId?: string }>();
  const { accountId: contextAccountId } = usePlayerContext();

  const activeId = paramAccountId || contextAccountId;

  const items = [
    {
      to: activeId ? `/dashboard/${activeId}` : '/search',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/hero-encyclopedia',
      label: 'Héroes',
      icon: Sword,
    },
    {
      to: '/items',
      label: 'Ítems',
      icon: Package,
    },
    {
      to: activeId ? `/analysis/${activeId}` : '/search',
      label: 'Análisis',
      icon: TrendingUp,
    },
    {
      to: '/search',
      label: 'Buscar',
      icon: Search,
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 py-1.5 px-2 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-[11px] font-medium ${
                  isActive
                    ? 'text-red-400 bg-red-500/10 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
