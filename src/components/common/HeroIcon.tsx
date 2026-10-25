import React, { useState } from 'react';
import { useConstants } from '../../hooks/useConstants';

interface HeroIconProps {
  heroId: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export const HeroIcon: React.FC<HeroIconProps> = ({
  heroId,
  size = 'md',
  showName = false,
  className = '',
}) => {
  const { getHeroIcon, getHeroName } = useConstants();
  const [hasError, setHasError] = useState(false);

  const iconUrl = getHeroIcon(heroId);
  const heroName = getHeroName(heroId);

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeStyles} relative rounded overflow-hidden bg-slate-800 border border-slate-700/60 flex-shrink-0 flex items-center justify-center shadow`}
        title={heroName}
      >
        {iconUrl && !hasError ? (
          <img
            src={iconUrl}
            alt={heroName}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-gray-400 font-semibold uppercase">
            {heroName.slice(0, 2)}
          </span>
        )}
      </div>
      {showName && (
        <span className="text-gray-200 font-medium truncate" title={heroName}>
          {heroName}
        </span>
      )}
    </div>
  );
};

export default HeroIcon;
