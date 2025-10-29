import { useState, useEffect } from 'react';

interface Photo {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

interface CircularPhotoSlideshowProps {
  photos: Photo[];
  autoPlay?: boolean;
  interval?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CircularPhotoSlideshow({ 
  photos, 
  autoPlay = true, 
  interval = 4000,
  size = 'md'
}: CircularPhotoSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || photos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, photos.length, isHovered]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  if (!photos.length) return null;

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div 
      className="relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Circular Photo Container */}
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden shadow-lg border-4 border-white`}>
        <img
          src={photos[currentIndex].src}
          alt={photos[currentIndex].alt}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-md transition-all duration-200 hover:scale-110"
              aria-label="Previous photo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-md transition-all duration-200 hover:scale-110"
              aria-label="Next photo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {photos.length > 1 && (
        <div className="flex space-x-2 mt-4">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${dotSizeClasses[size]} rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-terracotta' 
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Caption */}
      {photos[currentIndex].caption && (
        <p className="mt-3 text-sm text-slate-600 text-center max-w-xs">
          {photos[currentIndex].caption}
        </p>
      )}
    </div>
  );
}


