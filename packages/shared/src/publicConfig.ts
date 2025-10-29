import { doc, getDoc, onSnapshot, type Firestore } from 'firebase/firestore';

export interface PublicConfig {
  googleMapsKey?: string;
}

const SETTINGS_COLLECTION = 'settings';
const PUBLIC_CONFIG_DOC = 'publicConfig';

export async function getPublicConfig(db: Firestore): Promise<PublicConfig | null> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, PUBLIC_CONFIG_DOC);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return {
      googleMapsKey: data.googleMapsKey,
    };
  } catch (err) {
    return null;
  }
}

export function watchPublicConfig(
  db: Firestore,
  onUpdate: (config: PublicConfig | null) => void
): () => void {
  const ref = doc(db, SETTINGS_COLLECTION, PUBLIC_CONFIG_DOC);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const data = snap.data() as any;
      onUpdate({ googleMapsKey: data.googleMapsKey });
    },
    () => onUpdate(null)
  );
}



