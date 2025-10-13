#!/bin/bash

# Book.tsx
sed -i '' '/^const { db } = initFirebase();$/d' pages/Book.tsx
sed -i '' '/^export default function Book() {$/a\
  const { db } = initFirebase();
' pages/Book.tsx

# Services.tsx
sed -i '' '/^const { db } = initFirebase();$/d' pages/Services.tsx
sed -i '' '/^export default function ServicesPage() {$/a\
  const { db } = initFirebase();
' pages/Services.tsx

echo "Booking app fixed!"
