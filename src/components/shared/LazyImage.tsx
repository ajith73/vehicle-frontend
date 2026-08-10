import React, { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  imgClassName?: string;
}

export function LazyImage({ src, alt, className, imgClassName = '', fallbackSrc, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const defaultFallback = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f1f5f9"/><text x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="central">🛠️</text></svg>')}`;

  const currentSrc = error ? (fallbackSrc || defaultFallback) : src;
  const baseClass = className === undefined ? 'w-full h-full' : className;

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        setError(true);
        setIsLoaded(true);
      }}
      className={`${baseClass} object-cover transition-all duration-700 ease-in-out ${imgClassName} ${
        isLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-md scale-105 opacity-50'
      }`}
      {...props}
    />
  );
}
