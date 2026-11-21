import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  aspectClassName?: string;
  onClick?: () => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
  aspectClassName = '',
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/70 text-slate-500 p-4 text-center border border-slate-200/80 ${aspectClassName} ${onClick ? 'cursor-pointer' : ''}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-2 text-[#003B73]">
          <ImageOff className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-600 line-clamp-2 max-w-[200px]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${aspectClassName}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        onClick={onClick}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${onClick ? 'cursor-zoom-in' : ''}`}
      />
    </div>
  );
};
