import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sword,
  Package,
  TrendingUp,
  MoreHorizontal,
  X,
  Shield,
  Users,
  BarChart3,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';

export const MobileNav: React.FC = () => {
  const { accountId: paramAccountId } = useParams<{ accountId?: string }>();
  const { accountId: contextAccountId } = usePlayerContext();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const activeId = paramAccountId || contextAccountId;

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const primaryItems = [
    {
      to: activeId ? `/dashboard/${activeId}` : '/search',
      label: 'Dashboard',
      icon: LayoutDashboard,
      disabled: !activeId,
    },
    {
      to: activeId ? `/heroes/${activeId}` : '/search',
      label: 'Mis Héroes',
      icon: Shield,
      disabled: !activeId,
    },
    {
      to: activeId ? `/analysis/${activeId}` : '/search',
      label: 'Análisis Pro',
      icon: TrendingUp,
      disabled: !activeId,
      highlight: true,
    },
    {
      to: '/draft',
      label: 'Draft Helper',
      icon: Users,
      disabled: false,
    },
  ];

  const menuSections = [
    {
      title: 'Dota 2 Hub',
      items: [
        {
          to: '/hero-encyclopedia',
          label: 'Enciclopedia de Héroes',
          description: 'Habilidades, counters y builds de los 124 héroes',
          icon: Sword,
          disabled: false,
        },
        {
          to: '/items',
          label: 'Base de Ítems',
          description: 'Recetas, costos y árboles de componentes',
          icon: Package,
          disabled: false,
        },
        {
          to: '/meta',
          label: 'Meta & Tier List',
          description: 'Picks y winrates más ganadores por medalla',
          icon: BarChart3,
          disabled: false,
        },
      ],
    },
    {
      title: 'Aprender y Tácticas',
      items: [
        {
          to: '/guides',
          label: 'Guías Tácticas',
          description: 'Control de mapa, visión y timing de objetivos',
          icon: GraduationCap,
          disabled: false,
        },
        {
          to: '/legend',
          label: 'Glosario & Leyenda',
          description: 'Definiciones de términos competitivos (GPM, KDA, etc.)',
          icon: BookOpen,
          disabled: false,
        },
      ],
    },
  ];

  const isMoreActive = [
    '/hero-encyclopedia',
    '/items',
    '/meta',
    '/guides',
    '/legend',
  ].some((path) => path && location.pathname.startsWith(path));

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Drawer Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`sm:hidden fixed left-0 right-0 bottom-0 z-50 bg-[#0a0d14] border-t border-amber-500/30 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-sm shadow-amber-500/50" />
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-widest font-mono">
              Centro de Módulos
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white transition"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-5 pb-10">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2 font-mono">
                {section.title}
              </div>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between p-3.5 rounded-2xl border transition group ${
                          item.disabled
                            ? 'opacity-35 cursor-not-allowed pointer-events-none border-transparent bg-white/[0.02]'
                            : isActive && item.to !== '/'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md'
                            : 'bg-[#10141e]/90 hover:bg-[#151a26] border-white/[0.06] text-slate-300'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#090b10] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-amber-500/40 transition">
                          <Icon className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition flex-shrink-0 ml-2" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090b10]/95 backdrop-blur-xl border-t border-white/[0.08] py-2 px-3 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-[11px] font-bold ${
                    item.disabled
                      ? 'opacity-35 pointer-events-none text-slate-600'
                      : isActive
                      ? 'text-amber-400 bg-amber-500/15 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                <Icon className={`w-5 h-5 mb-0.5 ${item.highlight ? 'text-amber-400' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-[11px] font-bold cursor-pointer ${
              isOpen || isMoreActive
                ? 'text-amber-400 bg-amber-500/15'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-expanded={isOpen}
            aria-label="Más"
          >
            <MoreHorizontal className="w-5 h-5 mb-0.5" />
            <span>Más</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
