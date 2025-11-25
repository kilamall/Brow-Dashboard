# Bueno Brows - Unified Admin & Booking System

A comprehensive monorepo for managing a beauty salon business with integrated customer messaging system.

**📚 Documentation:** See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) for complete documentation index.

**🌐 Live Apps:**
- **Admin Dashboard**: https://bueno-brows-admin.web.app
- **Customer Booking**: https://bueno-brows-7cce7.web.app

## 🏗️ Architecture

This monorepo contains:

- **Admin App** (`apps/admin`) - TypeScript React app for salon management
- **Booking App** (`apps/booking`) - TypeScript React app for customer bookings  
- **Legacy App** (`apps/legacy`) - JavaScript React app (migrated from separate repo)
- **Shared Package** (`packages/shared`) - Common utilities, Firebase config, and messaging
- **Cloud Functions** (`functions`) - Backend logic for bookings and messaging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (package manager)
- Firebase project with Firestore, Auth, Functions, and Messaging enabled

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

### Development

```bash
# Start all apps in development
pnpm dev:admin     # Admin dashboard
pnpm dev:booking   # Customer booking site
pnpm dev:legacy    # Legacy admin interface

# Start Firebase emulators
pnpm --filter functions serve
```

### Environment Variables

Create `.env.local` files in each app directory with:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_USE_EMULATORS=1  # For local development
```

## 💬 Messaging Systems

### In-App Messaging
- **Real-time messaging** between customers and admin
- **Push notifications** for new messages
- **Conversation management** with unread counts
- **Message history** and persistence
- **Appointment-related messaging** context

### SMS Integration
- **Customer SMS support** - customers can text your business number
- **Automated responses** for availability, pricing, hours, and FAQs
- **Admin SMS interface** for managing customer conversations
- **Twilio integration** for reliable SMS delivery
- **Conversation tracking** and history in Firebase

### Customer Messaging

Customers can access messaging through:
- **SMS texting** to your business phone number
- Floating chat widget on booking pages
- Direct messaging interface
- Push notifications for admin responses

### SMS Features

Customers can text your business number with:
- **"AVAILABLE"** → Get available appointment slots
- **"HOURS"** → Get business hours
- **"PRICING"** → Get service pricing
- **"LOCATION"** → Get business address
- **"BOOK [date] [time]"** → Request appointment booking
- **"HELP"** → Get instructions

### Admin Messaging

Admins can:
- View all customer conversations (both SMS and in-app)
- Send messages to customers via SMS or in-app
- See unread message counts
- Manage conversation status
- Track SMS delivery and responses

### Firebase Collections

The messaging system uses these Firestore collections:

- `messages` - Individual in-app messages
- `conversations` - In-app conversation summaries
- `customer_tokens` - FCM tokens for push notifications
- `sms_conversations` - SMS message history
- `sms_logs` - SMS delivery tracking
- `customers` - Customer information and phone numbers

### Security Rules

Messaging follows these security rules:
- Customers can only read their own messages
- Admins can read all messages
- Message creation requires authentication
- Conversation updates are admin-only

## 🔧 Development

### Adding New Features

1. **Shared utilities** go in `packages/shared/src/`
2. **Components** go in respective app directories
3. **Cloud Functions** go in `functions/src/`
4. **Types** are defined in `packages/shared/src/types.ts`

### Code Style

- TypeScript for new code
- ESLint + Prettier for formatting
- Tailwind CSS for styling
- Firebase for backend services

### Testing

```bash
# Run tests across all packages
pnpm test

# Type checking
pnpm typecheck
```

## 📱 Apps Overview

### Admin App (`apps/admin`)
- Dashboard with analytics
- Appointment scheduling
- Customer management
- Service management
- **Messaging interface** for customer support
- Settings and configuration

### Booking App (`apps/booking`)
- Service selection
- Appointment booking
- Customer authentication
- **Floating messaging widget** for support
- Confirmation and reminders

### Legacy App (`apps/legacy`)
- Migrated from separate repository
- Maintains existing functionality
- Gradually being replaced by admin app

## 🚀 Deployment

### Firebase Deployment

```bash
# Deploy all functions
pnpm --filter functions deploy

# Deploy specific app
pnpm --filter @bueno/admin build
pnpm --filter @bueno/booking build
```

### SMS Setup

1. **Get Twilio Account**
   - Sign up at [twilio.com](https://www.twilio.com)
   - Purchase a phone number
   - Get API credentials

2. **Configure Environment**
   ```bash
   firebase functions:config:set twilio.account_sid="your_sid"
   firebase functions:config:set twilio.auth_token="your_token"
   firebase functions:config:set twilio.phone_number="+15551234567"
   ```

3. **Set Webhook URL**
   - In Twilio Console, set webhook to:
   - `https://us-central1-your-project.cloudfunctions.net/handleIncomingSMS`

4. **Test SMS Integration**
   - Text "AVAILABLE" to your Twilio number
   - Check admin interface for conversations

See `SMS_SETUP.md` for detailed instructions.

### Environment Setup

1. Enable Firebase services:
   - Firestore Database
   - Authentication
   - Cloud Functions
   - Cloud Messaging

2. Configure security rules in `firebase.rules`

3. Set up VAPID keys for push notifications

## 🔐 Security

- Firebase security rules control data access
- Admin authentication required for management features
- Customer data is protected and isolated
- Messaging follows strict permission rules

## 📊 Monitoring

- Firebase Analytics for usage tracking
- Cloud Functions logs for backend monitoring
- Real-time messaging metrics
- Appointment booking analytics

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for new features
3. Update documentation for new functionality
4. Test messaging features thoroughly
5. Ensure Firebase security rules are updated

## 📞 Support

For technical issues or questions about the messaging system:
- Check Firebase console for errors
- Review Cloud Functions logs
- Verify environment variables
- Test with Firebase emulators locally

---

**Built with ❤️ for Bueno Brows**
