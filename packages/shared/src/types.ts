export type ID = string;

// Cost Monitoring Types
export interface CostMonitoringSettings {
  projectId: string;
  budgetThresholds: {
    warning: number;    // 50% of budget
    critical: number;   // 80% of budget
    max: number;        // 100% of budget
  };
  alertEmails: string[];
  autoSync: boolean;
  currency: string;
  lastSyncAt: string;
  sendGridApiKey?: string; // Optional for email alerts
}

export interface CostMetrics {
  date: string; // YYYY-MM-DD
  totalCost: number;
  services: {
    firestore: { reads: number; writes: number; cost: number };
    functions: { invocations: number; cost: number };
    storage: { gb: number; bandwidth: number; cost: number };
    hosting: { bandwidth: number; cost: number };
    geminiAI: { calls: number; cost: number };
    sendGrid: { emails: number; cost: number };
  };
  projectedMonthly: number;
  createdAt: string;
}

export interface CostAlert {
  id: string;
  type: 'warning' | 'critical' | 'exceeded';
  threshold: number;
  currentCost: number;
  projectedCost: number;
  message: string;
  sentAt: string;
  emails: string[];
}

export interface UsageStats {
  firestore: {
    reads: number;
    writes: number;
    deletes: number;
    storage: number; // GB
  };
  functions: {
    invocations: number;
    computeTime: number; // GB-seconds
  };
  storage: {
    totalGB: number;
    downloadsGB: number;
  };
  hosting: {
    bandwidthGB: number;
  };
  geminiAI: {
    requests: number;
    tokens: number;
  };
  sendGrid: {
    emails: number;
  };
}


export interface Service {
  id: ID;
  name: string;
  price: number;
  duration: number; // minutes
  category?: string;
  description?: string;
  imageUrl?: string; // URL to service image
  isPopular?: boolean; // Mark as most popular service
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ServiceCategory {
id: ID;
name: string;
color: string; // hex color code
description?: string;
active: boolean;
createdAt?: any;
updatedAt?: any;
}


export interface Customer {
id: ID;
userId?: string; // Firebase Auth UID - matches the document ID for new customers
name: string;
email?: string;
phone?: string;
profilePictureUrl?: string; // Customer profile picture URL
notes?: string;
structuredNotes?: Array<{
  id: string;
  category: 'general' | 'preferences' | 'allergies' | 'history' | 'special_requests';
  content: string;
  addedBy: string; // admin user ID
  addedAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}>;
lastVisit?: string;
totalVisits?: number;
status?: 'pending'|'active'|'blocked';
consentFormsSigned?: Array<{
  consentId: ID;
  formId: ID;
  version: string;
  signedAt: string;
}>;
// Enhanced identity linking fields for unified customer system
authUid?: string | null; // Firebase Auth UID (if signed up) - for A2P integration
identityStatus?: 'guest' | 'auth' | 'merged' | 'migrated'; // Track identity state
mergedFrom?: string[]; // Array of old customer document IDs that were merged
migratedTo?: string; // If this customer was migrated to a new ID (authUid)
canonicalEmail?: string; // Normalized email (lowercase, trimmed) for consistent querying
canonicalPhone?: string; // Normalized phone (E.164 format: +1234567890) for A2P SMS
createdAt?: any;
updatedAt?: any;
}

export interface Staff {
id: ID;
name: string;
role: string;
email?: string;
phone?: string;
active: boolean;
createdAt?: any;
updatedAt?: any;
}


export interface Appointment {
  id: ID;
  customerId: ID;
  serviceId: ID;
  start: string; // ISO
  duration: number; // minutes
  status: 'confirmed'|'pending'|'cancelled'|'completed'|'no-show';
  notes?: string;
  bookedPrice?: number;
  tip?: number; // Tip amount added by admin
  totalPrice?: number; // Calculated total (bookedPrice + tip)
  isPriceEdited?: boolean; // Flag to indicate if price was manually edited
  priceEditedAt?: string; // When the price was last edited
  priceEditedBy?: string; // Who edited the price
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
  // Edit request tracking
  cancelledForEdit?: boolean; // True if cancelled due to approved edit request
  editRequestId?: string; // ID of the edit request that caused this cancellation
  // Attendance tracking
  attendance?: 'pending' | 'attended' | 'no-show';
  attendanceMarkedAt?: string;
  attendanceMarkedBy?: string;
  completedAt?: string;
  completedBy?: string;
  
  // Override tracking fields
  previousAttendance?: 'pending' | 'attended' | 'no-show';
  attendanceOverrideReason?: string;
  attendanceOverriddenAt?: string;
  attendanceOverriddenBy?: string;
}

export interface AppointmentEditRequest {
  id: ID;
  appointmentId: ID;
  customerId: ID;
  requestedChanges: {
    start?: string;
    serviceIds?: ID[]; // Support multiple services
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

// Day-specific closures and special hours
export interface DayClosure {
id: ID;
date: string; // YYYY-MM-DD format
reason?: string; // e.g., "Holiday", "Emergency closure"
closedBy?: string; // Admin user ID
closedAt?: string; // ISO timestamp
createdAt?: any;
}

export interface SpecialHours {
id: ID;
date: string; // YYYY-MM-DD format
ranges: [string, string][]; // Same format as BusinessHours.slots
reason?: string; // e.g., "Holiday hours", "Special event"
modifiedBy?: string; // Admin user ID
modifiedAt?: string; // ISO timestamp
createdAt?: any;
updatedAt?: any;
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
// Second hero section
hero2Title?: string;
hero2Subtitle?: string;
hero2ImageUrl?: string;
hero2CtaPrimary?: string;
hero2CtaSecondary?: string;
ctaPrimary: string;
ctaSecondary: string;
aboutText: string;
buenoCircleEnabled: boolean;
buenoCircleTitle: string;
buenoCircleDescription: string;
buenoCircleDiscount: number;
galleryPhotos?: string[]; // Array of photo URLs
// Skin Analysis Section
skinAnalysisEnabled: boolean;
skinAnalysisTitle: string;
skinAnalysisSubtitle: string;
skinAnalysisDescription: string;
skinAnalysisImageUrl?: string;
skinAnalysisCTA: string;
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