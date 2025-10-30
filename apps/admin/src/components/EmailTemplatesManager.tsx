import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables: string[];
  isDefault: boolean;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    subject: 'Appointment Confirmed - {{businessName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; margin-bottom: 20px;">Appointment Confirmed!</h2>
          
          <p>Hi {{customerName}},</p>
          
          <p>Your appointment has been confirmed for:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Time:</strong> {{time}}</p>
            <p><strong>Service:</strong> {{serviceName}}</p>
            <p><strong>Duration:</strong> {{duration}} minutes</p>
          </div>
          
          <p>We look forward to seeing you at {{businessName}}!</p>
          
          <p>If you need to reschedule or have any questions, please contact us at {{businessPhone}}.</p>
          
          <p>Best regards,<br>{{businessName}} Team</p>
        </div>
      </div>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'duration', 'businessName', 'businessPhone'],
    isDefault: true
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    subject: 'Reminder: Your appointment tomorrow at {{businessName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; margin-bottom: 20px;">Appointment Reminder</h2>
          
          <p>Hi {{customerName}},</p>
          
          <p>This is a friendly reminder that you have an appointment tomorrow:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Time:</strong> {{time}}</p>
            <p><strong>Service:</strong> {{serviceName}}</p>
            <p><strong>Duration:</strong> {{duration}} minutes</p>
          </div>
          
          <p>Please arrive 5-10 minutes early for your appointment.</p>
          
          <p>If you need to reschedule, please contact us at {{businessPhone}}.</p>
          
          <p>See you tomorrow!<br>{{businessName}} Team</p>
        </div>
      </div>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'duration', 'businessName', 'businessPhone'],
    isDefault: true
  },
  {
    id: 'receipt-email',
    name: 'Receipt Email',
    subject: 'Your Receipt from {{businessName}}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Thank You for Your Visit!</h2>' +
        '<p>Hi {{customerName}},</p>' +
        '<p>Thank you for choosing {{businessName}}! Here\'s your receipt for today\'s services:</p>' +
        '<div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">' +
          '<h3 style="margin-top: 0; color: #333;">Receipt #{{receiptNumber}}</h3>' +
          '<p><strong>Date:</strong> {{date}}</p>' +
          '<p><strong>Time:</strong> {{time}}</p>' +
          '<div style="border-top: 1px solid #ddd; margin: 15px 0; padding-top: 15px;">' +
            '<p><strong>Services:</strong></p>' +
            '<p>{{serviceDetails}}</p>' +
            '<p><strong>Subtotal:</strong> ${{subtotal}}</p>' +
            '<p><strong>Tip:</strong> ${{tip}}</p>' +
            '<p style="font-size: 18px; font-weight: bold; border-top: 2px solid #8B4513; padding-top: 10px; margin-top: 10px;">' +
              '<strong>Total: ${{total}}</strong>' +
            '</p>' +
          '</div>' +
        '</div>' +
        '<p>Your detailed receipt is attached as a PDF for your records.</p>' +
        '<p>We hope you love your results! If you have any questions or would like to book your next appointment, please don\'t hesitate to contact us.</p>' +
        '<p>Thank you again for choosing {{businessName}}!<br>The {{businessName}} Team</p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'receiptNumber', 'date', 'time', 'serviceDetails', 'subtotal', 'tip', 'total'],
    isDefault: true
  },
  {
    id: 'cancellation-notice',
    name: 'Cancellation Notice',
    subject: 'Appointment Cancelled - {{businessName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; margin-bottom: 20px;">Appointment Cancelled</h2>
          
          <p>Hi {{customerName}},</p>
          
          <p>We're sorry to inform you that your appointment has been cancelled:</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Time:</strong> {{time}}</p>
            <p><strong>Service:</strong> {{serviceName}}</p>
          </div>
          
          <p>Reason: {{cancellationReason}}</p>
          
          <p>We apologize for any inconvenience. Please contact us at {{businessPhone}} to reschedule your appointment.</p>
          
          <p>Best regards,<br>{{businessName}} Team</p>
        </div>
      </div>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'cancellationReason', 'businessName', 'businessPhone'],
    isDefault: true
  }
];

export default function EmailTemplatesManager() {
  const { db } = useFirebase();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load templates from Firestore
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesDoc = await getDoc(doc(db, 'settings', 'emailTemplates'));
      
      if (templatesDoc.exists()) {
        const data = templatesDoc.data();
        setTemplates(data.templates || defaultTemplates);
      } else {
        // Initialize with default templates
        await setDoc(doc(db, 'settings', 'emailTemplates'), {
          templates: defaultTemplates
        });
        setTemplates(defaultTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(defaultTemplates);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplates = async (updatedTemplates: EmailTemplate[]) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'emailTemplates'), {
        templates: updatedTemplates
      });
      setTemplates(updatedTemplates);
      alert('Templates saved successfully!');
    } catch (error) {
      console.error('Error saving templates:', error);
      alert('Failed to save templates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSaveTemplate = (updatedTemplate: EmailTemplate) => {
    const updatedTemplates = templates.map(t => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    );
    saveTemplates(updatedTemplates);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleResetToDefault = (templateId: string) => {
    if (confirm('Are you sure you want to reset this template to its default version? This will overwrite your current changes.')) {
      const defaultTemplate = defaultTemplates.find(t => t.id === templateId);
      if (defaultTemplate) {
        handleSaveTemplate(defaultTemplate);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta"></div>
          <span className="ml-3 text-slate-600">Loading templates...</span>
        </div>
      </section>
    );
  }

  if (isEditing && selectedTemplate) {
    return (
      <EmailTemplateEditor
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onCancel={handleCancelEdit}
        onResetToDefault={() => handleResetToDefault(selectedTemplate.id)}
      />
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl mb-2">Email Templates</h2>
          <p className="text-sm text-slate-600">Manage email templates for appointment confirmations, reminders, receipts, and more</p>
        </div>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 mb-1">{template.name}</h3>
                <p className="text-sm text-slate-600 mb-2">Subject: {template.subject}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Variables: {template.variables.join(', ')}</span>
                  {template.isDefault && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="px-3 py-1 text-sm bg-terracotta text-white rounded hover:bg-terracotta/90 transition-colors"
                >
                  Edit
                </button>
                {template.isDefault && (
                  <button
                    onClick={() => handleResetToDefault(template.id)}
                    className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Available Variables</h4>
        <p className="text-sm text-blue-800 mb-2">Use these variables in your templates by wrapping them in double curly braces:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {['customerName', 'customerEmail', 'customerPhone', 'date', 'time', 'serviceName', 'serviceDetails', 'duration', 'price', 'tip', 'total', 'subtotal', 'businessName', 'businessPhone', 'businessEmail', 'businessAddress', 'receiptNumber', 'receiptUrl', 'cancellationReason'].map(variable => (
            <code key={variable} className="bg-white px-2 py-1 rounded border">{'{{' + variable + '}}'}</code>
          ))}
        </div>
      </div>
    </section>
  );
}

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
  onResetToDefault: () => void;
}

function EmailTemplateEditor({ template, onSave, onCancel, onResetToDefault }: EmailTemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate>(template);
  const [previewMode, setPreviewMode] = useState<'html' | 'preview'>('html');

  const handleSave = () => {
    onSave(editedTemplate);
  };

  const handleSubjectChange = (subject: string) => {
    setEditedTemplate(prev => ({ ...prev, subject }));
  };

  const handleHtmlChange = (html: string) => {
    setEditedTemplate(prev => ({ ...prev, html }));
  };

  return (
    <section className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Edit Template: {template.name}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDefault}
            className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-terracotta text-white rounded hover:bg-terracotta/90 transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Subject Line</label>
          <input
            type="text"
            value={editedTemplate.subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-terracotta focus:border-transparent"
            placeholder="Email subject line"
          />
        </div>

        {/* Template Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">Template Content</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('html')}
                className={`px-3 py-1 text-xs rounded ${
                  previewMode === 'html' 
                    ? 'bg-terracotta text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-3 py-1 text-xs rounded ${
                  previewMode === 'preview' 
                    ? 'bg-terracotta text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
          
          {previewMode === 'html' ? (
            <textarea
              value={editedTemplate.html}
              onChange={(e) => handleHtmlChange(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-terracotta focus:border-transparent font-mono text-sm"
              placeholder="HTML template content"
            />
          ) : (
            <div className="border border-slate-300 rounded-md p-4 h-96 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: editedTemplate.html }} />
            </div>
          )}
        </div>

        {/* Variables Reference */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-2">Available Variables</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {template.variables.map(variable => (
              <code key={variable} className="bg-white px-2 py-1 rounded border">{'{{' + variable + '}}'}</code>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
