// functions/src/train-ai-from-admin-messages.ts
// Train Gemini AI on admin's SMS conversation style
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

try { initializeApp(); } catch {}
const db = getFirestore();

interface TrainingMessage {
  customerMessage: string;
  adminResponse: string;
  context: string; // appointment details, service info, etc.
  timestamp: Date;
}

interface TrainingData {
  messages: TrainingMessage[];
  styleProfile: {
    avgLength: number;
    tone: string; // casual, professional, friendly
    commonPhrases: string[];
    punctuationStyle: string;
    greetingStyle: string;
    closingStyle: string;
  };
  lastTrained: Date;
  messageCount: number;
  version: string;
}

/**
 * Extract admin SMS messages from Firestore for training
 */
async function extractAdminMessages(monthsBack: number = 3): Promise<TrainingMessage[]> {
  console.log(`📚 Extracting admin SMS messages from last ${monthsBack} months...`);
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);
  
  const trainingMessages: TrainingMessage[] = [];
  
  try {
    // Query messages collection for admin-sent messages
    const messagesQuery = await db.collection('messages')
      .where('type', '==', 'admin')
      .where('timestamp', '>=', cutoffDate)
      .orderBy('timestamp', 'desc')
      .limit(500) // Limit to most recent 500 messages
      .get();
    
    console.log(`Found ${messagesQuery.size} admin messages`);
    
    // Group messages by conversation to get context
    const conversationMap = new Map<string, any[]>();
    
    messagesQuery.forEach(doc => {
      const data = doc.data();
      const customerId = data.customerId;
      
      if (!conversationMap.has(customerId)) {
        conversationMap.set(customerId, []);
      }
      conversationMap.get(customerId)!.push({
        id: doc.id,
        ...data
      });
    });
    
    // Process each conversation to create training pairs
    for (const [customerId, messages] of conversationMap) {
      // Sort by timestamp ascending
      messages.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return aTime.getTime() - bTime.getTime();
      });
      
      // Find customer message -> admin response pairs
      for (let i = 0; i < messages.length - 1; i++) {
        const current = messages[i];
        const next = messages[i + 1];
        
        // If current is customer message and next is admin response
        if (current.type === 'customer' && next.type === 'admin') {
          // Get context (appointment info if available)
          let context = 'General inquiry';
          if (current.appointmentId) {
            try {
              const apptDoc = await db.collection('appointments').doc(current.appointmentId).get();
              if (apptDoc.exists) {
                const appt = apptDoc.data();
                context = `Appointment: ${appt?.start || 'unknown date'}, Service: ${appt?.serviceId || 'unknown'}`;
              }
            } catch (err) {
              console.log('Could not fetch appointment context:', err);
            }
          }
          
          trainingMessages.push({
            customerMessage: current.content,
            adminResponse: next.content,
            context,
            timestamp: next.timestamp?.toDate?.() || new Date(next.timestamp)
          });
        }
      }
    }
    
    console.log(`✅ Extracted ${trainingMessages.length} training pairs`);
    return trainingMessages;
    
  } catch (error: any) {
    console.error('❌ Error extracting admin messages:', error);
    throw new HttpsError('internal', `Failed to extract messages: ${error.message}`);
  }
}

/**
 * Analyze admin's writing style from messages
 */
function analyzeWritingStyle(messages: TrainingMessage[]): TrainingData['styleProfile'] {
  console.log('🔍 Analyzing admin writing style...');
  
  const responses = messages.map(m => m.adminResponse);
  
  // Calculate average response length
  const avgLength = responses.reduce((sum, r) => sum + r.length, 0) / responses.length;
  
  // Detect common phrases (case-insensitive)
  const phraseMap = new Map<string, number>();
  responses.forEach(response => {
    const words = response.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
    }
  });
  
  // Get top 10 common phrases
  const commonPhrases = Array.from(phraseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase]) => phrase);
  
  // Detect tone (simple heuristic)
  const casualIndicators = ['hey', 'yeah', 'yup', 'nope', 'gonna', 'wanna'];
  const professionalIndicators = ['please', 'thank you', 'certainly', 'regarding'];
  const friendlyIndicators = ['😊', '!', '❤️', 'love', 'excited'];
  
  let casualCount = 0, professionalCount = 0, friendlyCount = 0;
  
  responses.forEach(r => {
    const lower = r.toLowerCase();
    casualIndicators.forEach(word => { if (lower.includes(word)) casualCount++; });
    professionalIndicators.forEach(word => { if (lower.includes(word)) professionalCount++; });
    friendlyIndicators.forEach(word => { if (lower.includes(word)) friendlyCount++; });
  });
  
  let tone = 'professional';
  if (casualCount > professionalCount && casualCount > friendlyCount) tone = 'casual';
  else if (friendlyCount > professionalCount && friendlyCount > casualCount) tone = 'friendly';
  else if (casualCount + friendlyCount > professionalCount) tone = 'casual-friendly';
  
  // Detect punctuation style
  const exclamationCount = responses.filter(r => r.includes('!')).length;
  const punctuationStyle = exclamationCount > responses.length * 0.3 ? 'enthusiastic' : 'neutral';
  
  // Detect greeting and closing styles
  const greetings = responses
    .filter(r => r.length > 10)
    .map(r => r.split(/[.!?]/)[0])
    .filter(g => g.length < 50);
  
  const greetingStyle = greetings.length > 0 ? greetings[0] : 'Hi';
  
  const closings = responses
    .filter(r => r.includes('-'))
    .map(r => r.split('-').pop()?.trim() || '')
    .filter(c => c.length > 0 && c.length < 30);
  
  const closingStyle = closings.length > 0 ? closings[0] : 'Thanks';
  
  console.log('✅ Style analysis complete:', { tone, avgLength: Math.round(avgLength), commonPhrases: commonPhrases.length });
  
  return {
    avgLength: Math.round(avgLength),
    tone,
    commonPhrases,
    punctuationStyle,
    greetingStyle,
    closingStyle
  };
}

/**
 * Create training prompt for Gemini AI
 */
function createTrainingPrompt(trainingData: TrainingData): string {
  const { messages, styleProfile } = trainingData;
  
  const examples = messages.slice(0, 20).map(m => 
    `Customer: "${m.customerMessage}"\nContext: ${m.context}\nAdmin Response: "${m.adminResponse}"`
  ).join('\n\n---\n\n');
  
  return `You are a customer service AI for a beauty salon booking system. Your responses should match the following style:

## Writing Style Profile:
- Tone: ${styleProfile.tone}
- Average response length: ${styleProfile.avgLength} characters
- Punctuation: ${styleProfile.punctuationStyle}
- Typical greeting: "${styleProfile.greetingStyle}"
- Typical closing: "${styleProfile.closingStyle}"
- Common phrases used: ${styleProfile.commonPhrases.slice(0, 5).join(', ')}

## Example Conversations (from actual admin):
${examples}

## Response Guidelines:
1. Match the admin's tone and style exactly
2. Keep responses around ${styleProfile.avgLength} characters
3. Use similar phrases and expressions
4. ${styleProfile.punctuationStyle === 'enthusiastic' ? 'Use exclamation marks naturally' : 'Keep punctuation neutral'}
5. For appointment bookings, availability, pricing, and services - provide helpful information
6. For questions OUTSIDE these topics (personal questions, unrelated topics), respond with: "Thanks for reaching out! For that, please call us directly or visit our website. Is there anything about our services I can help with?"

## Business Context You Can Help With:
- Appointment availability
- Service pricing and descriptions
- Business hours and location
- Booking appointments
- Rescheduling/canceling
- Service recommendations
- Preparation instructions

Remember: Stay in character, match the admin's style, and flag anything outside business scope.`;
}

/**
 * Main training function - callable by admin
 */
export const trainAIFromAdminMessages = onCall(
  { region: 'us-central1', cors: true, memory: '1GiB', timeoutSeconds: 540, secrets: [geminiApiKey] },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    const { monthsBack = 3 } = req.data || {};
    
    try {
      console.log('🚀 Starting AI training from admin messages...');
      
      // Step 1: Extract admin messages
      const messages = await extractAdminMessages(monthsBack);
      
      if (messages.length < 10) {
        throw new HttpsError('failed-precondition', `Need at least 10 training messages. Found: ${messages.length}. Try increasing monthsBack parameter.`);
      }
      
      // Step 2: Analyze writing style
      const styleProfile = analyzeWritingStyle(messages);
      
      // Step 3: Create training data
      const trainingData: TrainingData = {
        messages,
        styleProfile,
        lastTrained: new Date(),
        messageCount: messages.length,
        version: `v${Date.now()}`
      };
      
      // Step 4: Save training data to Firestore
      await db.collection('ai_training').doc('admin_style').set({
        ...trainingData,
        messages: messages.map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString()
        })),
        lastTrained: FieldValue.serverTimestamp()
      });
      
      // Step 5: Create and save training prompt
      const trainingPrompt = createTrainingPrompt(trainingData);
      
      await db.collection('ai_training').doc('current_prompt').set({
        prompt: trainingPrompt,
        createdAt: FieldValue.serverTimestamp(),
        version: trainingData.version,
        messageCount: messages.length,
        styleProfile
      });
      
      console.log('✅ AI training complete!');
      
      return {
        success: true,
        message: 'AI successfully trained on admin message style',
        stats: {
          messagesAnalyzed: messages.length,
          tone: styleProfile.tone,
          avgLength: styleProfile.avgLength,
          version: trainingData.version
        }
      };
      
    } catch (error: any) {
      console.error('❌ Training error:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', `Training failed: ${error.message}`);
    }
  }
);

/**
 * Scheduled quarterly retraining
 */
export const quarterlyAIRetraining = onSchedule(
  {
    // Run at 9:00 AM PT on the 1st day every 3rd month
    schedule: '0 9 1 */3 *',
    timeZone: 'America/Los_Angeles',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 540
  },
  async (event: any) => {
    console.log('🔄 Quarterly AI retraining triggered');
    
    try {
      // Extract last 3 months of messages
      const messages = await extractAdminMessages(3);
      
      if (messages.length < 10) {
        console.log(`⚠️ Not enough messages for retraining: ${messages.length}. Skipping.`);
        return;
      }
      
      const styleProfile = analyzeWritingStyle(messages);
      
      const trainingData: TrainingData = {
        messages,
        styleProfile,
        lastTrained: new Date(),
        messageCount: messages.length,
        version: `v${Date.now()}_auto`
      };
      
      await db.collection('ai_training').doc('admin_style').set({
        ...trainingData,
        messages: messages.map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString()
        })),
        lastTrained: FieldValue.serverTimestamp()
      });
      
      const trainingPrompt = createTrainingPrompt(trainingData);
      
      await db.collection('ai_training').doc('current_prompt').set({
        prompt: trainingPrompt,
        createdAt: FieldValue.serverTimestamp(),
        version: trainingData.version,
        messageCount: messages.length,
        styleProfile,
        autoTrained: true
      });
      
      console.log(`✅ Quarterly retraining complete: ${messages.length} messages analyzed`);
      
      // Log to admin notifications
      await db.collection('admin_notifications').add({
        type: 'ai_retrained',
        message: `AI messaging style updated with ${messages.length} recent conversations`,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
        priority: 'low'
      });
      
    } catch (error: any) {
      console.error('❌ Quarterly retraining failed:', error);
      
      // Notify admin of failure
      await db.collection('admin_notifications').add({
        type: 'ai_training_failed',
        message: `Quarterly AI retraining failed: ${error.message}`,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
        priority: 'medium'
      });
    }
  }
);

