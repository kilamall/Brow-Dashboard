import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineString } from 'firebase-functions/params';
import sgMail from '@sendgrid/mail';

try { initializeApp(); } catch {}
const db = getFirestore();

const sendgridApiKey = defineString('SENDGRID_API_KEY', {
  description: 'SendGrid API key for sending emails',
  default: ''
});

const FROM_EMAIL = 'hello@buenobrows.com';
const FROM_NAME = 'Bueno Brows';

// Email analysis results to user
export const emailAnalysisResults = onCall(
  { 
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (request) => {
    try {
      const { userEmail, analysisId, analysisType, analysisContent } = request.data;
      
      if (!userEmail || !analysisId || !analysisType || !analysisContent) {
        throw new HttpsError('invalid-argument', 'Missing required parameters');
      }

      // Check if SendGrid is configured
      if (!sendgridApiKey.value()) {
        console.warn('⚠️ SENDGRID_API_KEY not set - email will not be sent');
        return { 
          success: false, 
          message: 'Email service not configured. Please contact support.' 
        };
      }

      // Format the analysis content for email
      let emailContent = '';
      if (typeof analysisContent === 'string') {
        emailContent = analysisContent;
      } else if (analysisContent && typeof analysisContent === 'object') {
        // Format structured analysis data
        emailContent = `
<h2>Your ${analysisType === 'skin' ? 'Skin' : 'Product'} Analysis Results</h2>

${analysisContent.skinType ? `<h3>Skin Type</h3><p>${analysisContent.skinType}</p>` : ''}

${analysisContent.concerns && analysisContent.concerns.length > 0 ? `
<h3>Key Concerns</h3>
<ul>
${analysisContent.concerns.map((concern: string) => `<li>${concern}</li>`).join('')}
</ul>
` : ''}

${analysisContent.recommendations && analysisContent.recommendations.length > 0 ? `
<h3>Recommendations</h3>
<ul>
${analysisContent.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
</ul>
` : ''}

${analysisContent.summary ? `<h3>Summary</h3><p>${analysisContent.summary}</p>` : ''}

${analysisContent.detailedReport ? `<h3>Detailed Report</h3><p>${analysisContent.detailedReport}</p>` : ''}

${analysisContent.facialFeatures ? `
<h3>Facial Features</h3>
<ul>
${Object.entries(analysisContent.facialFeatures).map(([key, value]) => 
  `<li><strong>${key.replace(/([A-Z])/g, ' $1').trim()}:</strong> ${value}</li>`
).join('')}
</ul>
` : ''}

${analysisContent.foundationMatch ? `
<h3>Foundation Match</h3>
${analysisContent.foundationMatch.undertoneRecommendation ? `<p><strong>Undertone:</strong> ${analysisContent.foundationMatch.undertoneRecommendation}</p>` : ''}
${analysisContent.foundationMatch.shadeRange ? `<p><strong>Shade Range:</strong> ${analysisContent.foundationMatch.shadeRange}</p>` : ''}
` : ''}

${analysisContent.recommendedServices && analysisContent.recommendedServices.length > 0 ? `
<h3>Recommended Services</h3>
${analysisContent.recommendedServices.map((service: any) => `
<div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
  <h4>${service.serviceName}</h4>
  <p><strong>Priority:</strong> ${service.priority}</p>
  <p><strong>Reason:</strong> ${service.reason}</p>
  ${service.frequency ? `<p><strong>Frequency:</strong> ${service.frequency}</p>` : ''}
</div>
`).join('')}
` : ''}

<p>Thank you for choosing Bueno Brows for your ${analysisType === 'skin' ? 'skin' : 'product'} analysis!</p>
        `;
      }

      // Send email using SendGrid
      sgMail.setApiKey(sendgridApiKey.value());

      const msg = {
        to: userEmail,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: `Your ${analysisType === 'skin' ? 'Skin' : 'Product'} Analysis Results - Bueno Brows`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8B4513;">Bueno Brows</h1>
            </div>
            ${emailContent}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
              <p>This email was sent from Bueno Brows. If you have any questions, please contact us.</p>
            </div>
          </div>
        `
      };

      await sgMail.send(msg);
      console.log(`Analysis results email sent successfully to ${userEmail}`);
      
      return { 
        success: true, 
        message: 'Analysis results have been sent to your email!' 
      };

    } catch (error: any) {
      console.error('Error sending analysis results email:', error);
      throw new HttpsError('internal', `Failed to send email: ${error.message}`);
    }
  }
);
