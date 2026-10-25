import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Cargando datos...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div
        className={`${sizeClasses} border-red-500 border-t-transparent rounded-full animate-spin`}
      />
      {message && <p className="text-gray-400 text-sm font-medium tracking-wide">{message}</p>}
    </div>
  );
};

export default Loading;
