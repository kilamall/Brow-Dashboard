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
    id: 'receipt-email',
    name: 'Receipt Email',
    subject: 'Your Receipt from \{\{businessName\}\} - Thank You!',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Thank You for Your Visit!</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>Thank you for choosing \{\{businessName\}\}! We hope you love your results. Here\'s your receipt for today\'s services:</p>' +
        '<div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">' +
          '<h3 style="margin-top: 0; color: #333;">Receipt #\{\{receiptNumber\}\}</h3>' +
          '<p><strong>Date:</strong> \{\{date\}\}</p>' +
          '<p><strong>Time:</strong> \{\{time\}\}</p>' +
          '<div style="border-top: 1px solid #ddd; margin: 15px 0; padding-top: 15px;">' +
            '<p><strong>Services:</strong></p>' +
            '<p>\{\{serviceDetails\}\}</p>' +
            '<p><strong>Subtotal:</strong> ${{subtotal}}</p>' +
            '<p><strong>Tip:</strong> ${{tip}}</p>' +
            '<p style="font-size: 18px; font-weight: bold; border-top: 2px solid #8B4513; padding-top: 10px; margin-top: 10px;">' +
              '<strong>Total: ${{total}}</strong>' +
            '</p>' +
          '</div>' +
        '</div>' +
        '<p>Your detailed receipt is attached as a PDF for your records.</p>' +
        '<p>We\'d love to see you again! <a href="\{\{bookingLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Book your next appointment online</a> or call us at \{\{businessPhone\}\}.</p>' +
        '<p>Thank you for trusting us with your beauty needs!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
        '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">' +
          '<p>\{\{businessName\}\}<br>\{\{businessAddress\}\}<br>\{\{businessPhone\}\} | \{\{businessEmail\}\}</p>' +
        '</div>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'receiptNumber', 'date', 'time', 'serviceDetails', 'subtotal', 'tip', 'total', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    subject: '✅ Appointment Confirmed - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Appointment Confirmed! 🎉</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>Great news! Your appointment has been confirmed. We\'re excited to see you!</p>' +
        '<div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #8B4513;">' +
          '<h3 style="margin-top: 0; color: #333;">Appointment Details</h3>' +
          '<p><strong>📅 Date:</strong> \{\{date\}\}</p>' +
          '<p><strong>🕐 Time:</strong> \{\{time\}\}</p>' +
          '<p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>' +
          '<p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>' +
          '<p><strong>💰 Total:</strong> $\{\{totalPrice\}\}</p>' +
        '</div>' +
        '<div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
          '<p><strong>📍 Location:</strong> \{\{businessAddress\}\}</p>' +
          '<p><strong>📞 Phone:</strong> \{\{businessPhone\}\}</p>' +
        '</div>' +
        '<p>Need to make changes? <a href="\{\{bookingLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Manage your booking online</a> or call us at \{\{businessPhone\}\}.</p>' +
        '<p>We can\'t wait to pamper you!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'totalPrice', 'businessAddress', 'businessPhone', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    subject: '⏰ Reminder: Your Appointment Tomorrow - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Appointment Reminder ⏰</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>This is a friendly reminder that you have an appointment scheduled for tomorrow. We\'re looking forward to seeing you!</p>' +
        '<div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">' +
          '<h3 style="margin-top: 0; color: #856404;">Tomorrow\'s Appointment</h3>' +
          '<p><strong>📅 Date:</strong> \{\{date\}\}</p>' +
          '<p><strong>🕐 Time:</strong> \{\{time\}\}</p>' +
          '<p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>' +
          '<p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>' +
        '</div>' +
        '<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
          '<p><strong>📍 Location:</strong> \{\{businessAddress\}\}</p>' +
          '<p><strong>📞 Phone:</strong> \{\{businessPhone\}\}</p>' +
        '</div>' +
        '<p>Need to reschedule? <a href="\{\{bookingLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Click here to manage your booking</a> or call us at \{\{businessPhone\}\}.</p>' +
        '<p>See you tomorrow!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'businessAddress', 'businessPhone', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-cancelled',
    name: 'Appointment Cancelled',
    subject: 'Appointment Cancelled - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Appointment Cancelled</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>We\'re sorry to inform you that your appointment has been cancelled:</p>' +
        '<div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">' +
          '<h3 style="margin-top: 0; color: #721c24;">Cancelled Appointment</h3>' +
          '<p><strong>📅 Date:</strong> \{\{date\}\}</p>' +
          '<p><strong>🕐 Time:</strong> \{\{time\}\}</p>' +
          '<p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>' +
          '<p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>' +
          '<p><strong>💰 Total:</strong> $\{\{totalPrice\}\}</p>' +
        '</div>' +
        '<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">' +
          '<p><strong>📍 Location:</strong> \{\{businessAddress\}\}</p>' +
          '<p><strong>📞 Phone:</strong> \{\{businessPhone\}\}</p>' +
        '</div>' +
        '<p>We apologize for any inconvenience. Please <a href="\{\{bookingLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">book a new appointment</a> or call us at \{\{businessPhone\}\} to reschedule.</p>' +
        '<p>Thank you for your understanding.<br><strong>The \{\{businessName\}\} Team</strong></p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'totalPrice', 'businessAddress', 'businessPhone', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'welcome-new-customer',
    name: 'Welcome New Customer',
    subject: 'Welcome to \{\{businessName\}\} - Let\'s Get Started!',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Welcome to \{\{businessName\}\}! 🎉</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>Welcome to the \{\{businessName\}\} family! We\'re thrilled to have you as a new client and can\'t wait to help you look and feel your absolute best.</p>' +
        '<div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">' +
          '<h3 style="margin-top: 0; color: #2d5a2d;">What to Expect</h3>' +
          '<p>✨ Professional, personalized service<br>' +
          '✨ High-quality products and techniques<br>' +
          '✨ A relaxing, comfortable environment<br>' +
          '✨ Expert advice and recommendations</p>' +
        '</div>' +
        '<p>Ready to book your first appointment? <a href="\{\{bookingLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Click here to get started</a> or call us at \{\{businessPhone\}\}.</p>' +
        '<p>We look forward to meeting you soon!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
        '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">' +
          '<p>\{\{businessName\}\}<br>\{\{businessAddress\}\}<br>\{\{businessPhone\}\} | \{\{businessEmail\}\}</p>' +
        '</div>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'follow-up-after-service',
    name: 'Follow-up After Service',
    subject: 'How was your visit? - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">How was your visit? 💫</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>We hope you\'re loving your results from your recent visit! Your \{\{serviceName\}\} on \{\{date\}\} was a pleasure to provide.</p>' +
        '<div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">' +
          '<p><strong>We\'d love to hear from you!</strong></p>' +
          '<p>Your feedback helps us continue providing the best possible service. Please take a moment to <a href="\{\{reviewLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">leave us a review</a>.</p>' +
        '</div>' +
        '<p>Ready for your next appointment? <a href="\{\{bookingLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Book online</a> or call us at \{\{businessPhone\}\}.</p>' +
        '<p>Thank you for choosing \{\{businessName\}\}!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'serviceName', 'date', 'reviewLink', 'bookingLink', 'businessPhone'],
    isDefault: true
  },
  {
    id: 'promotional-offer',
    name: 'Promotional Offer',
    subject: 'Special Offer Just for You - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Special Offer Just for You! 🎁</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>As one of our valued clients, we wanted to share an exclusive offer with you!</p>' +
        '<div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #ffc107; text-align: center;">' +
          '<h3 style="margin-top: 0; color: #856404; font-size: 24px;">{{offerTitle}}</h3>' +
          '<p style="font-size: 18px; color: #856404; margin: 10px 0;"><strong>{{offerDescription}}</strong></p>' +
          '<p style="font-size: 16px; color: #856404;">Valid until {{offerExpiry}}</p>' +
        '</div>' +
        '<p>Book your appointment today to take advantage of this special offer!</p>' +
        '<p><a href="\{\{bookingLink\}\}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Now</a></p>' +
        '<p>Questions? Call us at \{\{businessPhone\}\} or reply to this email.</p>' +
        '<p>We can\'t wait to see you!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'offerTitle', 'offerDescription', 'offerExpiry', 'bookingLink', 'businessPhone'],
    isDefault: true
  },
  {
    id: 'no-show-follow-up',
    name: 'No-Show Follow-up',
    subject: 'We missed you - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">We Missed You! 😔</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>We noticed you weren\'t able to make it to your appointment yesterday. We hope everything is okay!</p>' +
        '<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">' +
          '<p><strong>Missed Appointment:</strong></p>' +
          '<p>📅 \{\{date\}\} at \{\{time\}\}</p>' +
          '<p>💅 \{\{serviceName\}\}</p>' +
        '</div>' +
        '<p>No worries! We understand that life happens. We\'d love to reschedule your appointment at your convenience.</p>' +
        '<p><a href="\{\{bookingLink\}\}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reschedule Now</a></p>' +
        '<p>Or call us at \{\{businessPhone\}\} to book over the phone.</p>' +
        '<p>We look forward to seeing you soon!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'bookingLink', 'businessPhone'],
    isDefault: true
  },
  {
    id: 'birthday-special',
    name: 'Birthday Special',
    subject: 'Happy Birthday! Special Offer Inside - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Happy Birthday! 🎂🎉</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>Wishing you the happiest of birthdays! You deserve to be pampered on your special day.</p>' +
        '<div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #ffc107; text-align: center;">' +
          '<h3 style="margin-top: 0; color: #856404; font-size: 24px;">Birthday Special! 🎁</h3>' +
          '<p style="font-size: 18px; color: #856404; margin: 10px 0;"><strong>20% OFF your next service</strong></p>' +
          '<p style="font-size: 16px; color: #856404;">Valid for the entire month of \{\{birthdayMonth\}\}</p>' +
        '</div>' +
        '<p>Book your birthday treat today and let us help you celebrate in style!</p>' +
        '<p><a href="\{\{bookingLink\}\}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Your Birthday Service</a></p>' +
        '<p>Have a wonderful birthday!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'birthdayMonth', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-completion',
    name: 'Appointment Completion',
    subject: 'Thank you for your visit! - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Thank You for Your Visit! ✨</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>We hope you had a wonderful experience with us today! Thank you for choosing \{\{businessName\}\} for your beauty needs.</p>' +
        '<div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">' +
          '<h3 style="margin-top: 0; color: #2d5a2d;">Today\'s Service</h3>' +
          '<p><strong>📅 Date:</strong> \{\{date\}\}</p>' +
          '<p><strong>🕐 Time:</strong> \{\{time\}\}</p>' +
          '<p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>' +
          '<p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>' +
        '</div>' +
        '<p>We\'d love to hear about your experience! <a href="\{\{reviewLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Leave us a review</a> to help other clients discover our services.</p>' +
        '<p>Ready for your next appointment? <a href="\{\{bookingLink\}\}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Book your next visit</a> or call us at \{\{businessPhone\}\}.</p>' +
        '<p>Thank you for trusting us with your beauty needs!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
        '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">' +
          '<p>\{\{businessName\}\}<br>\{\{businessAddress\}\}<br>\{\{businessPhone\}\} | \{\{businessEmail\}\}</p>' +
        '</div>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'businessAddress', 'businessPhone', 'businessEmail', 'reviewLink', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-no-show',
    name: 'Appointment No-Show',
    subject: 'We missed you - \{\{businessName\}\}',
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">We Missed You! 😔</h2>' +
        '<p>Hi \{\{customerName\}\},</p>' +
        '<p>We noticed you weren\'t able to make it to your appointment today. We hope everything is okay!</p>' +
        '<div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">' +
          '<h3 style="margin-top: 0; color: #721c24;">Missed Appointment</h3>' +
          '<p><strong>📅 Date:</strong> \{\{date\}\}</p>' +
          '<p><strong>🕐 Time:</strong> \{\{time\}\}</p>' +
          '<p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>' +
          '<p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>' +
        '</div>' +
        '<p>No worries! We understand that life happens. We\'d love to reschedule your appointment at your convenience.</p>' +
        '<p><a href="\{\{bookingLink\}\}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reschedule Now</a></p>' +
        '<p>Or call us at \{\{businessPhone\}\} to book over the phone.</p>' +
        '<p>We look forward to seeing you soon!<br><strong>The \{\{businessName\}\} Team</strong></p>' +
        '<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">' +
          '<p>\{\{businessName\}\}<br>\{\{businessAddress\}\}<br>\{\{businessPhone\}\} | \{\{businessEmail\}\}</p>' +
        '</div>' +
      '</div>' +
    '</div>',
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'businessAddress', 'businessPhone', 'businessEmail', 'bookingLink'],
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
        const existingTemplates = data.templates || [];
        
        // Check if we have all the new templates, if not, merge with defaults
        if (existingTemplates.length < defaultTemplates.length) {
          console.log('Updating templates with new defaults...');
          const mergedTemplates = [...existingTemplates];
          
          // Add any missing templates from defaults
          defaultTemplates.forEach(defaultTemplate => {
            if (!existingTemplates.find(t => t.id === defaultTemplate.id)) {
              mergedTemplates.push(defaultTemplate);
            }
          });
          
          // Save the updated templates
          await setDoc(doc(db, 'settings', 'emailTemplates'), {
            templates: mergedTemplates
          });
          setTemplates(mergedTemplates);
        } else {
          setTemplates(existingTemplates);
        }
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
    <section className="bg-white rounded-xl shadow-soft p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg mb-1">Email Templates</h2>
          <p className="text-xs text-slate-600">Manage email templates for appointment confirmations, reminders, receipts, and more</p>
        </div>
      </div>

      <div className="grid gap-3">
        {templates.map((template) => (
          <div key={template.id} className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 text-sm mb-1 truncate">{template.name}</h3>
                <p className="text-xs text-slate-600 mb-2 truncate">Subject: {template.subject}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{template.variables.length} variables</span>
                  {template.isDefault && (
                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">Default</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="px-2.5 py-1 text-xs bg-terracotta text-white rounded hover:bg-terracotta/90 transition-colors"
                >
                  Edit
                </button>
                {template.isDefault && (
                  <button
                    onClick={() => handleResetToDefault(template.id)}
                    className="px-2.5 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
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
  const [previewMode, setPreviewMode] = useState<'visual' | 'preview'>('preview');
  const [formData, setFormData] = useState({
    greeting: 'Hi \{\{customerName\}\},',
    mainMessage: '',
    closingMessage: 'Thank you for choosing \{\{businessName\}\}!',
    businessName: '\{\{businessName\}\}',
    showReceiptDetails: true,
    showServiceBreakdown: true,
    showPricing: true,
    showBusinessInfo: true
  });

  // Initialize form data from template
  useEffect(() => {
    if (template.id === 'receipt-email') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'Thank you for choosing \{\{businessName\}\}! We hope you love your results. Here\'s your receipt for today\'s services:',
        closingMessage: 'We\'d love to see you again! Book your next appointment online or call us at \{\{businessPhone\}\}.',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: true,
        showServiceBreakdown: true,
        showPricing: true,
        showBusinessInfo: true
      });
    } else if (template.id === 'appointment-confirmation') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'Great news! Your appointment has been confirmed. We\'re excited to see you!',
        closingMessage: 'We can\'t wait to pamper you!',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    } else if (template.id === 'appointment-reminder') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'This is a friendly reminder that you have an appointment scheduled for tomorrow. We\'re looking forward to seeing you!',
        closingMessage: 'See you tomorrow!',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    } else if (template.id === 'appointment-cancelled') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'We\'re sorry to inform you that your appointment has been cancelled:',
        closingMessage: 'Thank you for your understanding.',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    } else if (template.id === 'welcome-new-customer') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'Welcome to the \{\{businessName\}\} family! We\'re thrilled to have you as a new client and can\'t wait to help you look and feel your absolute best.',
        closingMessage: 'We look forward to meeting you soon!',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    } else if (template.id === 'follow-up-after-service') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'We hope you\'re loving your results from your recent visit! Your \{\{serviceName\}\} on \{\{date\}\} was a pleasure to provide.',
        closingMessage: 'Thank you for choosing \{\{businessName\}\}!',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    } else if (template.id === 'promotional-offer') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'As one of our valued clients, we wanted to share an exclusive offer with you!',
        closingMessage: 'We can\'t wait to see you!',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    } else if (template.id === 'no-show-follow-up') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'We noticed you weren\'t able to make it to your appointment yesterday. We hope everything is okay!',
        closingMessage: 'We look forward to seeing you soon!',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    } else if (template.id === 'birthday-special') {
      setFormData({
        greeting: 'Hi \{\{customerName\}\},',
        mainMessage: 'Wishing you the happiest of birthdays! You deserve to be pampered on your special day.',
        closingMessage: 'Have a wonderful birthday!',
        businessName: '\{\{businessName\}\}',
        showReceiptDetails: false,
        showServiceBreakdown: false,
        showPricing: false,
        showBusinessInfo: true
      });
    }
  }, [template.id]);

  const handleSave = () => {
    // Generate HTML from form data
    const html = generateHtmlFromFormData(formData, template.id);
    const updatedTemplate = { ...editedTemplate, html };
    onSave(updatedTemplate);
  };

  const handleSubjectChange = (subject: string) => {
    setEditedTemplate(prev => ({ ...prev, subject }));
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate HTML from form data
  const generateHtmlFromFormData = (data: any, templateId: string) => {
    // Define URLs for different actions
    const bookingLink = 'https://bueno-brows-7cce7.web.app/dashboard?tab=bookings';
    const reviewLink = 'https://bueno-brows-7cce7.web.app/reviews';
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; margin-bottom: 20px;">${getTemplateTitle(templateId)}</h2>
          
          <p>${data.greeting}</p>
          
          <p>${data.mainMessage}</p>
    `;

    if (data.showReceiptDetails && templateId === 'receipt-email') {
      html += `
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Receipt #\{\{receiptNumber\}\}</h3>
            <p><strong>Date:</strong> \{\{date\}\}</p>
            <p><strong>Time:</strong> \{\{time\}\}</p>
      `;

      if (data.showServiceBreakdown) {
        html += `
            <div style="border-top: 1px solid #ddd; margin: 15px 0; padding-top: 15px;">
              <p><strong>Services:</strong></p>
              <p>\{\{serviceDetails\}\}</p>
        `;

        if (data.showPricing) {
          html += 
              '<p><strong>Subtotal:</strong> ${{subtotal}}</p>' +
              '<p><strong>Tip:</strong> ${{tip}}</p>' +
              '<p style="font-size: 18px; font-weight: bold; border-top: 2px solid #8B4513; padding-top: 10px; margin-top: 10px;">' +
                '<strong>Total: ${{total}}</strong>' +
              '</p>';
        }

        html += `</div>`;
      }

      html += `
          </div>
          <p>Your detailed receipt is attached as a PDF for your records.</p>
      `;
    }

    if (templateId === 'appointment-confirmation') {
      html += `
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #8B4513;">
            <h3 style="margin-top: 0; color: #333;">Appointment Details</h3>
            <p><strong>📅 Date:</strong> \{\{date\}\}</p>
            <p><strong>🕐 Time:</strong> \{\{time\}\}</p>
            <p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>
            <p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>
            <p><strong>💰 Total:</strong> $\{\{totalPrice\}\}</p>
          </div>
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📍 Location:</strong> \{\{businessAddress\}\}</p>
            <p><strong>📞 Phone:</strong> \{\{businessPhone\}\}</p>
          </div>
      `;
    }

    if (templateId === 'appointment-reminder') {
      html += `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">Tomorrow's Appointment</h3>
            <p><strong>📅 Date:</strong> \{\{date\}\}</p>
            <p><strong>🕐 Time:</strong> \{\{time\}\}</p>
            <p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>
            <p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📍 Location:</strong> \{\{businessAddress\}\}</p>
            <p><strong>📞 Phone:</strong> \{\{businessPhone\}\}</p>
          </div>
      `;
    }

    if (templateId === 'appointment-cancelled') {
      html += `
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin-top: 0; color: #721c24;">Cancelled Appointment</h3>
            <p><strong>📅 Date:</strong> \{\{date\}\}</p>
            <p><strong>🕐 Time:</strong> \{\{time\}\}</p>
            <p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>
          </div>
      `;
    }

    if (templateId === 'welcome-new-customer') {
      html += `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d5a2d;">What to Expect</h3>
            <p>✨ Professional, personalized service<br>
            ✨ High-quality products and techniques<br>
            ✨ A relaxing, comfortable environment<br>
            ✨ Expert advice and recommendations</p>
          </div>
      `;
    }

    if (templateId === 'follow-up-after-service') {
      html += `
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>We'd love to hear from you!</strong></p>
            <p>Your feedback helps us continue providing the best possible service. Please take a moment to <a href="${reviewLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">leave us a review</a>.</p>
          </div>
      `;
    }

    if (templateId === 'promotional-offer') {
      html += `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #ffc107; text-align: center;">
            <h3 style="margin-top: 0; color: #856404; font-size: 24px;">{{offerTitle}}</h3>
            <p style="font-size: 18px; color: #856404; margin: 10px 0;"><strong>{{offerDescription}}</strong></p>
            <p style="font-size: 16px; color: #856404;">Valid until {{offerExpiry}}</p>
          </div>
      `;
    }

    if (templateId === 'no-show-follow-up') {
      html += `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Missed Appointment:</strong></p>
            <p>📅 \{\{date\}\} at \{\{time\}\}</p>
            <p>💅 \{\{serviceName\}\}</p>
          </div>
      `;
    }

    if (templateId === 'birthday-special') {
      html += `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #ffc107; text-align: center;">
            <h3 style="margin-top: 0; color: #856404; font-size: 24px;">Birthday Special! 🎁</h3>
            <p style="font-size: 18px; color: #856404; margin: 10px 0;"><strong>20% OFF your next service</strong></p>
            <p style="font-size: 16px; color: #856404;">Valid for the entire month of \{\{birthdayMonth\}\}</p>
          </div>
      `;
    }

    if (templateId === 'appointment-cancelled') {
      html += `
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin-top: 0; color: #721c24;">Cancelled Appointment</h3>
            <p><strong>📅 Date:</strong> \{\{date\}\}</p>
            <p><strong>🕐 Time:</strong> \{\{time\}\}</p>
            <p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>
            <p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>
            <p><strong>💰 Total:</strong> $\{\{totalPrice\}\}</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📍 Location:</strong> \{\{businessAddress\}\}</p>
            <p><strong>📞 Phone:</strong> \{\{businessPhone\}\}</p>
          </div>
      `;
    }

    if (templateId === 'appointment-completion') {
      html += `
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d5a2d;">Today's Service</h3>
            <p><strong>📅 Date:</strong> \{\{date\}\}</p>
            <p><strong>🕐 Time:</strong> \{\{time\}\}</p>
            <p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>
            <p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>
          </div>
      `;
    }

    if (templateId === 'appointment-no-show') {
      html += `
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin-top: 0; color: #721c24;">Missed Appointment</h3>
            <p><strong>📅 Date:</strong> \{\{date\}\}</p>
            <p><strong>🕐 Time:</strong> \{\{time\}\}</p>
            <p><strong>💅 Service:</strong> \{\{serviceName\}\}</p>
            <p><strong>⏱️ Duration:</strong> \{\{duration\}\} minutes</p>
          </div>
      `;
    }

    // Add call-to-action buttons based on template type
    if (templateId === 'follow-up-after-service') {
      html += `
          <p>Ready for your next appointment? <a href="${bookingLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Book online</a> or call us at \{\{businessPhone\}\}.</p>
      `;
    } else if (templateId === 'promotional-offer' || templateId === 'birthday-special') {
      html += `
          <p>Book your appointment today to take advantage of this special offer!</p>
          <p><a href="${bookingLink}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Now</a></p>
      `;
    } else if (templateId === 'no-show-follow-up') {
      html += `
          <p>No worries! We understand that life happens. We'd love to reschedule your appointment at your convenience.</p>
          <p><a href="${bookingLink}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reschedule Now</a></p>
      `;
    } else if (templateId === 'welcome-new-customer') {
      html += `
          <p>Ready to book your first appointment? <a href="${bookingLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Click here to get started</a> or call us at \{\{businessPhone\}\}.</p>
      `;
    } else if (templateId === 'appointment-confirmation' || templateId === 'appointment-reminder') {
      html += `
          <p>Need to make changes? <a href="${bookingLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Manage your booking online</a> or call us at \{\{businessPhone\}\}.</p>
      `;
    } else if (templateId === 'appointment-cancelled') {
      html += `
          <p>We apologize for any inconvenience. Please <a href="${bookingLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">book a new appointment</a> or call us at \{\{businessPhone\}\} to reschedule.</p>
      `;
    } else if (templateId === 'appointment-completion') {
      html += `
          <p>We'd love to hear about your experience! <a href="${reviewLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Leave us a review</a> to help other clients discover our services.</p>
          <p>Ready for your next appointment? <a href="${bookingLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Book your next visit</a> or call us at \{\{businessPhone\}\}.</p>
      `;
    } else if (templateId === 'appointment-no-show') {
      html += `
          <p>No worries! We understand that life happens. We'd love to reschedule your appointment at your convenience.</p>
          <p><a href="${bookingLink}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reschedule Now</a></p>
          <p>Or call us at \{\{businessPhone\}\} to book over the phone.</p>
      `;
    } else if (templateId === 'receipt-email') {
      html += `
          <p>We'd love to see you again! <a href="${bookingLink}" style="color: #8B4513; text-decoration: none; font-weight: bold;">Book your next appointment online</a> or call us at \{\{businessPhone\}\}.</p>
      `;
    }

    html += `
          <p>${data.closingMessage}</p>
          
          <p>Thank you again for choosing ${data.businessName}!<br><strong>The ${data.businessName} Team</strong></p>
    `;

    // Add business info footer for certain templates
    if (templateId === 'receipt-email' || templateId === 'welcome-new-customer') {
      html += `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>\{\{businessName\}\}<br>\{\{businessAddress\}\}<br>\{\{businessPhone\}\} | \{\{businessEmail\}\}</p>
          </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  };

  // Helper function to get template titles
  const getTemplateTitle = (templateId: string) => {
    const titles: Record<string, string> = {
      'receipt-email': 'Thank You for Your Visit!',
      'appointment-confirmation': 'Appointment Confirmed! 🎉',
      'appointment-reminder': 'Appointment Reminder ⏰',
      'appointment-cancelled': 'Appointment Cancelled',
      'welcome-new-customer': 'Welcome to \{\{businessName\}\}! 🎉',
      'follow-up-after-service': 'How was your visit? 💫',
      'promotional-offer': 'Special Offer Just for You! 🎁',
      'no-show-follow-up': 'We Missed You! 😔',
      'birthday-special': 'Happy Birthday! 🎂🎉',
      'appointment-completion': 'Thank You for Your Visit! ✨',
      'appointment-no-show': 'We Missed You! 😔'
    };
    return titles[templateId] || 'Email from \{\{businessName\}\}';
  };

  return (
    <section className="bg-white rounded-xl shadow-soft p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg">Edit Template: {template.name}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDefault}
            className="px-2.5 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={onCancel}
            className="px-2.5 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-2.5 py-1 text-xs bg-terracotta text-white rounded hover:bg-terracotta/90 transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Subject Line */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Subject Line</label>
          <input
            type="text"
            value={editedTemplate.subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-terracotta focus:border-transparent"
            placeholder="Email subject line"
          />
        </div>

        {/* Visual Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-slate-700">Email Content</label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreviewMode('visual')}
                className={`px-2 py-1 text-xs rounded ${
                  previewMode === 'visual' 
                    ? 'bg-terracotta text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setPreviewMode('preview')}
                className={`px-2 py-1 text-xs rounded ${
                  previewMode === 'preview' 
                    ? 'bg-terracotta text-white' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
          
          {previewMode === 'visual' ? (
            <div className="space-y-3 border border-slate-300 rounded-md p-4">
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <h4 className="font-medium text-blue-900 mb-1 text-sm">📧 Current Template Preview</h4>
                <p className="text-xs text-blue-800">This template is already professionally designed with all appointment details, styling, and proper links. You can customize the text below if needed.</p>
              </div>

              {/* Greeting */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Greeting</label>
                <input
                  type="text"
                  value={formData.greeting}
                  onChange={(e) => handleFormChange('greeting', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  placeholder="e.g., Hi \{\{customerName\}\},"
                />
              </div>

              {/* Main Message */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Main Message</label>
                <textarea
                  value={formData.mainMessage}
                  onChange={(e) => handleFormChange('mainMessage', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  rows={2}
                  placeholder="Main message content"
                />
              </div>

              {/* Receipt-specific options */}
              {template.id === 'receipt-email' && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Receipt Details</h4>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showReceiptDetails"
                      checked={formData.showReceiptDetails}
                      onChange={(e) => handleFormChange('showReceiptDetails', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="showReceiptDetails" className="text-sm text-blue-800">
                      Show receipt details (date, time, receipt number)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showServiceBreakdown"
                      checked={formData.showServiceBreakdown}
                      onChange={(e) => handleFormChange('showServiceBreakdown', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="showServiceBreakdown" className="text-sm text-blue-800">
                      Show service breakdown
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showPricing"
                      checked={formData.showPricing}
                      onChange={(e) => handleFormChange('showPricing', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="showPricing" className="text-sm text-blue-800">
                      Show pricing details (subtotal, tip, total)
                    </label>
                  </div>
                </div>
              )}

              {/* Closing Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Closing Message</label>
                <textarea
                  value={formData.closingMessage}
                  onChange={(e) => handleFormChange('closingMessage', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  rows={2}
                  placeholder="Closing message"
                />
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Business Name (in signature)</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleFormChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  placeholder="e.g., \{\{businessName\}\}"
                />
              </div>
            </div>
          ) : (
            <div className="border border-slate-300 rounded-md p-3 h-80 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: generateHtmlFromFormData(formData, template.id) }} />
            </div>
          )}
        </div>

        {/* Variables Reference */}
        <div className="bg-slate-50 rounded-lg p-3">
          <h4 className="font-medium text-slate-900 mb-1 text-sm">Available Variables</h4>
          <p className="text-xs text-slate-600 mb-2">Use these variables in your messages by typing them exactly as shown:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 text-xs">
            {template.variables.map(variable => (
              <code key={variable} className="bg-white px-1.5 py-0.5 rounded border">{'{{' + variable + '}}'}</code>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
