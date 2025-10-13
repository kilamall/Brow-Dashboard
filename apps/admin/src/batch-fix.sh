#!/bin/bash

# Header.tsx
sed -i '' '/^const { auth } = initFirebase();$/d' components/Header.tsx
sed -i '' '/^export default function Header(){$/a\
  const { auth } = initFirebase();
' components/Header.tsx

# AIConversationManager.tsx  
sed -i '' '/^const { db } = initFirebase();$/d' components/AIConversationManager.tsx
sed -i '' '/^const AIConversationManager: React.FC = () => {$/a\
  const { db } = initFirebase();
' components/AIConversationManager.tsx

# Calendar.tsx
sed -i '' '/^const { db } = initFirebase();$/d' components/Calendar.tsx
sed -i '' '/^export default function Schedule() {$/a\
  const { db } = initFirebase();
' components/Calendar.tsx

# AddAppointmentModal.tsx
sed -i '' '/^const { db } = initFirebase();$/d' components/AddAppointmentModal.tsx
sed -i '' '/^export default function AddAppointmentModal/a\
  const { db } = initFirebase();
' components/AddAppointmentModal.tsx

# Customers.tsx
sed -i '' '/^const { db } = initFirebase();$/d' pages/Customers.tsx
sed -i '' '/^export default function Customers(){$/a\
  const { db } = initFirebase();
' pages/Customers.tsx

# Settings.tsx
sed -i '' '/^const { db } = initFirebase();$/d' pages/Settings.tsx
sed -i '' '/^export default function Settings() {$/a\
  const { db } = initFirebase();
' pages/Settings.tsx

echo "Done!"
