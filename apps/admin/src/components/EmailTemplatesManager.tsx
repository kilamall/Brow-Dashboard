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
    id: 'appointment-pending',
    name: 'New Appointment Request',
    subject: '📋 Appointment Request Received - {{businessName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }
    .header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
    .content { background-color: #2a2a2a; padding: 30px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 30px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>📋 Appointment Request Received!</h2>
    </div>
    <div class="content">
      <p class="greeting">Hi {{customerName}},</p>
      <p>Thank you for booking with us! We've received your appointment request and are reviewing it now.</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{date}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">{{time}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">{{serviceName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">{{duration}} minutes</span>
        </div>
      </div>
      <p style="margin-top: 20px;">We'll review your request and confirm it shortly. You'll receive a confirmation email once your appointment is approved.</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Manage Your Booking</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to make changes? Call us at {{businessPhone}} or visit our website.</p>
      <p style="margin-top: 20px;">Thank you for choosing {{businessName}}!</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;">{{businessName}}</strong></p>
      <p>📍 {{businessAddress}}</p>
      <p>📞 {{businessPhone}}</p>
      <p>✉️ {{businessEmail}}</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    subject: '✨ Appointment Confirmed - {{businessName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }
    .header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
    .content { background-color: #2a2a2a; padding: 30px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .price { color: #FFC107; font-size: 20px; font-weight: 700; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 30px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>✨ Appointment Confirmed!</h2>
    </div>
    <div class="content">
      <p class="greeting">Hi {{customerName}},</p>
      <p>Great news! Your appointment at <strong style="color: #FFC107;">{{businessName}}</strong> has been confirmed.</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">{{serviceName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{date}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">{{time}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">{{duration}} minutes</span>
        </div>
      </div>
      <p style="margin-top: 20px;">We look forward to seeing you!</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Book Your Next Appointment</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to make changes? Call us at {{businessPhone}} or visit our website.</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;">{{businessName}}</strong></p>
      <p>📍 {{businessAddress}}</p>
      <p>📞 {{businessPhone}}</p>
      <p>✉️ {{businessEmail}}</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'duration', 'businessName', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    subject: '🔔 Reminder: Your appointment tomorrow at {{businessName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }
    .header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
    .content { background-color: #2a2a2a; padding: 30px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 30px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>🔔 Appointment Reminder</h2>
    </div>
    <div class="content">
      <p class="greeting">Hi {{customerName}},</p>
      <p>This is a friendly reminder that you have an appointment tomorrow:</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{date}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">{{time}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">{{serviceName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">{{duration}} minutes</span>
        </div>
      </div>
      <p style="margin-top: 20px;">Please arrive 5-10 minutes early for your appointment.</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">View Appointment Details</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">If you need to reschedule, call us at {{businessPhone}} or visit our website.</p>
      <p style="margin-top: 20px;">See you tomorrow!</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;">{{businessName}}</strong></p>
      <p>📍 {{businessAddress}}</p>
      <p>📞 {{businessPhone}}</p>
      <p>✉️ {{businessEmail}}</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'duration', 'businessName', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'receipt-email',
    name: 'Receipt Email',
    subject: '💰 Your Receipt from {{businessName}}',
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <meta name="color-scheme" content="dark">\n  <meta name="supported-color-schemes" content="dark">\n  <style>\n    body { font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }\n    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }\n    .header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }\n    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }\n    .header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }\n    .content { background-color: #2a2a2a; padding: 30px 20px; color: #ffffff; }\n    .greeting { margin: 0 0 15px 0; font-size: 16px; }\n    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }\n    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }\n    .appointment-row:last-child { border-bottom: none; }\n    .detail-label { color: #FFC107; font-weight: 500; }\n    .detail-value { color: #ffffff; font-weight: 600; }\n    .total-row { margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFC107; }\n    .total-price { color: #FFC107; font-size: 24px; font-weight: 700; }\n    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }\n    .footer { background-color: #1a1a1a; padding: 30px 20px; text-align: center; color: #888; font-size: 14px; }\n  </style>\n</head>\n<body>\n  <div class="email-wrapper">\n    <div class="header-banner">\n      <h1>BUENO BROWS</h1>\n      <h2>💰 Thank You for Your Visit!</h2>\n    </div>\n    <div class="content">\n      <p class="greeting">Hi {{customerName}},</p>\n      <p>Thank you for choosing {{businessName}}! Here\'s your receipt for today\'s services:</p>\n      <div class="appointment-card">\n        <h3 style="margin-top: 0; color: #FFC107; font-size: 16px;">Receipt #{{receiptNumber}}</h3>\n        <div class="appointment-row">\n          <span class="detail-label">Date:</span>\n          <span class="detail-value">{{date}}</span>\n        </div>\n        <div class="appointment-row">\n          <span class="detail-label">Time:</span>\n          <span class="detail-value">{{time}}</span>\n        </div>\n        <div style="border-top: 1px solid #4a4a4a; margin: 15px 0; padding-top: 15px;">\n          <p style="margin: 10px 0; color: #FFC107; font-weight: 600;">Services:</p>\n          <p style="margin: 5px 0;">{{serviceDetails}}</p>\n        </div>\n        <div class="appointment-row">\n          <span class="detail-label">Subtotal:</span>\n          <span class="detail-value">${{subtotal}}</span>\n        </div>\n        <div class="appointment-row">\n          <span class="detail-label">Tip:</span>\n          <span class="detail-value">${{tip}}</span>\n        </div>\n        <div class="appointment-row total-row">\n          <span class="detail-label">Total:</span>\n          <span class="total-price">${{total}}</span>\n        </div>\n      </div>\n      <p>Your detailed receipt is attached as a PDF for your records.</p>\n      <p style="margin-top: 20px;">We hope you love your results! If you have any questions or would like to book your next appointment, please don\'t hesitate to contact us.</p>\n      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Book Your Next Appointment</a></div>\n    </div>\n    <div class="footer">\n      <p><strong style="color: #FFC107;">{{businessName}}</strong></p>\n      <p>📍 {{businessAddress}}</p>\n      <p>📞 {{businessPhone}}</p>\n      <p>✉️ {{businessEmail}}</p>\n    </div>\n  </div>\n</body>\n</html>',
    variables: ['customerName', 'businessName', 'receiptNumber', 'date', 'time', 'serviceDetails', 'subtotal', 'tip', 'total', 'businessAddress', 'businessPhone', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'cancellation-notice',
    name: 'Cancellation Notice',
    subject: '❌ Appointment Cancelled - {{businessName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .header-banner { background-color: #dc2626; padding: 40px 20px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 1px; }
    .header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #ffffff; }
    .content { background-color: #2a2a2a; padding: 30px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #fca5a5; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #dc2626; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 30px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>❌ Appointment Cancelled by Admin</h2>
    </div>
    <div class="content">
      <p class="greeting">Hi {{customerName}},</p>
      <p>We're writing to inform you that your appointment at <strong>{{businessName}}</strong> has been cancelled by our team.</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">{{serviceName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{date}}</span>
        </div>
      </div>
      <p style="margin-top: 20px;">We apologize for any inconvenience. Please contact us at {{businessPhone}} to reschedule your appointment.</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Book a New Appointment</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to reschedule? We'd love to help you find a new time that works for you.</p>
    </div>
    <div class="footer">
      <p><strong style="color: #dc2626;">{{businessName}}</strong></p>
      <p>📍 {{businessAddress}}</p>
      <p>📞 {{businessPhone}}</p>
      <p>✉️ {{businessEmail}}</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'cancellationReason', 'businessName', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
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
