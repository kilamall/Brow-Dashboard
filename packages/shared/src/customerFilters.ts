// packages/shared/src/customerFilters.ts
// Shared filtering logic for customers to ensure consistency across the app
import type { Customer } from './types';

/**
 * Filters out migrated/merged customers that should be hidden from the UI
 * This ensures consistency between the customer list and appointment modal
 * 
 * @param customers - Array of all customers from Firestore
 * @returns Filtered array with migrated customers removed
 */
export function filterActiveCustomers(customers: Customer[]): Customer[] {
  // Build a set of all customer IDs for efficient lookup
  const customerIds = new Set(customers.map(c => c.id));
  
  // Filter out customers that were merged FROM (migrated to another customer)
  // Only hide if migratedTo exists AND the target customer exists in the batch
  // If target doesn't exist in batch, show the customer (might be incorrectly marked or orphaned)
  const filtered = customers.filter(customer => {
    // Hide customers that have migratedTo pointing to an existing customer in this batch
    if (customer.migratedTo) {
      // CRITICAL FIX: Ignore self-references (migratedTo pointing to self)
      if (customer.migratedTo === customer.id) {
        console.warn(`[filterActiveCustomers] Customer ${customer.id} (${customer.name}) has migratedTo pointing to itself - showing customer (self-reference ignored)`);
        return true; // Show it - self-reference is invalid
      }
      
      const targetExists = customerIds.has(customer.migratedTo);
      if (targetExists) {
        // This customer was merged into another that exists in this batch - hide it
        console.log(`[filterActiveCustomers] Hiding customer ${customer.id} (${customer.name}) - merged to ${customer.migratedTo}`);
        return false;
      } else {
        // Target doesn't exist in batch - SHOW it (might be incorrectly marked or orphaned)
        // This allows admins to see and fix these customers
        console.warn(`[filterActiveCustomers] Showing customer ${customer.id} (${customer.name}) with migratedTo ${customer.migratedTo} - target not in batch (may be orphaned)`);
        return true;
      }
    }
    
    // Show all other customers (including those with identityStatus 'migrated' but no migratedTo)
    // This allows admins to see and fix incorrectly marked customers
    return true;
  });
  
  console.log(`[filterActiveCustomers] Filtered ${customers.length} customers down to ${filtered.length} (hid ${customers.length - filtered.length})`);
  return filtered;
}

/**
 * Sorts customers by name, handling customers without names gracefully
 */
export function sortCustomersByName(customers: Customer[]): Customer[] {
  return [...customers].sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    if (!aName && !bName) return 0;
    if (!aName) return 1; // Put customers without names at the end
    if (!bName) return -1;
    return aName.localeCompare(bName);
  });
}

/**
 * Filters customers by search term (name, email, or phone)
 */
export function filterCustomersBySearch(customers: Customer[], searchTerm: string): Customer[] {
  if (!searchTerm || !searchTerm.trim()) {
    return customers;
  }
  
  const term = searchTerm.trim().toLowerCase();
  return customers.filter(c => 
    c.name?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.phone?.includes(term)
  );
}

