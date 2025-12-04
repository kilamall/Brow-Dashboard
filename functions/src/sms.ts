import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { rateLimiters, consumeRateLimit, getUserIdentifier } from './rate-limiter.js';
import { fromZonedTime } from 'date-fns-tz';
import { callGeminiAI } from './sms-ai-integration.js';

try { initializeApp(); } catch {}
const db = getFirestore();

// Define secrets for Twilio
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = defineString('TWILIO_PHONE_NUMBER', { default: '+16506839181' });
const twilioMessagingServiceSid = defineString('TWILIO_MESSAGING_SERVICE_SID', { default: '' });

// Define secret for Gemini AI
const geminiApiKey = defineSecret('GEMINI_API_KEY');

// SMS Service Integration
interface SMSMessage {
  to: string;
  from: string;
  body: string;
  customerId?: string;
  appointmentId?: string;
  type: 'availability' | 'confirmation' | 'reminder' | 'faq' | 'booking' | 'admin_message';
}

interface CustomerSMS {
  phoneNumber: string;
  customerId: string;
  customerName: string;
  lastInteraction: string;
  messageCount: number;
  status: 'active' | 'blocked' | 'unsubscribed';
}

// SMS Provider Configuration (Twilio preferred if available, AWS SNS as fallback)
// These will be accessed from secrets in function context
// For A2P 10DLC compliance, use Messaging Service SID instead of phone number
const getTwilioConfig = () => ({
  accountSid: twilioAccountSid.value(),
  authToken: twilioAuthToken.value(),
  phoneNumber: twilioPhoneNumber.value(),
  messagingServiceSid: twilioMessagingServiceSid.value() || undefined
});

// AWS SNS configuration (fallback)
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// SMS Response Templates
const PRIVACY_URL = 'https://buenobrows.com/privacy';
const A2P_FOOTER = `\n\nReply STOP to opt out, HELP for help. Msg&data rates may apply. Privacy: ${PRIVACY_URL}`;
const SMS_TEMPLATES = {
  greeting: () => {
    return `Hi! 👋 Welcome to Bueno Brows!\n\nI'm your booking assistant. I can help you:\n• Book appointments\n• Check availability\n• Answer questions about our services\n\nReply "AVAILABLE" to see open slots\nReply "HELP" for more options\nReply "CANCEL" anytime to start over\n\nOr just ask me a question!\n\nCall us: (650) 613-8455\n- Bueno Brows` + A2P_FOOTER;
  },
  
  availability: (availableSlots: string[]) => {
    if (availableSlots.length === 0) {
      return "Hi! We don't have any available slots for the next 7 days. Please call us at (650) 613-8455 to discuss other options. - Bueno Brows" + A2P_FOOTER;
    }
    return `Hi! Here are our available slots:\n\n${availableSlots.slice(0, 5).join('\n')}\n\nReply with "BOOK [date] [time]" to reserve (e.g., "BOOK 12/15 2:00 PM"). - Bueno Brows` + A2P_FOOTER;
  },
  
  confirmation: (appointment: any) => {
    return `✅ Confirmed! Your ${appointment.serviceName} appointment is scheduled for ${appointment.date} at ${appointment.time}. We'll send a reminder 24 hours before. - Bueno Brows` + A2P_FOOTER;
  },
  
  faq: (question: string, answer: string) => {
    return `${answer}\n\nNeed more help? Reply with your question or call (650) 613-8455. - Bueno Brows` + A2P_FOOTER;
  },
  
  booking_instructions: () => {
    return `To book an appointment, reply with:\n"BOOK [date] [time]"\n\nExample: "BOOK 12/15 2:00 PM"\n\nFor availability, reply "AVAILABLE"\nStuck? Reply "CANCEL" to restart\nFor questions, just ask! - Bueno Brows` + A2P_FOOTER;
  },
  
  specificAvailable: (date: string, times: string[]) => {
    if (times.length === 0) {
      return `Sorry, we don't have any availability on ${date}. 😕\n\nWould you like to see other dates? Reply "AVAILABLE" or call us at (650) 613-8455. - Bueno Brows` + A2P_FOOTER;
    }
    if (times.length === 1) {
      return `Yes! We have ${times[0]} available on ${date}. ✨\n\nWould you like me to book this for you? Reply "YES" to confirm or "NO" to see other times. - Bueno Brows` + A2P_FOOTER;
    }
    return `Yes! We have these times available on ${date}: ✨\n\n${times.join('\n')}\n\nReply with the time you'd like (e.g., "${times[0]}") and I'll book it for you! - Bueno Brows` + A2P_FOOTER;
  },
  
  bookingConfirm: (date: string, time: string) => {
    return `Perfect! I'm booking ${time} on ${date} for you. 📅\n\nWhat's your email address? (We'll send confirmation there!)\n\nReply with your email (e.g., "jane@example.com"). - Bueno Brows` + A2P_FOOTER;
  },
  
  bookingConfirmName: () => {
    return `Great! 📧\n\nNow, what's your name? Reply with your full name (e.g., "Jane Smith"). - Bueno Brows` + A2P_FOOTER;
  },
  
  bookingComplete: (name: string, date: string, time: string) => {
    return `✅ All set, ${name}! Your appointment is confirmed for ${date} at ${time}.\n\nWe'll send you a reminder. Looking forward to seeing you!\n\nNeed to change anything? Call (650) 613-8455. - Bueno Brows` + A2P_FOOTER;
  },
  
  bookingCancelled: () => {
    return `No problem! Feel free to ask about other dates or call us at (650) 613-8455 if you'd like to discuss options. - Bueno Brows` + A2P_FOOTER;
  },
  
  categorySelection: (categories: string[]) => {
    if (categories.length === 0) {
      return `What service are you interested in?\n\nReply with the service name, or visit https://buenobrows.com/services to browse.\n\nNeed help? Call (650) 613-8455. - Bueno Brows` + A2P_FOOTER;
    }
    const categoryList = categories.map((c, i) => `${i + 1}. ${c}`).join('\n');
    return `What type of service are you looking for? 💅\n\n${categoryList}\n\nReply with the number or category name (e.g., "1" or "Brows"). - Bueno Brows` + A2P_FOOTER;
  },
  
  serviceListInCategory: (category: string, services: any[], hasMore: boolean) => {
    const serviceList = services.map((s, i) => `${i + 1}. ${s.name} - $${s.price} (${s.duration} min)`).join('\n');
    const moreText = hasMore ? '\n\nReply "MORE" to see more services in this category.' : '';
    return `Great choice! Here are our ${category} services:\n\n${serviceList}${moreText}\n\nReply with the number or service name (e.g., "1" or "${services[0]?.name}"). - Bueno Brows` + A2P_FOOTER;
  },

  serviceConfirm: (service: any, date: string, time: string) => {
    return `Perfect! ${service.name} (${service.duration} min) for ${date} at ${time}.\n\nThis will take ${service.duration} minutes. Confirming availability...\n- Bueno Brows` + A2P_FOOTER;
  },

  serviceTooLong: (service: any, time: string, nextAvailable: string) => {
    return `Sorry, ${time} doesn't have ${service.duration} min available for ${service.name}. 😕\n\nNext available: ${nextAvailable}\n\nReply with a different time or "AVAILABLE" for more options. - Bueno Brows` + A2P_FOOTER;
  },

  serviceNotFound: (searchTerm: string) => {
    return `Hmm, I don't see "${searchTerm}" in our services at the moment. 🤔\n\nWould you like to try a different service? You can browse our full menu at https://buenobrows.com/services\n\nOr give us a call at (650) 613-8455 and we'll help you find the perfect service! - Bueno Brows` + A2P_FOOTER;
  },

  serviceNotFoundWithSuggestions: (searchTerm: string, suggestions: any[]) => {
    const suggestionList = suggestions.map((s, i) => `${i + 1}. ${s.name} - $${s.price} (${s.duration} min)`).join('\n');
    return `Hmm, I don't see "${searchTerm}" exactly. 🤔\n\nDid you mean one of these?\n\n${suggestionList}\n\nReply with the number or try a different service. Browse all at https://buenobrows.com/services\n\nCall (650) 613-8455 for help! - Bueno Brows` + A2P_FOOTER;
  },

  bookingCompleteWithEmail: (name: string, service: string, date: string, time: string) => {
    return `✅ All set, ${name}! Your ${service} appointment is confirmed for ${date} at ${time}.\n\nCheck your email for confirmation details. We'll also send a reminder.\n\nQuestions? Call (650) 613-8455. - Bueno Brows` + A2P_FOOTER;
  },
  
  error: () => {
    return "Sorry, I didn't understand that. 😕\n\nText 'HELP' for commands or call (650) 613-8455 for assistance. - Bueno Brows" + A2P_FOOTER;
  },
  
  weeklyGrid: (gridData: string) => {
    return `📅 NEXT 5 DAYS:\n\n${gridData}\n\n✓ = Open  ✗ = Booked\n\nReply with day & time to book! (e.g., "Wed 2pm")\n- Bueno Brows` + A2P_FOOTER;
  },
  
  notAvailable: () => {
    return "No availability found. 📅\n\nCall (650) 613-8455 to discuss options or check alternate dates. - Bueno Brows" + A2P_FOOTER;
  },
  
  tooManyAttempts: () => {
    return "Having trouble? Let's get you help! 📞\n\nCall (650) 613-8455 and we'll book you right away. - Bueno Brows" + A2P_FOOTER;
  }
};

// FAQ Database
const FAQ_DATABASE = {
  'hours': 'We\'re open Tuesday-Saturday 9AM-6PM, Sunday 10AM-4PM. Closed Mondays.',
  'pricing': 'Brow services start at $45. Full pricing: Basic $45, Shaping $55, Tinting $25, Waxing $15. Package deals available!',
  'location': 'We\'re located at 123 Main Street, Downtown. Free parking in the back lot.',
  'cancellation': 'Please give us 24 hours notice for cancellations. Same-day cancellations may incur a fee.',
  'first time': 'Welcome! Your first visit will take about 60-90 minutes. We\'ll discuss your goals and create a custom plan.',
  'aftercare': 'Avoid touching brows for 24 hours. No makeup, swimming, or sweating for 24 hours. Use provided aftercare products.',
  'how long': 'Most appointments take 60-90 minutes. Touch-ups are 30-45 minutes.',
  'pain': 'Most clients find it very comfortable. We use numbing cream and gentle techniques.',
  'results': 'Results last 4-6 weeks. Touch-ups recommended every 4-6 weeks for best results.',
  'payment': 'We accept cash, credit cards, and Venmo. Payment is due at time of service.'
};

// Parse specific date from natural language
function parseSpecificDate(text: string): Date | null {
  const today = new Date();
  const lowerText = text.toLowerCase();
  
  // Handle "tomorrow"
  if (lowerText.includes('tomorrow')) {
    const tomorrow = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0, 0));
    console.log('📅 Parsed "tomorrow" as:', tomorrow.toISOString());
    return tomorrow;
  }
  
  // Handle "today"
  if (lowerText.includes('today')) {
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
    console.log('📅 Parsed "today" as:', todayUTC.toISOString());
    return todayUTC;
  }
  
  // Handle "the [number]th/st/nd/rd" OR just "[number]th/st/nd/rd" (e.g., "the 9th", "9th", "15th")
  const dayMatch = lowerText.match(/(?:the\s+)?(\d{1,2})(st|nd|rd|th)/);
  if (dayMatch) {
    const day = parseInt(dayMatch[1]);
    // Create date at UTC noon to avoid timezone issues
    const targetDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), day, 12, 0, 0));
    const todayUTCNoon = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
    // If the day has passed this month, assume next month
    if (targetDate < todayUTCNoon) {
      targetDate.setUTCMonth(targetDate.getUTCMonth() + 1);
    }
    console.log(`📅 Parsed "${day}${dayMatch[2]}" as:`, targetDate.toISOString());
    return targetDate;
  }
  
  // Handle just a number (e.g., "on 9", "the 10") when context suggests a date
  if (lowerText.match(/\bon\s+(?:the\s+)?(\d{1,2})\b/) || lowerText.match(/\bthe\s+(\d{1,2})\b/)) {
    const numMatch = lowerText.match(/\b(\d{1,2})\b/);
    if (numMatch) {
      const day = parseInt(numMatch[1]);
      if (day >= 1 && day <= 31) {
        // Create date at UTC noon to avoid timezone issues
        const targetDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), day, 12, 0, 0));
        const todayUTCNoon = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
        if (targetDate < todayUTCNoon) {
          targetDate.setUTCMonth(targetDate.getUTCMonth() + 1);
        }
        console.log(`📅 Parsed "the ${day}" as:`, targetDate.toISOString());
        return targetDate;
      }
    }
  }
  
  // Handle month names (Dec 15, December 15, 12/15, etc.)
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  for (let i = 0; i < months.length; i++) {
    if (lowerText.includes(months[i])) {
      const dayNumMatch = lowerText.match(/\d{1,2}/);
      if (dayNumMatch) {
        const day = parseInt(dayNumMatch[0]);
        // Create date at UTC noon to avoid timezone issues
        const targetDate = new Date(Date.UTC(today.getFullYear(), i, day, 12, 0, 0));
        const todayUTCNoon = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
        if (targetDate < todayUTCNoon) {
          targetDate.setUTCFullYear(targetDate.getUTCFullYear() + 1);
        }
        console.log(`📅 Parsed "${months[i]} ${day}" as:`, targetDate.toISOString());
        return targetDate;
      }
    }
  }
  
  // Handle MM/DD or M/D format
  const dateMatch = lowerText.match(/(\d{1,2})\/(\d{1,2})/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    // Create date at UTC noon to avoid timezone issues
    const targetDate = new Date(Date.UTC(today.getFullYear(), month, day, 12, 0, 0));
    const todayUTCNoon = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
    if (targetDate < todayUTCNoon) {
      targetDate.setUTCFullYear(targetDate.getUTCFullYear() + 1);
    }
    console.log(`📅 Parsed "${dateMatch[1]}/${dateMatch[2]}" as:`, targetDate.toISOString());
    return targetDate;
  }
  
  return null;
}

/**
 * Parse time string into 24-hour format
 * Handles: "7pm", "7 pm", "7:00", "7:00 PM", "19:00", etc.
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  const text = timeStr.trim().toUpperCase();
  
  // Try matching "7PM", "7 PM", "07PM", etc.
  const simpleMatch = text.match(/^(\d{1,2})\s*(AM|PM)$/);
  if (simpleMatch) {
    let hours = parseInt(simpleMatch[1]);
    const period = simpleMatch[2];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return { hours, minutes: 0 };
  }
  
  // Try matching "7:00 PM", "7:30PM", "07:15 AM", etc.
  const colonMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (colonMatch) {
    let hours = parseInt(colonMatch[1]);
    const minutes = parseInt(colonMatch[2]);
    const period = colonMatch[3];
    
    if (period) {
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
    
    return { hours, minutes };
  }
  
  // Try 24-hour format "19:00", "7", etc.
  const twentyFourMatch = text.match(/^(\d{1,2})(:(\d{2}))?$/);
  if (twentyFourMatch) {
    const hours = parseInt(twentyFourMatch[1]);
    const minutes = twentyFourMatch[3] ? parseInt(twentyFourMatch[3]) : 0;
    if (hours >= 0 && hours <= 23) {
      return { hours, minutes };
    }
  }
  
  return null;
}

/**
 * Check if a requested time matches an available time slot
 * Handles cases like "10am" matching "10:00 AM"
 */
function timeMatches(requestedTime: string, availableTime: string): boolean {
  const requested = parseTimeString(requestedTime);
  const available = parseTimeString(availableTime);
  
  if (!requested || !available) {
    // Fallback to simple string comparison if parsing fails
    const normalizedRequested = requestedTime.toUpperCase().replace(/[:\s]/g, '');
    const normalizedAvailable = availableTime.toUpperCase().replace(/[:\s]/g, '');
    return normalizedAvailable === normalizedRequested;
  }
  
  // Match if hours are the same and:
  // - Minutes match exactly, OR
  // - Requested time had no minutes specified (defaults to 0) and available time is on the hour
  return requested.hours === available.hours && 
         (requested.minutes === available.minutes || 
          (requested.minutes === 0 && available.minutes === 0));
}

/**
 * Parse message using Gemini AI for natural language understanding
 * Extracts booking intent, date, time, service, and email from complex messages
 */
async function parseMessageWithGemini(message: string, phoneNumber: string, apiKey: string): Promise<{
  intent: 'booking' | 'availability' | 'question' | 'unknown',
  date?: string,
  time?: string,
  service?: string,
  email?: string
} | null> {
  try {
    if (!apiKey) {
      console.log('⚠️ GEMINI_API_KEY not provided, skipping AI parsing');
      return null;
    }

    const systemPrompt = `You are a booking assistant parser. Extract booking information from SMS messages.

Return ONLY a JSON object (no other text) with these fields:
{
  "intent": "booking" | "availability" | "question" | "unknown",
  "date": "MM/DD or YYYY-MM-DD format if found (only include if user specified a date)",
  "time": "HH:MM AM/PM format if found",
  "service": "service name if mentioned",
  "email": "email@example.com if provided"
}

Examples:
"BOOK 11/11 10am brow wax" → {"intent":"booking","date":"11/11","time":"10:00 AM","service":"brow wax"}
"Available?" → {"intent":"availability"}
"What's available on 11/18?" → {"intent":"availability","date":"11/18"}
"I need a brow wax next Tuesday around 2pm" → {"intent":"booking","date":"next tuesday","time":"2:00 PM","service":"brow wax"}
"What are your hours?" → {"intent":"question"}

IMPORTANT: If user asks for availability without specifying a date, set intent to "availability" and omit the date field.

Message: ${message}`;

    const requestBody = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 150,
      }
    };

    console.log('🤖 Calling Gemini AI to parse:', message);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Gemini parsed:', parsed);
      return parsed;
    }
    
    console.log('⚠️ Gemini response had no JSON:', text);
    return null;
  } catch (error) {
    console.error('❌ Gemini parsing error:', error);
    return null;
  }
}

/**
 * Quick regex parser for one-message bookings
 * Pattern: "BOOK 11/11 10am brow wax jane@email.com"
 */
function parseQuickBooking(message: string): {
  success: boolean,
  date?: string,
  time?: string,
  service?: string,
  email?: string
} {
  // Pattern: "BOOK 11/11 10am brow wax jane@email.com"
  const bookPattern = /book\s+([0-9]{1,2}[\/\-][0-9]{1,2})\s+(?:at\s+)?([0-9]{1,2}:?[0-9]{0,2}\s*(?:am|pm))\s+([a-z\s]+?)(?:\s+([^\s@]+@[^\s@]+\.[^\s@]+))?$/i;
  
  const match = message.toLowerCase().trim().match(bookPattern);
  
  if (!match) {
    return { success: false };
  }
  
  console.log('✅ Quick booking parsed:', {
    date: match[1],
    time: match[2],
    service: match[3].trim(),
    email: match[4]
  });
  
  return {
    success: true,
    date: match[1],
    time: match[2],
    service: match[3].trim(),
    email: match[4]
  };
}

// Get or create conversation state
async function getConversationState(phoneNumber: string): Promise<any> {
  const stateDoc = await db.collection('sms_conversation_state').doc(phoneNumber).get();
  if (!stateDoc.exists) return null;
  
  const state = stateDoc.data();
  if (!state) return null;
  
  // Check if conversation has expired (30 minutes of inactivity)
  if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
    console.log('🕐 Conversation expired, clearing state');
    await clearConversationState(phoneNumber);
    return null;
  }
  
  return state;
}

// Save conversation state with 30-minute expiration
async function saveConversationState(phoneNumber: string, state: any): Promise<void> {
  await db.collection('sms_conversation_state').doc(phoneNumber).set({
    ...state,
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
  });
}

// Clear conversation state
async function clearConversationState(phoneNumber: string): Promise<void> {
  await db.collection('sms_conversation_state').doc(phoneNumber).delete();
}

// Get active services with categories
async function getActiveServices(): Promise<{ id: string; name: string; duration: number; price: number; category: string | null }[]> {
  const servicesQuery = db.collection('services').where('active', '==', true).orderBy('name');
  const snapshot = await servicesQuery.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    duration: doc.data().duration,
    price: doc.data().price,
    category: doc.data().category || null
  }));
}

// Get top 5 most booked services (sorted by popularity)
async function getTop5MostBookedServices(): Promise<any[]> {
  try {
    // Get all active services
    const servicesSnapshot = await db.collection('services').where('active', '==', true).get();
    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      price: doc.data().price,
      duration: doc.data().duration,
      category: doc.data().category || null,
      bookingCount: 0
    }));
    
    // Get all appointments from last 90 days to measure recent popularity
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const appointmentsSnapshot = await db.collection('appointments')
      .where('start', '>=', ninetyDaysAgo.toISOString())
      .get();
    
    // Count bookings per service
    const bookingCounts = new Map<string, number>();
    
    appointmentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Handle both single serviceId and multiple serviceIds
      if (data.serviceIds && Array.isArray(data.serviceIds)) {
        data.serviceIds.forEach((sid: string) => {
          bookingCounts.set(sid, (bookingCounts.get(sid) || 0) + 1);
        });
      } else if (data.serviceId) {
        bookingCounts.set(data.serviceId, (bookingCounts.get(data.serviceId) || 0) + 1);
      }
    });
    
    // Add booking counts to services
    services.forEach(service => {
      service.bookingCount = bookingCounts.get(service.id) || 0;
    });
    
    // Sort by booking count (descending), then by price (ascending) as tiebreaker
    const sortedServices = services.sort((a, b) => {
      if (b.bookingCount !== a.bookingCount) {
        return b.bookingCount - a.bookingCount; // Most booked first
      }
      return a.price - b.price; // If equal bookings, cheaper first
    });
    
    // Log for debugging
    console.log('📊 Service popularity (last 90 days):');
    sortedServices.slice(0, 10).forEach((s, i) => {
      console.log(`  ${i+1}. ${s.name} - ${s.bookingCount} bookings ($${s.price})`);
    });
    
    return sortedServices.slice(0, 5);
  } catch (error) {
    console.error('Error getting top 5 services:', error);
    // Fallback to all services sorted by price if there's an error
    const servicesSnapshot = await db.collection('services').where('active', '==', true).get();
    return servicesSnapshot.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);
  }
}

// Get unique categories
async function getServiceCategories(): Promise<string[]> {
  const services = await getActiveServices();
  const categories = new Set<string>();
  services.forEach(s => {
    if (s.category) categories.add(s.category);
  });
  return Array.from(categories).sort();
}

// Get services grouped by category
async function getServicesByCategory(categoryName: string): Promise<any[]> {
  const services = await getActiveServices();
  return services.filter(s => s.category === categoryName).sort((a, b) => a.name.localeCompare(b.name));
}

// Calculate Levenshtein distance (measures typo similarity)
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];
  const aLen = a.length;
  const bLen = b.length;

  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bLen][aLen];
}

// Find category by name or number
function findCategory(categories: string[], searchTerm: string): string | null {
  const trimmed = searchTerm.trim();
  
  // Check if it's a number
  const num = parseInt(trimmed);
  if (!isNaN(num) && num >= 1 && num <= categories.length) {
    return categories[num - 1];
  }
  
  // Check for exact or partial match
  const lower = trimmed.toLowerCase();
  let match = categories.find(c => c.toLowerCase() === lower);
  if (match) return match;
  
  match = categories.find(c => c.toLowerCase().includes(lower));
  return match || null;
}

// Find service by name or number (from a list)
function findServiceByNameOrNumber(
  services: any[], 
  searchTerm: string
): { match: any | null; suggestions: any[] } {
  const trimmed = searchTerm.trim();
  
  // Check if it's a number
  const num = parseInt(trimmed);
  if (!isNaN(num) && num >= 1 && num <= services.length) {
    return { match: services[num - 1], suggestions: [] };
  }
  
  // Fuzzy name matching
  const lower = trimmed.toLowerCase();
  
  // Exact match first
  let match = services.find(s => s.name.toLowerCase() === lower);
  if (match) return { match, suggestions: [] };
  
  // Partial match (contains)
  match = services.find(s => s.name.toLowerCase().includes(lower));
  if (match) return { match, suggestions: [] };
  
  // Very fuzzy match (contains any word)
  const words = lower.split(/\s+/);
  match = services.find(s => words.some(w => s.name.toLowerCase().includes(w)));
  if (match) return { match, suggestions: [] };
  
  // No match found - calculate similarity scores for suggestions
  const withScores = services.map(s => ({
    service: s,
    distance: levenshteinDistance(lower, s.name.toLowerCase()),
    // Bonus for word matches
    wordBonus: words.some(w => s.name.toLowerCase().includes(w)) ? -5 : 0
  }));
  
  // Sort by similarity (lower distance = more similar)
  withScores.sort((a, b) => (a.distance + a.wordBonus) - (b.distance + b.wordBonus));
  
  // Return top 3 suggestions if they're reasonably close (distance < length of search term)
  const suggestions = withScores
    .filter(s => s.distance <= lower.length) // Not too different
    .slice(0, 3)
    .map(s => s.service);
  
  return { match: null, suggestions };
}

// Parse incoming SMS and determine response
function parseSMSMessage(message: string, conversationState: any = null): { type: string; data: any } {
  const text = message.toLowerCase().trim();
  
  // PRIORITY 0: Check for availability requests FIRST (before anything else)
  // Normalize by removing punctuation to handle "available?", "available!", etc.
  const normalizedForAvailability = text.replace(/[?!.,;:]/g, '').trim();
  if (normalizedForAvailability === 'available' || normalizedForAvailability === 'availability') {
    console.log('✅ Detected availability request via pattern match (early check):', message);
    return { type: 'availability_request', data: null };
  }
  
  // PRIORITY 1: Check for escape commands (before conversation state)
  // This allows users to break out of stuck conversations
  
  // Check for cancel/restart requests (clears conversation state)
  if (text === 'cancel' || text === 'restart' || text === 'start over' || text === 'reset') {
    return { type: 'cancel', data: null };
  }
  
  // Check for help requests
  if (text === 'help' || text === 'info' || text === 'menu') {
    return { type: 'help', data: null };
  }
  
  // Check for greetings
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
  const isGreeting = greetings.some(greeting => {
    const words = text.split(/\s+/);
    return words.length <= 3 && words.some(word => word === greeting || word.startsWith(greeting));
  });
  
  if (isGreeting) {
    return { type: 'greeting', data: null };
  }
  
  // Check for weekly grid request
  if (text === 'week' || text === 'weekly') {
    return { type: 'weekly_grid_request', data: null };
  }
  
  // PRIORITY 2: Try quick pattern - one-message booking
  if (text.startsWith('book ')) {
    const quickBooking = parseQuickBooking(message);
    if (quickBooking.success) {
      return { 
        type: 'quick_booking', 
        data: {
          date: quickBooking.date,
          time: quickBooking.time,
          service: quickBooking.service,
          email: quickBooking.email
        }
      };
    }
  }
  
  // PRIORITY 3: Check conversation state actions
  if (conversationState) {
    if (text === 'yes' || text === 'y' || text === 'yeah' || text === 'yep' || text === 'sure') {
      return { type: 'confirm_yes', data: conversationState };
    }
    if (text === 'no' || text === 'n' || text === 'nope' || text === 'nah') {
      return { type: 'confirm_no', data: null };
    }
    
    // Check if they're selecting a time from the available options
    const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
    if (timeMatch) {
      console.log('🕐 Time pattern matched:', timeMatch[0], 'pendingTimes:', conversationState.pendingTimes);
      if (conversationState.pendingTimes) {
        console.log('✅ Returning time_selection');
        return { type: 'time_selection', data: { time: message.trim() } };
      } else {
        console.log('❌ No pendingTimes in state, state:', JSON.stringify(conversationState));
      }
    }
    
    // Check if they're providing their email (in email collection state)
    if (conversationState.awaitingEmail) {
      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const email = message.trim().toLowerCase();
      if (emailRegex.test(email)) {
        return { type: 'provide_email', data: { email } };
      }
    }
    
    // Check if they're providing their name (in name collection state)
    if (conversationState.awaitingName) {
      // Simple name validation (at least 2 words or 3+ chars)
      const words = message.trim().split(/\s+/);
      if (words.length >= 2 || message.trim().length >= 3) {
        return { type: 'provide_name', data: { name: message.trim() } };
      }
    }
    
    // Check if they're providing a service name (in service selection state)
    if (conversationState.awaitingService) {
      // BUT: Check if this looks like a new booking request first (allows breaking out of stuck state)
      const hasBookKeyword = text.includes('book') || text.includes('schedule') || text.includes('appointment');
      if (hasBookKeyword) {
        // Match MM/DD, MM/DD/YY, or MM/DD/YYYY formats
        const dateMatch = text.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}-\d{1,2}(?:-\d{2,4})?|\d{1,2}\s+\d{1,2}(?:\s+\d{2,4})?)/);
        const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)|(\d{1,2})\s*(am|pm)/i);
        if (dateMatch) {
          console.log('✅ Detected new booking request while in awaitingService state, clearing old state');
          return {
            type: 'booking_request',
            data: {
              date: dateMatch[1],
              time: timeMatch ? timeMatch[0] : null
            }
          };
        }
      }
      return { type: 'provide_service', data: { serviceInput: message.trim() } };
    }
    
    // Legacy: Handle old category states by redirecting to service selection
    // (Users might have old state from before we removed categories)
    if (conversationState.awaitingCategory) {
      console.log('⚠️ Found legacy awaitingCategory state, redirecting to service selection');
      return { type: 'legacy_category_redirect', data: { input: message.trim() } };
    }
  }
  
  // Check for booking requests (also check here for messages not in conversation state)
  if (text.includes('book') || text.includes('schedule') || text.includes('appointment')) {
    // Match MM/DD, MM/DD/YY, or MM/DD/YYYY formats
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}-\d{1,2}(?:-\d{2,4})?|\d{1,2}\s+\d{1,2}(?:\s+\d{2,4})?)/);
    const timeMatch = text.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm))/i);
    
    if (dateMatch && timeMatch) {
      return {
        type: 'booking_request',
        data: {
          date: dateMatch[1],
          time: timeMatch[0]
        }
      };
    }
    
    // If only date is provided (no time), still treat as booking request
    if (dateMatch) {
      return {
        type: 'booking_request',
        data: {
          date: dateMatch[1],
          time: null
        }
      };
    }
    
    return { type: 'booking_help', data: null };
  }
  
  // Check for availability requests with specific date (also below escape commands)
  if (text.includes('open') || text.includes('free')) {
    const specificDate = parseSpecificDate(text);
    if (specificDate) {
      return { 
        type: 'specific_availability_request', 
        data: { date: specificDate }
      };
    }
    return { type: 'availability_request', data: null };
  }
  
  // Check for FAQ questions
  for (const [keyword, answer] of Object.entries(FAQ_DATABASE)) {
    if (text.includes(keyword)) {
      return {
        type: 'faq',
        data: { question: keyword, answer }
      };
    }
  }
  
  // Check if message contains a date without explicit availability keywords
  // This catches messages like "9th?", "tomorrow?", "Dec 15?"
  const implicitDate = parseSpecificDate(text);
  if (implicitDate) {
    // BUT: Check if there's also a time in the message
    // If so, treat it as a booking request, not just availability
    const timeMatch = text.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)|(\d{1,2})\s*(am|pm)/i);
    if (timeMatch) {
      console.log('🕐 Found both date AND time in message, treating as booking request');
      return {
        type: 'booking_request',
        data: {
          date: `${implicitDate.getMonth() + 1}/${implicitDate.getDate()}`,
          time: timeMatch[0].trim()
        }
      };
    }
    
    // Just a date, treat as availability request
    return { 
      type: 'specific_availability_request', 
      data: { date: implicitDate }
    };
  }
  
  // PRIORITY 4: Try Gemini AI for complex messages
  // This will be called asynchronously in the webhook handler
  // Return a flag to trigger Gemini parsing
  return { type: 'needs_gemini_parse', data: { message } };
}

// Generate weekly availability grid (5 days, hourly)
async function getWeeklyAvailabilityGrid(): Promise<string> {
  try {
    const businessTimezone = 'America/Los_Angeles';
    const now = new Date();
    const gridLines: string[] = [];
    
    // Get next 5 days - use same date creation method as getAvailableSlots() for consistency
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      // Create date using millisecond addition (same as getAvailableSlots) to avoid timezone issues
      const targetDate = new Date(now.getTime() + (dayOffset * 24 * 60 * 60 * 1000));
      
      // Format day label with month (e.g., "Tu 11/12", "We 11/13")
      const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const dayName = dayNames[targetDate.getDay()];
      const monthNum = targetDate.getMonth() + 1;
      const dayNum = targetDate.getDate();
      
      // Get available times for this day - uses same function as getAvailableSlots()
      const availableTimes = await getAvailableSlotsForDate(targetDate);
      
      // Convert available times to hourly grid (10am-4pm = 7 hours)
      const hourSlots: string[] = [];
      for (let hour = 10; hour <= 16; hour++) { // 10am to 4pm
        const displayHour = hour > 12 ? hour - 12 : hour;
        
        // Check if this hour is available
        const hourAvailable = availableTimes.some(timeStr => {
          const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
          if (!timeMatch) return false;
          const timeHour = parseInt(timeMatch[1]);
          const period = timeMatch[3]?.toUpperCase();
          let hour24 = timeHour;
          if (period === 'PM' && timeHour !== 12) hour24 += 12;
          if (period === 'AM' && timeHour === 12) hour24 = 0;
          return hour24 === hour;
        });
        
        hourSlots.push(hourAvailable ? '✓' : '✗');
      }
      
      // Format line: "Tu 11/12│10✓ 11✓ 12✓ 1✓ 2✓ 3✗ 4✗"
      const hours = ['10', '11', '12', '1', '2', '3', '4'];
      const slotsWithHours = hours.map((h, i) => `${h}${hourSlots[i]}`).join(' ');
      gridLines.push(`${dayName} ${monthNum}/${dayNum}│${slotsWithHours}`);
    }
    
    return gridLines.join('\n');
  } catch (error) {
    console.error('Error generating weekly grid:', error);
    return 'Unable to load weekly view. Text "AVAILABLE" for next slots.';
  }
}

// Get available appointment slots - searches up to 30 days or until we find enough slots
async function getAvailableSlots(minSlots: number = 5, maxDays: number = 30): Promise<string[]> {
  try {
    // Get business hours
    const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
    const businessHours = businessHoursDoc.data();
    
    if (!businessHours) {
      return ['Please call (650) 613-8455 for availability'];
    }
    
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    const endDate = new Date(now.getTime() + (maxDays * 24 * 60 * 60 * 1000));
    
    // Get existing appointments for the search period (filter status in memory)
    const appointmentsQuery = db.collection('appointments')
      .where('start', '>=', now.toISOString())
      .where('start', '<=', endDate.toISOString());
    
    const appointments = await appointmentsQuery.get();
    const existingAppointments = appointments.docs
      .filter(doc => {
        const status = doc.data().status;
        return status === 'confirmed' || status === 'pending';
      })
      .map(doc => ({
      start: doc.data().start,
      duration: doc.data().duration || 60
    }));
    
    // Generate available slots (stop when we have enough)
    const availableSlots: string[] = [];
    const currentDate = new Date();
    
    for (let i = 0; i <= maxDays && availableSlots.length < minSlots; i++) {
      const checkDate = new Date(currentDate.getTime() + (i * 24 * 60 * 60 * 1000));
      
      // Check if this date has available times (respects closures and special hours)
      const dayTimes = await getAvailableSlotsForDate(checkDate);
      
      if (dayTimes.length === 0) continue; // Closed or no availability
      
      // Add each available time to our results
          const dateStr = checkDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
      
      for (const timeStr of dayTimes) {
        availableSlots.push(`${dateStr} at ${timeStr}`);
        
        // Stop early if we have enough slots
        if (availableSlots.length >= minSlots) break;
      }
    }
    
    // If no slots found after searching max days, return helpful message
    if (availableSlots.length === 0) {
      return ['No availability in next 30 days. Please call (650) 613-8455 to discuss options.'];
    }
    
    return availableSlots.slice(0, 10); // Limit to 10 slots for display
  } catch (error) {
    console.error('Error getting available slots:', error);
    return ['Please call (650) 613-8455 for availability'];
  }
}

// Get available times for a specific date
async function getAvailableSlotsForDate(targetDate: Date): Promise<string[]> {
  try {
    // Get business hours
    const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
    const businessHours = businessHoursDoc.data();
    
    console.log('🔍 Checking availability for date:', targetDate.toISOString());
    
    if (!businessHours) {
      console.log('❌ No business hours found');
      return [];
    }
    
    const businessTimezone = businessHours.timezone || 'America/Los_Angeles';
    console.log('🌍 Business timezone:', businessTimezone);
    
    // Format date as YYYY-MM-DD for comparison (using UTC date)
    const dateStr = `${targetDate.getUTCFullYear()}-${String(targetDate.getUTCMonth() + 1).padStart(2, '0')}-${String(targetDate.getUTCDate()).padStart(2, '0')}`;
    console.log('📅 Formatted date (UTC):', dateStr);
    
    // Check if shop is closed on this specific date
    const closuresSnapshot = await db.collection('dayClosures').where('date', '==', dateStr).get();
    if (!closuresSnapshot.empty) {
      console.log('🚫 Date is marked as closed');
      return []; // Closed on this date
    }
    
    // Check for special hours on this date
    const specialHoursSnapshot = await db.collection('specialHours').where('date', '==', dateStr).get();
    let hoursRanges: [string, string][] = [];
    
    console.log(`🔎 Checking special hours for ${dateStr}. Found ${specialHoursSnapshot.size} special hour entries`);
    
    if (!specialHoursSnapshot.empty) {
      // Use special hours
      const specialData = specialHoursSnapshot.docs[0].data();
      hoursRanges = Array.isArray(specialData.ranges) ? specialData.ranges : [];
      console.log('⏰ Using special hours:', hoursRanges);
    } else {
      // Use regular business hours
      // Use UTC day of week to get correct day
      const dayOfWeek = targetDate.getUTCDay();
      const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][dayOfWeek];
      const daySlots = businessHours.slots?.[dayKey];
      // Business hours are stored as { ranges: [[start, end], ...] }
      hoursRanges = Array.isArray(daySlots?.ranges) ? daySlots.ranges : (Array.isArray(daySlots) ? daySlots : []);
      console.log(`⏰ Using regular ${dayKey} hours:`, hoursRanges);
    }
    
    // If no hours for this day, it's closed
    if (!Array.isArray(hoursRanges) || hoursRanges.length === 0) {
      console.log('🚫 No hours configured for this day');
      return [];
    }
    
    // Get existing appointments for the target date
    // IMPORTANT: Use UTC methods to avoid timezone interference
    // Query ±12 hours to catch appointments across UTC day boundaries
    const year = targetDate.getUTCFullYear();
    const month = targetDate.getUTCMonth();
    const day = targetDate.getUTCDate();
    
    const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const queryStart = new Date(startOfDay.getTime() - (12 * 60 * 60 * 1000)); // 12 hours before
    
    const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    const queryEnd = new Date(endOfDay.getTime() + (12 * 60 * 60 * 1000)); // 12 hours after
    
    console.log(`🔎 Querying appointments from ${queryStart.toISOString()} to ${queryEnd.toISOString()}`);
    
    const appointmentsQuery = db.collection('appointments')
      .where('start', '>=', queryStart.toISOString())
      .where('start', '<=', queryEnd.toISOString());
    
    const appointments = await appointmentsQuery.get();
    console.log(`🔎 Total appointments in query range: ${appointments.size}`);
    
    const existingAppointments = appointments.docs
      .filter(doc => {
        const data = doc.data();
        const status = data.status;
        if (status !== 'confirmed' && status !== 'pending') {
          console.log(`  ⏭️ Skipping appointment (status: ${status})`);
          return false;
        }
        
        // Also check if appointment actually falls on target date in business timezone
        // (since we query wider range for timezone safety)
        const aptDate = new Date(data.start);
        // Format the appointment date in business timezone
        const aptDateInBusinessTZ = aptDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          timeZone: businessTimezone 
        });
        // Convert MM/DD/YYYY to YYYY-MM-DD
        const [month, day, year] = aptDateInBusinessTZ.split('/');
        const aptDay = `${year}-${month}-${day}`;
        const matches = aptDay === dateStr;
        console.log(`  🔍 ${data.start} → ${aptDay} (target: ${dateStr}) - ${matches ? 'MATCH ✅' : 'SKIP'}`);
        return matches;
      })
      .map(doc => ({
        start: doc.data().start,
        duration: doc.data().duration || 60
      }));
    
    console.log(`📊 Found ${existingAppointments.length} existing appointments for ${dateStr} in ${businessTimezone}`);
    if (existingAppointments.length > 0) {
      existingAppointments.forEach(apt => {
        const aptDate = new Date(apt.start);
        const time = aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: businessTimezone });
        console.log(`  - ${apt.start} → ${time} (${apt.duration} min)`);
      });
    } else {
      console.log('  (No appointments found for this day)');
    }
    
    const availableTimes: string[] = [];
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
    
    // Generate time slots based on actual business hours
    for (const range of hoursRanges) {
      // Handle both object format { start, end } and array format [start, end]
      const startStr: string = (typeof range === 'object' && 'start' in range) ? (range as any).start : (range as any)[0];
      const endStr: string = (typeof range === 'object' && 'end' in range) ? (range as any).end : (range as any)[1];
      
      // Parse start time (format: "09:00" or "9:00")
      const [startHour, startMin] = startStr.split(':').map(Number);
      const [endHour, endMin] = endStr.split(':').map(Number);
      
      // Determine DST offset for this date (same logic as booking site)
      const year = targetDate.getUTCFullYear();
      const month = targetDate.getUTCMonth();
      const dayNum = targetDate.getUTCDate();
      
      let offsetHours = 8; // Default PST (UTC-8)
      if (month === 10) { // November
        const nov1 = new Date(Date.UTC(year, 10, 1));
        const firstSunday = 1 + ((7 - nov1.getUTCDay()) % 7);
        if (dayNum < firstSunday) offsetHours = 7; // Still PDT
      } else if (month >= 3 && month <= 9) {
        offsetHours = 7; // PDT months
      } else if (month === 2) { // March
        const mar1 = new Date(Date.UTC(year, 2, 1));
        const firstSunday = 1 + ((7 - mar1.getUTCDay()) % 7);
        const secondSunday = firstSunday + 7;
        if (dayNum >= secondSunday) offsetHours = 7; // DST started
      }
      
      // Generate hourly slots within the range
      let currentHour = startHour;
      while (currentHour < endHour) {
        // Convert Pacific time to UTC using manual offset
        // Example: 4 PM PST + 8 hours = midnight UTC (next day)
        const slotStartMs = Date.UTC(year, month, dayNum, currentHour + offsetHours, 0, 0);
        const slotEndMs = slotStartMs + (60 * 60 * 1000); // 1 hour duration
        
        const slotDisplayTime = new Date(slotStartMs).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
          hour12: true,
          timeZone: businessTimezone
        });
        
        // Skip slots that are less than 2 hours from now
        const now = new Date();
        if (slotStartMs < now.getTime() + (2 * 60 * 60 * 1000)) {
          console.log(`  ⏭️ Skipping ${slotDisplayTime} (too soon - less than 2 hours)`);
          currentHour++;
          continue;
        }
        
        // Check if slot conflicts with any existing appointment
        const isConflict = existingAppointments.some(apt => {
          const aptStartMs = new Date(apt.start).getTime();
          const aptEndMs = aptStartMs + (apt.duration * 60 * 1000);
          const hasOverlap = (slotStartMs < aptEndMs && slotEndMs > aptStartMs);
          if (hasOverlap) {
            const aptDisplayTime = new Date(apt.start).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true, 
              timeZone: businessTimezone 
            });
            console.log(`  ❌ ${slotDisplayTime} (slot ${slotStartMs}) conflicts with appointment at ${aptDisplayTime} (apt ${aptStartMs}-${aptEndMs})`);
          }
          return hasOverlap;
        });
        
        if (!isConflict) {
          console.log(`  ✅ ${slotDisplayTime} is AVAILABLE`);
          availableTimes.push(slotDisplayTime);
        }
        
        currentHour++;
      }
    }
    
    console.log(`✅ Found ${availableTimes.length} available times:`, availableTimes);
    return availableTimes;
  } catch (error) {
    console.error('Error getting slots for specific date:', error);
    return [];
  }
}

// Simple checker: returns true/false if a time slot can fit the duration
// This function does NOT search for alternatives (no recursion)
async function isSlotAvailableForDuration(
  startTime: Date,
  durationMinutes: number
): Promise<boolean> {
  const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));
  
  // Check 2-hour advance booking requirement
  const now = new Date();
  const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  if (startTime < minBookingTime) {
    return false;
  }
  
  // Get all appointments for the day (filter status in memory to avoid complex index)
  // Use UTC methods to query ±12 hours to catch appointments across day boundaries
  const year = startTime.getUTCFullYear();
  const month = startTime.getUTCMonth();
  const day = startTime.getUTCDate();
  
  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const queryStart = new Date(startOfDay.getTime() - (12 * 60 * 60 * 1000));
  
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  const queryEnd = new Date(endOfDay.getTime() + (12 * 60 * 60 * 1000));
  
  const appointmentsQuery = db.collection('appointments')
    .where('start', '>=', queryStart.toISOString())
    .where('start', '<=', queryEnd.toISOString());
  
  const appointments = await appointmentsQuery.get();
  
  // Check for overlaps (filter status in memory)
  const hasConflict = appointments.docs.some(doc => {
    const apt = doc.data();
    
    // Skip cancelled appointments
    if (apt.status === 'cancelled' || apt.status === 'no-show' || apt.status === 'completed') {
      return false;
    }
    
    const aptStart = new Date(apt.start);
    const aptEnd = new Date(aptStart.getTime() + (apt.duration * 60 * 1000));
    
    // Conflict if new appointment overlaps with existing one
    return (startTime < aptEnd && endTime > aptStart);
  });
  
  return !hasConflict; // Return true if NO conflict
}

// Smart checker: checks if requested slot is available AND finds next available if not
// Uses isSlotAvailableForDuration() to avoid recursion
async function checkSlotAvailableForDuration(
  startTime: Date,
  durationMinutes: number
): Promise<{ available: boolean; nextAvailable: string | null }> {
  
  // First, check if the requested time works
  const isAvailable = await isSlotAvailableForDuration(startTime, durationMinutes);
  
  if (isAvailable) {
    return { available: true, nextAvailable: null };
  }
  
  // If not available, search for next slot that can fit this duration
  const availableTimes = await getAvailableSlotsForDate(startTime);
  
  for (const timeStr of availableTimes) {
    const testTime = new Date(startTime);
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period?.toLowerCase() === 'pm' && hours !== 12) hour24 += 12;
    if (period?.toLowerCase() === 'am' && hours === 12) hour24 = 0;
    testTime.setHours(hour24, minutes || 0, 0, 0);
    
    // Use simple checker here (NOT calling checkSlotAvailableForDuration - no recursion!)
    const fits = await isSlotAvailableForDuration(testTime, durationMinutes);
    if (fits) {
      return { available: false, nextAvailable: timeStr };
    }
  }
  
  return { available: false, nextAvailable: null };
}

// Send SMS (prioritizes Twilio if configured, falls back to AWS SNS)
export async function sendSMS(message: SMSMessage, twilioConfig?: { accountSid: string; authToken: string; phoneNumber: string; messagingServiceSid?: string }): Promise<boolean> {
  try {
    // Option 1: Use Twilio (preferred - A2P approved)
    if (twilioConfig?.accountSid && twilioConfig?.authToken) {
      try {
        const twilio = await import('twilio');
        const client = twilio.default(twilioConfig.accountSid, twilioConfig.authToken);
        
        // For A2P 10DLC compliance, use Messaging Service SID if available
        // Otherwise fall back to phone number
        const messageParams: any = {
          body: message.body,
          to: message.to
        };
        
        if (twilioConfig.messagingServiceSid) {
          // Use Messaging Service SID for A2P compliance
          messageParams.messagingServiceSid = twilioConfig.messagingServiceSid;
          console.log('📱 Using Messaging Service SID for A2P compliance');
        } else if (twilioConfig.phoneNumber) {
          // Fallback to phone number if Messaging Service not configured
          messageParams.from = twilioConfig.phoneNumber;
          console.log('📱 Using phone number directly (not A2P optimized)');
        } else {
          throw new Error('Either messagingServiceSid or phoneNumber must be provided');
        }
        
        const result = await client.messages.create(messageParams);
        
        console.log('✅ SMS sent via Twilio (A2P approved):', result.sid);
      
      // Store SMS in database for tracking
      await db.collection('sms_logs').add({
        ...message,
        timestamp: new Date().toISOString(),
          status: 'sent',
          twilioMessageId: result.sid,
          provider: 'twilio'
      });
      
      return true;
      } catch (error) {
        console.error('Error sending SMS via Twilio:', error);
        throw error;
      }
    }

    // Option 2: Use AWS SNS (fallback)
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
    });

    const params = {
      Message: message.body,
      PhoneNumber: message.to
    };

    const result = await sns.publish(params).promise();
      console.log('✅ SMS sent via AWS SNS:', result.MessageId);
      
      // Store SMS in database for tracking
      await db.collection('sms_logs').add({
        ...message,
        timestamp: new Date().toISOString(),
        status: 'sent',
        awsMessageId: result.MessageId,
        provider: 'aws_sns'
      });
      
      return true;
    }
    
    // Option 3: No SMS provider configured
    console.log('⚠️ No SMS provider configured, logging SMS instead:', {
      to: message.to,
      body: message.body
    });
    
    // Store SMS in database for tracking
    await db.collection('sms_logs').add({
      ...message,
      timestamp: new Date().toISOString(),
      status: 'logged_only',
      provider: 'none'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    
    // Store failed SMS attempt
    await db.collection('sms_logs').add({
      ...message,
      timestamp: new Date().toISOString(),
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
    
    return false;
  }
}

// Handle incoming SMS webhook (HTTP function for Twilio)
export const smsWebhook = onRequest(
  { 
    region: 'us-central1', 
    cors: true,
    secrets: [twilioAccountSid, twilioAuthToken, geminiApiKey]
  },
  async (req, res) => {
    console.log('SMS webhook received:', req.method, req.body);
    
    // Only accept POST requests
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      res.status(405).send('Method not allowed');
      return;
    }
    
    // Extract data from Twilio webhook
    const { From: from, Body: body, To: to } = req.body || {};
    
    if (!from || !body) {
      console.error('Missing required fields:', { from, body, to });
      res.status(400).send('Missing required fields');
      return;
    }
    
    console.log('Processing SMS:', { from, body, to });
    
    try {
      // Get conversation state (if any)
      const conversationState = await getConversationState(from);
      console.log('📱 Conversation state for', from, ':', conversationState ? JSON.stringify(conversationState) : 'null');
      
      // Parse the incoming message with conversation context
      let parsed = parseSMSMessage(body, conversationState);
      console.log('🔍 Parsed message type:', parsed.type, 'for message:', body);
      
      // If needs Gemini parsing, try it
      if (parsed.type === 'needs_gemini_parse') {
        console.log('🤖 Message needs Gemini AI parsing');
        const geminiResult = await parseMessageWithGemini(body, from, geminiApiKey.value());
        
        if (geminiResult && geminiResult.intent === 'booking') {
          // Convert to quick_booking format
          console.log('✅ Gemini detected booking intent');
          parsed = {
            type: 'quick_booking',
            data: {
              date: geminiResult.date,
              time: geminiResult.time,
              service: geminiResult.service,
              email: geminiResult.email
            }
          };
        } else if (geminiResult && geminiResult.intent === 'availability') {
          // Convert to availability check
          console.log('✅ Gemini detected availability check');
          if (geminiResult.date) {
            // Specific date availability request
            const specificDate = parseSpecificDate(geminiResult.date);
            if (specificDate) {
          parsed = {
            type: 'specific_availability_request',
                data: { date: specificDate }
          };
        } else {
              // Date couldn't be parsed, show general availability
              parsed = { type: 'availability_request', data: null };
            }
          } else {
            // General availability request (no date specified)
            parsed = { type: 'availability_request', data: null };
          }
        } else if (geminiResult && geminiResult.intent === 'question') {
          // Use full Gemini AI for answering questions
          console.log('✅ Gemini detected question - using conversational AI');
          parsed = { type: 'gemini_question', data: { message: body } };
        } else {
          // Gemini couldn't parse or unknown intent - check if it's a simple availability request
          const fallbackNormalized = body.replace(/[?!.,;:]/g, '').trim().toLowerCase();
          if (fallbackNormalized === 'available' || fallbackNormalized === 'availability') {
            console.log('✅ Fallback: Detected availability request after Gemini failed');
            parsed = { type: 'availability_request', data: null };
          } else {
            // Use conversational AI as fallback
            console.log('🤖 Using Gemini conversational AI for:', body);
            parsed = { type: 'gemini_question', data: { message: body } };
          }
        }
      }
      
      // Get or create customer record
      let customer = await db.collection('customers').where('phone', '==', from).limit(1).get();
      let customerId: string;
      
      if (customer.empty) {
        // Create new customer
        const newCustomer = await db.collection('customers').add({
          phone: from,
          name: 'SMS Customer',
          email: null,
          status: 'sms_customer',
          createdAt: new Date().toISOString(),
          smsOptIn: true
        });
        customerId = newCustomer.id;
      } else {
        customerId = customer.docs[0].id;
      }
      
      // Store incoming message
      await db.collection('sms_conversations').add({
        customerId,
        phoneNumber: from,
        message: body,
        direction: 'inbound',
        timestamp: new Date().toISOString(),
        parsedType: parsed.type
      });
      
      let responseMessage = '';
      
      // Generate response based on parsed message
      switch (parsed.type) {
        case 'greeting':
          responseMessage = SMS_TEMPLATES.greeting();
          await clearConversationState(from);
          break;
          
        case 'availability_request':
          // Default to weekly grid view instead of list
          console.log('📅 Showing weekly availability grid (default)...');
          const weeklyGridForAvailable = await getWeeklyAvailabilityGrid();
          responseMessage = SMS_TEMPLATES.weeklyGrid(weeklyGridForAvailable);
          await clearConversationState(from);
          break;
          
        case 'specific_availability_request':
          const targetDate = parsed.data.date;
          console.log('📅 Checking availability for:', targetDate.toISOString());
          
          // Check if date is in the past (with 2 hour minimum booking buffer)
          const nowForCheck = new Date();
          const minBookingTimeForCheck = new Date(nowForCheck.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
          const targetDateStart = new Date(targetDate);
          targetDateStart.setHours(0, 0, 0, 0);
          const minBookingDateForCheck = new Date(minBookingTimeForCheck);
          minBookingDateForCheck.setHours(0, 0, 0, 0);
          
          if (targetDateStart < minBookingDateForCheck) {
            const dateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            responseMessage = `Sorry, ${dateStr} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
            break;
          }
          
          const availableTimes = await getAvailableSlotsForDate(targetDate);
          console.log(`✅ Found ${availableTimes.length} available times:`, availableTimes);
          const dateStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          responseMessage = SMS_TEMPLATES.specificAvailable(dateStr, availableTimes);
          
          // Save conversation state if there are times available
          if (availableTimes.length > 0) {
            const singleTimeValue = availableTimes.length === 1 ? availableTimes[0] : null;
            console.log(`💾 Saving state with singleTime:`, singleTimeValue);
            await saveConversationState(from, {
              type: 'awaiting_time_selection',
              date: targetDate.toISOString(),
              dateStr,
              availableTimes,
              pendingTimes: true,
              singleTime: singleTimeValue
            });
          } else {
            await clearConversationState(from);
          }
          break;
          
        case 'quick_booking':
          // User sent "BOOK 11/11 10am brow wax" or Gemini parsed a complex booking request
          console.log('📅 Processing quick booking:', parsed.data);
          
          // Parse the date and time - check full datetime before assuming next year
          const bookingDateStr = parsed.data.date;
          const bookingTimeStr = parsed.data.time;
          const now = new Date();
          const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
          let bookingDate: Date | null = null;
          
          // Try to parse as MM/DD format first (most common)
          const dateMatch = bookingDateStr.match(/(\d{1,2})\/(\d{1,2})/);
          if (dateMatch) {
            const month = parseInt(dateMatch[1]) - 1;
            const day = parseInt(dateMatch[2]);
            const currentYear = new Date().getFullYear();
            
            // Parse the time to check full datetime
            const parsedTime = parseTimeString(bookingTimeStr);
            
            if (parsedTime) {
              const businessTimezone = 'America/Los_Angeles';
              const { fromZonedTime } = await import('date-fns-tz');
              
              // Try current year first with the actual time
              const dateISO = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const localTimeStr = `${dateISO}T${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}:00`;
              const appointmentDateTime = fromZonedTime(localTimeStr, businessTimezone);
              
              // If current year datetime is in the future, use it
              if (appointmentDateTime >= minBookingTime) {
                bookingDate = new Date(Date.UTC(currentYear, month, day, 12, 0, 0));
              } else {
                // Current year is in the past - try next year
                const nextYear = currentYear + 1;
                const nextYearDateISO = `${nextYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const nextYearTimeStr = `${nextYearDateISO}T${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}:00`;
                const nextYearDateTime = fromZonedTime(nextYearTimeStr, businessTimezone);
                
                // If next year is also in the past, reject it
                if (nextYearDateTime < minBookingTime) {
                  const dateDisplay = new Date(Date.UTC(currentYear, month, day, 12, 0, 0)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                  break;
                }
                
                // Next year is valid, use it
                bookingDate = new Date(Date.UTC(nextYear, month, day, 12, 0, 0));
              }
              } else {
                // No time parsed - use date-only logic
                bookingDate = new Date(Date.UTC(currentYear, month, day, 12, 0, 0));
                const bookingDateStart = new Date(bookingDate);
                bookingDateStart.setHours(0, 0, 0, 0);
                const minBookingDate = new Date(minBookingTime);
                minBookingDate.setHours(0, 0, 0, 0);
                
                // If date is in the past, check if it's clearly in the past
                if (bookingDateStart < minBookingDate) {
                  const currentMonth = now.getMonth();
                  const currentDay = now.getDate();
                  
                  // If the requested month/day is clearly in the past (same month but past day, or previous month), reject it
                  if (month < currentMonth || (month === currentMonth && day < currentDay)) {
                    const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                    break;
                  }
                  
                  // Otherwise, try next year (for dates like "12/25" when it's November)
                  const nextYearDate = new Date(Date.UTC(currentYear + 1, month, day, 12, 0, 0));
                  const nextYearDateStart = new Date(nextYearDate);
                  nextYearDateStart.setHours(0, 0, 0, 0);
                  
                  // Only use next year if it's actually in the future
                  if (nextYearDateStart >= minBookingDate) {
                    bookingDate = nextYearDate;
                  } else {
                    // Both current year and next year are in the past - reject it
                    const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                    break;
                  }
                }
              }
          } else {
            // Not MM/DD format - use parseSpecificDate as fallback
            bookingDate = parseSpecificDate(bookingDateStr);
            
            if (!bookingDate) {
              responseMessage = `Sorry, I couldn't understand the date "${bookingDateStr}". 😕\n\nTry: "BOOK 11/11 10am brow wax"\n\nCall (650) 613-8455 for assistance. - Bueno Brows` + A2P_FOOTER;
              break;
            }
            
            // Check if date is in the past (with 2 hour minimum booking buffer)
            const bookingDateStart = new Date(bookingDate);
            bookingDateStart.setHours(0, 0, 0, 0);
            const minBookingDate = new Date(minBookingTime);
            minBookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDateStart < minBookingDate) {
              const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              break;
            }
          }
          
          if (!bookingDate) {
            responseMessage = `Sorry, I couldn't understand the date "${bookingDateStr}". 😕\n\nTry: "BOOK 11/11 10am brow wax"\n\nCall (650) 613-8455 for assistance. - Bueno Brows` + A2P_FOOTER;
            break;
          }
          
          // Check availability for this date
          const bookingAvailableTimes = await getAvailableSlotsForDate(bookingDate);
          
          if (bookingAvailableTimes.length === 0) {
            const bookingDateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            responseMessage = `No availability on ${bookingDateDisplay}. 😕\n\nCall (650) 613-8455 to find another date. - Bueno Brows` + A2P_FOOTER;
            break;
          }
          
          // Check if requested time is available
          const requestedTimeStr = parsed.data.time.toUpperCase();
          const normalizedRequestedTimeStr = requestedTimeStr.replace(/[:\s]/g, '');
          const timeIsAvailable = bookingAvailableTimes.some(t => timeMatches(requestedTimeStr, t));
          
          if (!timeIsAvailable) {
            const bookingDateDisplay2 = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            console.log('⏰ Requested time not available. Saving state with pendingTimes:', bookingAvailableTimes.length, 'slots');
            responseMessage = `${requestedTimeStr} isn't available on ${bookingDateDisplay2}. Here's what we have:\n\n${bookingAvailableTimes.slice(0, 5).join('\n')}\n\nReply with a time. - Bueno Brows` + A2P_FOOTER;
            
            await saveConversationState(from, {
              type: 'awaiting_time',
              date: bookingDate.toISOString(),
              dateStr: bookingDateDisplay2,
              pendingTimes: bookingAvailableTimes,
              service: parsed.data.service,
              email: parsed.data.email,
              awaitingTime: true
            });
            console.log('✅ State saved with pendingTimes for phone:', from);
            break;
          }
          
          // Time is available! Try to find the service if provided
          if (parsed.data.service) {
            const allBookingServices = await db.collection('services').where('active', '==', true).get();
            const bookingServices = allBookingServices.docs.map(d => ({ id: d.id, ...d.data() }));
            const serviceMatch = findServiceByNameOrNumber(bookingServices, parsed.data.service);
            
            if (serviceMatch.match) {
              // Service found! Check if customer has email
              const customerData = customer.docs[0]?.data();
              const hasEmail = customerData?.email || parsed.data.email;
              
              const bookingDateDisplay3 = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              if (hasEmail) {
                // Skip email, go to name
                responseMessage = SMS_TEMPLATES.bookingConfirmName();
                await saveConversationState(from, {
                  type: 'awaiting_name',
                  date: bookingDate.toISOString(),
                  dateStr: bookingDateDisplay3,
                  time: requestedTimeStr,
                  serviceId: serviceMatch.match.id,
                  serviceName: serviceMatch.match.name,
                  serviceDuration: serviceMatch.match.duration,
                  servicePrice: serviceMatch.match.price,
                  customerEmail: hasEmail,
                  awaitingName: true
                });
              } else {
                // Need email
                responseMessage = SMS_TEMPLATES.bookingConfirm(bookingDateDisplay3, requestedTimeStr);
                await saveConversationState(from, {
                  type: 'awaiting_email',
                  date: bookingDate.toISOString(),
                  dateStr: bookingDateDisplay3,
                  time: requestedTimeStr,
                  serviceId: serviceMatch.match.id,
                  serviceName: serviceMatch.match.name,
                  serviceDuration: serviceMatch.match.duration,
                  servicePrice: serviceMatch.match.price,
                  awaitingEmail: true
                });
              }
              break;
            }
          }
          
          // Service not found or not provided - show top 5 most booked
          console.log('📋 Getting top 5 most booked services...');
          const top5Services = await getTop5MostBookedServices();
          
          const bookingDateDisplay4 = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          responseMessage = `Great! Which service?\n\n${top5Services.map((s, i) => 
            `${i+1}. ${s.name} - $${s.price} (${s.duration}min)`
          ).join('\n')}\n\nView all: buenobrows.com/services\n\nReply with number or name. - Bueno Brows` + A2P_FOOTER;
          
          await saveConversationState(from, {
            type: 'awaiting_service',
            date: bookingDate.toISOString(),
            dateStr: bookingDateDisplay4,
            time: requestedTimeStr,
            email: parsed.data.email,
            awaitingService: true,
            availableServices: top5Services
          });
          break;
          
        case 'confirm_yes':
          // User confirmed a single time slot - show top 5 most booked services
          if (conversationState && conversationState.singleTime) {
            console.log('📋 Getting top 5 most booked services...');
            const top5ServicesList = await getTop5MostBookedServices();
            
            responseMessage = `Great! Which service?\n\n${top5ServicesList.map((s, i) => 
              `${i+1}. ${s.name} - $${s.price} (${s.duration}min)`
            ).join('\n')}\n\nView all: buenobrows.com/services\n\nReply with number or name. - Bueno Brows` + A2P_FOOTER;
            
            await saveConversationState(from, {
              type: 'awaiting_service',
              date: conversationState.date,
              dateStr: conversationState.dateStr,
              time: conversationState.singleTime,
              awaitingService: true,
              availableServices: top5ServicesList
            });
          } else {
            responseMessage = SMS_TEMPLATES.error();
            await clearConversationState(from);
          }
          break;
          
        case 'confirm_no':
          responseMessage = SMS_TEMPLATES.bookingCancelled();
          await clearConversationState(from);
          break;
          
        case 'cancel':
          responseMessage = `No problem! Your booking has been cancelled. 👍\n\nReply "AVAILABLE" to start a new booking or "HELP" for options.\n\nCall us: (650) 613-8455 - Bueno Brows` + A2P_FOOTER;
          await clearConversationState(from);
          break;
          
        case 'time_selection':
          // User selected a time - show top 5 most booked services
          if (conversationState && conversationState.pendingTimes) {
            // Check if date is in the past
            const bookingDateFromState = new Date(conversationState.date);
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
            const bookingDateStart = new Date(bookingDateFromState);
            bookingDateStart.setHours(0, 0, 0, 0);
            const minBookingDate = new Date(minBookingTime);
            minBookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDateStart < minBookingDate) {
              responseMessage = `Sorry, ${conversationState.dateStr} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            const selectedTime = parsed.data.time;
            
            // Show top 5 most booked services
            console.log('📋 Getting top 5 most booked services...');
            const top5ForTime = await getTop5MostBookedServices();
            
            responseMessage = `Great! Which service?\n\n${top5ForTime.map((s, i) => 
              `${i+1}. ${s.name} - $${s.price} (${s.duration}min)`
            ).join('\n')}\n\nView all: buenobrows.com/services\n\nReply with number or name. - Bueno Brows` + A2P_FOOTER;
            
            await saveConversationState(from, {
              type: 'awaiting_service',
              date: conversationState.date,
              dateStr: conversationState.dateStr,
              time: selectedTime,
              awaitingService: true,
              availableServices: top5ForTime
            });
          } else {
            responseMessage = SMS_TEMPLATES.error();
            await clearConversationState(from);
          }
          break;
          
        case 'legacy_category_redirect':
          // Handle users with old awaitingCategory state from before we removed categories
          console.log('🔄 Handling legacy category state, showing top 5 most booked services');
          if (conversationState && conversationState.date && conversationState.time) {
            console.log('📋 Getting top 5 most booked services...');
            const legacyTop5 = await getTop5MostBookedServices();
            
            responseMessage = `Great! Which service?\n\n${legacyTop5.map((s, i) => 
              `${i+1}. ${s.name} - $${s.price} (${s.duration}min)`
            ).join('\n')}\n\nView all: buenobrows.com/services\n\nReply with number or name. - Bueno Brows` + A2P_FOOTER;
            
            await saveConversationState(from, {
              type: 'awaiting_service',
              date: conversationState.date,
              dateStr: conversationState.dateStr,
              time: conversationState.time,
              awaitingService: true,
              availableServices: legacyTop5
            });
          } else {
            // State incomplete, restart booking flow
            console.log('❌ Legacy state incomplete, restarting');
            responseMessage = SMS_TEMPLATES.booking_instructions();
            await clearConversationState(from);
          }
          break;
          
        case 'provide_service':
          // User provided service name - validate and check duration fit
          console.log('🔍 Service selection:', parsed.data.serviceInput);
          
          if (conversationState && conversationState.awaitingService) {
            const serviceList = conversationState.availableServices || await getActiveServices();
            console.log(`📋 Checking ${serviceList.length} services`);
            
            const serviceResult = findServiceByNameOrNumber(serviceList, parsed.data.serviceInput);
            
            if (!serviceResult.match) {
              console.log('❌ Service not found:', parsed.data.serviceInput);
              if (serviceResult.suggestions.length > 0) {
                console.log('💡 Suggesting:', serviceResult.suggestions.map(s => s.name));
                responseMessage = SMS_TEMPLATES.serviceNotFoundWithSuggestions(
                  parsed.data.serviceInput, 
                  serviceResult.suggestions
                );
              } else {
                responseMessage = SMS_TEMPLATES.serviceNotFound(parsed.data.serviceInput);
              }
              // Keep state for retry
              break;
            }
            
            const service = serviceResult.match;
            console.log('✅ Found service:', service.name, `(${service.duration} min)`);
            
            // Parse the time and check if service duration fits (in Pacific timezone)
            const businessTimezone = 'America/Los_Angeles';
            const dateISO = conversationState.date.split('T')[0];
            const parsedTime = parseTimeString(conversationState.time);
            
            if (!parsedTime) {
              responseMessage = `Sorry, I couldn't understand the time "${conversationState.time}". Please start over or call (650) 613-8455. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            const localTimeStr = `${dateISO}T${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}:00`;
            const appointmentDate = fromZonedTime(localTimeStr, businessTimezone);
            
            // Validate that appointment datetime is in the future (with 2 hour minimum buffer)
            const nowForService = new Date();
            const minBookingTimeForService = new Date(nowForService.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
            
            if (appointmentDate < minBookingTimeForService) {
              const dateTimeStr = appointmentDate.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZone: businessTimezone
              });
              responseMessage = `Sorry, ${dateTimeStr} is in the past or too soon (need at least 2 hours notice). 😕\n\nPlease choose a future time. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            const availabilityCheck = await checkSlotAvailableForDuration(appointmentDate, service.duration);
            
            if (!availabilityCheck.available) {
              if (availabilityCheck.nextAvailable) {
                responseMessage = SMS_TEMPLATES.serviceTooLong(service, conversationState.time, availabilityCheck.nextAvailable);
              } else {
                responseMessage = `Sorry, ${conversationState.dateStr} doesn't have enough time for ${service.name}.\n\nReply "AVAILABLE" to see other dates. - Bueno Brows` + A2P_FOOTER;
              }
              await clearConversationState(from);
              break;
            }
            
            // Service fits! Check if customer has email
            const customerData = customer.docs[0]?.data();
            if (customerData?.email) {
              // Skip email step, go directly to name
              console.log('✅ Customer has email, skipping email collection');
              responseMessage = SMS_TEMPLATES.bookingConfirmName();
              await saveConversationState(from, {
                type: 'awaiting_name',
                date: conversationState.date,
                dateStr: conversationState.dateStr,
                time: conversationState.time,
                serviceId: service.id,
                serviceName: service.name,
                serviceDuration: service.duration,
                servicePrice: service.price,
                customerEmail: customerData.email, // Use existing email
                awaitingName: true
              });
            } else {
              // New customer, ask for email
              console.log('📧 Customer has no email, asking for it');
              responseMessage = SMS_TEMPLATES.bookingConfirm(conversationState.dateStr, conversationState.time);
              await saveConversationState(from, {
                type: 'awaiting_email',
                date: conversationState.date,
                dateStr: conversationState.dateStr,
                time: conversationState.time,
                serviceId: service.id,
                serviceName: service.name,
                serviceDuration: service.duration,
                servicePrice: service.price,
                awaitingEmail: true
              });
            }
          } else {
            responseMessage = SMS_TEMPLATES.error();
            await clearConversationState(from);
          }
          break;
        
        case 'provide_email':
          // User provided email - now ask for name
          if (conversationState && conversationState.awaitingEmail) {
            // Check if date is in the past
            const bookingDateFromState = new Date(conversationState.date);
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
            const bookingDateStart = new Date(bookingDateFromState);
            bookingDateStart.setHours(0, 0, 0, 0);
            const minBookingDate = new Date(minBookingTime);
            minBookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDateStart < minBookingDate) {
              responseMessage = `Sorry, ${conversationState.dateStr} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            const customerEmail = parsed.data.email;
            
            responseMessage = SMS_TEMPLATES.bookingConfirmName();
            await saveConversationState(from, {
              type: 'awaiting_name',
              date: conversationState.date,
              dateStr: conversationState.dateStr,
              time: conversationState.time,
              serviceId: conversationState.serviceId,
              serviceName: conversationState.serviceName,
              serviceDuration: conversationState.serviceDuration,
              servicePrice: conversationState.servicePrice,
              customerEmail, // Save email for later
              awaitingName: true
            });
          } else {
            responseMessage = SMS_TEMPLATES.error();
            await clearConversationState(from);
          }
          break;
          
        case 'provide_name':
          // User provided name - create the appointment!
          if (conversationState && conversationState.awaitingName) {
            const customerName = parsed.data.name;
            console.log('📝 Customer provided name:', customerName);
            console.log('📋 Current conversation state:', JSON.stringify(conversationState));
            
            // Check if date is in the past (with 2 hour minimum booking buffer)
            const bookingDateFromState = new Date(conversationState.date);
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
            const bookingDateStart = new Date(bookingDateFromState);
            bookingDateStart.setHours(0, 0, 0, 0);
            const minBookingDate = new Date(minBookingTime);
            minBookingDate.setHours(0, 0, 0, 0);
            
            if (bookingDateStart < minBookingDate) {
              responseMessage = `Sorry, ${conversationState.dateStr} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            // Parse appointment date/time in BUSINESS TIMEZONE (Pacific)
            const businessTimezone = 'America/Los_Angeles';
            const dateISO = conversationState.date.split('T')[0]; // Extract YYYY-MM-DD
            
            // Parse the time string using our helper
            const parsedTime = parseTimeString(conversationState.time);
            if (!parsedTime) {
              responseMessage = `Sorry, I couldn't understand the time "${conversationState.time}". Please try again or call (650) 613-8455. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            // Create appointment in Pacific timezone
            const localTimeStr = `${dateISO}T${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}:00`;
            const appointmentDate = fromZonedTime(localTimeStr, businessTimezone);
            
            // Validate that appointment datetime is in the future (with 2 hour minimum buffer)
            const nowForFinal = new Date();
            const minBookingTimeForFinal = new Date(nowForFinal.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
            
            if (appointmentDate < minBookingTimeForFinal) {
              const dateTimeStr = appointmentDate.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                timeZone: businessTimezone
              });
              responseMessage = `Sorry, ${dateTimeStr} is in the past or too soon (need at least 2 hours notice). 😕\n\nPlease choose a future time. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            // Double-check availability (race condition protection)
            const finalCheck = await isSlotAvailableForDuration(appointmentDate, conversationState.serviceDuration);
            
            if (!finalCheck) {
              responseMessage = `Oops! That time was just taken. 😕\n\nReply "AVAILABLE" to see current openings. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            try {
              // Update customer name and email
              const customerData = customer.docs[0]?.data();
              const updateData: any = { 
                name: customerName, // Always update name from SMS booking
                updatedAt: new Date().toISOString() 
              };
              
              // Update email if provided and not already set
              if (conversationState.customerEmail) {
                updateData.email = conversationState.customerEmail;
              }
              
              console.log('👤 Updating customer:', customerId, 'with:', updateData);
              await db.collection('customers').doc(customerId).update(updateData);
              console.log('✅ Customer updated successfully');
              
              // Create the appointment directly using admin SDK with transaction
              const appointmentRef = db.collection('appointments').doc();
              const startISO = appointmentDate.toISOString();
              const endMs = appointmentDate.getTime() + (conversationState.serviceDuration * 60 * 1000);
              const endISO = new Date(endMs).toISOString();
              
              console.log('📅 Creating SMS appointment:', {
                customerName: customerName,
                customerId: customerId,
                date: dateISO,
                time: conversationState.time,
                parsedTime: parsedTime,
                appointmentDateUTC: appointmentDate.toISOString(),
                appointmentDateLocal: appointmentDate.toLocaleString('en-US', { timeZone: businessTimezone }),
                startISO,
                endISO
              });
              
              await db.runTransaction(async (transaction) => {
                // Check for conflicts within transaction
                const windowStartISO = new Date(appointmentDate.getTime() - (conversationState.serviceDuration * 60 * 1000)).toISOString();
                
                const conflictQuery = await db.collection('appointments')
                  .where('start', '>=', windowStartISO)
                  .where('start', '<', endISO)
                  .get();
                
                // Check for overlaps (filter status in memory)
                for (const doc of conflictQuery.docs) {
                  const apt = doc.data();
                  
                  // Skip cancelled/completed appointments
                  if (apt.status === 'cancelled' || apt.status === 'no-show' || apt.status === 'completed') {
                    continue;
                  }
                  const aptStart = new Date(apt.start);
                  const aptEnd = new Date(aptStart.getTime() + (apt.duration * 60 * 1000));
                  const newStart = appointmentDate;
                  const newEnd = new Date(endMs);
                  
                  if (newStart < aptEnd && newEnd > aptStart) {
                    throw new Error('OVERLAP');
                  }
                }
                
                // No conflicts - create appointment as PENDING first (will update to confirmed after)
                const appointmentData = {
                  customerId: customerId,
                  customerName: customerName,
                  customerEmail: conversationState.customerEmail || customerData?.email || '',
                  customerPhone: from,
                  serviceId: conversationState.serviceId,
                  serviceIds: [conversationState.serviceId],
                  start: startISO,
                  end: endISO,
                  duration: conversationState.serviceDuration,
                  status: 'pending', // Create as pending first to trigger email on confirmation
                  notes: `Booked via SMS`,
                  bookedPrice: conversationState.servicePrice,
                  servicePrices: { [conversationState.serviceId]: conversationState.servicePrice },
                  attendance: 'pending',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                console.log('💾 Setting appointment data:', JSON.stringify(appointmentData));
                transaction.set(appointmentRef, appointmentData);
              });
              
              // Update to confirmed to trigger email notifications
              await appointmentRef.update({
                status: 'confirmed',
                updatedAt: new Date().toISOString()
              });
              
              console.log('✅ Appointment created via SMS:', appointmentRef.id);
              
              // Email will be automatically triggered by onAppointmentConfirmedSendEmail
              responseMessage = SMS_TEMPLATES.bookingCompleteWithEmail(
                customerName, 
                conversationState.serviceName,
                conversationState.dateStr, 
                conversationState.time
              );
              
            } catch (error: any) {
              console.error('Error creating appointment:', error);
              
              if (error.message === 'OVERLAP') {
                responseMessage = `That slot was just taken! 😕\n\nReply "AVAILABLE" for current openings. - Bueno Brows` + A2P_FOOTER;
              } else {
                responseMessage = `Something went wrong creating your booking. Please call us at (650) 613-8455 to complete your appointment. - Bueno Brows` + A2P_FOOTER;
              }
            }
            
            await clearConversationState(from);
          } else {
            responseMessage = SMS_TEMPLATES.error();
            await clearConversationState(from);
          }
          break;
          
        case 'faq':
          responseMessage = SMS_TEMPLATES.faq(parsed.data.question, parsed.data.answer);
          await clearConversationState(from);
          break;
          
        case 'gemini_question':
          // Check if this is an availability-related question (earliest, next appointment, etc.)
          const questionText = parsed.data.message.toLowerCase();
          const isAvailabilityQuestion = questionText.includes('earliest') || 
                                         questionText.includes('next appt') ||
                                         questionText.includes('next appointment') ||
                                         questionText.includes('when can') ||
                                         questionText.includes('when are you') ||
                                         questionText.includes('soonest');
          
          if (isAvailabilityQuestion) {
            // Treat as availability request - show next available slots
            console.log('📅 Question is about availability, showing next slots');
            const nextSlots = await getAvailableSlots(3, 7); // Get top 3 slots
            if (nextSlots.length > 0) {
              const earliestSlot = nextSlots[0];
              responseMessage = `Our earliest available appointment is ${earliestSlot}. ✨\n\nOther options:\n${nextSlots.slice(1, 3).join('\n')}\n\nWould you like to book one? Reply with the time or "AVAILABLE" for more options. - Bueno Brows` + A2P_FOOTER;
            } else {
              responseMessage = `I'm checking our calendar... Please call (650) 613-8455 for the earliest availability, or reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
            }
            await clearConversationState(from);
            break;
          }
          
          // Use full Gemini AI for other conversational responses
          console.log('🤖 Using Gemini AI for conversational response');
          try {
            // Get real-time business data for context
            const [servicesSnapshot] = await Promise.all([
              db.collection('services').where('active', '==', true).get()
            ]);
            let services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter out consultation services and event services (they're not regular bookable services)
            services = services.filter((s: any) => {
              const nameLower = (s.name || '').toLowerCase();
              const categoryLower = (s.category || '').toLowerCase();
              const isConsultation = nameLower.includes('consultation') || nameLower.includes('consult');
              const isEvent = categoryLower === 'events';
              return !isConsultation && !isEvent;
            });
            
            const availableSlots = await getAvailableSlots(5, 7);
            
            // Get customer info (already fetched earlier in the function)
            const customerData = customer.docs[0]?.data() || {};
            
            const context = {
              availableSlots,
              services,
              customer: {
                phoneNumber: from,
                name: customerData.name || 'New customer'
              }
            };
            
            const aiResponse = await callGeminiAI(parsed.data.message, context, from, geminiApiKey.value());
            responseMessage = aiResponse + A2P_FOOTER;
          } catch (error: any) {
            console.error('Error calling Gemini AI:', error);
            responseMessage = `I'm having trouble understanding that. 😕\n\nText "HELP" for commands or call (650) 613-8455 for assistance. - Bueno Brows` + A2P_FOOTER;
          }
          await clearConversationState(from);
          break;
          
        case 'booking_help':
          responseMessage = SMS_TEMPLATES.booking_instructions();
          await clearConversationState(from);
          break;
          
        case 'help':
          responseMessage = SMS_TEMPLATES.booking_instructions();
          await clearConversationState(from);
          break;
          
        case 'weekly_grid_request':
          console.log('📅 Generating weekly availability grid...');
          const weeklyGrid = await getWeeklyAvailabilityGrid();
          responseMessage = SMS_TEMPLATES.weeklyGrid(weeklyGrid);
          await clearConversationState(from);
          break;
          
        case 'booking_request':
          // User sent "BOOK [date] [time]" - process the booking
          if (parsed.data.date && parsed.data.time) {
            // Parse the date (create at UTC noon to avoid timezone issues)
            let bookingDate: Date | null = null;
            const dateStr = parsed.data.date.replace(/[\/\-]/g, '/');
            const dateParts = dateStr.split('/');
            
            if (dateParts.length === 3) {
              // Format: MM/DD/YY or MM/DD/YYYY - year is explicitly provided
              const month = parseInt(dateParts[0]) - 1;
              const day = parseInt(dateParts[1]);
              let year = parseInt(dateParts[2]);
              const currentYear = new Date().getFullYear();
              const now = new Date();
              const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
              
              // Handle 2-digit year (e.g., "26" = 2026, "25" = 2025)
              if (year < 100) {
                // For booking purposes, assume 2-digit years are in the 2000s
                // "26" = 2026, "25" = 2025, etc.
                year = 2000 + year;
              }
              
              // Parse the time to check full datetime
              const parsedTime = parseTimeString(parsed.data.time);
              
              if (parsedTime) {
                const businessTimezone = 'America/Los_Angeles';
                const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const localTimeStr = `${dateISO}T${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}:00`;
                const { fromZonedTime } = await import('date-fns-tz');
                const appointmentDateTime = fromZonedTime(localTimeStr, businessTimezone);
                
                // Check if this datetime is in the future
                if (appointmentDateTime >= minBookingTime) {
                  bookingDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
                } else {
                  // Date is in the past - reject it
                  const dateDisplay = new Date(Date.UTC(year, month, day, 12, 0, 0)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeDisplay = parsed.data.time.toUpperCase();
                  responseMessage = `Sorry, ${dateDisplay} at ${timeDisplay} is in the past or too soon (need at least 2 hours notice). 😕\n\nPlease choose a future date and time. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                  await clearConversationState(from);
                  break;
                }
              } else {
                // No time parsed - use date-only logic
                bookingDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
                const bookingDateStart = new Date(bookingDate);
                bookingDateStart.setUTCHours(0, 0, 0, 0);
                const minBookingDate = new Date(minBookingTime);
                minBookingDate.setUTCHours(0, 0, 0, 0);
                
                // Check if date is in the past
                if (bookingDateStart < minBookingDate) {
                  const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                  await clearConversationState(from);
                  break;
                }
              }
            } else if (dateParts.length === 2) {
              // Format: MM/DD - check with time FIRST before assuming next year
              const month = parseInt(dateParts[0]) - 1;
              const day = parseInt(dateParts[1]);
              const currentYear = new Date().getFullYear();
              const now = new Date();
              const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
              
              // Parse the time to check full datetime
              const parsedTime = parseTimeString(parsed.data.time);
              
              // Try current year first with the actual time
              if (parsedTime) {
                const businessTimezone = 'America/Los_Angeles';
                const dateISO = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const localTimeStr = `${dateISO}T${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}:00`;
                const { fromZonedTime } = await import('date-fns-tz');
                const appointmentDateTime = fromZonedTime(localTimeStr, businessTimezone);
                
                // If current year datetime is in the future, use it
                if (appointmentDateTime >= minBookingTime) {
              bookingDate = new Date(Date.UTC(currentYear, month, day, 12, 0, 0));
                } else {
                  // Current year datetime is in the past - check if it's clearly a past date
                  const currentMonth = now.getMonth();
                  const currentDay = now.getDate();
                  
                  // If the requested month/day is in the past (same month but past day, or previous month), reject it immediately
                  if (month < currentMonth || (month === currentMonth && day < currentDay)) {
                    const dateDisplay = new Date(Date.UTC(currentYear, month, day, 12, 0, 0)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                    await clearConversationState(from);
                    break;
                  }
                  
                  // Date is in current month but the day hasn't happened yet, or it's a future month
                  // But the datetime with time is still in the past - this means the time has passed today
                  // Reject it - they need to choose a future time
                  const dateDisplay = new Date(Date.UTC(currentYear, month, day, 12, 0, 0)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const timeDisplay = parsed.data.time.toUpperCase();
                  responseMessage = `Sorry, ${dateDisplay} at ${timeDisplay} is in the past or too soon (need at least 2 hours notice). 😕\n\nPlease choose a future date and time. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                  await clearConversationState(from);
                  break;
                }
              } else {
                // No time parsed - use date-only logic
                const currentMonth = now.getMonth();
                const currentDay = now.getDate();
                
                // If the requested month/day is clearly in the past (same month but past day, or previous month), reject it immediately
                if (month < currentMonth || (month === currentMonth && day < currentDay)) {
                  const dateDisplay = new Date(Date.UTC(currentYear, month, day, 12, 0, 0)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                  await clearConversationState(from);
                  break;
                }
                
                // Date is in current month (future day) or future month - use current year
                bookingDate = new Date(Date.UTC(currentYear, month, day, 12, 0, 0));
                const bookingDateStart = new Date(bookingDate);
                bookingDateStart.setHours(0, 0, 0, 0);
                const minBookingDate = new Date(minBookingTime);
                minBookingDate.setHours(0, 0, 0, 0);
                
                // Double-check it's actually in the future
                if (bookingDateStart < minBookingDate) {
                  // This shouldn't happen given the check above, but just in case
                  const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                  await clearConversationState(from);
                  break;
                }
              }
            }
            
            if (!bookingDate) {
              responseMessage = `Sorry, I couldn't understand the date "${parsed.data.date}". 😕\n\nPlease try: "What's available on the 9th?" or "AVAILABLE" to see open slots. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            // Check if date is in the past (with 2 hour minimum booking buffer)
            // IMPORTANT: Do this check BEFORE asking for service
            const now = new Date();
            const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
            const bookingDateStart = new Date(bookingDate);
            bookingDateStart.setUTCHours(0, 0, 0, 0);
            const minBookingDate = new Date(minBookingTime);
            minBookingDate.setUTCHours(0, 0, 0, 0);
            
            // Also check if the date (with time) would be in the past
            // Parse the time to get full datetime
            const parsedTime = parseTimeString(parsed.data.time);
            if (parsedTime) {
              const businessTimezone = 'America/Los_Angeles';
              const dateISO = bookingDate.toISOString().split('T')[0];
              const localTimeStr = `${dateISO}T${String(parsedTime.hours).padStart(2, '0')}:${String(parsedTime.minutes).padStart(2, '0')}:00`;
              const { fromZonedTime } = await import('date-fns-tz');
              const appointmentDateTime = fromZonedTime(localTimeStr, businessTimezone);
              
              if (appointmentDateTime < minBookingTime) {
                const dateTimeDisplay = appointmentDateTime.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZone: businessTimezone
                });
                responseMessage = `Sorry, ${dateTimeDisplay} is in the past or too soon (need at least 2 hours notice). 😕\n\nPlease choose a future date and time. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                await clearConversationState(from);
                break;
              }
            }
            
            // Check if just the date (without time) is in the past
            if (bookingDateStart < minBookingDate) {
              const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            // Check availability for this date
            const availableTimes = await getAvailableSlotsForDate(bookingDate);
            
            if (availableTimes.length === 0) {
              const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              responseMessage = `Sorry, we don't have availability on ${dateDisplay}. 😕\n\nReply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              break;
            }
            
            // Check if their requested time is available
            const requestedTime = parsed.data.time.toUpperCase();
            const timeAvailable = availableTimes.some(t => timeMatches(requestedTime, t));
            
            if (timeAvailable) {
              // Time is available - show top 5 most booked services
              const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              console.log('📋 Getting top 5 most booked services...');
              const top5ServicesList = await getTop5MostBookedServices();
              
              responseMessage = `Great! Which service?\n\n${top5ServicesList.map((s, i) => 
                `${i+1}. ${s.name} - $${s.price} (${s.duration}min)`
              ).join('\n')}\n\nView all: buenobrows.com/services\n\nReply with number or name. - Bueno Brows` + A2P_FOOTER;
              
              await saveConversationState(from, {
                type: 'awaiting_service',
                date: bookingDate.toISOString(),
                dateStr: dateDisplay,
                time: requestedTime,
                pendingTimes: [requestedTime],
                awaitingService: true,
                availableServices: top5ServicesList
              });
            } else {
              // Time not available - show what IS available and save state for time selection
              const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              responseMessage = `${requestedTime} isn't available on ${dateDisplay}. Here's what we have:\n\n${availableTimes.slice(0, 5).join('\n')}\n\nReply with a time to continue booking! - Bueno Brows` + A2P_FOOTER;
              
              // Save conversation state so they can select a time
              await saveConversationState(from, {
                type: 'awaiting_time',
                date: bookingDate.toISOString(),
                dateStr: dateDisplay,
                pendingTimes: availableTimes,
                awaitingTime: true
              });
            }
          } else if (parsed.data.date && !parsed.data.time) {
            // User sent "BOOK [date]" without time - validate date and ask for time
            console.log('📅 Processing booking request with date only:', parsed.data.date);
            let bookingDate: Date | null = null;
            const dateStr = parsed.data.date.replace(/[\/\-]/g, '/');
            const dateParts = dateStr.split('/');
            
            if (dateParts.length === 3) {
              // Format: MM/DD/YY or MM/DD/YYYY
              const month = parseInt(dateParts[0]) - 1;
              const day = parseInt(dateParts[1]);
              let year = parseInt(dateParts[2]);
              const currentYear = new Date().getFullYear();
              const now = new Date();
              const minBookingTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
              
              // Handle 2-digit year
              if (year < 100) {
                year = 2000 + year;
              }
              
              bookingDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
              const bookingDateStart = new Date(bookingDate);
              bookingDateStart.setUTCHours(0, 0, 0, 0);
              const minBookingDate = new Date(minBookingTime);
              minBookingDate.setUTCHours(0, 0, 0, 0);
              
              // Check if date is in the past
              if (bookingDateStart < minBookingDate) {
                const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                await clearConversationState(from);
                break;
              }
            } else if (dateParts.length === 2) {
              // Format: MM/DD
              const month = parseInt(dateParts[0]) - 1;
              const day = parseInt(dateParts[1]);
              const currentYear = new Date().getFullYear();
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentDay = now.getDate();
              
              // If the requested month/day is clearly in the past, reject it immediately
              if (month < currentMonth || (month === currentMonth && day < currentDay)) {
                const dateDisplay = new Date(Date.UTC(currentYear, month, day, 12, 0, 0)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                responseMessage = `Sorry, ${dateDisplay} is in the past. 😕\n\nPlease choose a future date. Reply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
                await clearConversationState(from);
                break;
              }
              
              // Date is in current month (future day) or future month - use current year
              bookingDate = new Date(Date.UTC(currentYear, month, day, 12, 0, 0));
            }
            
            if (!bookingDate) {
              responseMessage = `Sorry, I couldn't understand the date "${parsed.data.date}". 😕\n\nPlease try: "Book 12/1 10AM" or "AVAILABLE" to see open slots. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            // Get available times for this date
            const availableTimes = await getAvailableSlotsForDate(bookingDate);
            
            if (availableTimes.length === 0) {
              const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              responseMessage = `Sorry, we don't have availability on ${dateDisplay}. 😕\n\nReply "AVAILABLE" to see our next open dates. - Bueno Brows` + A2P_FOOTER;
              await clearConversationState(from);
              break;
            }
            
            // Date is valid and has availability - ask for time
            const dateDisplay = bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            responseMessage = `Great! What time on ${dateDisplay}? ⏰\n\nAvailable times:\n${availableTimes.slice(0, 5).join('\n')}${availableTimes.length > 5 ? `\n\n...and ${availableTimes.length - 5} more` : ''}\n\nReply with a time (e.g., "10AM" or "2:30PM"). - Bueno Brows` + A2P_FOOTER;
            
            // Save conversation state so when they provide time, we can continue booking
            await saveConversationState(from, {
              type: 'awaiting_time',
              date: bookingDate.toISOString(),
              dateStr: dateDisplay,
              pendingTimes: availableTimes,
              awaitingTime: true
            });
          } else {
            responseMessage = SMS_TEMPLATES.booking_instructions();
          }
          break;
          
        default:
          // Check attempts and suggest calling after 2 failures
          const attempts = conversationState?.attempts || 0;
          
          if (attempts >= 2) {
            console.log('❌ Too many failed attempts, suggesting to call');
            responseMessage = SMS_TEMPLATES.tooManyAttempts();
            await clearConversationState(from);
          } else {
            console.log(`⚠️ Error parsing message (attempt ${attempts + 1}/3)`);
            responseMessage = SMS_TEMPLATES.error();
            
            // Save state with incremented attempts if we have conversation state
            if (conversationState) {
              await saveConversationState(from, {
                ...conversationState,
                attempts: attempts + 1
              });
            }
          }
          break;
      }
      
      // Send response
      const twilioConfig = getTwilioConfig();
      const smsMessage: SMSMessage = {
        to: from,
        from: to || twilioConfig.phoneNumber || '+16506839181',
        body: responseMessage,
        customerId,
        type: parsed.type as any
      };
      
      const sent = await sendSMS(smsMessage, twilioConfig);
      
      // Store outgoing message
      if (sent) {
        await db.collection('sms_conversations').add({
          customerId,
          phoneNumber: from,
          message: responseMessage,
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          messageType: parsed.type
        });
      }
      
      // Send simple response (AWS SNS doesn't use TwiML)
      res.status(200).json({
        success: true,
        response: responseMessage,
        message: 'SMS processed successfully'
      });
      
    } catch (error) {
      console.error('Error handling SMS:', error);
      res.status(500).send('Error processing SMS');
    }
  }
);

// Send SMS to customer (admin function)
export const sendSMSToCustomer = onCall(
  { 
    region: 'us-central1', 
    cors: true, 
    enforceAppCheck: true,
    secrets: [twilioAccountSid, twilioAuthToken]
  },
  async (req) => {
    const { phoneNumber, message, customerId } = req.data || {};
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    // SECURITY FIX: Require admin role
    const userToken = req.auth?.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    if (!phoneNumber || !message) {
      throw new HttpsError('invalid-argument', 'Missing phone number or message');
    }
    
    // SECURITY: Rate limit SMS sending (5 per 5 minutes per phone number)
    await consumeRateLimit(rateLimiters.sendSMS, `phone:${phoneNumber}`);
    
    try {
      const twilioConfig = getTwilioConfig();
      const smsMessage: SMSMessage = {
        to: phoneNumber,
        from: twilioConfig.phoneNumber || '+16506839181',
        body: message,
        customerId,
        type: 'admin_message'
      };
      
      const sent = await sendSMS(smsMessage, twilioConfig);
      
      if (sent) {
        // Store in conversation log
        await db.collection('sms_conversations').add({
          customerId,
          phoneNumber,
          message,
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          messageType: 'admin_message',
          sentBy: userId
        });
      }
      
      return { success: sent };
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new HttpsError('internal', 'Error sending SMS');
    }
  }
);

// Test SMS function (for testing AWS SNS)
export const testSMS = onCall(
  { 
    region: 'us-central1', 
    cors: true,
    secrets: [twilioAccountSid, twilioAuthToken]
  },
  async (req) => {
    const { phoneNumber, message } = req.data || {};
    
    if (!phoneNumber || !message) {
      throw new HttpsError('invalid-argument', 'Missing phone number or message');
    }
    
    try {
      const twilioConfig = getTwilioConfig();
      const smsMessage: SMSMessage = {
        to: phoneNumber,
        from: twilioConfig.phoneNumber || '+16506839181',
        body: message,
        type: 'admin_message'
      };
      
      const sent = await sendSMS(smsMessage, twilioConfig);
      return { success: sent, message: 'Test SMS sent' };
      
    } catch (error) {
      console.error('Error sending test SMS:', error);
      throw new HttpsError('internal', 'Error sending test SMS');
    }
  }
);

// Get SMS conversation history
export const getSMSConversation = onCall(
  { region: 'us-central1', cors: true, enforceAppCheck: true },
  async (req) => {
    const { customerId } = req.data || {};
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    if (!customerId) {
      throw new HttpsError('invalid-argument', 'Missing customer ID');
    }
    
    // SECURITY FIX: Prevent IDOR - only allow access to own data or admin
    const isAdmin = req.auth?.token?.role === 'admin';
    const isOwnData = userId === customerId;
    
    if (!isAdmin && !isOwnData) {
      throw new HttpsError('permission-denied', 'Cannot access other customers\' conversations');
    }
    
    try {
      const conversationQuery = db.collection('sms_conversations')
        .where('customerId', '==', customerId)
        .orderBy('timestamp', 'desc')
        .limit(50);
      
      const conversation = await conversationQuery.get();
      const messages = conversation.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { messages };
      
    } catch (error) {
      console.error('Error getting SMS conversation:', error);
      throw new HttpsError('internal', 'Error getting conversation');
    }
  }
);

