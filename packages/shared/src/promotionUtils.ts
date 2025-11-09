import type { Promotion, Service, Customer } from './types';
import { Firestore, doc, getDoc, getDocs, query, collection, where, limit } from 'firebase/firestore';
import { getPromotionUsageCount, getCustomerPromotionUsageCount, hasUsedBirthdayPromoThisYear } from './firestoreActions';

export interface PromotionEligibilityResult {
  eligible: boolean;
  reason?: string;
}

// Helper function to check if guest has booked before
// Uses cloud function to avoid security rule issues
async function checkGuestHasBookedBefore(
  db: Firestore,
  email?: string,
  phone?: string
): Promise<boolean> {
  if (!email && !phone) {
    // No contact info provided - assume they're new
    return false;
  }

  try {
    // Import dynamically to avoid circular dependencies
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const { initFirebase } = await import('./firebase');
    const { app } = initFirebase();
    const functions = getFunctions(app, 'us-central1');
    const checkNewCustomerStatus = httpsCallable(functions, 'checkNewCustomerStatus');
    
    const result = await checkNewCustomerStatus({ email, phone });
    const data = result.data as { isNewCustomer: boolean; reason?: string };
    
    // Return true if they've booked before (inverse of isNewCustomer)
    return !data.isNewCustomer;
  } catch (error) {
    console.error('Error checking guest booking history:', error);
    // On error, assume they're returning (be conservative with discounts)
    return true;
  }
}

export async function checkPromotionEligibility(
  db: Firestore,
  promotion: Promotion,
  customer: Customer | null,
  selectedServices: Service[],
  totalPrice: number,
  currentDate: Date = new Date(),
  guestEmail?: string,
  guestPhone?: string
): Promise<PromotionEligibilityResult> {
  // 1. Check status
  if (promotion.status !== 'active') {
    return { eligible: false, reason: 'Promotion is not active' };
  }
  
  // 2. Check date range
  if (promotion.validFrom) {
    const validFrom = new Date(promotion.validFrom);
    if (currentDate < validFrom) {
      return { eligible: false, reason: 'Promotion not yet valid' };
    }
  }
  
  if (promotion.validUntil) {
    const validUntil = new Date(promotion.validUntil);
    if (currentDate > validUntil) {
      return { eligible: false, reason: 'Promotion expired' };
    }
  }
  
  // 3. Check day of week
  if (promotion.validDaysOfWeek && promotion.validDaysOfWeek.length > 0) {
    const currentDay = currentDate.getDay();
    if (!promotion.validDaysOfWeek.includes(currentDay)) {
      return { eligible: false, reason: 'Not valid for this day of week' };
    }
  }
  
  // 4. Check time window
  if (promotion.validTimeRanges && promotion.validTimeRanges.length > 0) {
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const inValidWindow = promotion.validTimeRanges.some(range => {
      const [startHour, startMin] = range.start.split(':').map(Number);
      const [endHour, endMin] = range.end.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      return currentTime >= startTime && currentTime <= endTime;
    });
    
    if (!inValidWindow) {
      return { eligible: false, reason: 'Not valid for current time' };
    }
  }
  
  // 5. Check customer segment
  if (customer) {
    const segmentCheck = await checkCustomerSegment(
      db,
      promotion,
      customer,
      selectedServices
    );
    if (!segmentCheck.eligible) {
      return segmentCheck;
    }
  } else {
    // For non-logged-in users (guests)
    if (promotion.customerSegment === 'new_customers') {
      // New customer promotions require account creation
      return { eligible: false, reason: 'Create an account to get your first-time discount' };
    } else if (promotion.customerSegment === 'all') {
      return { eligible: true };
    } else {
      return { eligible: false, reason: 'Customer login required' };
    }
  }
  
  // 6. Check service/category targeting
  if (promotion.appliesTo === 'services') {
    if (!promotion.serviceIds || promotion.serviceIds.length === 0) {
      return { eligible: false, reason: 'No services configured' };
    }
    const hasMatchingService = selectedServices.some(s => 
      promotion.serviceIds?.includes(s.id)
    );
    if (!hasMatchingService) {
      return { eligible: false, reason: 'No matching services' };
    }
  } else if (promotion.appliesTo === 'categories') {
    if (!promotion.categoryNames || promotion.categoryNames.length === 0) {
      return { eligible: false, reason: 'No categories configured' };
    }
    const hasMatchingCategory = selectedServices.some(s => 
      promotion.categoryNames?.includes(s.category || '')
    );
    if (!hasMatchingCategory) {
      return { eligible: false, reason: 'No matching categories' };
    }
  }
  
  // 7. Check exclusions
  if (promotion.excludeServiceIds && promotion.excludeServiceIds.length > 0) {
    const hasExcludedService = selectedServices.some(s => 
      promotion.excludeServiceIds?.includes(s.id)
    );
    if (hasExcludedService) {
      return { eligible: false, reason: 'Excluded service in cart' };
    }
  }
  
  if (promotion.excludeCategoryNames && promotion.excludeCategoryNames.length > 0) {
    const hasExcludedCategory = selectedServices.some(s => 
      promotion.excludeCategoryNames?.includes(s.category || '')
    );
    if (hasExcludedCategory) {
      return { eligible: false, reason: 'Excluded category in cart' };
    }
  }
  
  // 8. Check minimum purchase
  if (promotion.minPurchaseAmount && totalPrice < promotion.minPurchaseAmount) {
    return { 
      eligible: false, 
      reason: `Minimum purchase of $${promotion.minPurchaseAmount} required` 
    };
  }
  
  // 9. Check usage limits
  if (promotion.maxUses) {
    const usageCount = await getPromotionUsageCount(db, promotion.id);
    if (usageCount >= promotion.maxUses) {
      return { eligible: false, reason: 'Promotion usage limit reached' };
    }
  }
  
  if (promotion.maxUsesPerCustomer && customer) {
    const customerUsage = await getCustomerPromotionUsageCount(
      db,
      promotion.id,
      customer.id
    );
    if (customerUsage >= promotion.maxUsesPerCustomer) {
      return { eligible: false, reason: 'Customer usage limit reached' };
    }
  }
  
  return { eligible: true };
}

async function checkCustomerSegment(
  db: Firestore,
  promotion: Promotion,
  customer: Customer,
  selectedServices: Service[]
): Promise<PromotionEligibilityResult> {
  const segment = promotion.customerSegment;
  const config = promotion.segmentConfig || {};
  
  switch (segment) {
    case 'all':
      return { eligible: true };
      
    case 'new_customers':
      const visitCount = customer.totalVisits || 0;
      return { 
        eligible: visitCount === 0,
        reason: visitCount > 0 ? 'Customer is not new' : undefined
      };
      
    case 'returning_customers':
      return { 
        eligible: (customer.totalVisits || 0) >= 1,
        reason: (customer.totalVisits || 0) === 0 ? 'Customer is new' : undefined
      };
      
    case 'loyalty_milestone':
      const targetVisit = config.visitCount || 5;
      const currentVisit = (customer.totalVisits || 0) + 1; // +1 for upcoming booking
      return {
        eligible: currentVisit === targetVisit,
        reason: currentVisit !== targetVisit 
          ? `Loyalty milestone is ${targetVisit} visits, customer is at ${currentVisit}`
          : undefined
      };
      
    case 'inactive_customers':
      // Would need to check last appointment date
      // For now, placeholder - need to implement
      return { eligible: false, reason: 'Inactive customer check not fully implemented' };
      
    case 'specific_customers':
      return {
        eligible: config.customerIds?.includes(customer.id) || false,
        reason: !config.customerIds?.includes(customer.id) 
          ? 'Customer not in target list' 
          : undefined
      };
      
    case 'birthday':
      return await checkBirthdayEligibility(db, promotion, customer);
      
    default:
      return { eligible: false, reason: 'Unknown customer segment' };
  }
}

async function checkBirthdayEligibility(
  db: Firestore,
  promotion: Promotion,
  customer: Customer
): Promise<PromotionEligibilityResult> {
  if (!customer.birthday) {
    return { eligible: false, reason: 'Customer birthday not set' };
  }
  
  const [year, month, day] = customer.birthday.split('-').map(Number);
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Calculate this year's birthday
  const thisYearBirthday = new Date(currentYear, month - 1, day);
  
  // Get birthday window config
  const window = promotion.segmentConfig?.birthdayWindow || {};
  const daysBefore = window.daysBefore || 7;
  const daysAfter = window.daysAfter || 7;
  
  // Calculate valid date range
  const validStart = new Date(thisYearBirthday);
  validStart.setDate(validStart.getDate() - daysBefore);
  
  const validEnd = new Date(thisYearBirthday);
  validEnd.setDate(validEnd.getDate() + daysAfter);
  
  // Check if today is within birthday window
  const isInWindow = today >= validStart && today <= validEnd;
  if (!isInWindow) {
    return { 
      eligible: false, 
      reason: 'Not within birthday promotion window' 
    };
  }
  
  // Check if already used this year
  const hasUsed = await hasUsedBirthdayPromoThisYear(
    db,
    promotion.id,
    customer.id,
    currentYear
  );
  
  if (hasUsed) {
    return { 
      eligible: false, 
      reason: 'Birthday promotion already used this year' 
    };
  }
  
  return { eligible: true };
}

export function calculateDiscount(
  promotion: Promotion,
  totalPrice: number,
  selectedServices: Service[]
): number {
  switch (promotion.discountType) {
    case 'percentage':
      return Math.round(totalPrice * (promotion.discountValue / 100) * 100) / 100;
      
    case 'fixed_amount':
      return Math.min(promotion.discountValue, totalPrice);
      
    case 'free_service':
      // Check if free service is in cart
      const freeServiceId = promotion.discountConfig?.freeServiceId;
      if (freeServiceId) {
        const freeService = selectedServices.find(s => s.id === freeServiceId);
        if (freeService) {
          return freeService.price;
        }
      }
      return 0;
      
    case 'buy_x_get_y':
      // Complex logic for BOGO - simplified for now
      // Would need to calculate based on buyQuantity and getQuantity
      const buyQty = promotion.discountConfig?.buyQuantity || 2;
      const getQty = promotion.discountConfig?.getQuantity || 1;
      // For now, return 0 - would need more complex logic
      return 0;
      
    case 'bundle_discount':
      // If bundle size met, apply percentage
      const bundleSize = promotion.discountConfig?.bundleSize || 3;
      if (selectedServices.length >= bundleSize) {
        return Math.round(totalPrice * (promotion.discountValue / 100) * 100) / 100;
      }
      return 0;
      
    default:
      return 0;
  }
}

export async function findApplicablePromotions(
  db: Firestore,
  promotions: Promotion[],
  customer: Customer | null,
  selectedServices: Service[],
  totalPrice: number,
  enteredPromoCode?: string,
  guestEmail?: string,
  guestPhone?: string
): Promise<Promotion[]> {
  const applicable: Promotion[] = [];
  
  for (const promotion of promotions) {
    // If promo code entered, only check that specific promotion
    if (enteredPromoCode) {
      if (promotion.promoCode?.toUpperCase() === enteredPromoCode.toUpperCase()) {
        const eligibility = await checkPromotionEligibility(
          db,
          promotion,
          customer,
          selectedServices,
          totalPrice,
          new Date(),
          guestEmail,
          guestPhone
        );
        if (eligibility.eligible) {
          applicable.push(promotion);
        }
        break; // Only one code can apply
      }
      continue; // Skip others if looking for specific code
    }
    
    // Auto-apply promotions
    if (promotion.applicationMethod === 'auto_apply') {
      const eligibility = await checkPromotionEligibility(
        db,
        promotion,
        customer,
        selectedServices,
        totalPrice,
        new Date(),
        guestEmail,
        guestPhone
      );
      if (eligibility.eligible) {
        applicable.push(promotion);
      }
    }
  }
  
  // Sort by priority (highest first)
  applicable.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  // If not stackable, only return highest priority
  if (applicable.length > 0 && !applicable[0].stackable) {
    return [applicable[0]];
  }
  
  // Return stackable promotions (up to reasonable limit)
  return applicable.slice(0, 3);
}

