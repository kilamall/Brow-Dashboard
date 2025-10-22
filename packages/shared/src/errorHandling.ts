import { getAnalytics, logEvent } from 'firebase/analytics';

/**
 * Error categories for tracking and custom messaging
 */
export enum ErrorCategory {
  BOOKING = 'booking',
  SCHEDULE = 'schedule',
  CUSTOMER = 'customer',
  PAYMENT = 'payment',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  DATA_SYNC = 'data_sync',
  SERVICE = 'service',
  SETTINGS = 'settings',
  MESSAGING = 'messaging',
  SKIN_ANALYSIS = 'skin_analysis',
  CONSENT_FORM = 'consent_form',
  UNKNOWN = 'unknown'
}

/**
 * Custom error class with category and user-friendly messages
 */
export class AppError extends Error {
  category: ErrorCategory;
  userMessage: string;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, any>;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    userMessage?: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.userMessage = userMessage || this.getDefaultUserMessage(category);
    this.originalError = originalError;
    this.timestamp = new Date();
    this.context = context;
  }

  private getDefaultUserMessage(category: ErrorCategory): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.BOOKING]: 'Unable to book appointment. Please try selecting a different time slot.',
      [ErrorCategory.SCHEDULE]: 'Unable to load calendar. Please refresh the page.',
      [ErrorCategory.CUSTOMER]: 'Unable to load customer information. Please try again.',
      [ErrorCategory.PAYMENT]: 'Payment processing failed. Your card was not charged.',
      [ErrorCategory.AUTHENTICATION]: 'Session expired. Please sign in again.',
      [ErrorCategory.NETWORK]: 'Connection lost. Please check your internet and try again.',
      [ErrorCategory.DATA_SYNC]: 'Unable to save changes. Your changes will be saved when connection is restored.',
      [ErrorCategory.SERVICE]: 'Unable to load services. Please try again.',
      [ErrorCategory.SETTINGS]: 'Unable to save settings. Please try again.',
      [ErrorCategory.MESSAGING]: 'Unable to send message. Please try again.',
      [ErrorCategory.SKIN_ANALYSIS]: 'Unable to process skin analysis. Please try again.',
      [ErrorCategory.CONSENT_FORM]: 'Unable to load consent form. Please try again.',
      [ErrorCategory.UNKNOWN]: 'Something went wrong. Please try again.'
    };
    return messages[category];
  }
}

/**
 * Log error to Firebase Analytics
 */
export function logErrorToFirebase(error: Error | AppError, additionalContext?: Record<string, any>) {
  try {
    const analytics = getAnalytics();
    
    const errorData: Record<string, any> = {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack?.substring(0, 500), // Truncate stack trace
      timestamp: new Date().toISOString(),
      ...additionalContext
    };

    if (error instanceof AppError) {
      errorData.category = error.category;
      errorData.user_message = error.userMessage;
      errorData.context = JSON.stringify(error.context || {});
    }

    logEvent(analytics, 'app_error', errorData);
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('AppError logged:', errorData);
    }
  } catch (loggingError) {
    // Don't let logging errors break the app
    console.error('Failed to log error to Firebase:', loggingError);
  }
}

/**
 * Classify errors based on error message or type
 */
export function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  
  if (message.includes('auth') || message.includes('permission') || message.includes('unauthorized')) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
    return ErrorCategory.NETWORK;
  }
  if (message.includes('booking') || message.includes('appointment') || message.includes('slot')) {
    return ErrorCategory.BOOKING;
  }
  if (message.includes('customer') || message.includes('user')) {
    return ErrorCategory.CUSTOMER;
  }
  if (message.includes('payment') || message.includes('charge') || message.includes('card')) {
    return ErrorCategory.PAYMENT;
  }
  if (message.includes('schedule') || message.includes('calendar')) {
    return ErrorCategory.SCHEDULE;
  }
  if (message.includes('service')) {
    return ErrorCategory.SERVICE;
  }
  if (message.includes('message') || message.includes('sms')) {
    return ErrorCategory.MESSAGING;
  }
  if (message.includes('skin') || message.includes('analysis')) {
    return ErrorCategory.SKIN_ANALYSIS;
  }
  if (message.includes('consent')) {
    return ErrorCategory.CONSENT_FORM;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown, category?: ErrorCategory, context?: Record<string, any>): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    const detectedCategory = category || classifyError(error);
    return new AppError(
      error.message,
      detectedCategory,
      undefined,
      error,
      context
    );
  }
  
  return new AppError(
    String(error),
    category || ErrorCategory.UNKNOWN,
    undefined,
    undefined,
    context
  );
}

/**
 * Handle async operations with error catching
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  category: ErrorCategory,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = toAppError(error, category, context);
    logErrorToFirebase(appError);
    throw appError;
  }
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  
  const appError = toAppError(lastError, category, { maxRetries, attempts: maxRetries });
  logErrorToFirebase(appError);
  throw appError;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: Error | AppError): boolean {
  const recoverableCategories = [
    ErrorCategory.NETWORK,
    ErrorCategory.DATA_SYNC,
    ErrorCategory.UNKNOWN
  ];
  
  if (error instanceof AppError) {
    return recoverableCategories.includes(error.category);
  }
  
  const message = error.message.toLowerCase();
  return message.includes('network') || 
         message.includes('timeout') || 
         message.includes('fetch') ||
         message.includes('offline');
}

/**
 * Get recovery action text based on error category
 */
export function getRecoveryAction(category: ErrorCategory): string {
  const actions: Record<ErrorCategory, string> = {
    [ErrorCategory.BOOKING]: 'Try selecting a different time slot or refresh the page',
    [ErrorCategory.SCHEDULE]: 'Refresh the page to reload the calendar',
    [ErrorCategory.CUSTOMER]: 'Try again or contact support if the problem persists',
    [ErrorCategory.PAYMENT]: 'Check your payment method and try again',
    [ErrorCategory.AUTHENTICATION]: 'Sign in again to continue',
    [ErrorCategory.NETWORK]: 'Check your internet connection and try again',
    [ErrorCategory.DATA_SYNC]: 'Your changes will be saved when connection is restored',
    [ErrorCategory.SERVICE]: 'Refresh the page to reload services',
    [ErrorCategory.SETTINGS]: 'Try saving again or refresh the page',
    [ErrorCategory.MESSAGING]: 'Try sending your message again',
    [ErrorCategory.SKIN_ANALYSIS]: 'Try uploading the image again',
    [ErrorCategory.CONSENT_FORM]: 'Refresh the page to reload the form',
    [ErrorCategory.UNKNOWN]: 'Refresh the page or try again later'
  };
  return actions[category];
}


