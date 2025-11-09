import { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { watchServices, watchHomePageContent } from '@buenobrows/shared/firestoreActions';
import type { Service, HomePageContent } from '@buenobrows/shared/types';
import { Link } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import SEO from '../components/SEO';

export default function EventsPage() {
  const { db, app } = useFirebase();
  const [rows, setRows] = useState<Service[]>([]);
  const [q, setQ] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [content, setContent] = useState<HomePageContent | null>(null);

  useEffect(() => {
    return watchServices(db, { activeOnly: true }, setRows);
  }, [db]);

  useEffect(() => {
    const unsubscribe = watchHomePageContent(db, (content) => {
      setContent(content);
    });
    return unsubscribe;
  }, [db]);

  // Filter services to only show those with category "Events" (case-insensitive)
  const eventServices = useMemo(() => {
    return rows.filter((s) => s.category?.toLowerCase() === 'events');
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return eventServices.filter((s) => {
      const matchesTerm = !term || 
        s.name.toLowerCase().includes(term) || 
        (s.description || '').toLowerCase().includes(term);
      return matchesTerm;
    });
  }, [eventServices, q]);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  return (
    <section className="grid gap-8 md:gap-12">
      <SEO 
        title="Corporate Event Packages & Experiential Services | Bueno Brows"
        description="Premium event packages for corporate gatherings, team building, and special occasions. Unique experiential services including permanent jewelry, face paint, professional makeup, and curated beauty experiences."
        keywords="corporate events, event packages, team building, experiential services, permanent jewelry, professional makeup, face paint, corporate wellness, networking events"
        url="https://buenobrows.com/events"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-terracotta/5 rounded-2xl p-8 md:p-12 lg:p-16 border border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            {content?.eventsHeroTitle || 'Premium Event Packages'}
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-6 leading-relaxed max-w-2xl mx-auto">
            {content?.eventsHeroDescription || 'Transform your corporate events, team gatherings, and special occasions with our curated experiential services. From permanent jewelry to professional makeup artistry, we deliver memorable experiences that elevate any event.'}
          </p>
          <div className="flex justify-center mt-8 mb-6">
            <button
              onClick={() => setShowInquiryModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg px-8 py-4 hover:bg-slate-800 transition-all font-semibold text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule Consultation
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 bg-white/80 px-4 py-2 rounded-full border border-slate-200">
              <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Custom Packages</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 bg-white/80 px-4 py-2 rounded-full border border-slate-200">
              <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium">Team Experiences</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 bg-white/80 px-4 py-2 rounded-full border border-slate-200">
              <svg className="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-sm font-medium">Unique Services</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Services Showcase */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">{content?.eventsFeaturedTitle1 || 'Permanent Jewelry'}</h3>
          <p className="text-sm text-slate-600">{content?.eventsFeaturedDescription1 || 'Seamless, custom jewelry installations for lasting memories.'}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">{content?.eventsFeaturedTitle2 || 'Professional Makeup'}</h3>
          <p className="text-sm text-slate-600">{content?.eventsFeaturedDescription2 || 'Expert artistry for corporate headshots and events.'}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">{content?.eventsFeaturedTitle3 || 'Face Paint & Artistry'}</h3>
          <p className="text-sm text-slate-600">{content?.eventsFeaturedDescription3 || 'Creative designs that add vibrancy to any occasion.'}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">{content?.eventsFeaturedTitle4 || 'Curated Experiences'}</h3>
          <p className="text-sm text-slate-600">{content?.eventsFeaturedDescription4 || 'Bespoke packages tailored to your event vision.'}</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl text-slate-900 mb-2">
              {content?.eventsPackagesTitle || 'Available Packages'}
            </h2>
            <p className="text-slate-600">
              {content?.eventsPackagesDescription || 'Explore our curated event packages designed for corporate gatherings, team experiences, and special occasions.'}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-3 pl-12 text-base focus:ring-2 focus:ring-terracotta focus:border-terracotta"
              placeholder="Search event packages…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search event packages"
            />
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 md:p-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-6">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Event Packages Coming Soon</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            {q ? 'No packages match your search. Try a different term.' : 'We\'re curating premium event packages. Contact us to discuss custom arrangements for your upcoming event.'}
          </p>
          {q && (
            <button
              onClick={() => setQ('')}
              className="text-terracotta hover:text-terracotta/80 font-medium transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((s) => (
            <article key={s.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group">
              {/* Package Image */}
              <div className="relative h-56 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {(s as any).imageUrl ? (
                  <img 
                    src={(s as any).imageUrl} 
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full flex items-center justify-center ${(s as any).imageUrl ? 'hidden' : 'flex'} bg-gradient-to-br from-terracotta/10 to-slate-100`}
                  style={{ display: (s as any).imageUrl ? 'none' : 'flex' }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-terracotta/20 to-terracotta/10 rounded-xl flex items-center justify-center border-2 border-terracotta/20">
                      <svg className="w-10 h-10 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Premium Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-slate-200">
                    Premium Package
                  </span>
                </div>
                
                {/* Price Badge */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-terracotta text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="text-xs font-medium opacity-90">Starting at</div>
                    <div className="text-xl font-bold">${s.price.toFixed(0)}</div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <header className="mb-4">
                  <h3 className="font-semibold text-xl text-slate-900 mb-3 group-hover:text-terracotta transition-colors">
                    {s.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {s.duration} min
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      On-site Available
                    </span>
                  </div>
                </header>
                
                {/* Description */}
                <div className="flex-1 mb-6">
                  <p className="text-slate-600 leading-relaxed line-clamp-3">
                    {s.description || 'Premium experiential service designed to elevate your corporate event or special occasion.'}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setShowInquiryModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg px-6 py-3 font-semibold hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Inquire About Package
                  </button>
                  
                  <button
                    onClick={() => handleServiceClick(s)}
                    className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 rounded-lg px-6 py-2.5 font-medium hover:bg-slate-50 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Corporate CTA Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            {content?.eventsCTATitle || 'Elevate Your Next Corporate Event'}
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
            {content?.eventsCTADescription || 'Our team specializes in creating memorable experiences for corporate gatherings, team building events, product launches, and networking occasions. Contact us to discuss custom package arrangements tailored to your needs.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowInquiryModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 rounded-lg px-8 py-4 hover:bg-slate-50 transition-all font-semibold text-base md:text-lg shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {content?.eventsCTAButton1 || 'Schedule Consultation'}
            </button>
            <Link 
              to="/services" 
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white rounded-lg px-8 py-4 hover:bg-white/10 transition-all font-semibold text-base md:text-lg backdrop-blur-sm"
            >
              {content?.eventsCTAButton2 || 'View All Services'}
            </Link>
          </div>
        </div>
      </div>

      {/* Service Details Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">Premium Package</div>
                  <h3 className="font-serif text-3xl text-slate-900">{selectedService.name}</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 text-lg">Package Overview</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
                    {selectedService.description || 'Premium experiential service designed to elevate your corporate event or special occasion. Our team brings professional expertise and attention to detail to ensure an exceptional experience for all participants.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-sm text-slate-500 mb-1 font-medium">Duration</div>
                    <div className="font-semibold text-slate-900 text-lg">{selectedService.duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1 font-medium">Investment</div>
                    <div className="font-semibold text-terracotta text-2xl">${selectedService.price.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      closeModal();
                      setShowInquiryModal(true);
                    }}
                    className="flex-1 bg-slate-900 text-white rounded-lg px-6 py-4 text-center font-semibold hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Request Information
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 border-2 border-slate-300 text-slate-700 rounded-lg px-6 py-4 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Inquiry Modal */}
      {showInquiryModal && (
        <EventInquiryModal 
          onClose={() => setShowInquiryModal(false)} 
          services={eventServices}
          app={app}
        />
      )}
    </section>
  );
}

// Event Inquiry Form Modal Component
function EventInquiryModal({ 
  onClose, 
  services,
  app 
}: { 
  onClose: () => void; 
  services: Service[];
  app: any;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    eventType: '',
    eventDate: '',
    numberOfAttendees: '',
    preferredServices: [] as string[],
    preferredContactMethod: 'email',
    additionalDetails: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      setErrorMessage('Name and email are required');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    
    try {
      const functions = getFunctions(app, 'us-central1');
      const submitInquiry = httpsCallable(functions, 'submitEventInquiry');
      
      const result = await submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        eventType: formData.eventType || undefined,
        eventDate: formData.eventDate || undefined,
        numberOfAttendees: formData.numberOfAttendees || undefined,
        preferredServices: formData.preferredServices.length > 0 ? formData.preferredServices : undefined,
        preferredContactMethod: formData.preferredContactMethod,
        additionalDetails: formData.additionalDetails || undefined,
      });
      
      setStatus('success');
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          eventType: '',
          eventDate: '',
          numberOfAttendees: '',
          preferredServices: [],
          preferredContactMethod: 'email',
          additionalDetails: '',
        });
        setStatus('idle');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      setStatus('error');
      setErrorMessage(error?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      preferredServices: prev.preferredServices.includes(serviceId)
        ? prev.preferredServices.filter(id => id !== serviceId)
        : [...prev.preferredServices, serviceId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl text-slate-900 mb-2">
                Event Consultation Request
              </h2>
              <p className="text-slate-600">
                Tell us about your event and we'll create a custom package for you
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Thank You!</h3>
              <p className="text-slate-600 mb-4">
                Your inquiry has been submitted successfully. We'll get back to you within 24 hours.
              </p>
              <p className="text-sm text-slate-500">
                Closing automatically...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inquiry-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              {/* Phone and Company */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inquiry-phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    placeholder="(650) 555-1234"
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-company" className="block text-sm font-medium text-slate-700 mb-2">
                    Company / Organization
                  </label>
                  <input
                    id="inquiry-company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>

              {/* Event Type and Date */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inquiry-event-type" className="block text-sm font-medium text-slate-700 mb-2">
                    Event Type
                  </label>
                  <select
                    id="inquiry-event-type"
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                  >
                    <option value="">Select event type...</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Team Building">Team Building</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Networking Event">Networking Event</option>
                    <option value="Holiday Party">Holiday Party</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="inquiry-date" className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Event Date
                  </label>
                  <input
                    id="inquiry-date"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Number of Attendees and Contact Method */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="inquiry-attendees" className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Attendees
                  </label>
                  <input
                    id="inquiry-attendees"
                    type="text"
                    value={formData.numberOfAttendees}
                    onChange={(e) => setFormData({...formData, numberOfAttendees: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    placeholder="e.g., 20-30 people"
                  />
                </div>
                <div>
                  <label htmlFor="inquiry-contact-method" className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    id="inquiry-contact-method"
                    value={formData.preferredContactMethod}
                    onChange={(e) => setFormData({...formData, preferredContactMethod: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="either">Either</option>
                  </select>
                </div>
              </div>

              {/* Preferred Services */}
              {services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Services of Interest (optional)
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-lg">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-200 hover:border-terracotta/40 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.preferredServices.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                          className="w-4 h-4 text-terracotta border-slate-300 rounded focus:ring-terracotta"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 text-sm">{service.name}</div>
                          <div className="text-xs text-slate-500">${service.price.toFixed(0)} • {service.duration} min</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div>
                <label htmlFor="inquiry-details" className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  id="inquiry-details"
                  rows={4}
                  value={formData.additionalDetails}
                  onChange={(e) => setFormData({...formData, additionalDetails: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-terracotta focus:border-terracotta resize-none"
                  placeholder="Tell us more about your event, special requirements, budget considerations, or any questions you have..."
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border-2 border-slate-300 text-slate-700 rounded-lg px-6 py-3 font-semibold hover:bg-slate-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name || !formData.email}
                  className="flex-1 bg-slate-900 text-white rounded-lg px-6 py-3 font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

