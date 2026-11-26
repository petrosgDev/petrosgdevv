'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { PortfolioBundle } from '@/data/portfolio';
import { validatePortfolioBundle } from '@/lib/portfolioSchema';
import {
  AUTHORIZED_ADMIN_EMAIL,
  isAuthorizedAdminIdentity,
  stripUndefinedDeep,
} from '@/lib/adminAccess';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const PORTFOLIO_COLLECTION = 'portfolio';
export const PORTFOLIO_DOC_ID = 'published';
export const PORTFOLIO_DOC_PATH = `${PORTFOLIO_COLLECTION}/${PORTFOLIO_DOC_ID}`;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function isFirebaseConfigured(): boolean {
  return (
    Boolean(firebaseConfig?.apiKey) &&
    firebaseConfig.apiKey !== 'mock-api-key' &&
    Boolean(firebaseConfig?.projectId) &&
    firebaseConfig.projectId !== 'petros-portfolio-mock'
  );
}

let connectionTested = false;

export async function testFirestoreConnection(): Promise<void> {
  if (connectionTested || typeof window === 'undefined' || !isFirebaseConfigured()) {
    return;
  }
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export function isAuthorizedAdminUser(user: User | null | undefined): boolean {
  return isAuthorizedAdminIdentity(user);
}

export async function signInAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function getFirebaseProjectInfo(): {
  configured: boolean;
  projectId: string;
  authDomain: string;
  databaseId: string;
} {
  return {
    configured: isFirebaseConfigured(),
    projectId: firebaseConfig.projectId || '',
    authDomain: firebaseConfig.authDomain || '',
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
  };
}

export async function getFirebaseAdminIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}

export function subscribeAdminAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export interface PublishedPortfolioSnapshot {
  data: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
}

function extractIsoTimestamp(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

export function subscribePublishedPortfolio(
  onUpdate: (snapshot: PublishedPortfolioSnapshot | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured()) {
    onUpdate(null);
    return () => {};
  }

  const ref = doc(db, PORTFOLIO_COLLECTION, PORTFOLIO_DOC_ID);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      const raw = snap.data();
      const validated = validatePortfolioBundle(raw);
      if (validated.ok) {
        onUpdate({
          data: validated.data,
          updatedAt: extractIsoTimestamp(raw.updatedAt),
          isCustomized: true,
        });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, PORTFOLIO_DOC_PATH);
      } catch (wrapped) {
        if (onError) {
          onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    }
  );
}

export async function savePublishedPortfolio(
  bundle: PortfolioBundle,
  user: User
): Promise<{ data: PortfolioBundle; updatedAt: string }> {
  if (!isAuthorizedAdminUser(user)) {
    throw new Error(`Access denied. Only ${AUTHORIZED_ADMIN_EMAIL} can update this portfolio.`);
  }

  const validated = validatePortfolioBundle(bundle);
  if (!validated.ok) {
    throw new Error(validated.errors[0] || 'Please fix validation errors before saving.');
  }

  const cleanBundle = stripUndefinedDeep(validated.data);
  const ref = doc(db, PORTFOLIO_COLLECTION, PORTFOLIO_DOC_ID);

  let exists = false;
  try {
    const existingSnap = await getDoc(ref);
    exists = existingSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PORTFOLIO_DOC_PATH);
  }

  if (exists) {
    try {
      await updateDoc(ref, {
        ...cleanBundle,
        updatedByUid: user.uid,
        updatedByEmail: AUTHORIZED_ADMIN_EMAIL,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, PORTFOLIO_DOC_PATH);
    }
  } else {
    try {
      await setDoc(ref, {
        ...cleanBundle,
        updatedByUid: user.uid,
        updatedByEmail: AUTHORIZED_ADMIN_EMAIL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PORTFOLIO_DOC_PATH);
    }
  }

  return {
    data: cleanBundle,
    updatedAt: new Date().toISOString(),
  };
}

export async function resetPublishedPortfolio(user: User): Promise<void> {
  if (!isAuthorizedAdminUser(user)) {
    throw new Error(`Access denied. Only ${AUTHORIZED_ADMIN_EMAIL} can reset this portfolio.`);
  }

  const ref = doc(db, PORTFOLIO_COLLECTION, PORTFOLIO_DOC_ID);
  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, PORTFOLIO_DOC_PATH);
  }
}

export { AUTHORIZED_ADMIN_EMAIL };
