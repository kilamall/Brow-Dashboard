import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchBusinessInfo, watchHomePageContent } from '@buenobrows/shared/firestoreActions';
import type { BusinessInfo, HomePageContent } from '@buenobrows/shared/types';
import HeroPhoto from '../components/HeroPhoto';
import SEO from '../components/SEO';
import MyBookingsCard from '../components/MyBookingsCard';
import CircularPhotoSlideshow from '../components/CircularPhotoSlideshow';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore';

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  serviceName?: string;
  createdAt: any;
  isApproved?: boolean;
  isFeatured?: boolean;
}

export default function Home() {
  const { db } = useFirebase();
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [aboutPhotos, setAboutPhotos] = useState<any[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);

  // Load photos from media gallery
  useEffect(() => {
    const loadGalleryPhotos = async () => {
      try {
        const docRef = doc(db, 'settings', 'homePageContent');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const galleryPhotos = data.galleryPhotos || [];
          
          // Handle both old string format and new object format
          const processedPhotos = galleryPhotos.map((photo: any, index: number) => {
            // If it's a string (old format), treat as gallery photo
            if (typeof photo === 'string') {
              return {
                id: `legacy_photo_${index}`,
                url: photo,
                alt: `Gallery Photo ${index + 1}`,
                category: 'gallery'
              };
            }
            // If it's an object, use as-is
            return photo;
          });
          
          setGalleryPhotos(processedPhotos);
        }
      } catch (error) {
        console.error('Error loading gallery photos:', error);
      }
    };

    const loadSlideshowPhotos = async () => {
      try {
        // Load slideshow photos from photos collection
        const photosQuery = query(
          collection(db, 'photos'),
          where('category', '==', 'about')
        );
        const photosSnapshot = await getDocs(photosQuery);
        
        const aboutPhotos = photosSnapshot.docs.map(doc => ({
          id: doc.id,
          src: doc.data().url,
          alt: doc.data().alt || 'About Photo',
          caption: doc.data().caption || doc.data().alt || 'About Photo'
        }));
        
        // Sort by uploadedAt manually since we can't use orderBy without index
        aboutPhotos.sort((a, b) => {
          const aTime = photosSnapshot.docs.find(doc => doc.id === a.id)?.data().uploadedAt;
          const bTime = photosSnapshot.docs.find(doc => doc.id === b.id)?.data().uploadedAt;
          if (!aTime || !bTime) return 0;
          return bTime.toMillis() - aTime.toMillis(); // Descending order
        });
        
        // If no photos found, use fallback photos
        if (aboutPhotos.length === 0) {
          setAboutPhotos([
            {
              id: '1',
              src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
              alt: 'Regina - Licensed Esthetician',
              caption: 'Regina, Licensed Esthetician'
            },
            {
              id: '2',
              src: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face',
              alt: 'Professional Beauty Services',
              caption: 'Professional Beauty Services'
            },
            {
              id: '3',
              src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face',
              alt: 'Client Care and Attention',
              caption: 'Personalized Client Care'
            },
            {
              id: '4',
              src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop&crop=face',
              alt: 'Beauty Studio Environment',
              caption: 'Our Beautiful Studio'
            }
          ]);
        } else {
          setAboutPhotos(aboutPhotos);
        }
      } catch (error) {
        console.error('Error loading slideshow photos:', error);
        // Use fallback photos on error
        setAboutPhotos([
          {
            id: '1',
            src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
            alt: 'Regina - Licensed Esthetician',
            caption: 'Regina, Licensed Esthetician'
          }
        ]);
      }
    };

    loadGalleryPhotos();
    loadSlideshowPhotos();
  }, [db]);

  useEffect(() => watchBusinessInfo(db, setBusinessInfo), [db]);
  useEffect(() => {
    const unsubscribe = watchHomePageContent(db, (content) => {
      setContent(content);
    });
    return unsubscribe;
  }, [db]);

  // Fetch featured reviews for homepage
  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('isApproved', '==', true),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));
        
        setFeaturedReviews(reviewsData);
      },
      (error) => {
        console.error('Error fetching featured reviews:', error);
        // Fallback to any approved reviews if no featured ones
        const fallbackQuery = query(
          collection(db, 'reviews'),
          where('isApproved', '==', true),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        
        onSnapshot(fallbackQuery, (snapshot) => {
          const fallbackReviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Review));
          setFeaturedReviews(fallbackReviews);
        });
      }
    );

    return () => unsubscribe();
  }, [db]);

  // Show sticky button on scroll for mobile UX
  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 400px
      setShowStickyButton(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg key={i} className={`w-5 h-5 fill-current ${i < rating ? 'text-gold' : 'text-gray-300'}`} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (!businessInfo || !content) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-8 md:space-y-12">
      <SEO 
        title="Bueno Brows - Professional Eyebrow Services in San Mateo, CA"
        description="Professional eyebrow services including microblading, brow shaping, and beauty treatments in San Mateo, CA. Book your appointment online today!"
        keywords="eyebrow services, microblading, brow shaping, San Mateo, beauty salon, eyebrow specialist, brow tattoo, semi-permanent makeup, California"
        url="https://buenobrows.com/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BeautySalon",
          "name": "Bueno Brows",
          "description": "Professional eyebrow services including microblading, brow shaping, and beauty treatments in San Mateo, CA.",
          "url": "https://buenobrows.com",
          "telephone": businessInfo.phone,
          "email": businessInfo.email,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": businessInfo.address,
            "addressLocality": businessInfo.city,
            "addressRegion": businessInfo.state,
            "postalCode": businessInfo.zip,
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "37.5665",
            "longitude": "-122.3255"
          },
          "openingHours": [
            "Mo-Fr 09:00-18:00",
            "Sa 09:00-17:00"
          ],
          "priceRange": "$$",
          "image": "https://buenobrows.com/og-image.jpg",
          "sameAs": [
            businessInfo.instagram,
            businessInfo.tiktok
          ]
        }}
      />
      {/* Sticky Book Now Button for Mobile (appears after scrolling) */}
      {showStickyButton && (
        <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Link 
            to="/book" 
            className="flex items-center gap-2 bg-terracotta text-white rounded-full px-6 py-4 shadow-2xl hover:bg-terracotta/90 transition-all hover:scale-105 font-semibold text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
          </Link>
        </div>
      )}

      {/* Hero Photo */}
      <section className="mb-8">
        <HeroPhoto 
          imageUrl={content.heroImageUrl}
          title={content.heroTitle}
          subtitle={content.heroSubtitle}
          description="Experience the art of eyebrow perfection with our expert techniques and personalized approach."
          buttonText={content.ctaPrimary}
          buttonLink="/book"
        />
      </section>

      {/* Second Hero Section */}
      <section className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
        <div className="order-2 md:order-1">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-terracotta mb-4 leading-tight">
            {content.hero2Title || content.heroTitle}
          </h1>
          <p className="text-slate-600 mb-6 text-base md:text-lg leading-relaxed">
            {content.hero2Subtitle || content.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/book" className="bg-terracotta text-white rounded-lg px-6 py-4 hover:bg-terracotta/90 transition-colors text-center font-medium text-base">
              {content.hero2CtaPrimary || content.ctaPrimary}
            </Link>
            <Link to="/services" className="border border-slate-300 rounded-lg px-6 py-4 hover:bg-slate-50 transition-colors text-center font-medium text-base">
              {content.hero2CtaSecondary || content.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Second Hero Image */}
        <div className="relative bg-white rounded-2xl shadow-soft h-80 md:h-96 grid place-items-center overflow-hidden order-1 md:order-2">
          {content.hero2ImageUrl ? (
            <img src={content.hero2ImageUrl} alt="BUENO BROWS" className="w-full h-full object-cover" />
          ) : content.heroImageUrl ? (
            <img src={content.heroImageUrl} alt="BUENO BROWS" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-lg">Second hero image (TBD)</span>
          )}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-3 -left-3 w-24 h-24 rounded-full bg-terracotta/5" />
            <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-gold/10" />
          </div>
        </div>
      </section>

      {/* My Bookings Card - Only shows when user is signed in */}
      <MyBookingsCard />

      {/* About Section */}
      {content.aboutText && (
        <section className="bg-white rounded-xl shadow-soft p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Photo Slideshow */}
            <div className="flex justify-center">
              <CircularPhotoSlideshow 
                photos={aboutPhotos}
                size="md"
                autoPlay={true}
                interval={5000}
              />
            </div>
            
            {/* Text Content */}
            <div className="text-center md:text-left">
              <h2 className="font-serif text-2xl md:text-3xl text-terracotta mb-4">Our Story</h2>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6">{content.aboutText}</p>
              
              {/* CTA after About */}
              <Link 
                to="/services" 
                className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta/80 font-semibold text-base md:text-lg group"
              >
                Explore Our Services 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* AI Skin Analysis Feature Section */}
      {content.skinAnalysisEnabled && (
        <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-terracotta/10 rounded-xl shadow-soft overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Content */}
            <div className="p-6 md:p-10 flex flex-col justify-center order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 w-fit">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-Powered Technology
              </div>
              <h2 className="font-serif text-2xl md:text-4xl text-terracotta mb-4">{content.skinAnalysisTitle}</h2>
              <p className="text-lg md:text-xl text-slate-700 mb-4 font-medium">{content.skinAnalysisSubtitle}</p>
              <p className="text-slate-600 mb-6 text-base md:text-lg leading-relaxed">{content.skinAnalysisDescription}</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-slate-800">Personalized Skin Analysis</p>
                    <p className="text-sm text-slate-600">Get detailed insights about your skin type, tone, and concerns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-slate-800">Service Recommendations</p>
                    <p className="text-sm text-slate-600">Receive tailored treatment suggestions for your unique needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-slate-800">Foundation Matching</p>
                    <p className="text-sm text-slate-600">Find your perfect foundation shade with AI precision</p>
                  </div>
                </div>
              </div>

              <Link 
                to="/skin-analysis" 
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg px-8 py-4 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 font-semibold text-base md:text-lg shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {content.skinAnalysisCTA || 'Try Free Skin Analysis'}
              </Link>
            </div>

            {/* Image */}
            <div className="relative h-80 md:h-auto order-1 md:order-2">
              {content.skinAnalysisImageUrl ? (
                <img 
                  src={content.skinAnalysisImageUrl} 
                  alt="AI Skin Analysis" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-200 via-pink-200 to-terracotta/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="w-24 h-24 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-purple-600 font-medium text-lg">AI Skin Analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Location & Map Section */}
      <section className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Map */}
          <div className="h-64 md:h-auto order-2 md:order-1">
            <iframe
              title="Business Location"
              src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zip}`)}`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '256px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          {/* Location Info */}
          <div className="p-6 md:p-8 order-1 md:order-2">
            <h2 className="font-serif text-2xl md:text-3xl text-terracotta mb-6">Visit Us</h2>
            
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-slate-700 mb-2">Address</h3>
                <p className="text-slate-600 text-base">{businessInfo.address}</p>
                <p className="text-slate-600 text-base">{businessInfo.city}, {businessInfo.state} {businessInfo.zip}</p>
              </div>
              
              <div>
                <h3 className="text-base font-semibold text-slate-700 mb-2">Contact</h3>
                <p className="text-slate-600 text-base">
                  <a href={`tel:${businessInfo.phone.replace(/\D/g, '')}`} className="hover:text-terracotta transition-colors">
                    {businessInfo.phone}
                  </a>
                </p>
                <p className="text-slate-600 text-base">
                  <a href={`mailto:${businessInfo.email}`} className="hover:text-terracotta transition-colors">
                    {businessInfo.email}
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-700 mb-3">Get Directions</h3>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${businessInfo.address}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zip}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-terracotta hover:underline text-base font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>

              {(businessInfo.instagram || businessInfo.tiktok || businessInfo.facebook) && (
                <div className="pt-5 border-t">
                  <h3 className="text-base font-semibold text-slate-700 mb-3">Connect With Us</h3>
                  <div className="flex items-center gap-4">
                    {businessInfo.instagram && (
                      <a 
                        href={`https://instagram.com/${businessInfo.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-100 p-3 rounded-lg text-slate-700 hover:text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 transition-all duration-300"
                        aria-label="Instagram"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {businessInfo.tiktok && (
                      <a 
                        href={`https://tiktok.com/@${businessInfo.tiktok}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-100 p-3 rounded-lg text-slate-700 hover:text-white hover:bg-black transition-all duration-300"
                        aria-label="TikTok"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                      </a>
                    )}
                    {businessInfo.facebook && (
                      <a 
                        href={`https://facebook.com/${businessInfo.facebook}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-slate-100 p-3 rounded-lg text-slate-700 hover:text-white hover:bg-blue-600 transition-all duration-300"
                        aria-label="Facebook"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-3 text-terracotta">Our Space</h2>
          <p className="text-center text-slate-600 mb-8 text-base md:text-lg">Take a peek inside our beautiful studio</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {content.galleryPhotos.map((photo: any, index: number) => {
              // Handle both string format (old) and object format (new)
              const photoUrl = typeof photo === 'string' ? photo : photo.url;
              const photoAlt = typeof photo === 'string' ? `Shop photo ${index + 1}` : photo.alt || `Shop photo ${index + 1}`;
              
              return (
                <div 
                  key={index}
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer select-none"
                >
                  <img 
                    src={photoUrl} 
                    alt={photoAlt} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    draggable="false"
                    onError={(e) => {
                      console.error('Image failed to load:', photoUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Decorative elements */}
          <div className="relative mt-6 md:mt-8 flex justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-terracotta/30" />
              <div className="w-2 h-2 rounded-full bg-gold/40" />
              <div className="w-2 h-2 rounded-full bg-terracotta/30" />
            </div>
          </div>

          {/* CTA after Gallery */}
          <div className="text-center mt-8">
            <p className="text-slate-600 mb-4 text-base md:text-lg">Love what you see?</p>
            <Link 
              to="/book" 
              className="inline-flex items-center gap-2 bg-terracotta text-white rounded-lg px-8 py-4 hover:bg-terracotta/90 transition-all hover:scale-105 font-semibold text-base md:text-lg shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Your Appointment
            </Link>
          </div>
        </section>
      )}

      {/* No Gallery Photos Message */}
      {(!content.galleryPhotos || content.galleryPhotos.length === 0) && (
        <section className="text-center py-12">
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-3 text-terracotta">Our Space</h2>
          <p className="text-center text-slate-600 mb-8 text-base md:text-lg">Take a peek inside our beautiful studio</p>
          <div className="bg-slate-100 rounded-xl p-8 text-slate-500">
            <p>Gallery photos will appear here once uploaded through the admin panel.</p>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section id="reviews">
        <h2 className="font-serif text-2xl md:text-3xl text-center mb-6 md:mb-8 text-terracotta">What Clients Say</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featuredReviews.length > 0 ? (
            featuredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-soft p-5 md:p-6">
                <div className="flex mb-3">
                  {renderStars(review.rating)}
                </div>
                <p className="text-slate-700 mb-3 text-base leading-relaxed">"{review.comment}"</p>
                <div className="text-sm text-slate-500">— {review.customerName || 'Anonymous'}</div>
                {review.serviceName && (
                  <div className="text-xs text-slate-400 mt-1">{review.serviceName}</div>
                )}
              </div>
            ))
          ) : (
            // Fallback to placeholder reviews if no real reviews yet
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-soft p-5 md:p-6">
                <div className="flex mb-3">
                  {renderStars(5)}
                </div>
                <p className="text-slate-700 mb-3 text-base leading-relaxed">"Beautiful, natural results. Booking was easy and I felt cared for."</p>
                <div className="text-sm text-slate-500">— Happy Client</div>
              </div>
            ))
          )}
        </div>
        <div className="text-center mt-6 md:mt-8 space-y-4">
          <Link to="/reviews" className="inline-flex items-center gap-2 text-terracotta hover:underline text-base font-medium">
            See all reviews 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Final CTA Section - Great for mobile users who scrolled to bottom */}
      <section className="bg-gradient-to-br from-terracotta to-terracotta/80 rounded-xl shadow-soft p-8 md:p-12 text-center text-white">
        <h2 className="font-serif text-2xl md:text-4xl mb-4">Ready to Transform Your Look?</h2>
        <p className="text-white/90 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Join hundreds of satisfied clients who trust us with their beauty needs. Book your appointment today and experience the difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/book" 
            className="inline-flex items-center gap-2 bg-white text-terracotta rounded-lg px-8 py-4 hover:bg-slate-50 transition-all hover:scale-105 font-semibold text-base md:text-lg shadow-lg w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
          </Link>
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 border-2 border-white text-white rounded-lg px-8 py-4 hover:bg-white/10 transition-all font-semibold text-base md:text-lg w-full sm:w-auto justify-center"
          >
            View All Services
          </Link>
        </div>
        
        {/* Quick Links for better navigation */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link to="/services" className="text-white/90 hover:text-white transition-colors">Services</Link>
            <span className="text-white/40">•</span>
            <Link to="/skin-analysis" className="text-white/90 hover:text-white transition-colors">AI Skin Analysis</Link>
            <span className="text-white/40">•</span>
            <Link to="/reviews" className="text-white/90 hover:text-white transition-colors">Reviews</Link>
            <span className="text-white/40">•</span>
            <a href={`tel:${businessInfo.phone.replace(/\D/g, '')}`} className="text-white/90 hover:text-white transition-colors">
              Call Us: {businessInfo.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
