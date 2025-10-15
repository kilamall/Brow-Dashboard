import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchBusinessInfo, watchHomePageContent } from '@buenobrows/shared/firestoreActions';
import type { BusinessInfo, HomePageContent } from '@buenobrows/shared/types';

export default function Home() {
  const { db } = useFirebase();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [buenoCirclePhone, setBuenoCirclePhone] = useState('');
  const [buenoCircleSubmitted, setBuenoCircleSubmitted] = useState(false);

  useEffect(() => watchBusinessInfo(db, setBusinessInfo), [db]);
  useEffect(() => watchHomePageContent(db, setContent), [db]);

  const handleBuenoCircleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buenoCirclePhone.trim()) return;
    
    // TODO: Store the phone number in Firestore for marketing
    console.log('Bueno Circle signup:', buenoCirclePhone);
    setBuenoCircleSubmitted(true);
    setBuenoCirclePhone('');
    
    // Reset after 3 seconds
    setTimeout(() => setBuenoCircleSubmitted(false), 3000);
  };

  if (!businessInfo || !content) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="font-serif text-4xl text-terracotta mb-3">{content.heroTitle}</h1>
          <p className="text-slate-600 mb-6">{content.heroSubtitle}</p>
          <div className="flex gap-3">
            <Link to="/book" className="bg-terracotta text-white rounded-md px-6 py-3 hover:bg-terracotta/90 transition-colors">
              {content.ctaPrimary}
            </Link>
            <Link to="/services" className="border border-slate-300 rounded-md px-6 py-3 hover:bg-slate-50 transition-colors">
              {content.ctaSecondary}
            </Link>
          </div>

        </div>

        {/* Hero Image */}
        <div className="relative bg-white rounded-2xl shadow-soft h-96 grid place-items-center overflow-hidden">
          {content.heroImageUrl ? (
            <img src={content.heroImageUrl} alt="BUENO BROWS" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400">Hero image (TBD)</span>
          )}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-3 -left-3 w-24 h-24 rounded-full bg-terracotta/5" />
            <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-gold/10" />
          </div>
        </div>
      </section>

      {/* About Section */}
      {content.aboutText && (
        <section className="bg-white rounded-xl shadow-soft p-8 text-center">
          <h2 className="font-serif text-2xl text-terracotta mb-4">Our Story</h2>
          <p className="text-slate-600 max-w-3xl mx-auto">{content.aboutText}</p>
        </section>
      )}

      {/* Location & Map Section */}
      <section className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Map */}
          <div className="h-80 md:h-auto">
            <iframe
              title="Business Location"
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zip}`)}`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '320px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          {/* Location Info */}
          <div className="p-8">
            <h2 className="font-serif text-2xl text-terracotta mb-6">Visit Us</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Address</h3>
                <p className="text-slate-600">{businessInfo.address}</p>
                <p className="text-slate-600">{businessInfo.city}, {businessInfo.state} {businessInfo.zip}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Contact</h3>
                <p className="text-slate-600">
                  <a href={`tel:${businessInfo.phone.replace(/\D/g, '')}`} className="hover:text-terracotta transition-colors">
                    {businessInfo.phone}
                  </a>
                </p>
                <p className="text-slate-600">
                  <a href={`mailto:${businessInfo.email}`} className="hover:text-terracotta transition-colors">
                    {businessInfo.email}
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Get Directions</h3>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zip}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-terracotta hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>

              {(businessInfo.instagram || businessInfo.tiktok || businessInfo.facebook) && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Connect With Us</h3>
                  <div className="flex items-center gap-3">
                    {businessInfo.instagram && (
                      <a 
                        href={`https://instagram.com/${businessInfo.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-100 p-2 rounded-lg text-slate-700 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {businessInfo.tiktok && (
                      <a 
                        href={`https://tiktok.com/@${businessInfo.tiktok}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-100 p-2 rounded-lg text-slate-700 hover:text-white hover:bg-black transition-all duration-300"
                        aria-label="TikTok"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {businessInfo.facebook && (
                      <a 
                        href={`https://facebook.com/${businessInfo.facebook}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-100 p-2 rounded-lg text-slate-700 hover:text-white hover:bg-blue-600 transition-all duration-300"
                        aria-label="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {content.galleryPhotos && content.galleryPhotos.length > 0 && (
        <section>
          <h2 className="font-serif text-3xl text-center mb-2 text-terracotta">Our Space</h2>
          <p className="text-center text-slate-600 mb-8">Take a peek inside our beautiful studio</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.galleryPhotos.map((photo, index) => (
              <div 
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <img 
                  src={photo} 
                  alt={`Shop photo ${index + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-terracotta/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="relative mt-8 flex justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-terracotta/30" />
              <div className="w-2 h-2 rounded-full bg-gold/40" />
              <div className="w-2 h-2 rounded-full bg-terracotta/30" />
            </div>
          </div>
        </section>
      )}

      {/* Bueno Circle Section */}
      {content.buenoCircleEnabled && (
        <section className="bg-gradient-to-br from-terracotta/10 to-gold/10 rounded-xl shadow-soft p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl text-terracotta mb-3">{content.buenoCircleTitle}</h2>
            <p className="text-slate-600 mb-6">{content.buenoCircleDescription}</p>
            
            {!buenoCircleSubmitted ? (
              <form onSubmit={handleBuenoCircleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={buenoCirclePhone}
                  onChange={(e) => setBuenoCirclePhone(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="bg-terracotta text-white rounded-lg px-6 py-3 hover:bg-terracotta/90 transition-colors whitespace-nowrap"
                >
                  Get {content.buenoCircleDiscount}% Off
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-700 font-medium">🎉 Welcome to the Bueno Circle!</p>
                <p className="text-green-600 text-sm mt-1">We'll text you your discount code shortly.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section id="reviews">
        <h2 className="font-serif text-3xl text-center mb-8 text-terracotta">What Clients Say</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-gold fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-3">"Beautiful, natural results. Booking was easy and I felt cared for."</p>
              <div className="text-sm text-slate-500">— Happy Client</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/reviews" className="text-terracotta hover:underline">
            See all reviews →
          </Link>
        </div>
      </section>
    </div>
  );
}
