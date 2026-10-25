import React, { useState } from 'react';
import { ShoppingBag, Clock } from 'lucide-react';
import type { MatchDetail, MatchPlayer } from '../../api/types';
import ItemIcon from '../common/ItemIcon';
import HeroIcon from '../common/HeroIcon';
import { formatDuration, isRadiant } from '../../utils/formatting';
import { useConstants } from '../../hooks/useConstants';

interface ItemTimelineProps {
  match: MatchDetail;
}

export const ItemTimeline: React.FC<ItemTimelineProps> = ({ match }) => {
  const { getHeroName, getItemName } = useConstants();
  const [selectedSlot, setSelectedSlot] = useState<number>(
    match.players && match.players.length > 0 ? match.players[0].player_slot : 0
  );

  const selectedPlayer = match.players?.find((p) => p.player_slot === selectedSlot);
  const purchaseLog = selectedPlayer?.purchase_log || [];

  // Filter out minor consumables (clarity, tango, branches, wards) to highlight key items unless small list
  const filteredPurchases = purchaseLog.filter((item) => {
    const key = item.key;
    if (
      key === 'tango' ||
      key === 'clarity' ||
      key === 'flask' ||
      key === 'faerie_fire' ||
      key === 'branches' ||
      key === 'tpscroll' ||
      key === 'smoke_of_deceit' ||
      key === 'dust'
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Línea de Tiempo de Items (Item Timings)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Selecciona un jugador para ver cuándo completó cada item importante
          </p>
        </div>
      </div>

      {/* Player picker tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {match.players?.map((p) => {
          const isRad = isRadiant(p.player_slot);
          const isSelected = p.player_slot === selectedSlot;

          return (
            <button
              key={p.player_slot}
              onClick={() => setSelectedSlot(p.player_slot)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition flex-shrink-0 ${
                isSelected
                  ? isRad
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow'
                    : 'bg-rose-500/20 border-rose-500 text-white shadow'
                  : 'bg-slate-950/60 border-slate-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              <HeroIcon heroId={p.hero_id} size="sm" />
              <span>{getHeroName(p.hero_id)}</span>
            </button>
          );
        })}
      </div>

      {/* Purchases timeline */}
      {filteredPurchases.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          No hay registros de compras detalladas para este jugador en la repetición.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredPurchases.map((purchase, idx) => {
              const name = getItemName(purchase.key);

              return (
                <div
                  key={`${purchase.key}-${purchase.time}-${idx}`}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3 hover:border-slate-700 transition"
                >
                  <ItemIcon itemKey={purchase.key} size="md" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-200 truncate" title={name}>
                      {name || purchase.key}
                    </div>
                    <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {formatDuration(purchase.time)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemTimeline;
