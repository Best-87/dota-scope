import React, { useState } from 'react';
import { useConstants } from '../../hooks/useConstants';
import { getItemImageUrl } from '../../utils/constants';

interface ItemIconProps {
  itemId?: number | null;
  itemKey?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({
  itemId,
  itemKey,
  size = 'md',
  className = '',
}) => {
  const { items, getItemName } = useConstants();
  const [hasError, setHasError] = useState(false);

  // If no item ID or key provided or empty slot (0)
  if ((itemId === undefined || itemId === null || itemId === 0) && !itemKey) {
    const emptySize = {
      sm: 'w-6 h-5',
      md: 'w-8 h-6',
      lg: 'w-11 h-8',
    }[size];
    return <div className={`${emptySize} bg-slate-900/60 rounded border border-slate-800/80 ${className}`} />;
  }

  // Lookup item in items dictionary
  let itemData: any = null;
  let keyString = itemKey || (itemId ? String(itemId) : '');

  if (itemKey && items[itemKey]) {
    itemData = items[itemKey];
  } else if (itemId) {
    for (const it of Object.values(items)) {
      if ((it as any).id === itemId) {
        itemData = it;
        break;
      }
    }
  }

  const displayName = itemData?.dname || getItemName(keyString) || `Item ${itemId || itemKey}`;
  const rawImg = itemData?.img;
  const iconUrl = rawImg ? getItemImageUrl(rawImg) : null;

  const sizeClasses = {
    sm: 'w-6 h-5',
    md: 'w-8 h-6',
    lg: 'w-11 h-8',
  }[size];

  return (
    <div
      className={`${sizeClasses} relative rounded overflow-hidden bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-sm ${className}`}
      title={displayName}
    >
      {iconUrl && !hasError ? (
        <img
          src={iconUrl}
          alt={displayName}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-[10px] text-gray-500 font-mono">
          {displayName.slice(0, 3)}
        </span>
      )}
    </div>
  );
};

export default ItemIcon;
