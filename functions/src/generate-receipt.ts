import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
// @ts-ignore - pdfkit doesn't have type definitions
import PDFDocument from 'pdfkit';
// @ts-ignore - shared types import
import type { Appointment, Service } from '@buenobrows/shared/types';

try { initializeApp(); } catch {}
const db = getFirestore();
const storage = getStorage();

// Helper function to generate receipt that can be called directly
export async function generateReceiptHelper(appointmentId: string): Promise<{ success: boolean; receiptUrl: string; fileName: string }> {
  // Get appointment data
  const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
  
  if (!appointmentDoc.exists) {
    throw new Error('Appointment not found');
  }
  
  const appointment = appointmentDoc.data() as Appointment;
  
  // Get services data
  const serviceIds = (appointment as any).serviceIds || (appointment as any).selectedServices || [appointment.serviceId];
  const services: Service[] = [];
  
  for (const serviceId of serviceIds) {
    const serviceDoc = await db.collection('services').doc(serviceId).get();
    if (serviceDoc.exists) {
      services.push({ id: serviceDoc.id, ...serviceDoc.data() } as Service);
    }
  }

  // Get business settings
  const settingsDoc = await db.collection('settings').doc('businessInfo').get();
  const businessInfo = settingsDoc.exists ? settingsDoc.data() : {
    businessName: 'Bueno Brows',
    businessAddress: '123 Main Street, Downtown',
    businessPhone: '(555) 123-4567',
    businessEmail: 'hello@buenobrows.com'
  };

  // Generate PDF
  const pdfBuffer = await generateReceiptPDF(appointment, services, businessInfo);
  
  // Upload to Firebase Storage
  const fileName = `receipts/${appointment.customerId}/${appointmentId}_receipt.pdf`;
  const bucket = storage.bucket();
  const file = bucket.file(fileName);
  
  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        appointmentId: appointmentId,
        customerId: appointment.customerId,
        generatedAt: new Date().toISOString()
      }
    }
  });

  // Make file publicly readable
  await file.makePublic();
  
  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
  return {
    success: true,
    receiptUrl: publicUrl,
    fileName: fileName
  };
}

export const generateReceipt = onCall(
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

    const { appointmentId } = req.data || {};
    
    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'Missing appointmentId');
    }

    try {
      return await generateReceiptHelper(appointmentId);
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw new HttpsError('internal', `Failed to generate receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

async function generateReceiptPDF(
  appointment: Appointment, 
  services: Service[], 
  businessInfo: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const buffers: Buffer[] = [];
    
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24)
       .fillColor('#8B4513') // Terracotta color
       .text(businessInfo.businessName || 'Bueno Brows', 50, 50);
    
    doc.fontSize(12)
       .fillColor('#666666')
       .text(businessInfo.businessAddress || '123 Main Street, Downtown', 50, 80)
       .text(`Phone: ${businessInfo.businessPhone || '(555) 123-4567'}`, 50, 95)
       .text(`Email: ${businessInfo.businessEmail || 'hello@buenobrows.com'}`, 50, 110);

    // Receipt title
    doc.fontSize(18)
       .fillColor('#000000')
       .text('RECEIPT', 50, 150);

    // Receipt number and date
    const receiptNumber = `RCP-${appointment.id.substring(0, 8).toUpperCase()}`;
    const serviceDate = new Date(appointment.start);
    
    doc.fontSize(12)
       .fillColor('#666666')
       .text(`Receipt #: ${receiptNumber}`, 50, 180)
       .text(`Date: ${serviceDate.toLocaleDateString('en-US', { 
         weekday: 'long', 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       })}`, 50, 195)
       .text(`Time: ${serviceDate.toLocaleTimeString('en-US', { 
         hour: 'numeric', 
         minute: '2-digit',
         hour12: true 
       })}`, 50, 210);

    // Customer info
    doc.fontSize(14)
       .fillColor('#000000')
       .text('Customer Information', 50, 250);
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Name: ${appointment.customerName || 'N/A'}`, 50, 275);
    
    if (appointment.customerEmail) {
      doc.text(`Email: ${appointment.customerEmail}`, 50, 290);
    }
    
    if (appointment.customerPhone) {
      doc.text(`Phone: ${appointment.customerPhone}`, 50, 305);
    }

    // Services section
    doc.fontSize(14)
       .fillColor('#000000')
       .text('Services Performed', 50, 340);

    let yPosition = 365;
    let totalServicePrice = 0;

    // Check if this is a multi-service appointment with individual prices
    const hasIndividualPrices = appointment.servicePrices && Object.keys(appointment.servicePrices).length > 0;
    
    if (hasIndividualPrices && appointment.servicePrices) {
      // Multi-service with individual prices
      services.forEach((service, index) => {
        const servicePrice = appointment.servicePrices![service.id] || service.price;
        totalServicePrice += servicePrice;
        
        doc.fontSize(12)
           .fillColor('#333333')
           .text(`${index + 1}. ${service.name}`, 50, yPosition)
           .text(`$${servicePrice.toFixed(2)}`, 400, yPosition);
        
        yPosition += 20;
      });
    } else {
      // Single service or legacy pricing
      const servicePrice = appointment.bookedPrice || (services[0]?.price || 0);
      totalServicePrice = servicePrice;
      
      services.forEach((service, index) => {
        doc.fontSize(12)
           .fillColor('#333333')
           .text(`${index + 1}. ${service.name}`, 50, yPosition)
           .text(`$${servicePrice.toFixed(2)}`, 400, yPosition);
        
        yPosition += 20;
      });
    }

    // Subtotal
    yPosition += 10;
    doc.fontSize(12)
       .fillColor('#333333')
       .text('Subtotal:', 50, yPosition)
       .text(`$${totalServicePrice.toFixed(2)}`, 400, yPosition);

    // Tip
    const tipAmount = appointment.tip || 0;
    if (tipAmount > 0) {
      yPosition += 20;
      doc.text('Tip:', 50, yPosition)
         .text(`$${tipAmount.toFixed(2)}`, 400, yPosition);
    }

    // Total
    const totalAmount = totalServicePrice + tipAmount;
    yPosition += 30;
    doc.fontSize(14)
       .fillColor('#000000')
       .text('TOTAL:', 50, yPosition)
       .text(`$${totalAmount.toFixed(2)}`, 400, yPosition);

    // Payment method (if available)
    if (appointment.notes) {
      yPosition += 40;
      doc.fontSize(12)
         .fillColor('#666666')
         .text('Notes:', 50, yPosition)
         .text(appointment.notes, 50, yPosition + 15);
    }

    // Thank you message
    yPosition += 60;
    doc.fontSize(12)
       .fillColor('#8B4513')
       .text('Thank you for choosing Bueno Brows!', 50, yPosition)
       .text('We look forward to seeing you again soon.', 50, yPosition + 20);

    // Rebooking info
    yPosition += 40;
    doc.fontSize(10)
       .fillColor('#666666')
       .text('To book your next appointment, visit our website or call us directly.', 50, yPosition);

    // Footer
    const pageHeight = doc.page.height;
    doc.fontSize(8)
       .fillColor('#999999')
       .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 50, pageHeight - 30)
       .text('This is an automated receipt. No signature required.', 50, pageHeight - 15);

    doc.end();
  });
}
