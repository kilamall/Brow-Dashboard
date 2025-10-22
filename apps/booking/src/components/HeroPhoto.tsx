
interface HeroPhotoProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function HeroPhoto({ 
  imageUrl, 
  title = "BUENO BROWS", 
  subtitle = "Beautiful Brows, Tailored to You",
  description = "Experience the art of eyebrow perfection with our expert techniques and personalized approach.",
  buttonText = "Book Your Appointment",
  buttonLink = "/book"
}: HeroPhotoProps) {
  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: imageUrl 
            ? `url(${imageUrl})` 
            : 'linear-gradient(135deg, #C17A6F 0%, #D4A574 100%)'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-4xl mx-auto px-6 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">
              {title}
            </h1>
            
            {subtitle && (
              <h2 className="text-xl md:text-2xl font-medium mb-4 text-white/90">
                {subtitle}
              </h2>
            )}
            
            {description && (
              <p className="text-lg md:text-xl mb-8 text-white/80 leading-relaxed">
                {description}
              </p>
            )}
            
            {buttonText && buttonLink && (
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={buttonLink}
                  className="inline-flex items-center justify-center gap-2 bg-terracotta text-white rounded-xl px-8 py-4 hover:bg-terracotta/90 transition-all hover:scale-105 font-semibold text-lg shadow-lg"
                >
                  {buttonText}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative elements to make it look like a slideshow frame */}
      <div className="absolute top-6 right-6 z-20 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
        1 / 1
      </div>
      
      {/* Bottom dots indicator (single dot) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-white scale-125" />
      </div>
    </div>
  );
}
