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
    twilio: { smsSent: number; smsReceived: number; cost: number };
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
  twilio: {
    smsSent: number;
    smsReceived: number;
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

// ========================= PROMOTIONS & CAMPAIGNS =========================

export type DiscountType = 
  | 'percentage'           // 10% off
  | 'fixed_amount'         // $10 off
  | 'free_service'         // Free service when conditions met
  | 'buy_x_get_y'          // Buy 2, get 1 free
  | 'bundle_discount';     // Book 3 services, save 15%

export type ApplicationMethod = 
  | 'auto_apply'           // Automatically applies
  | 'promo_code'           // Customer enters code
  | 'one_time_code'        // Single-use code
  | 'manual';              // Admin applies

export type CustomerSegment = 
  | 'all'
  | 'new_customers'        // 0 visits
  | 'returning_customers'  // 1+ visits
  | 'loyalty_milestone'    // Xth visit
  | 'inactive_customers'   // Haven't booked in X days
  | 'specific_customers'   // Custom customer list
  | 'birthday';            // Birthday customers

export interface Promotion {
  id: ID;
  name: string;
  description?: string;
  
  // Campaign Status & Scheduling
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'ended';
  scheduledStart?: string; // ISO date string
  scheduledEnd?: string;   // ISO date string
  startedAt?: string;      // When campaign actually started
  endedAt?: string;        // When campaign ended
  
  // Discount Configuration
  discountType: DiscountType;
  discountValue: number;   // 10 for 10% or $10
  discountConfig?: {
    buyQuantity?: number;  // For BOGO: buy 2
    getQuantity?: number;  // For BOGO: get 1
    bundleSize?: number;   // For bundle: 3 services
    freeServiceId?: string; // For free_service: service ID
  };
  
  // Application Method
  applicationMethod: ApplicationMethod;
  promoCode?: string;      // If code-based: "SUMMER2025"
  codeFormat?: 'custom' | 'auto_generated'; // For code generation
  oneTimeCodes?: string[]; // Array of single-use codes
  
  // Targeting - Services/Categories
  appliesTo: 'all' | 'services' | 'categories';
  serviceIds?: string[];   // Specific services
  categoryNames?: string[];// Specific categories
  excludeServiceIds?: string[];     // Never apply to these services
  excludeCategoryNames?: string[];  // Never apply to these categories
  
  // Targeting - Customer Segments
  customerSegment: CustomerSegment;
  segmentConfig?: {
    visitCount?: number;        // For loyalty_milestone: 5
    inactiveDays?: number;      // For inactive_customers: 30
    customerIds?: string[];     // For specific_customers
    birthdayWindow?: {
      daysBefore?: number;      // Send email X days before (default: 7)
      daysAfter?: number;       // Valid X days after birthday (default: 7)
      sendEmail?: boolean;      // Auto-send birthday email
      emailTemplate?: string;   // Email template ID to use
    };
  };
  
  // Conditions
  minPurchaseAmount?: number;   // Minimum $ to qualify
  maxUses?: number;             // Total uses (null = unlimited)
  maxUsesPerCustomer?: number;  // Per customer limit (null = unlimited)
  stackable: boolean;           // Can combine with other promos
  
  // Priority (if multiple applicable, higher priority wins)
  priority: number;             // 1-100, higher = more priority
  
  // Date/Time Restrictions
  validFrom?: string;           // ISO date string
  validUntil?: string;          // ISO date string
  validDaysOfWeek?: number[];   // [0-6] Sunday-Saturday
  validTimeRanges?: {           // Time windows
    start: string;              // "09:00"
    end: string;                // "17:00"
  }[];
  
  // Exclusions
  excludePromotionIds?: string[]; // Can't combine with these promos
  
  // Tracking
  usedCount?: number;           // Total times used
  totalDiscountGiven?: number;  // Total $ saved by customers
  customerUsageCount?: Record<string, number>; // Per-customer usage
  
  // Metadata
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;           // Admin user ID
}

export interface PromotionUsage {
  id: ID;
  promotionId: ID;
  customerId: ID;
  appointmentId?: ID;
  appliedAt: string; // ISO date string
  discountAmount: number; // Amount saved
  promoCodeUsed?: string;
  triggerContext?: {
    trigger: CustomerSegment;
    visitCount?: number; // For tracking which visit triggered it
  };
}

export interface BirthdayPromoUsage {
  id: ID;
  customerId: ID;
  promotionId: ID;
  birthdayYear: number; // e.g., 2025 - tracks which year they used it
  usedAt: string; // ISO date string
  appointmentId?: ID;
  discountAmount: number;
}


export interface Customer {
id: ID;
userId?: string; // Firebase Auth UID - matches the document ID for new customers
name: string;
email?: string;
phone?: string;
birthday?: string; // Date in YYYY-MM-DD format
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
  serviceIds?: ID[]; // Array of service IDs for multi-service appointments (primary field)
  selectedServices?: ID[]; // Legacy field for backward compatibility
  start: string; // ISO
  duration: number; // minutes
  status: 'confirmed'|'pending'|'cancelled'|'completed'|'no-show';
  notes?: string;
  bookedPrice?: number; // Legacy field - total price for all services
  servicePrices?: Record<string, number>; // Individual prices per service ID for multi-service appointments
  tip?: number; // Tip amount added by admin
  totalPrice?: number; // Calculated total (sum of servicePrices + tip, or bookedPrice + tip for legacy)
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
  
  // Receipt fields
  receiptUrl?: string;
  receiptGeneratedAt?: string;
  receiptNumber?: string; // For display purposes
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
// Events Page Section
eventsHeroTitle: string;
eventsHeroDescription: string;
eventsFeaturedTitle1: string;
eventsFeaturedDescription1: string;
eventsFeaturedTitle2: string;
eventsFeaturedDescription2: string;
eventsFeaturedTitle3: string;
eventsFeaturedDescription3: string;
eventsFeaturedTitle4: string;
eventsFeaturedDescription4: string;
eventsPackagesTitle: string;
eventsPackagesDescription: string;
eventsCTATitle: string;
eventsCTADescription: string;
eventsCTAButton1: string;
eventsCTAButton2: string;
}

export interface SkinAnalysis {
id: ID;
customerId: ID; // Required - must be logged in
customerEmail: string;
customerName: string;
type: 'skin' | 'products';
imageUrl: string; // Legacy field - single image (for backward compatibility)
imageUrls?: string[]; // New field - supports multiple images
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
linkedProductAnalysisId?: string;
recommendedProducts?: string[]; // IDs from monetizedProducts
monetizationData?: {
  conversionTracking?: {
    recommendationsSent: number;
    clicks: number;
    purchases: number;
    revenue: number;
    lastRecommendationSent?: Date;
  };
  aiFeedingScore?: number; // 0-100
  crossReferenceSuccess?: boolean;
};
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

// Monetization Infrastructure Types
export interface MonetizedProduct {
  id: string;
  name: string;
  brand: string;
  category: string; // cleanser, serum, moisturizer, sunscreen, etc.
  price: number;
  commission: number; // percentage or fixed amount
  affiliateLink: string;
  imageUrl?: string;
  description?: string;
  targetSkinTypes: string[]; // dry, oily, combination, sensitive
  targetConcerns: string[]; // acne, aging, hyperpigmentation, etc.
  activeIngredients?: string[];
  compatibilityScore: number; // 1-10 rating
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversionTracking {
  id: string;
  customerId: string;
  analysisId: string;
  productId: string;
  recommendationSent: Date;
  linkClicked?: Date;
  purchaseCompleted?: Date;
  revenue: number;
  commission: number;
  status: 'sent' | 'clicked' | 'purchased' | 'expired';
  metadata?: {
    clickSource?: string;
    deviceType?: string;
    referralData?: any;
  };
}

export interface ProductRecommendation {
  productId: string;
  product: MonetizedProduct;
  compatibilityScore: number;
  reason: string;
  category: string;
}