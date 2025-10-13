#!/bin/bash

files=(
  "apps/admin/src/components/AddAppointmentModal.tsx"
  "apps/admin/src/components/AIConversationManager.tsx"
  "apps/admin/src/components/Calendar.tsx"
  "apps/admin/src/components/AuthGate.tsx"
  "apps/admin/src/components/SMSInterface.tsx"
  "apps/admin/src/components/Header.tsx"
  "apps/admin/src/components/MessagingInterface.tsx"
  "apps/admin/src/pages/Settings.tsx"
  "apps/admin/src/pages/Services.tsx"
  "apps/admin/src/pages/Schedule.tsx"
  "apps/admin/src/pages/Customers.tsx"
  "apps/booking/src/components/CustomerMessaging.tsx"
  "apps/booking/src/pages/Book.tsx"
  "apps/booking/src/pages/Services.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating: $file"
    # Replace import
    sed -i '' 's/import { initFirebase }/import { useFirebase }/g' "$file"
    sed -i '' 's/from.*@buenobrows\/shared\/firebase/from '\''@buenobrows\/shared\/useFirebase'\''/g' "$file"
    # Replace usage
    sed -i '' 's/initFirebase()/useFirebase()/g' "$file"
  fi
done

echo "All files updated!"
