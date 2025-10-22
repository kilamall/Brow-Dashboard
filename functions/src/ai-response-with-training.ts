// functions/src/ai-response-with-training.ts
// Enhanced AI messaging with admin style training and out-of-scope detection
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GENERIC_OUT_OF_SCOPE_RESPONSE = "Thanks for reaching out! For that question, please call us directly or visit our website. Is there anything about our beauty services or appointments I can help with?";

interface CustomerMessage {
  customerId: string;
  customerName: string;
  customerPhone?: string;
  message: string;
  appointmentId?: string;
}

interface AIResponse {
  response: string;
  isOutOfScope: boolean;
  confidence: number;
  flaggedForReview: boolean;
  topic?: string;
}

/**
 * Detect if message is out of business scope
 */
function detectOutOfScope(message: string): { isOutOfScope: boolean; topic: string } {
  const lower = message.toLowerCase();
  
  // Business-related keywords
  const businessKeywords = [
    'appointment', 'booking', 'book', 'schedule', 'reschedule', 'cancel',
    'available', 'availability', 'open', 'hours', 'time', 'slot',
    'price', 'cost', 'how much', 'service', 'brow', 'lash', 'wax', 'tint',
    'location', 'address', 'where', 'directions',
    'preparation', 'prepare', 'before', 'after', 'care',
    'recommendation', 'suggest', 'best for', 'should i'
  ];
  
  // Out-of-scope keywords
  const outOfScopeKeywords = [
    'weather', 'news', 'politics', 'recipe', 'joke', 'story',
    'personal life', 'relationship', 'medical advice', 'diagnosis',
    'loan', 'investment', 'cryptocurrency', 'stock',
    'how are you feeling', 'what do you think about', 'your opinion',
    'tell me about yourself', 'who are you', 'are you human',
    'write code', 'solve this', 'homework', 'essay'
  ];
  
  // Check for business keywords
  const hasBusinessKeyword = businessKeywords.some(keyword => lower.includes(keyword));
  
  // Check for out-of-scope keywords
  const hasOutOfScopeKeyword = outOfScopeKeywords.some(keyword => lower.includes(keyword));
  
  // Detect questions that are clearly not business-related
  const isGeneralQuestion = /^(what|who|where|when|why|how) (?:is|are|do|does|did|can|could|would|should)/i.test(message) 
    && !hasBusinessKeyword;
  
  if (hasOutOfScopeKeyword || (isGeneralQuestion && !hasBusinessKeyword)) {
    // Determine topic
    let topic = 'general';
    if (lower.includes('weather')) topic = 'weather';
    else if (lower.includes('news') || lower.includes('politics')) topic = 'current_events';
    else if (lower.includes('medical') || lower.includes('diagnosis')) topic = 'medical';
    else if (lower.includes('personal')) topic = 'personal';
    else if (lower.includes('code') || lower.includes('homework')) topic = 'technical';
    
    return { isOutOfScope: true, topic };
  }
  
  // Very short messages without context might be out of scope
  if (message.length < 15 && !hasBusinessKeyword) {
    return { isOutOfScope: true, topic: 'unclear' };
  }
  
  return { isOutOfScope: false, topic: 'business' };
}

/**
 * Get trained AI prompt from Firestore
 */
async function getTrainedPrompt(): Promise<string | null> {
  try {
    const promptDoc = await db.collection('ai_training').doc('current_prompt').get();
    
    if (!promptDoc.exists) {
      console.log('⚠️ No trained prompt found, using default');
      return null;
    }
    
    const data = promptDoc.data();
    return data?.prompt || null;
    
  } catch (error) {
    console.error('Error fetching trained prompt:', error);
    return null;
  }
}

/**
 * Get customer context for personalized responses
 */
async function getCustomerContext(customerId: string): Promise<any> {
  try {
    const customerDoc = await db.collection('customers').doc(customerId).get();
    
    if (!customerDoc.exists) {
      return { name: 'Customer', hasHistory: false };
    }
    
    const customerData = customerDoc.data();
    
    // Get recent appointments
    const appointmentsQuery = await db.collection('appointments')
      .where('customerId', '==', customerId)
      .orderBy('start', 'desc')
      .limit(3)
      .get();
    
    const recentAppointments = appointmentsQuery.docs.map(doc => doc.data());
    
    return {
      name: customerData?.name || 'Customer',
      hasHistory: recentAppointments.length > 0,
      lastVisit: recentAppointments[0]?.start || null,
      preferredServices: recentAppointments.map(a => a.serviceId).filter((v, i, a) => a.indexOf(v) === i)
    };
    
  } catch (error) {
    console.error('Error getting customer context:', error);
    return { name: 'Customer', hasHistory: false };
  }
}

/**
 * Call Gemini AI with trained prompt
 */
async function callGeminiWithTraining(
  message: string,
  trainedPrompt: string,
  customerContext: any
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.log('⚠️ Gemini API key not configured');
    return 'Thanks for your message! We\'ll get back to you shortly.';
  }
  
  try {
    const contextInfo = customerContext.hasHistory 
      ? `Customer ${customerContext.name} is a returning client.`
      : `Customer ${customerContext.name} is a new client.`;
    
    const fullPrompt = `${trainedPrompt}\n\n## Current Message:\n${contextInfo}\nCustomer asks: "${message}"\n\nYour response (match admin's style):`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
            topP: 0.9,
            topK: 40
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return generatedText.trim();
    
  } catch (error: any) {
    console.error('Error calling Gemini AI:', error);
    throw error;
  }
}

/**
 * Main AI response handler with training and scope detection
 */
export const generateAIResponse = onCall(
  { region: 'us-central1', cors: true, memory: '512MiB', timeoutSeconds: 60 },
  async (req) => {
    const { customerId, customerName, customerPhone, message, appointmentId } = req.data as CustomerMessage;
    
    if (!message || !customerId) {
      throw new HttpsError('invalid-argument', 'customerId and message are required');
    }
    
    try {
      console.log(`🤖 Processing message from ${customerName}: "${message.substring(0, 50)}..."`);
      
      // Step 1: Check if message is out of scope
      const scopeCheck = detectOutOfScope(message);
      
      if (scopeCheck.isOutOfScope) {
        console.log(`⚠️ Out-of-scope message detected: ${scopeCheck.topic}`);
        
        // Flag for admin review
        await db.collection('flagged_messages').add({
          customerId,
          customerName,
          customerPhone,
          message,
          topic: scopeCheck.topic,
          reason: 'out_of_scope',
          timestamp: FieldValue.serverTimestamp(),
          reviewed: false,
          autoResponse: GENERIC_OUT_OF_SCOPE_RESPONSE
        });
        
        // Send generic response
        const response: AIResponse = {
          response: GENERIC_OUT_OF_SCOPE_RESPONSE,
          isOutOfScope: true,
          confidence: 1.0,
          flaggedForReview: true,
          topic: scopeCheck.topic
        };
        
        // Log the interaction
        await db.collection('ai_interactions').add({
          customerId,
          customerMessage: message,
          aiResponse: response.response,
          isOutOfScope: true,
          flagged: true,
          timestamp: FieldValue.serverTimestamp()
        });
        
        return response;
      }
      
      // Step 2: Get trained prompt
      const trainedPrompt = await getTrainedPrompt();
      
      if (!trainedPrompt) {
        throw new HttpsError('failed-precondition', 'AI not trained yet. Admin must run trainAIFromAdminMessages first.');
      }
      
      // Step 3: Get customer context
      const customerContext = await getCustomerContext(customerId);
      
      // Step 4: Generate AI response
      const aiResponse = await callGeminiWithTraining(message, trainedPrompt, customerContext);
      
      // Step 5: Save interaction
      await db.collection('ai_interactions').add({
        customerId,
        customerName,
        customerMessage: message,
        aiResponse,
        isOutOfScope: false,
        flagged: false,
        timestamp: FieldValue.serverTimestamp(),
        appointmentId: appointmentId || null
      });
      
      console.log(`✅ AI response generated: "${aiResponse.substring(0, 50)}..."`);
      
      const response: AIResponse = {
        response: aiResponse,
        isOutOfScope: false,
        confidence: 0.9,
        flaggedForReview: false
      };
      
      return response;
      
    } catch (error: any) {
      console.error('❌ AI response error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', `Failed to generate response: ${error.message}`);
    }
  }
);

/**
 * Get flagged messages for admin review
 */
export const getFlaggedMessages = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    try {
      const flaggedQuery = await db.collection('flagged_messages')
        .where('reviewed', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      const flaggedMessages = flaggedQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        success: true,
        messages: flaggedMessages,
        count: flaggedMessages.length
      };
      
    } catch (error: any) {
      console.error('Error fetching flagged messages:', error);
      throw new HttpsError('internal', `Failed to fetch flagged messages: ${error.message}`);
    }
  }
);

/**
 * Mark flagged message as reviewed
 */
export const markMessageReviewed = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    const { messageId, adminNotes } = req.data;
    
    if (!messageId) {
      throw new HttpsError('invalid-argument', 'messageId is required');
    }
    
    try {
      await db.collection('flagged_messages').doc(messageId).update({
        reviewed: true,
        reviewedAt: FieldValue.serverTimestamp(),
        reviewedBy: req.auth.uid,
        adminNotes: adminNotes || null
      });
      
      return {
        success: true,
        message: 'Message marked as reviewed'
      };
      
    } catch (error: any) {
      console.error('Error marking message as reviewed:', error);
      throw new HttpsError('internal', `Failed to mark as reviewed: ${error.message}`);
    }
  }
);

