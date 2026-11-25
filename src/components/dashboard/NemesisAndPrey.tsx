import React, { useState, useEffect, useMemo } from 'react';
import { Skull, Trophy, ShieldAlert, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { getHeroes } from '../../api/opendota';
import type { HeroStats } from '../../api/types';
import HeroIcon from '../common/HeroIcon';
import { useConstants } from '../../hooks/useConstants';

interface NemesisAndPreyProps {
  accountId: number;
}

type TimeRange = 7 | 15 | 30 | 'all';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 7, label: '7 días' },
  { value: 15, label: '15 días' },
  { value: 30, label: '30 días' },
  { value: 'all', label: 'Todo' },
];

function getCounterTip(roles: string[] = []): string {
  if (roles.includes('Escape')) {
    return 'Prioriza control instantáneo (Orchid, Scythe of Vyse, Atos) y Nullifier para evitar que escape.';
  }
  if (roles.includes('Durable')) {
    return 'Compra Spirit Vessel, Eye of Skadi o Silver Edge para cortar su regeneración y pasivas defensivas.';
  }
  if (roles.includes('Pusher')) {
    return 'Limpia oleadas rápido desde lejos, defiende torres temprano con TP y castiga su split-push con smokes.';
  }
  if (roles.includes('Nuker') || roles.includes('Disabler')) {
    return 'Asegura Black King Bar (BKB), Lotus Orb o Glimmer Cape para sobrevivir su ráfaga inicial.';
  }
  if (roles.includes('Carry')) {
    return 'Invade su jungla con visión agresiva, gankea antes de su primer ítem mayor y arma Ghost Scepter / Heaven’s Halberd.';
  }
  return 'Controla su ritmo con wards en sus rutas de farmeo y coordina iniciaciones en grupo antes de que escale.';
}

export const NemesisAndPrey: React.FC<NemesisAndPreyProps> = ({ accountId }) => {
  const { heroes, getHeroName } = useConstants();
  const [range, setRange] = useState<TimeRange>(15);
  const [stats, setStats] = useState<HeroStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedHeroId, setExpandedHeroId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const days = range === 'all' ? undefined : range;
    getHeroes(accountId, days)
      .then((data) => {
        if (active) {
          setStats(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setStats([]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [accountId, range]);

  const { nemesis, prey } = useMemo(() => {
    const minGames = range === 7 ? 1 : 2;
    const valid = stats.filter((h) => h.against_games >= minGames);

    const withRate = valid.map((h) => {
      const wins = h.against_win;
      const losses = h.against_games - h.against_win;
      const winRate = h.against_games > 0 ? Math.round((wins / h.against_games) * 100) : 0;
      return { ...h, wins, losses, winRate };
    });

    const nemesisList = [...withRate]
      .filter((h) => h.losses > 0)
      .sort((a, b) => a.winRate - b.winRate || b.losses - a.losses)
      .slice(0, 5);

    const preyList = [...withRate]
      .filter((h) => h.wins > 0)
      .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
      .slice(0, 5);

    return { nemesis: nemesisList, prey: preyList };
  }, [stats, range]);

  return (
    <div className="bg-gradient-to-b from-[#111520]/90 to-[#0c0f16]/95 border border-white/[0.08] rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Matchups: Némesis y Víctimas
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Héroes contra los que más pierdes o ganas y cómo contrarrestarlos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#090b10] p-1 rounded-xl border border-white/[0.08] text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {TIME_RANGES.map((r) => (
            <button
              key={String(r.value)}
              type="button"
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === r.value
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-xs text-slate-400 font-mono">
          Cargando historial de enfrentamientos...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nemesis (Most Lost Against) */}
          <div className="bg-[#090c12]/80 border border-rose-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Skull className="w-4 h-4" />
              <span>Contra los que más pierdo</span>
            </div>

            {nemesis.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                No hay suficientes partidas en este período.
              </p>
            ) : (
              <div className="space-y-2">
                {nemesis.map((h) => {
                  const heroInfo = heroes?.[h.hero_id];
                  const isOpen = expandedHeroId === h.hero_id;
                  return (
                    <div
                      key={h.hero_id}
                      className="bg-[#0e121a] border border-white/[0.05] rounded-xl p-3 transition hover:border-rose-500/30"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <HeroIcon heroId={h.hero_id} size="sm" />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-100 truncate">
                              {getHeroName(h.hero_id)}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {h.wins}V - {h.losses}D ({h.against_games} partidas)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            {h.winRate}% WR
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedHeroId(isOpen ? null : h.hero_id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 transition"
                          >
                            <span>Cómo lidiar</span>
                            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                          <span className="text-amber-400 font-bold">Consejo táctico: </span>
                          {getCounterTip(heroInfo?.roles)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prey (Most Won Against) */}
          <div className="bg-[#090c12]/80 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Trophy className="w-4 h-4" />
              <span>Contra los que más gano</span>
            </div>

            {prey.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                No hay suficientes partidas en este período.
              </p>
            ) : (
              <div className="space-y-2">
                {prey.map((h) => (
                  <div
                    key={h.hero_id}
                    className="bg-[#0e121a] border border-white/[0.05] rounded-xl p-3 flex items-center justify-between gap-3 transition hover:border-emerald-500/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <HeroIcon heroId={h.hero_id} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-100 truncate">
                          {getHeroName(h.hero_id)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {h.wins}V - {h.losses}D ({h.against_games} partidas)
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                      {h.winRate}% WR
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NemesisAndPrey;
