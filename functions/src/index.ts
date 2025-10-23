// Export all Cloud Functions
export * from './holds.js';
export * from './messaging.js';
export * from './sms.js';
export * from './ai-chatbot.js';
export * from './sms-ai-integration.js';
export * from './appointment-reminders.js';
export * from './confirm-appointment.js';
// export * from './email-verification.js'; // REMOVED - using Firebase built-in verification
// SECURITY: Disabled - export * from './set-admin-role.js';
// TEMPORARILY DISABLED - v1 to v2 upgrade not supported
// export * from './seed-data.js';
// export * from './update-business-hours.js';
export * from './find-or-create-customer.js';
export * from './migrate-customer-identities.js';
export * from './train-ai-from-admin-messages.js';
export * from './ai-response-with-training.js';
export * from './skin-analysis.js';
export * from './skin-analysis-requests.js';
export * from './email.js';
export * from './admin-notifications.js';
export * from './setup-admin.js';
export * from './test-admin-email.js';
export * from './edit-request-notifications.js';
export * from './init-consent-forms.js';
export * from './create-custom-consent-form.js';
export * from './availability-sync.js';
export * from './sync-availability-function.js';
export * from './quick-sync.js';
export * from './clear-holds.js';
export * from './debug-availability.js';
export * from './delete-customer-data.js';
export * from './admin-purge-data.js';
export * from './update-customer-stats.js';
export * from './sync-customer-visits.js';
export * from './clear-cancelled-appointments.js';
export * from './auto-cleanup.js';
export * from './manual-cleanup.js';
export * from './enhanced-auto-cleanup.js';
export * from './slideshow-management.js';
export * from './image-upload.js';
export * from './cleanup-expired-holds.js';
export * from './check-slot-details.js';
export * from './guest-verification.js';
export * from './mark-attendance.js';
export * from './post-service-receipt.js';
export * from './auto-attend-scheduler.js';
export * from './close-shop.js';
export * from './cleanup-edit-requests.js';

// SECURITY FIX: Disable test functions in production
// These functions are now secured with authentication but should not be used in production
// export * from './test-sms.js';  // DISABLED - use sendSMSToCustomer instead
// export * from './test-ai-chatbot.js';  // DISABLED - use aiChatbot instead
// export * from './test-sms-ai.js';  // DISABLED - use smsAIWebhook instead
