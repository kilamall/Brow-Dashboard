import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServices } from '@buenobrows/shared/firestoreActions';
import type { Service } from '@buenobrows/shared/types';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';


export default function ServicesPage() {
  const { db } = useFirebase();
  const [rows, setRows] = useState<Service[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Public read is allowed by rules; live updates for simplicity.
    return watchServices(db, { activeOnly: true }, setRows);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((s) => s.category && set.add(s.category));
    return ['All', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((s) => {
      const matchesCat = cat === 'All' || s.category === cat;
      const matchesTerm = !term || s.name.toLowerCase().includes(term) || (s.description || '').toLowerCase().includes(term);
      return matchesCat && matchesTerm;
    });
  }, [rows, q, cat]);

  // Helper function to truncate description for mobile
  const truncateDescription = (description: string, maxLength: number = 80) => {
    if (!description) return 'Beautiful brows, tailored to you.';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  // Category color mapping (matching admin colors)
  const getCategoryColor = (category?: string): string => {
    const colorMap: Record<string, string> = {
      'Brows': '#F59E0B',        // Yellow/Amber
      'Facial Waxing': '#EC4899', // Pink
      'Lashes': '#8B5CF6',       // Purple
      'Skincare': '#10B981',     // Green
      'Other': '#6B7280',        // Gray
    };
    return colorMap[category || 'Other'] || '#6B7280';
  };

  // Get contrasting text color (white or black)
  const getContrastColor = (backgroundColor: string): string => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Handle service details modal
  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  return (
    <section className="grid gap-6">
      <SEO 
        title="Beauty Services - Microblading, Brow Shaping & More | Bueno Brows"
        description="Professional beauty services including microblading, brow shaping, and specialized treatments. Expert techniques and personalized care in San Mateo, CA."
        keywords="beauty services, microblading, brow shaping, eyebrow services, beauty treatments, San Mateo, California"
        url="https://buenobrows.com/services"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Beauty Services",
          "description": "Professional beauty services offered at Bueno Brows",
          "itemListElement": rows.map((service, index) => ({
            "@type": "Service",
            "position": index + 1,
            "name": service.name,
            "description": service.description,
            "offers": {
              "@type": "Offer",
              "price": service.price,
              "priceCurrency": "USD"
            }
          }))
        }}
      />
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl mb-2">Services</h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">Explore our offerings. Prices reflect current rates; your booked price is saved at confirmation.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="border rounded-lg px-4 py-3 text-base flex-1 min-w-0"
            placeholder="Search services…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search services"
          />
          <select className="border rounded-lg px-4 py-3 text-base min-w-[140px]" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filtered.map((s) => (
          <article key={s.id} className="bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col h-[500px]">
            {/* Service Image */}
            <div className="relative h-48 bg-gradient-to-br from-terracotta/20 to-terracotta/5 overflow-hidden flex-shrink-0">
              {(s as any).imageUrl ? (
                <img 
                  src={(s as any).imageUrl} 
                  alt={s.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-full h-full flex items-center justify-center ${(s as any).imageUrl ? 'hidden' : 'flex'}`}
                style={{ display: (s as any).imageUrl ? 'none' : 'flex' }}
              >
                {/* BUENO BROWS Logo Placeholder */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-terracotta/30 to-terracotta/10 rounded-full flex items-center justify-center border-2 border-terracotta/20">
                    <svg className="w-12 h-12 text-terracotta" viewBox="0 0 100 100" fill="none">
                      {/* Hand holding tool */}
                      <path d="M25 60 L35 50 L40 55 L45 50 L50 55 L55 50 L60 55 L65 50 L70 55 L75 50 L80 55 L85 50 L90 55 L95 50 L100 55" 
                            stroke="currentColor" strokeWidth="2" fill="none"/>
                      {/* Eyebrow */}
                      <path d="M20 30 Q50 20 80 30" 
                            stroke="currentColor" strokeWidth="3" fill="none"/>
                      {/* Brow hairs */}
                      <path d="M25 25 L30 20" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M35 23 L40 18" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M45 22 L50 17" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M55 22 L60 17" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M65 23 L70 18" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M75 25 L80 20" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">BUENO BROWS</p>
                </div>
              </div>
              
              {/* Category Badge with Color Coding */}
              <div className="absolute top-3 left-3">
                <span 
                  className="text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: getCategoryColor(s.category),
                    color: getContrastColor(getCategoryColor(s.category))
                  }}
                >
                  {s.category || 'Service'}
                </span>
              </div>
              
              {/* Most Popular Badge */}
              {s.isPopular && (
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Most Popular
                  </span>
                </div>
              )}
              
              {/* Price Badge */}
              <div className={`absolute bottom-3 right-3 ${s.isPopular ? 'bottom-12' : ''}`}>
                <span className="bg-terracotta text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                  ${s.price.toFixed(0)}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 flex flex-col h-full min-h-0">
              <header className="mb-4">
                <h3 className="font-semibold text-xl text-slate-800 mb-2">{s.name}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {s.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    In Studio
                  </span>
                </div>
              </header>
              
              {/* Description */}
              <div className="flex-1 mb-4 overflow-hidden">
                <p className="text-slate-600 leading-relaxed text-sm line-clamp-3">
                  {s.description || 'Beautiful brows, tailored to you. Professional service with personalized care and attention to detail.'}
                </p>
              </div>
              
              {/* Action Buttons - Fixed at bottom */}
              <div className="mt-auto">
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/book" 
                    state={{ selectedServiceId: s.id }}
                    className="inline-flex items-center justify-center gap-2 bg-terracotta text-white rounded-lg px-6 py-3 font-semibold hover:bg-terracotta/90 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Now
                  </Link>
                  
                  {/* Learn More button for all services */}
                  <button
                    onClick={() => handleServiceClick(s)}
                    className="inline-flex items-center justify-center gap-2 border border-terracotta text-terracotta rounded-lg px-6 py-2 font-medium hover:bg-terracotta/5 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className="text-slate-500 text-base col-span-full text-center py-8">No services match your search. Try clearing filters.</div>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="mt-12 bg-gradient-to-br from-terracotta to-terracotta/80 rounded-xl shadow-soft p-8 md:p-12 text-center text-white">
        <h2 className="font-serif text-2xl md:text-3xl mb-4">Ready to Book Your Appointment?</h2>
        <p className="text-white/90 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Not sure which service is right for you? Try our free AI Skin Analysis to get personalized recommendations!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/book" 
            className="inline-flex items-center justify-center gap-2 bg-white text-terracotta rounded-lg px-8 py-4 hover:bg-slate-50 transition-all hover:scale-105 font-semibold text-base md:text-lg shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
          </Link>
          <Link 
            to="/skin-analysis" 
            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white rounded-lg px-8 py-4 hover:bg-white/10 transition-all font-semibold text-base md:text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Try AI Skin Analysis
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link to="/" className="text-white/90 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">•</span>
            <Link to="/reviews" className="text-white/90 hover:text-white transition-colors">Client Reviews</Link>
            <span className="text-white/40">•</span>
            <Link to="/skin-analysis" className="text-white/90 hover:text-white transition-colors">AI Skin Analysis</Link>
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">{selectedService.category || 'Service'}</div>
                  <h3 className="font-serif text-2xl text-slate-800">{selectedService.name}</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">Service Details</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedService.description || 'Beautiful brows, tailored to you.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-sm text-slate-500">Duration</div>
                    <div className="font-medium text-slate-800">{selectedService.duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Price</div>
                    <div className="font-semibold text-terracotta text-xl">${selectedService.price.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link 
                    to="/book" 
                    state={{ selectedServiceId: selectedService.id }}
                    className="flex-1 bg-terracotta text-white rounded-lg px-6 py-3 text-center font-semibold hover:bg-terracotta/90 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                    onClick={closeModal}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Now
                  </Link>
                  <button
                    onClick={closeModal}
                    className="flex-1 border border-slate-300 text-slate-700 rounded-lg px-6 py-3 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
