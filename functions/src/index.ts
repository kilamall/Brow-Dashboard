// Export all Cloud Functions
export * from './holds.js';
export * from './messaging.js';
export * from './sms.js';
export * from './ai-chatbot.js';
export * from './sms-ai-integration.js';
// SECURITY: Disabled - export * from './set-admin-role.js';
// TEMPORARILY DISABLED - v1 to v2 upgrade not supported
// export * from './seed-data.js';
// export * from './update-business-hours.js';
export * from './find-or-create-customer.js';
export * from './skin-analysis.js';
export * from './skin-analysis-requests.js';
export * from './email.js';
export * from './init-consent-forms.js';
export * from './create-custom-consent-form.js';
export * from './availability-sync.js';
export * from './sync-availability-function.js';
export * from './quick-sync.js';
export * from './clear-holds.js';
export * from './debug-availability.js';

// SECURITY FIX: Disable test functions in production
// These functions are now secured with authentication but should not be used in production
// export * from './test-sms.js';  // DISABLED - use sendSMSToCustomer instead
// export * from './test-ai-chatbot.js';  // DISABLED - use aiChatbot instead
// export * from './test-sms-ai.js';  // DISABLED - use smsAIWebhook instead
