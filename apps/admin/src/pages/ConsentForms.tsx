import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs, orderBy } from 'firebase/firestore';
import type { ConsentFormTemplate, CustomerConsent } from '@buenobrows/shared/types';
import { flagConsentsForRenewal } from '@buenobrows/shared/consentFormHelpers';
import { initializeConsentFormsClient } from '@buenobrows/shared/functionsClient';
import { format } from 'date-fns';
import ConsentFormBuilder from '../components/ConsentFormBuilder';

export default function ConsentForms() {
  const { db } = useFirebase();
  const [templates, setTemplates] = useState<ConsentFormTemplate[]>([]);
  const [consents, setConsents] = useState<CustomerConsent[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ConsentFormTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch consent form templates
  useEffect(() => {
    const templatesRef = collection(db, 'consentFormTemplates');
    const q = query(templatesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const forms: ConsentFormTemplate[] = [];
      snapshot.forEach((doc) => {
        forms.push({ id: doc.id, ...doc.data() } as ConsentFormTemplate);
      });
      setTemplates(forms);
    });

    return () => unsubscribe();
  }, [db]);

  // Fetch all customer consents
  useEffect(() => {
    const consentsRef = collection(db, 'customerConsents');
    const q = query(consentsRef, orderBy('consentedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customerConsents: CustomerConsent[] = [];
      snapshot.forEach((doc) => {
        customerConsents.push({ id: doc.id, ...doc.data() } as CustomerConsent);
      });
      setConsents(customerConsents);
    });

    return () => unsubscribe();
  }, [db]);

  const handleInitializeDefaults = async () => {
    try {
      setLoading(true);
      const result = await initializeConsentFormsClient();
      
      if (result.alreadyExists) {
        alert(`Active consent form already exists!\n\nName: ${result.form.name}\nVersion: ${result.form.version}\n\nTo create a new version, deactivate the existing one first.`);
      } else {
        alert(`Default consent form created successfully!\n\nName: ${result.form.name}\nVersion: ${result.form.version}\nSections: ${result.form.sections}\nRequired: ${result.form.requiredSections || 0}`);
      }
    } catch (error: any) {
      console.error('Error creating default form:', error);
      const errorMessage = error.message || 'Failed to create default form. Please try again.';
      alert(`Error: ${errorMessage}\n\nMake sure you are logged in as an admin.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateTemplate = async (template: ConsentFormTemplate) => {
    if (!confirm(`Are you sure you want to deactivate "${template.name}"? This will require customers to sign a new consent form.`)) {
      return;
    }

    try {
      setLoading(true);
      const templateRef = doc(db, 'consentFormTemplates', template.id);
      await updateDoc(templateRef, {
        active: false,
        updatedAt: new Date().toISOString(),
      });

      // Flag all consents using this template for renewal
      await flagConsentsForRenewal(db, template.id, template.category);
      
      alert('Template deactivated and consents flagged for renewal.');
    } catch (error) {
      console.error('Error deactivating template:', error);
      alert('Failed to deactivate template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTemplate = async (template: ConsentFormTemplate) => {
    if (!confirm(`Activate "${template.name}"? This will deactivate any other active templates in the same category.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // Deactivate other templates in the same category
      const templatesRef = collection(db, 'consentFormTemplates');
      const q = query(
        templatesRef,
        where('category', '==', template.category),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const deactivatePromises = snapshot.docs.map(docSnapshot =>
        updateDoc(doc(db, 'consentFormTemplates', docSnapshot.id), {
          active: false,
          updatedAt: new Date().toISOString(),
        })
      );
      
      await Promise.all(deactivatePromises);
      
      // Activate the selected template
      const templateRef = doc(db, 'consentFormTemplates', template.id);
      await updateDoc(templateRef, {
        active: true,
        updatedAt: new Date().toISOString(),
      });
      
      alert('Template activated successfully!');
    } catch (error) {
      console.error('Error activating template:', error);
      alert('Failed to activate template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group consents by template
  const consentsByTemplate = templates.reduce((acc, template) => {
    acc[template.id] = consents.filter(c => c.consentFormId === template.id);
    return acc;
  }, {} as Record<string, CustomerConsent[]>);

  // Statistics
  const totalConsents = consents.length;
  const activeConsents = consents.filter(c => c.agreed && !c.needsRenewal).length;
  const needsRenewal = consents.filter(c => c.needsRenewal).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-slate-800">Consent Forms</h1>
          <p className="text-slate-600 mt-1">Manage consent form templates and customer signatures</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFormBuilder(true)}
            className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium"
            disabled={loading}
          >
            + Custom Template
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            disabled={loading}
          >
            Default Form
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{templates.length}</div>
              <div className="text-sm text-slate-600">Templates</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{activeConsents}</div>
              <div className="text-sm text-slate-600">Active Consents</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <svg className="h-6 w-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{needsRenewal}</div>
              <div className="text-sm text-slate-600">Needs Renewal</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalConsents}</div>
              <div className="text-sm text-slate-600">Total Signed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Initialize Default Button */}
      {templates.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-slate-900 mb-2">No Consent Forms Yet</h3>
              <p className="text-sm text-slate-600 mb-4">
                Get started by creating a default consent form template for brow and lash services.
                This template includes all necessary legal sections for compliance.
              </p>
              <button
                onClick={handleInitializeDefaults}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Default Consent Form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consent Form Templates */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-slate-800">Consent Form Templates</h2>
        
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-xl shadow-soft p-6 border-2 ${
              template.active ? 'border-green-300' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-slate-900">{template.name}</h3>
                  {template.active && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    v{template.version}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {template.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{template.title}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                  <span>
                    Effective: {format(new Date(template.effectiveDate), 'MMM d, yyyy')}
                  </span>
                  <span>•</span>
                  <span>
                    {template.sections.length} sections ({template.sections.filter(s => s.required).length} required)
                  </span>
                  <span>•</span>
                  <span>
                    {consentsByTemplate[template.id]?.length || 0} signatures
                  </span>
                </div>
                
                {/* Service Assignment Info */}
                {(template.assignedCategories && template.assignedCategories.length > 0) || 
                 (template.assignedServices && template.assignedServices.length > 0) ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Assigned to:</span>
                    {template.assignedCategories?.map(category => (
                      <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {category} Category
                      </span>
                    ))}
                    {template.assignedServices && template.assignedServices.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {template.assignedServices.length} specific services
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      All services
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!template.active ? (
                  <button
                    onClick={() => handleActivateTemplate(template)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Activate
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeactivateTemplate(template)}
                    disabled={loading}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                )}
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Sections Preview */}
            <div className="border-t border-slate-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Sections:</h4>
              <div className="grid grid-cols-2 gap-2">
                {template.sections.map((section, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {section.required ? (
                      <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-slate-700">{section.heading}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Signatures */}
            {consentsByTemplate[template.id] && consentsByTemplate[template.id].length > 0 && (
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Signatures:</h4>
                <div className="space-y-2">
                  {consentsByTemplate[template.id].slice(0, 3).map((consent) => (
                    <div key={consent.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${consent.needsRenewal ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                        <span className="font-medium text-slate-900">{consent.customerName}</span>
                        <span className="text-slate-500">{consent.customerEmail || consent.customerPhone}</span>
                      </div>
                      <span className="text-slate-500">
                        {format(new Date(consent.consentedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col">
            <div className="border-b border-slate-200 p-6 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-serif text-terracotta mb-1">{selectedTemplate.name}</h2>
                  <p className="text-sm text-slate-600">Version {selectedTemplate.version}</p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-700">{selectedTemplate.content}</p>
              </div>

              {selectedTemplate.sections.map((section, idx) => (
                <div key={idx} className="border-2 border-slate-200 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    {section.heading}
                    {section.required && (
                      <span className="text-xs text-red-600">(Required)</span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-6 flex-shrink-0">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Form Builder Modal */}
      {showFormBuilder && (
        <ConsentFormBuilder
          onClose={() => setShowFormBuilder(false)}
          onSuccess={() => {
            setShowFormBuilder(false);
            // Templates will automatically refresh due to real-time listener
          }}
        />
      )}
    </div>
  );
}

