import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Service } from '@buenobrows/shared/types';
import { createCustomConsentFormClient } from '@buenobrows/shared/functionsClient';

interface ConsentSection {
  id: string;
  heading: string;
  content: string;
  required: boolean;
}

interface ConsentFormTemplate {
  name: string;
  version: string;
  category: string;
  title: string;
  content: string;
  active: boolean;
  effectiveDate: string;
  sections: ConsentSection[];
  assignedServices?: string[]; // Array of service IDs
  assignedCategories?: string[]; // Array of service category names
  createdAt: string;
}

const DEFAULT_SECTIONS: ConsentSection[] = [
  {
    id: 'services-covered',
    heading: 'Services Covered',
    content: 'This consent form covers the following services:\n• [Service details will be auto-populated]',
    required: true,
  },
  {
    id: 'pre-treatment',
    heading: 'Pre-Treatment Acknowledgment',
    content: 'I acknowledge that:\n• I have disclosed any allergies, skin sensitivities, or medical conditions\n• I am not currently using Retin-A, Accutane, or other exfoliating products on the treatment area\n• I do not have any active infections, open wounds, or skin conditions in the treatment area\n• I am not pregnant or nursing (for certain treatments)\n• I have not had recent sun exposure or chemical peels in the treatment area',
    required: true,
  },
  {
    id: 'risks',
    heading: 'Potential Risks & Side Effects',
    content: 'I understand the following potential risks:\n• Temporary redness, swelling, or irritation\n• Allergic reaction to products used (patch test recommended)\n• Temporary discomfort during the procedure\n• Rare risk of infection if aftercare instructions are not followed\n• Results may vary based on individual characteristics\n• Color results from tinting may differ from expectations',
    required: true,
  },
  {
    id: 'aftercare',
    heading: 'Aftercare Responsibilities',
    content: 'I agree to follow all aftercare instructions, including:\n• Avoiding water, steam, and excessive sweating for 24-48 hours (service-specific)\n• Not touching or rubbing the treated area\n• Avoiding makeup application on treated area as directed\n• Using recommended aftercare products only\n• Scheduling follow-up appointments as recommended\n• Contacting the salon immediately if any adverse reactions occur',
    required: true,
  },
  {
    id: 'consent-release',
    heading: 'Consent & Release',
    content: 'I hereby consent to receive the services I have selected. I understand that results are not guaranteed and may require multiple sessions. I release Bueno Brows, its staff, and practitioners from any liability for damages or injuries resulting from these services, except in cases of gross negligence. I confirm that all information provided is accurate and complete.',
    required: true,
  },
];

const SECTION_TEMPLATES: ConsentSection[] = [
  {
    id: 'photo-release',
    heading: 'Photo Release (Optional)',
    content: 'I give permission for before/after photos of my treatment to be used for marketing purposes, social media, and portfolio use. My identity will remain confidential unless I provide additional written consent.',
    required: false,
  },
  {
    id: 'payment-terms',
    heading: 'Payment Terms',
    content: 'I understand that payment is due at the time of service. Cancellations must be made at least 24 hours in advance to avoid cancellation fees. No-shows will be charged 50% of the service fee.',
    required: false,
  },
  {
    id: 'emergency-contact',
    heading: 'Emergency Contact Information',
    content: 'I agree to provide emergency contact information and understand that this information may be used in case of medical emergency during my treatment.',
    required: false,
  },
  {
    id: 'data-privacy',
    heading: 'Data Privacy & Storage',
    content: 'I understand that my personal information and treatment records will be stored securely and may be shared with medical professionals if necessary for my care. I consent to the use of my data for appointment reminders and follow-up communications.',
    required: false,
  },
];

interface ConsentFormBuilderProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConsentFormBuilder({ onClose, onSuccess }: ConsentFormBuilderProps) {
  const { db } = useFirebase();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [sections, setSections] = useState<ConsentSection[]>([]);
  
  // Get available service categories
  const serviceCategories = Array.from(new Set(services.map(s => s.category).filter(Boolean)));

  useEffect(() => {
    // Load services
    const loadServices = async () => {
      try {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, where('active', '==', true));
        const snapshot = await getDocs(q);
        const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading services:', error);
      }
    };
    
    loadServices();
  }, [db]);

  const addSection = (template: ConsentSection) => {
    const newSection: ConsentSection = {
      id: `${template.id}-${Date.now()}`,
      heading: template.heading,
      content: template.content,
      required: template.required,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<ConsentSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setSections(newSections);
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedServiceCategories(prev => 
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName.trim() || !formTitle.trim() || sections.length === 0) {
      alert('Please fill in all required fields and add at least one section.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await createCustomConsentFormClient({
        name: formName.trim(),
        version: '1.0',
        category: selectedCategory || 'custom',
        title: formTitle.trim(),
        content: formDescription.trim() || 'Please read the following information carefully before proceeding with your service.',
        sections: sections.map(s => ({
          heading: s.heading,
          content: s.content,
          required: s.required,
        })),
        assignedServices: selectedServices,
        assignedCategories: selectedServiceCategories,
      });
      
      alert(`Consent form "${result.form.name}" created successfully!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating consent form:', error);
      const errorMessage = error.message || 'Failed to create consent form template. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-serif text-terracotta mb-1">Create Consent Form Template</h2>
              <p className="text-sm text-slate-600">Build a custom consent form for specific services or categories</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="consent-form-name" className="block text-sm font-medium text-slate-700 mb-2">
                  Form Name *
                </label>
                <input
                  id="consent-form-name"
                  name="consent-form-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Brow Services Consent"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="consent-form-title" className="block text-sm font-medium text-slate-700 mb-2">
                  Form Title *
                </label>
                <input
                  id="consent-form-title"
                  name="consent-form-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Consent Form for Brow Services"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="consent-form-description" className="block text-sm font-medium text-slate-700 mb-2">
                Form Description
              </label>
              <textarea
                id="consent-form-description"
                name="consent-form-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of what this consent form covers..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
              />
            </div>

            {/* Service Assignment */}
            <div className="border border-slate-200 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Assignment</h3>
              
              {/* Assign to Categories */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assign to Service Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {serviceCategories.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedServiceCategories.includes(category)
                          ? 'bg-terracotta text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign to Specific Services */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Or assign to specific services
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                  {services.map(service => (
                    <label key={service.id} className="flex items-center gap-2 py-1">
                      <input
                        id={`service-${service.id}`}
                        name={`service-${service.id}`}
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="rounded border-slate-300 text-terracotta focus:ring-terracotta"
                      />
                      <span className="text-sm text-slate-700">
                        {service.name} <span className="text-slate-500">({service.category})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Form Sections</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSections([...sections, {
                      id: `custom-${Date.now()}`,
                      heading: 'New Section',
                      content: 'Section content...',
                      required: false,
                    }])}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    + Add Custom Section
                  </button>
                </div>
              </div>

              {/* Section Templates */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Add from templates:
                </label>
                <div className="flex flex-wrap gap-2">
                  {SECTION_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => addSection(template)}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                    >
                      + {template.heading}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Sections */}
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div key={section.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                        <input
                          id={`section-heading-${section.id}`}
                          name={`section-heading-${section.id}`}
                          type="text"
                          value={section.heading}
                          onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                          className="font-semibold text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                        />
                        {section.required && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Required</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(section.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <textarea
                      id={`section-content-${section.id}`}
                      name={`section-content-${section.id}`}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-sm"
                      placeholder="Section content..."
                    />
                    
                    <div className="mt-2">
                      <label htmlFor={`section-required-${section.id}`} className="flex items-center gap-2">
                        <input
                          id={`section-required-${section.id}`}
                          name={`section-required-${section.id}`}
                          type="checkbox"
                          checked={section.required}
                          onChange={(e) => updateSection(section.id, { required: e.target.checked })}
                          className="rounded border-slate-300 text-terracotta focus:ring-terracotta"
                        />
                        <span className="text-sm text-slate-700">Required section</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {sections.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No sections added yet. Add sections using the templates above or create custom ones.</p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formName.trim() || !formTitle.trim() || sections.length === 0}
              className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
