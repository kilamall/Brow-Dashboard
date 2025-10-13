import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

try { initializeApp(); } catch {}
const db = getFirestore();
const messaging = getMessaging();

// Send push notification when a new message is created
export const onMessageCreated = onDocumentCreated(
  'messages/{messageId}',
  async (event) => {
    const messageData = event.data?.data();
    if (!messageData) return;

    // Only send notifications for customer messages (admin messages)
    if (messageData.type !== 'admin') return;

    const { customerId, content, customerName } = messageData;

    try {
      // Get customer's FCM token
      const tokenDoc = await db.collection('customer_tokens').doc(customerId).get();
      if (!tokenDoc.exists) {
        console.log('No FCM token found for customer:', customerId);
        return;
      }

      const tokenData = tokenDoc.data();
      const fcmToken = tokenData?.token;

      if (!fcmToken) {
        console.log('No valid FCM token for customer:', customerId);
        return;
      }

      // Send push notification
      const message = {
        token: fcmToken,
        notification: {
          title: 'New Message from Bueno Brows',
          body: content.length > 100 ? content.substring(0, 100) + '...' : content,
        },
        data: {
          type: 'message',
          customerId,
          messageId: event.params.messageId,
          customerName: customerName || 'Customer',
        },
        webpush: {
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            requireInteraction: true,
            actions: [
              {
                action: 'open',
                title: 'Open Chat'
              }
            ]
          }
        }
      };

      const response = await messaging.send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
);

// Update conversation when message is created
export const onMessageCreatedUpdateConversation = onDocumentCreated(
  'messages/{messageId}',
  async (event) => {
    const messageData = event.data?.data();
    if (!messageData) return;

    const { customerId, content, type, timestamp } = messageData;

    try {
      const conversationRef = db.collection('conversations').doc(customerId);
      
      await conversationRef.set({
        customerId,
        lastMessage: content,
        lastMessageTime: timestamp,
        unreadCount: type === 'customer' ? 1 : 0,
        status: 'active',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Updated conversation for customer:', customerId);
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }
);

// Send appointment reminder notifications
export const onAppointmentCreated = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const appointmentData = event.data?.data();
    if (!appointmentData) return;

    const { customerId, start, customerName, serviceId } = appointmentData;

    try {
      // Get service details
      const serviceDoc = await db.collection('services').doc(serviceId).get();
      const serviceData = serviceDoc.data();
      const serviceName = serviceData?.name || 'Service';

      // Get customer's FCM token
      const tokenDoc = await db.collection('customer_tokens').doc(customerId).get();
      if (!tokenDoc.exists) return;

      const tokenData = tokenDoc.data();
      const fcmToken = tokenData?.token;
      if (!fcmToken) return;

      // Send confirmation notification
      const message = {
        token: fcmToken,
        notification: {
          title: 'Appointment Confirmed!',
          body: `Your ${serviceName} appointment has been confirmed.`,
        },
        data: {
          type: 'appointment_confirmed',
          appointmentId: event.params.appointmentId,
          customerId,
          serviceName,
        }
      };

      await messaging.send(message);
      console.log('Sent appointment confirmation notification');
    } catch (error) {
      console.error('Error sending appointment notification:', error);
    }
  }
);

// Send appointment reminder 24 hours before
export const sendAppointmentReminder = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) return;

    // Check if appointment was just confirmed
    if (beforeData.status !== 'pending' && afterData.status === 'confirmed') {
      const { customerId, start, serviceId } = afterData;
      const appointmentTime = new Date(start);
      const now = new Date();
      const timeDiff = appointmentTime.getTime() - now.getTime();
      
      // If appointment is within 24 hours, send reminder
      if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
        try {
          // Get service details
          const serviceDoc = await db.collection('services').doc(serviceId).get();
          const serviceData = serviceDoc.data();
          const serviceName = serviceData?.name || 'Service';

          // Get customer's FCM token
          const tokenDoc = await db.collection('customer_tokens').doc(customerId).get();
          if (!tokenDoc.exists) return;

          const tokenData = tokenDoc.data();
          const fcmToken = tokenData?.token;
          if (!fcmToken) return;

          const message = {
            token: fcmToken,
            notification: {
              title: 'Appointment Reminder',
              body: `Don't forget! Your ${serviceName} appointment is coming up.`,
            },
            data: {
              type: 'appointment_reminder',
              appointmentId: event.params.appointmentId,
              customerId,
              serviceName,
            }
          };

          await messaging.send(message);
          console.log('Sent appointment reminder notification');
        } catch (error) {
          console.error('Error sending appointment reminder:', error);
        }
      }
    }
  }
);
