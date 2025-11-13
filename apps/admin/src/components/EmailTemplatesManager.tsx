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
    id: 'initial-request',
    name: 'Initial Request / Invitation',
    subject: 'Welcome to {{businessName}}! Start by booking or setting up your profile',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .header-banner { background-color: #FFC107; padding: 36px 20px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 8px 10px 0 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
    </div>
    <div class="content">
      <p>Hi {{customerName}},</p>
      <p>Welcome! You can get started in a few ways:</p>
      <p>
        <a class="cta-button" href="{{bookingLink}}">Book an appointment</a>
        <a class="cta-button" href="{{profileLink}}">Set up your profile</a>
        <a class="cta-button" href="{{skinAnalysisLink}}">Try Skin Analysis</a>
      </p>
      <p style="margin-top: 16px; color:#bbb">Questions? Call us at {{businessPhone}}.</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 {{businessPhone}}</p>
      <p>✉️ <a href="mailto:{{businessEmail}}" style="color: #888; text-decoration: none;">{{businessEmail}}</a></p>
      <p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'businessName', 'bookingLink', 'profileLink', 'skinAnalysisLink', 'websiteLink', 'businessPhone', 'businessAddress', 'businessEmail'],
    isDefault: true
  },
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
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
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
          <span class="detail-value" style="text-align: right; line-height: 1.8;">{{serviceName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">{{duration}} minutes</span>
        </div>
      </div>
      <p style="margin-top: 20px;">We'll review your request and confirm it shortly. You'll receive a confirmation email once your appointment is approved.</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Manage Your Booking</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to make changes? Call us at {{businessPhone}} or visit our website.</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'websiteLink', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    subject: '✨ Appointment Confirmed - {{serviceName}} on {{date}}',
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
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
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
      <p>Great news! Your appointment at <strong style="color: #FFC107;">Bueno Brows</strong> has been confirmed.</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value" style="text-align: right; line-height: 1.8;">{{serviceName}}</span>
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
      {{notesSection}}
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Manage Your Booking</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to reschedule or cancel? Please call us at {{businessPhone}}</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'duration', 'notes', 'notesSection', 'businessName', 'websiteLink', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    subject: '🔔 Reminder: Your appointment {{timeUntilAppointment}} at {{businessName}}',
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
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; text-align: right; }
    .service-list { color: #ffffff; font-weight: 600; text-align: right; line-height: 1.8; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
    .reminder-time { color: #FFC107; font-weight: 600; font-size: 18px; }
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
      <p>This is a friendly reminder that you have an appointment <span class="reminder-time">{{timeUntilAppointment}}</span>:</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value" style="text-align: right; line-height: 1.8;">{{serviceName}}</span>
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
      <p style="margin-top: 20px;">Please arrive 5-10 minutes early for your appointment.</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Manage Your Booking</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to reschedule or cancel? Please call us at {{businessPhone}} or visit our website.</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'businessName', 'date', 'time', 'serviceName', 'duration', 'timeUntilAppointment', 'websiteLink', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'receipt-email',
    name: 'Receipt Email',
    subject: '💰 Your Receipt from {{businessName}}',
    html: `<!DOCTYPE html>
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
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .total-row { margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFC107; }
    .total-price { color: #FFC107; font-size: 24px; font-weight: 700; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>💰 Thank You for Your Visit!</h2>
    </div>
    <div class="content">
      <p class="greeting">Hi {{customerName}},</p>
      <p>Thank you for choosing {{businessName}}! Here's your receipt for today's services:</p>
      <div class="appointment-card">
        <h3 style="margin-top: 0; color: #FFC107; font-size: 16px;">Receipt #{{receiptNumber}}</h3>
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{date}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">{{time}}</span>
        </div>
        <div style="border-top: 1px solid #4a4a4a; margin: 15px 0; padding-top: 15px;">
          <p style="margin: 10px 0; color: #FFC107; font-weight: 600;">Services:</p>
          <p style="margin: 5px 0;">{{serviceDetails}}</p>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Subtotal:</span>
          <span class="detail-value">${'$'}{{subtotal}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Tip:</span>
          <span class="detail-value">${'$'}{{tip}}</span>
        </div>
        <div class="appointment-row total-row">
          <span class="detail-label">Total:</span>
          <span class="total-price">${'$'}{{total}}</span>
        </div>
      </div>
      <p>Your detailed receipt is attached as a PDF for your records.</p>
      <p style="margin-top: 20px;">We hope you love your results! If you have any questions or would like to book your next appointment, please don't hesitate to contact us.</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Book Your Next Appointment</a></div>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>`,
    variables: ['customerName', 'businessName', 'receiptNumber', 'date', 'time', 'serviceDetails', 'subtotal', 'tip', 'total', 'websiteLink', 'businessAddress', 'businessPhone', 'businessEmail', 'bookingLink'],
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
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #fca5a5; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #dc2626; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
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
          <span class="detail-value" style="text-align: right; line-height: 1.8;">{{serviceName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">{{date}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">{{time}}</span>
        </div>
      </div>
      {{cancellationReasonSection}}
      <p style="margin-top: 20px;">We apologize for any inconvenience. Please contact us at {{businessPhone}} to reschedule your appointment.</p>
      <div style="text-align: center;"><a href="{{bookingLink}}" class="cta-button">Book a New Appointment</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to reschedule? We'd love to help you find a new time that works for you.</p>
    </div>
    <div class="footer">
      <p><strong style="color: #dc2626;"><a href="{{websiteLink}}" style="color: #dc2626; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #dc2626; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'date', 'time', 'serviceName', 'cancellationReason', 'cancellationReasonSection', 'businessName', 'websiteLink', 'businessPhone', 'businessAddress', 'businessEmail', 'bookingLink'],
    isDefault: true
  },
  {
    id: 'edit-request-admin',
    name: 'Edit Request (Admin Notification)',
    subject: '📝 Edit Request: {{serviceName}} - {{customerName}}',
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
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; text-align: right; }
    .service-list { color: #ffffff; font-weight: 600; text-align: right; line-height: 1.8; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
    .urgent-badge { background: #ff4444; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin-bottom: 20px; }
    .changes-card { background-color: #4a3a2a; border-left: 4px solid #FFC107; border-radius: 8px; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>📝 Edit Request Received</h2>
    </div>
    <div class="content">
      <div class="urgent-badge">⚠️ ACTION REQUIRED</div>
      <p class="greeting">Hello Admin,</p>
      <p>A customer has requested to edit their appointment. Please review the changes below.</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Customer:</span>
          <span class="detail-value">{{customerName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">{{customerEmail}}</span>
        </div>
        {{customerPhoneSection}}
        <div class="appointment-row">
          <span class="detail-label">Current Service:</span>
          <span class="detail-value" style="text-align: right; line-height: 1.8;">{{currentServiceName}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Current Date:</span>
          <span class="detail-value">{{currentDate}}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Current Time:</span>
          <span class="detail-value">{{currentTime}}</span>
        </div>
      </div>
      <div class="changes-card">
        <h3 style="margin-top: 0; color: #FFC107; font-size: 16px;">Requested Changes:</h3>
        {{requestedChangesSection}}
        {{reasonSection}}
      </div>
      <div style="text-align: center;"><a href="{{reviewLink}}" class="cta-button">Review & Approve Edit Request</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">
        <strong>Quick Actions:</strong><br>
        • Click the button above to review and approve the edit request<br>
        • Or visit the admin dashboard to manage all edit requests<br>
        • The customer will be notified once you approve
      </p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
      <p style="margin-top: 16px; color: #666;">This is an automated notification from your booking system.</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['customerName', 'customerEmail', 'customerPhone', 'customerPhoneSection', 'serviceName', 'currentServiceName', 'currentDate', 'currentTime', 'requestedChangesSection', 'reason', 'reasonSection', 'reviewLink', 'websiteLink', 'businessName', 'businessPhone', 'businessAddress', 'businessEmail'],
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
        const storedTemplates = data.templates || [];
        
        // Merge stored templates with defaults, preserving customizations but updating defaults
        const mergedTemplates = defaultTemplates.map(defaultTemplate => {
          const stored = storedTemplates.find((t: EmailTemplate) => t.id === defaultTemplate.id);
          // If stored template exists and was customized, use it; otherwise use updated default
          // For now, always use defaults to ensure updated templates are shown
          return defaultTemplate;
        });
        
        setTemplates(mergedTemplates);
        
        // Update Firestore with new default templates (only if structure changed)
        await setDoc(doc(db, 'settings', 'emailTemplates'), {
          templates: mergedTemplates,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } else {
        // Initialize with default templates
        await setDoc(doc(db, 'settings', 'emailTemplates'), {
          templates: defaultTemplates,
          lastUpdated: new Date().toISOString()
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
          {['customerName', 'customerEmail', 'customerPhone', 'date', 'time', 'serviceName', 'serviceDetails', 'duration', 'price', 'tip', 'total', 'subtotal', 'businessName', 'businessPhone', 'businessEmail', 'businessAddress', 'websiteLink', 'receiptNumber', 'receiptUrl', 'cancellationReason', 'bookingLink', 'profileLink', 'skinAnalysisLink'].map(variable => (
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

  // Get safe preview HTML - templates are just text, no execution needed
  const getSafePreviewHtml = (html: string): string => {
    // Templates are static HTML with placeholders - safe to render as-is
    // The variables will be replaced server-side when emails are sent
    return html;
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
          <label htmlFor="email-template-subject" className="block text-sm font-medium text-slate-700 mb-2">Subject Line</label>
          <input
            id="email-template-subject"
            name="subject"
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
            <label htmlFor="email-template-html" className="block text-sm font-medium text-slate-700">Template Content</label>
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
              id="email-template-html"
              name="html"
              value={editedTemplate.html}
              onChange={(e) => handleHtmlChange(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-terracotta focus:border-transparent font-mono text-sm"
              placeholder="HTML template content"
            />
          ) : (
            <div className="border border-slate-300 rounded-md p-4 h-96 overflow-auto bg-white">
              <iframe
                key={`preview-${editedTemplate.html.length}-${editedTemplate.html.substring(0, 50).replace(/\s/g, '')}`}
                title="Email Preview"
                srcDoc={getSafePreviewHtml(editedTemplate.html)}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts"
                style={{ minHeight: '400px' }}
              />
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
