#!/bin/bash
# Script to fix Firebase initialization in remaining files

files=(
  "components/Header.tsx"
  "components/AIConversationManager.tsx"
  "components/AddAppointmentModal.tsx"
  "components/Calendar.tsx"
  "pages/Schedule.tsx"
  "pages/Services.tsx"
  "pages/Customers.tsx"
  "pages/Settings.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if file has module-level Firebase init
    if grep -q "^const { .* } = initFirebase();" "$file"; then
      echo "Processing: $file"
      # This is complex to automate via sed, skip for manual fix
    fi
  fi
done
