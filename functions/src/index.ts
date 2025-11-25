// Global console filter: keep production logs clean unless explicitly enabled
import * as admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

(() => {
  // Initialize Admin SDK (ESM-safe)
  if (!getApps().length) {
    initializeApp();
  }

  const original = { log: console.log, info: console.info, debug: console.debug };
  const noop = () => {};
  const apply = (enabled: boolean) => {
    if (enabled) {
      console.log = original.log as any;
      console.info = original.info as any;
      console.debug = original.debug as any;
    } else {
      console.log = noop as any;
      console.info = noop as any;
      console.debug = noop as any;
    }
  };

  // Env var override
  if (process.env.DEBUG_LOGS === 'true') {
    apply(true);
    return;
  }

  // Read flag from Firestore and refresh periodically
  const ref = getFirestore().doc('settings/developerOptions');
  const refresh = async () => {
    try {
      const snap = await ref.get();
      const enabled = !!(snap.exists && (snap.data() as any)?.debugLogs);
      apply(enabled);
    } catch {
      // On failure, default to disabled
      apply(false);
    }
  };

  // Initial read and periodic refresh
  refresh();
  setInterval(refresh, 60_000).unref();
})();

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
export * from './create-customer-unique.js';
export * from './on-user-created.js';
export * from './run-migration.js';
export * from './merge-customers.js';
export * from './migrate-customer-identities.js';
export * from './train-ai-from-admin-messages.js';
export * from './ai-response-with-training.js';
export * from './skin-analysis.js';
export * from './skin-analysis-requests.js';
export * from './multi-product-analysis.js';
export * from './email-analysis-results.js';
export * from './product-recommendations.js';
export * from './email.js';
export * from './admin-notifications.js';
export * from './setup-admin.js';
export * from './edit-request-notifications.js';
export * from './init-consent-forms.js';
export * from './create-custom-consent-form.js';
export * from './availability-sync.js';
export * from './sync-availability-function.js';
export * from './quick-sync.js';
// export * from './clear-holds.js';
// export * from './debug-availability.js';
export * from './delete-customer-data.js';
export * from './admin-purge-data.js';
export * from './update-customer-stats.js';
export * from './sync-customer-visits.js';
export * from './cleanup-stats.js';
// export * from './clear-cancelled-appointments.js';
// export * from './auto-cleanup.js';
// export * from './manual-cleanup.js';
// export * from './enhanced-auto-cleanup.js';
export * from './slideshow-management.js';
export * from './image-upload.js';
// export * from './cleanup-expired-holds.js';
// export * from './check-slot-details.js';
export * from './guest-verification.js';
export * from './mark-attendance.js';
export * from './post-service-receipt.js';
export * from './auto-attend-scheduler.js';
export * from './generate-receipt.js';
export * from './close-shop.js';
// export * from './cleanup-edit-requests.js';
export * from './cost-monitoring.js';
export * from './cost-diagnostic.js';
export * from './simple-cost-check.js';
export * from './count-all-docs.js';
export * from './analytics-diagnostic.js';
export * from './event-inquiries.js';
export * from './check-new-customer.js';
export * from './fix-total-visits.js';
export * from './check-email-config.js';
export * from './send-receipt-email.js';
export * from './send-receipt-sms.js';
export * from './fix-orphaned-customers.js';
export * from './fix-orphaned-appointments.js';
export * from './debug-customer-query.js';
export * from './inspect-customer.js';
export * from './cleanup-orphaned-migrations.js';
export * from './fix-luis-duplicate.js';
export * from './fix-self-reference-migrations.js';
export * from './trace-customer-filter.js';
export * from './audit-log.js';

// SECURITY FIX: Disable test functions in production
// These functions are now secured with authentication but should not be used in production
// export * from './test-sms.js';  // DISABLED - use sendSMSToCustomer instead
// export * from './test-ai-chatbot.js';  // DISABLED - use aiChatbot instead
// export * from './test-sms-ai.js';  // DISABLED - use smsAIWebhook instead
