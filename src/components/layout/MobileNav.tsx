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
} from 'lucide-react';
import { usePlayerContext } from '../../context/PlayerContext';

export const MobileNav: React.FC = () => {
  const { accountId: paramAccountId } = useParams<{ accountId?: string }>();
  const { accountId: contextAccountId } = usePlayerContext();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const activeId = paramAccountId || contextAccountId;

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Cerrar al presionar fuera del menú
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

  // ── Ítems principales de la barra inferior (fijos) ─────────────────────────────
  // Análisis Inteligente (Avanzado) en el centro sustituyendo a uno de ellos,
  // con Dashboard, Héroes, Draft y el botón Más.
  const primaryItems = [
    {
      to: activeId ? `/dashboard/${activeId}` : '/search',
      label: 'Dashboard',
      icon: LayoutDashboard,
      disabled: !activeId,
    },
    {
      to: '/hero-encyclopedia',
      label: 'Héroes',
      icon: Sword,
      disabled: false,
    },
    {
      to: activeId ? `/analysis/${activeId}` : '/search',
      label: 'Análisis',
      icon: TrendingUp,
      disabled: !activeId,
      highlight: true, // destacamos en el centro
    },
    {
      to: '/draft',
      label: 'Draft',
      icon: Users,
      disabled: false,
    },
  ];

  // ── Secciones del menú desplegable "Más" (sin duplicar Dashboard, Draft ni Cambiar Jugador) ──
  const menuSections = [
    {
      title: 'Jugador',
      items: [
        {
          to: activeId ? `/heroes/${activeId}` : '/search',
          label: 'Mis Héroes',
          description: 'Estadísticas detalladas, winrate y partidas por héroe',
          icon: Shield,
          disabled: !activeId,
        },
      ],
    },
    {
      title: 'Dota 2 Helper',
      items: [
        {
          to: '/items',
          label: 'Base de Datos de Ítems',
          description: 'Todos los ítems, recetas, costos, componentes y descripciones',
          icon: Package,
          disabled: false,
        },
        {
          to: '/meta',
          label: 'Meta & Tier List',
          description: 'Tier list de héroes, winrates y picks más ganadores por medalla',
          icon: BarChart3,
          disabled: false,
        },
      ],
    },
    {
      title: 'Aprender y Referencia',
      items: [
        {
          to: '/guides',
          label: 'Guías de Dota 2',
          description: 'Conceptos clave, timing de objetivos, mapa y visión',
          icon: GraduationCap,
          disabled: false,
        },
        {
          to: '/legend',
          label: 'Leyenda y Glosario',
          description: 'Definiciones de términos competitivos (GPM, XPM, KDA, etc.)',
          icon: BookOpen,
          disabled: false,
        },
      ],
    },
  ];

  // Comprobar si alguna de las rutas secundarias del modal está activa actualmente
  const isMoreActive = [
    activeId ? `/heroes/${activeId}` : '',
    '/items',
    '/meta',
    '/guides',
    '/legend',
  ].some((path) => path && location.pathname.startsWith(path));

  return (
    <>
      {/* Backdrop overlay para el sheet desplegable */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sheet desplegable hacia arriba (Drawer / Bottom Sheet) */}
      <div
        ref={sheetRef}
        className={`sm:hidden fixed left-0 right-0 bottom-0 z-50 bg-slate-950 border-t border-slate-800 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header del Sheet */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Más Secciones
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-gray-400 hover:text-white transition"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto p-4 space-y-5 pb-8">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1 mb-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between p-3 rounded-2xl border transition group ${
                          item.disabled
                            ? 'opacity-40 cursor-not-allowed pointer-events-none border-transparent bg-slate-900/30'
                            : isActive && item.to !== '/'
                            ? 'bg-red-600/15 border-red-500/40 text-white shadow-md'
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-gray-300'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-red-500/40 transition">
                          <Icon className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition flex-shrink-0 ml-2" />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de navegación inferior fija */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 py-1.5 px-2 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition text-[11px] font-medium ${
                    item.disabled
                      ? 'opacity-40 pointer-events-none text-gray-600'
                      : isActive
                      ? 'text-red-400 bg-red-500/10 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  } ${item.highlight ? 'font-semibold' : ''}`
                }
              >
                <Icon className={`w-5 h-5 mb-0.5 ${item.highlight ? 'text-amber-400' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Botón "Más" para abrir el sheet con las secciones restantes */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition text-[11px] font-medium cursor-pointer ${
              isOpen || isMoreActive
                ? 'text-red-400 bg-red-500/15 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            aria-expanded={isOpen}
            aria-label="Ver más opciones"
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
