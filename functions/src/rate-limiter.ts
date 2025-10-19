// Rate Limiter Configuration for Cloud Functions
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { HttpsError } from 'firebase-functions/v2/https';

// Rate limiter instances for different endpoints
export const rateLimiters = {
  // Booking hold creation: 10 per minute per IP
  createHold: new RateLimiterMemory({
    points: 10,
    duration: 60, // per 60 seconds
    blockDuration: 60, // block for 60 seconds if exceeded
  }),

  // Booking finalization: 5 per minute per IP
  finalizeBooking: new RateLimiterMemory({
    points: 5,
    duration: 60,
    blockDuration: 120, // block for 2 minutes if exceeded
  }),

  // Customer creation: 10 per hour per IP
  createCustomer: new RateLimiterMemory({
    points: 10,
    duration: 3600, // per hour
    blockDuration: 300, // block for 5 minutes if exceeded
  }),

  // SMS sending: 5 per 5 minutes per phone number
  sendSMS: new RateLimiterMemory({
    points: 5,
    duration: 300, // per 5 minutes
    blockDuration: 600, // block for 10 minutes if exceeded
  }),

  // AI chatbot: 20 per minute per user
  aiChatbot: new RateLimiterMemory({
    points: 20,
    duration: 60,
    blockDuration: 60,
  }),

  // Authentication attempts: 5 per 15 minutes per IP
  authentication: new RateLimiterMemory({
    points: 5,
    duration: 900, // per 15 minutes
    blockDuration: 900, // block for 15 minutes if exceeded
  }),

  // Message creation: 10 per minute per user
  messages: new RateLimiterMemory({
    points: 10,
    duration: 60,
    blockDuration: 120,
  }),

  // Skin analysis upload: 3 per hour per user
  skinAnalysis: new RateLimiterMemory({
    points: 3,
    duration: 3600,
    blockDuration: 1800, // block for 30 minutes if exceeded
  }),
};

// Helper function to get client IP from request
export function getClientIP(req: any): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = req.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers?.['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  // Fallback to raw request IP
  return req.rawRequest?.ip || req.ip || 'unknown';
}

// Helper function to get user identifier (prefer user ID, fallback to IP)
export function getUserIdentifier(req: any): string {
  // Prefer authenticated user ID
  if (req.auth?.uid) {
    return `user:${req.auth.uid}`;
  }
  
  // Fallback to IP address for unauthenticated requests
  return `ip:${getClientIP(req)}`;
}

// Consume rate limit with proper error handling
export async function consumeRateLimit(
  limiter: RateLimiterMemory,
  key: string,
  points: number = 1
): Promise<void> {
  try {
    await limiter.consume(key, points);
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      // Rate limit exceeded
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      throw new HttpsError(
        'resource-exhausted',
        `Too many requests. Please try again in ${secs} seconds.`,
        { retryAfter: secs }
      );
    }
    // Unknown error
    throw rejRes;
  }
}

// Decorator-style rate limiting for callable functions
export function withRateLimit(
  limiter: RateLimiterMemory,
  getKey: (req: any) => string = getUserIdentifier
) {
  return async (req: any): Promise<void> => {
    const key = getKey(req);
    await consumeRateLimit(limiter, key);
  };
}

// Combined rate limiting (check multiple limiters)
export async function consumeMultipleRateLimits(
  limits: Array<{ limiter: RateLimiterMemory; key: string; points?: number }>
): Promise<void> {
  for (const { limiter, key, points } of limits) {
    await consumeRateLimit(limiter, key, points);
  }
}

// Get rate limit status (useful for debugging)
export async function getRateLimitStatus(
  limiter: RateLimiterMemory,
  key: string
): Promise<{ remainingPoints: number; msBeforeNext: number } | null> {
  try {
    const res = await limiter.get(key);
    if (!res) {
      return null;
    }
    return {
      remainingPoints: res.remainingPoints,
      msBeforeNext: res.msBeforeNext,
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
}

// Reset rate limit for a key (admin only, useful for support)
export async function resetRateLimit(
  limiter: RateLimiterMemory,
  key: string
): Promise<boolean> {
  try {
    await limiter.delete(key);
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
}

// Log rate limit violations for monitoring
export function logRateLimitViolation(
  endpoint: string,
  key: string,
  remainingTime: number
): void {
  console.warn('Rate limit exceeded:', {
    endpoint,
    key: key.startsWith('user:') ? key : 'ip:***', // Don't log full IPs
    remainingTime,
    timestamp: new Date().toISOString(),
  });
}

