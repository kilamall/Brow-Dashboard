import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initSendGrid, sendEmail } from './email.js';

try { initializeApp(); } catch {}
const db = getFirestore();

/**
 * Send admin notification when an appointment edit request is submitted
 */
export const onEditRequestCreated = onDocumentCreated(
  {
    document: 'appointmentEditRequests/{requestId}',
    region: 'us-central1',
  },
  async (event) => {
    const editRequestData = event.data?.data();
    const requestId = event.params.requestId;

    if (!editRequestData) {
      console.log('No edit request data found');
      return;
    }

    console.log('📧 New edit request submitted, sending admin notification...');

    try {
      // Get admin email from settings
      const settingsDoc = await db.collection('settings').doc('admin').get();
      const adminEmail = settingsDoc.exists ? settingsDoc.data()?.email : null;

      if (!adminEmail) {
        console.log('No admin email configured, skipping edit request notification');
        return;
      }

      // Get appointment details
      const appointmentDoc = await db.collection('appointments').doc(editRequestData.appointmentId).get();
      const appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;

      if (!appointmentData) {
        console.log('Appointment not found for edit request');
        return;
      }

      // Get customer details
      const customerDoc = await db.collection('customers').doc(editRequestData.customerId).get();
      const customerData = customerDoc.exists ? customerDoc.data() : null;

      // Get service details
      const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
      const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
      const serviceName = serviceData?.name || 'Unknown Service';

      // Format current appointment details
      const currentDate = new Date(appointmentData.start);
      const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedCurrentTime = currentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Format requested changes
      let requestedChangesText = '';
      if (editRequestData.requestedChanges.start) {
        const newDate = new Date(editRequestData.requestedChanges.start);
        const formattedNewDate = newDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedNewTime = newDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        requestedChangesText += `📅 <strong>New Date/Time:</strong> ${formattedNewDate} at ${formattedNewTime}<br>`;
      }

      if (editRequestData.requestedChanges.serviceIds && editRequestData.requestedChanges.serviceIds.length > 0) {
        requestedChangesText += `🔧 <strong>New Services:</strong> ${editRequestData.requestedChanges.serviceIds.join(', ')}<br>`;
      }

      if (editRequestData.requestedChanges.notes) {
        requestedChangesText += `📝 <strong>Notes:</strong> ${editRequestData.requestedChanges.notes}<br>`;
      }

      if (editRequestData.reason) {
        requestedChangesText += `💭 <strong>Reason:</strong> ${editRequestData.reason}<br>`;
      }

      const adminDashboardLink = `https://bueno-brows-admin.web.app/edit-requests?highlight=${requestId}`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ffcc33 0%, #D8A14A 100%); color: #2c1810; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #1a0f08;">📝 New Edit Request</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
            <h2 style="color: #2c1810; margin-top: 0;">Appointment Edit Request</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c1810; margin-top: 0;">Current Appointment</h3>
              <p><strong>Customer:</strong> ${customerData?.name || 'Unknown Customer'}</p>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Current Date:</strong> ${formattedCurrentDate}</p>
              <p><strong>Current Time:</strong> ${formattedCurrentTime}</p>
              <p><strong>Customer Email:</strong> ${customerData?.email || 'N/A'}</p>
              <p><strong>Customer Phone:</strong> ${customerData?.phone || 'N/A'}</p>
            </div>

            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c1810; margin-top: 0;">Requested Changes</h3>
              ${requestedChangesText || '<p>No specific changes requested.</p>'}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${adminDashboardLink}" style="background: #D8A14A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Review Edit Request
              </a>
            </div>

            <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;

      const msg = {
        to: adminEmail,
        from: { email: 'hello@buenobrows.com', name: 'Bueno Brows Admin' },
        subject: `📝 Edit Request: ${serviceName} - ${customerData?.name || 'Customer'}`,
        html: emailContent,
      };

      await sendEmail(msg);
      console.log('Edit request notification email sent successfully to:', adminEmail);
    } catch (error) {
      console.error('Error sending edit request notification email:', error);
    }
  }
);

/**
 * Send email notification to customer when edit request is approved
 */
export const sendEditApprovalEmail = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    const { editRequestId, appointmentId, customerId } = request.data;

    if (!editRequestId || !appointmentId || !customerId) {
      throw new Error('Missing required parameters');
    }

    console.log('📧 Sending edit approval email...');

    try {
      // Get edit request details
      const editRequestDoc = await db.collection('appointmentEditRequests').doc(editRequestId).get();
      const editRequestData = editRequestDoc.exists ? editRequestDoc.data() : null;

      if (!editRequestData) {
        throw new Error('Edit request not found');
      }

      // Get appointment details
      const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
      const appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;

      if (!appointmentData) {
        throw new Error('Appointment not found');
      }

      // Get customer details
      const customerDoc = await db.collection('customers').doc(customerId).get();
      const customerData = customerDoc.exists ? customerDoc.data() : null;

      if (!customerData?.email) {
        throw new Error('Customer email not found');
      }

      // Get service details
      const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
      const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
      const serviceName = serviceData?.name || 'Unknown Service';

      // Format the new appointment details
      const newDate = new Date(appointmentData.start);
      const formattedDate = newDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = newDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ffcc33 0%, #D8A14A 100%); color: #2c1810; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #1a0f08;">✅ Edit Request Approved</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
            <h2 style="color: #2c1810; margin-top: 0;">Your appointment has been updated!</h2>
            
            <p>Hi ${customerData.name || 'there'},</p>
            
            <p>Great news! Your appointment edit request has been approved. Here are your updated appointment details:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c1810; margin-top: 0;">Updated Appointment Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${appointmentData.notes ? `<p><strong>Notes:</strong> ${appointmentData.notes}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://buenobrows.com" style="background: #D8A14A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Your Appointment
              </a>
            </div>

            <p>If you have any questions or need to make further changes, please don't hesitate to contact us.</p>
            
            <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p>Thank you for choosing Bueno Brows!</p>
              <p><strong>Bueno Brows Team</strong></p>
            </div>
          </div>
        </div>
      `;

      const msg = {
        to: customerData.email,
        from: { email: 'hello@buenobrows.com', name: 'Bueno Brows' },
        subject: `✅ Appointment Updated - ${serviceName} on ${formattedDate}`,
        html: emailContent,
      };

      await sendEmail(msg);
      console.log('Edit approval email sent successfully to:', customerData.email);
      
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending edit approval email:', error);
      throw error;
    }
  }
);
