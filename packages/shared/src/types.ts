export type ID = string;


export interface Service {
id: ID;
name: string;
price: number;
duration: number; // minutes
category?: string;
description?: string;
active: boolean;
createdAt?: any;
updatedAt?: any;
}


export interface Customer {
id: ID;
name: string;
email?: string;
phone?: string;
notes?: string;
lastVisit?: string;
totalVisits?: number;
status?: 'pending'|'active'|'blocked';
consentFormsSigned?: Array<{
  consentId: ID;
  formId: ID;
  version: string;
  signedAt: string;
}>;
createdAt?: any;
updatedAt?: any;
}


export interface Appointment {
id: ID;
customerId: ID;
serviceId: ID;
start: string; // ISO
duration: number; // minutes
status: 'confirmed'|'pending'|'cancelled';
notes?: string;
bookedPrice?: number;
createdAt?: any;
updatedAt?: any;
// Optional convenience to speed overlap queries
end?: string; // ISO (computed from start + duration)
// Additional fields for customer info
customerName?: string;
customerEmail?: string;
customerPhone?: string;
// Confirmation tracking
confirmedAt?: string;
confirmedBy?: string;
cancelledAt?: string;
cancelledBy?: string;
}

export interface AppointmentEditRequest {
id: ID;
appointmentId: ID;
customerId: ID;
requestedChanges: {
  start?: string;
  serviceId?: ID;
  notes?: string;
};
status: 'pending'|'approved'|'denied';
reason?: string; // Customer's reason for the change
adminNotes?: string; // Admin's notes when approving/denying
createdAt?: any;
updatedAt?: any;
processedAt?: string;
processedBy?: string;
}


export interface AnalyticsTargets {
dailyTarget: number;
weeklyTarget: number;
monthlyTarget: number;
defaultCogsRate: number; // % 0..1
}


export interface BusinessHours {
timezone: string; // e.g. "America/Los_Angeles"
slotInterval: number; // minutes
slots: Record<'sun'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat', [string,string][]>; // [["09:00","17:00"]]
}

export interface BusinessInfo {
name: string;
address: string;
city: string;
state: string;
zip: string;
phone: string;
email: string;
instagram?: string;
tiktok?: string;
facebook?: string;
}

export interface HomePageContent {
heroTitle: string;
heroSubtitle: string;
heroImageUrl?: string;
ctaPrimary: string;
ctaSecondary: string;
aboutText: string;
buenoCircleEnabled: boolean;
buenoCircleTitle: string;
buenoCircleDescription: string;
buenoCircleDiscount: number;
galleryPhotos?: string[]; // Array of photo URLs
}

export interface SkinAnalysis {
id: ID;
customerId: ID; // Required - must be logged in
customerEmail: string;
customerName: string;
type: 'skin' | 'products';
imageUrl: string;
analysis: {
  skinType?: string;
  skinTone?: {
    category: string; // e.g., "Fair", "Light", "Medium", "Tan", "Deep"
    undertone: string; // e.g., "Cool", "Warm", "Neutral"
    fitzpatrickScale: number; // 1-6
    hexColor?: string; // Approximate hex color
  };
  foundationMatch?: {
    shadeRange: string; // e.g., "Fair 110-120"
    undertoneRecommendation: string;
    popularBrands?: Array<{
      brand: string;
      shades: string[];
    }>;
  };
  facialFeatures?: {
    eyeShape?: string;
    browShape?: string;
    faceShape?: string;
    lipShape?: string;
  };
  concerns?: string[];
  recommendations?: string[];
  recommendedServices?: Array<{
    serviceName: string;
    reason: string;
    frequency: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  productAnalysis?: {
    products?: Array<{
      name: string;
      usage: string;
      order: number;
      suitability: string;
    }>;
    routine?: string;
  };
  summary: string;
  detailedReport?: string; // Comprehensive report text
};
status: 'pending' | 'completed' | 'error';
createdAt: any;
updatedAt?: any;
}

// Skin Analysis Request (when customer requests a new analysis)
export interface SkinAnalysisRequest {
id: ID;
customerId: ID;
customerEmail?: string;
customerName?: string;
reason?: string;
status: 'pending' | 'approved' | 'rejected';
requestedAt: any;
approvedAt?: any;
approvedBy?: ID;
rejectedAt?: any;
rejectedBy?: ID;
adminNotes?: string;
createdAt: any;
updatedAt?: any;
}

// Consent Form Template
export interface ConsentFormTemplate {
id: ID;
name: string;
version: string; // e.g., "1.0", "1.1"
category: 'general' | 'brow_services' | 'lash_services' | 'wax' | 'tint' | 'other';
title: string;
content: string; // HTML or markdown formatted consent text
sections: Array<{
  heading: string;
  content: string;
  required: boolean;
}>;
active: boolean; // Only one version per category should be active
effectiveDate: string; // ISO date when this version became active
createdAt: any;
updatedAt?: any;
createdBy?: string; // Admin user ID
}

// Customer Consent Record
export interface CustomerConsent {
id: ID;
customerId: ID;
customerName: string;
customerEmail?: string;
customerPhone?: string;
consentFormId: ID; // References ConsentFormTemplate
consentFormVersion: string; // Store version at time of consent
consentFormCategory: string;
agreed: boolean;
signature?: string; // Digital signature (typed name or drawn signature data URL)
ipAddress?: string;
userAgent?: string;
consentedAt: string; // ISO timestamp
expiresAt?: string; // Optional expiration date (e.g., annual renewal)
needsRenewal?: boolean; // Flag when consent form is updated
appointmentId?: ID; // If consent was given during booking
createdAt: any;
updatedAt?: any;
}