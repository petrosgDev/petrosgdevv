import firebaseConfig from '../../firebase-applet-config.json';
import type { PortfolioBundle } from '@/data/portfolio';
import { validatePortfolioBundle } from '@/lib/portfolioSchema';

export interface PublishedPortfolioSnapshot {
  data: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
}

interface FirestoreRestValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  arrayValue?: { values?: FirestoreRestValue[] };
  mapValue?: { fields?: Record<string, FirestoreRestValue> };
}

function decodeFirestoreValue(value: FirestoreRestValue | undefined): unknown {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue ?? '';
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue ?? null;
  if ('arrayValue' in value) {
    return (value.arrayValue?.values ?? []).map(decodeFirestoreValue);
  }
  if ('mapValue' in value) {
    const out: Record<string, unknown> = {};
    const fields = value.mapValue?.fields ?? {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return null;
}

function isServerFirebaseConfigured(): boolean {
  return (
    Boolean(firebaseConfig?.apiKey) &&
    firebaseConfig.apiKey !== 'mock-api-key' &&
    Boolean(firebaseConfig?.projectId) &&
    firebaseConfig.projectId !== 'petros-portfolio-mock'
  );
}

/**
 * Fetches /portfolio/published directly from Firestore on the server so SSR HTML
 * matches the live database with zero initial stale-data flash on hydration.
 */
export async function getPublishedPortfolioServer(): Promise<PublishedPortfolioSnapshot | null> {
  if (!isServerFirebaseConfigured()) {
    return null;
  }

  const projectId = encodeURIComponent(firebaseConfig.projectId);
  const databaseId = encodeURIComponent(firebaseConfig.firestoreDatabaseId || '(default)');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/portfolio/published`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) {
      return null;
    }

    const doc = (await res.json()) as { fields?: Record<string, FirestoreRestValue> };
    if (!doc?.fields) {
      return null;
    }

    const decoded = decodeFirestoreValue({ mapValue: { fields: doc.fields } }) as Record<
      string,
      unknown
    >;
    const validated = validatePortfolioBundle(decoded);
    if (!validated.ok) {
      return null;
    }

    return {
      data: validated.data,
      updatedAt: typeof decoded.updatedAt === 'string' ? decoded.updatedAt : null,
      isCustomized: true,
    };
  } catch {
    return null;
  }
}
