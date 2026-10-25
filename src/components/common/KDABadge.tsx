import React from 'react';
import { calculateKDA, formatKDA } from '../../utils/formatting';

interface KDABadgeProps {
  kills: number;
  deaths: number;
  assists: number;
  showRatio?: boolean;
  className?: string;
}

export const KDABadge: React.FC<KDABadgeProps> = ({
  kills,
  deaths,
  assists,
  showRatio = true,
  className = '',
}) => {
  const ratio = calculateKDA(kills, deaths, assists);

  let ratioColor = 'text-gray-400 bg-gray-500/10 border-gray-600/30';
  if (ratio >= 4.5) {
    ratioColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30 font-semibold';
  } else if (ratio >= 3.0) {
    ratioColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  } else if (ratio >= 2.0) {
    ratioColor = 'text-sky-400 bg-sky-500/15 border-sky-500/30';
  } else if (ratio < 1.0) {
    ratioColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm tracking-tight text-gray-200">
        <span className="text-emerald-400 font-medium">{kills}</span>
        <span className="text-gray-500"> / </span>
        <span className="text-rose-400 font-medium">{deaths}</span>
        <span className="text-gray-500"> / </span>
        <span className="text-sky-400 font-medium">{assists}</span>
      </span>

      {showRatio && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded border font-mono ${ratioColor}`}
          title="KDA Ratio: (K + A) / max(D, 1)"
        >
          {ratio.toFixed(2)}
        </span>
      )}
    </div>
  );
};

export default KDABadge;
