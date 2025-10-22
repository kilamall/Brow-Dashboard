# 🛡️ Error Handling Quick Reference

## Import Statements

```typescript
// Error handling utilities
import { 
  ErrorCategory, 
  toAppError, 
  logErrorToFirebase,
  withErrorHandling 
} from '@buenobrows/shared/errorHandling';

// Error boundaries
import { ErrorBoundary } from '@buenobrows/shared/ErrorBoundary';

// Fallback UI components
import { 
  FullPageError, 
  FeatureError, 
  InlineError,
  EmptyState,
  LoadingSkeleton,
  NetworkError 
} from '@buenobrows/shared/FallbackUI';

// Validators
import {
  safeString,
  safeNumber,
  safeBoolean,
  safeArray,
  sanitizeService,
  sanitizeCustomer,
  sanitizeAppointment
} from '@buenobrows/shared/validators';
```

---

## Common Patterns

### 1. Add Error Boundary to Route

```typescript
<Route path="/my-page" element={
  <ErrorBoundary 
    fallback={(error, reset) => (
      <FeatureError 
        error={error} 
        reset={reset} 
        title="Page Error" 
      />
    )} 
    category={ErrorCategory.BOOKING}
  >
    <MyPage />
  </ErrorBoundary>
} />
```

### 2. Add Error Handling to Component

```typescript
export default function MyComponent() {
  const { db } = useFirebase();
  const [data, setData] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!db) {
      setError('Database not initialized');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const unsubscribe = onSnapshot(
        collection(db, 'myCollection'),
        (snapshot) => {
          try {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setData(items);
            setError(null);
            setLoading(false);
          } catch (err) {
            console.error('Error processing data:', err);
            setError('Error loading data');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Firestore error:', err);
          setError('Unable to load data. Please refresh.');
          setLoading(false);
        }
      );
      
      return () => unsubscribe?.();
    } catch (err) {
      console.error('Setup error:', err);
      setError('Error initializing');
      setLoading(false);
    }
  }, [db]);
  
  return (
    <div>
      {error && (
        <InlineError 
          error={toAppError(error, ErrorCategory.UNKNOWN)} 
          reset={() => window.location.reload()} 
        />
      )}
      {loading && <LoadingSkeleton type="list" count={3} />}
      {!loading && !error && data.length === 0 && (
        <EmptyState 
          title="No data yet" 
          message="Get started by adding your first item" 
        />
      )}
      {/* Your content */}
    </div>
  );
}
```

### 3. Wrap Async Operations

```typescript
async function saveData() {
  try {
    await withErrorHandling(
      async () => {
        await updateDoc(doc(db, 'collection', id), data);
      },
      ErrorCategory.DATA_SYNC,
      { operation: 'save', id }
    );
    setSuccess(true);
  } catch (error) {
    if (error instanceof AppError) {
      setError(error.userMessage);
    }
  }
}
```

### 4. Validate User Input

```typescript
function handleSubmit() {
  // Validate email
  if (!isValidEmail(email)) {
    setError('Please enter a valid email address');
    return;
  }
  
  // Validate phone
  if (phone && !isValidPhone(phone)) {
    setError('Please enter a valid phone number');
    return;
  }
  
  // Validate price
  if (!isValidPrice(price)) {
    setError('Price must be a positive number');
    return;
  }
  
  // Continue with submission
}
```

### 5. Sanitize Firestore Data

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'services'),
    (snapshot) => {
      const services = snapshot.docs
        .map(doc => sanitizeService({ id: doc.id, ...doc.data() }))
        .filter((s): s is Service => s !== null);
      setServices(services);
    }
  );
  return () => unsubscribe();
}, [db]);
```

---

## Error Categories

Use these categories for consistent error handling:

- `ErrorCategory.BOOKING` - Appointment booking errors
- `ErrorCategory.SCHEDULE` - Calendar/schedule errors  
- `ErrorCategory.CUSTOMER` - Customer data errors
- `ErrorCategory.PAYMENT` - Payment processing errors
- `ErrorCategory.AUTHENTICATION` - Login/auth errors
- `ErrorCategory.NETWORK` - Connection/network errors
- `ErrorCategory.DATA_SYNC` - Data save/sync errors
- `ErrorCategory.SERVICE` - Service data errors
- `ErrorCategory.SETTINGS` - Settings/config errors
- `ErrorCategory.MESSAGING` - SMS/message errors
- `ErrorCategory.SKIN_ANALYSIS` - Skin analysis errors
- `ErrorCategory.CONSENT_FORM` - Consent form errors
- `ErrorCategory.UNKNOWN` - Generic/unknown errors

---

## UI Components

### FullPageError
For critical app-wide failures
```typescript
<FullPageError error={appError} reset={() => location.reload()} />
```

### FeatureError
For page/feature-level errors
```typescript
<FeatureError 
  error={appError} 
  reset={handleReset} 
  title="Custom Error Title"
/>
```

### InlineError
For small component errors
```typescript
<InlineError error={appError} reset={handleRetry} />
```

### EmptyState
When there's no data (not an error)
```typescript
<EmptyState
  icon="inbox"
  title="No customers yet"
  message="Start by adding your first customer"
  actionLabel="Add Customer"
  onAction={() => setShowAddModal(true)}
/>
```

### LoadingSkeleton
Show loading states
```typescript
<LoadingSkeleton type="list" count={5} />
<LoadingSkeleton type="grid" count={6} />
<LoadingSkeleton type="card" />
<LoadingSkeleton type="table" count={10} />
```

### NetworkError
Specific network error handling
```typescript
<NetworkError reset={handleRetry} />
```

---

## Safe Data Access

```typescript
// Safe primitives
const name = safeString(data.name, 'Unknown');
const price = safeNumber(data.price, 0);
const active = safeBoolean(data.active, false);
const items = safeArray(data.items, []);

// Safe object access
const count = getProperty(data, 'stats.count', 0);

// Safe JSON parsing
const config = safeJsonParse(jsonString, {});
```

---

## Validators

```typescript
// Email validation
if (!isValidEmail(email)) {
  setError('Invalid email address');
  return;
}

// Phone validation
if (!isValidPhone(phone)) {
  setError('Invalid phone number');
  return;
}

// Date validation
if (!isValidDateString(dateStr)) {
  setError('Invalid date');
  return;
}

// Price validation
if (!isValidPrice(price)) {
  setError('Invalid price');
  return;
}

// Duration validation (minutes)
if (!isValidDuration(duration)) {
  setError('Duration must be between 1 and 1440 minutes');
  return;
}

// Required fields check
if (!hasRequiredFields(data, ['name', 'email', 'phone'])) {
  setError('Missing required fields');
  return;
}
```

---

## Tips

1. **Always add error state** to components that load data
2. **Show loading states** while data is fetching
3. **Provide empty states** when there's no data
4. **Log errors** to Firebase for monitoring
5. **Give users recovery actions** (try again, refresh, go home)
6. **Use appropriate error categories** for better tracking
7. **Validate user input** before submission
8. **Sanitize Firestore data** to handle malformed documents
9. **Check for null/undefined** before accessing nested properties
10. **Wrap Firebase operations** in try-catch blocks

---

## Testing Errors

```typescript
// Simulate component error (triggers error boundary)
throw new Error('Test error');

// Simulate Firestore error
throw new Error('Missing or insufficient permissions');

// Simulate network error
throw new Error('Failed to fetch');

// Test with bad data
const badService = { id: '123' }; // Missing required fields
const service = sanitizeService(badService); // Returns null safely
```

---

## Common Mistakes to Avoid

❌ **DON'T:**
```typescript
// No error handling
const data = snapshot.docs.map(d => d.data());

// No null check
const name = customer.name.toUpperCase(); // Crashes if name is undefined

// No loading state
if (data.length === 0) return <p>No data</p>; // Shows even while loading
```

✅ **DO:**
```typescript
// With error handling
try {
  const data = snapshot.docs
    .map(d => sanitize(d.data()))
    .filter(Boolean);
} catch (error) {
  logErrorToFirebase(error);
  setError('Failed to load data');
}

// With null check
const name = safeString(customer?.name, 'Unknown').toUpperCase();

// With loading state
if (loading) return <LoadingSkeleton />;
if (error) return <InlineError error={error} />;
if (data.length === 0) return <EmptyState />;
```

---

## Need Help?

Check `BULLET_PROOF_IMPLEMENTATION.md` for detailed implementation guide.

**Happy coding!** 🚀


