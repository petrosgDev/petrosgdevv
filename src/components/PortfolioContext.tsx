'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PortfolioBundle } from '@/data/portfolio';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import { validatePortfolioBundle } from '@/lib/portfolioSchema';
import type { PublishedPortfolioSnapshot } from '@/lib/serverPortfolio';
import {
  isFirebaseConfigured,
  subscribePublishedPortfolio,
  testFirestoreConnection,
} from '@/lib/firebase';

const LEGACY_CACHE_KEY = 'petros_portfolio_snapshot_v1';
const PORTFOLIO_CACHE_KEY = 'petros_portfolio_snapshot_v2';

interface PortfolioContextValue {
  data: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
  loadedFromServer: boolean;
  lastError: string | null;
  applyPortfolio: (
    nextData: PortfolioBundle,
    meta?: { updatedAt?: string | null; isCustomized?: boolean }
  ) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function normalizeWithDefaults(raw: PortfolioBundle): PortfolioBundle {
  const defaults = getDefaultPortfolioBundle();
  return {
    ...defaults,
    ...raw,
    THEME_TOKENS: raw.THEME_TOKENS ?? defaults.THEME_TOKENS,
    SEO_SETTINGS: raw.SEO_SETTINGS ?? defaults.SEO_SETTINGS,
    BLOG_SETTINGS: raw.BLOG_SETTINGS ?? defaults.BLOG_SETTINGS,
  };
}

function bundleSignature(bundle: PortfolioBundle): string {
  try {
    return JSON.stringify(bundle);
  } catch {
    return '';
  }
}

function readCachedSnapshot(): PublishedPortfolioSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    window.localStorage.removeItem(LEGACY_CACHE_KEY);
    const raw = window.localStorage.getItem(PORTFOLIO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PublishedPortfolioSnapshot>;
    const validated = validatePortfolioBundle(parsed?.data);
    if (!validated.ok) return null;
    return {
      data: normalizeWithDefaults(validated.data),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      isCustomized: Boolean(parsed.isCustomized),
    };
  } catch {
    return null;
  }
}

function writeCachedSnapshot(snapshot: PublishedPortfolioSnapshot | null): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_CACHE_KEY);
    if (!snapshot || !snapshot.isCustomized) {
      window.localStorage.removeItem(PORTFOLIO_CACHE_KEY);
      return;
    }
    window.localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function PortfolioProvider({
  children,
  initialSnapshot = null,
}: {
  children: React.ReactNode;
  initialSnapshot?: PublishedPortfolioSnapshot | null;
}) {
  const initialBundle = useMemo(
    () =>
      initialSnapshot?.data
        ? normalizeWithDefaults(initialSnapshot.data)
        : getDefaultPortfolioBundle(),
    [initialSnapshot]
  );

  const [data, setData] = useState<PortfolioBundle>(initialBundle);
  const [updatedAt, setUpdatedAt] = useState<string | null>(
    initialSnapshot?.updatedAt ?? null
  );
  const [isCustomized, setIsCustomized] = useState<boolean>(
    Boolean(initialSnapshot?.isCustomized)
  );
  const [loadedFromServer, setLoadedFromServer] = useState<boolean>(
    Boolean(initialSnapshot) || !isFirebaseConfigured()
  );
  const [lastError, setLastError] = useState<string | null>(null);

  const lastSignatureRef = useRef<string>(bundleSignature(initialBundle));
  const isCustomizedRef = useRef<boolean>(Boolean(initialSnapshot?.isCustomized));
  const updatedAtRef = useRef<string | null>(initialSnapshot?.updatedAt ?? null);

  // Only read browser cache if SSR did not receive a snapshot, and clean legacy keys
  useLayoutEffect(() => {
    if (initialSnapshot) {
      writeCachedSnapshot(initialSnapshot);
      return;
    }
    const cached = readCachedSnapshot();
    if (cached) {
      const nextSig = bundleSignature(cached.data);
      if (nextSig !== lastSignatureRef.current) {
        lastSignatureRef.current = nextSig;
        setData(cached.data);
      }
      isCustomizedRef.current = cached.isCustomized;
      updatedAtRef.current = cached.updatedAt;
      setIsCustomized(cached.isCustomized);
      setUpdatedAt(cached.updatedAt);
    }
  }, [initialSnapshot]);

  useEffect(() => {
    let cancelled = false;

    const loadLocalRecord = async () => {
      try {
        const res = await fetch('/api/portfolio/', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          data?: PortfolioBundle;
          updatedAt?: string | null;
          isCustomized?: boolean;
        };
        if (json?.data?.SITE_PROFILE && Array.isArray(json.data.PROJECTS)) {
          const normalized = normalizeWithDefaults(json.data);
          const nextUpdatedAt = typeof json.updatedAt === 'string' ? json.updatedAt : null;
          const nextCustomized = Boolean(json.isCustomized);
          const nextSig = bundleSignature(normalized);
          if (nextSig !== lastSignatureRef.current) {
            lastSignatureRef.current = nextSig;
            setData(normalized);
          }
          updatedAtRef.current = nextUpdatedAt;
          isCustomizedRef.current = nextCustomized;
          setUpdatedAt(nextUpdatedAt);
          setIsCustomized(nextCustomized);
          writeCachedSnapshot({
            data: normalized,
            updatedAt: nextUpdatedAt,
            isCustomized: nextCustomized,
          });
        }
      } catch {
        // Keep cached or built-in defaults if offline or unavailable
      } finally {
        if (!cancelled) {
          setLoadedFromServer(true);
        }
      }
    };

    if (!isFirebaseConfigured()) {
      void loadLocalRecord();
      return () => {
        cancelled = true;
      };
    }

    void testFirestoreConnection();

    const unsubscribe = subscribePublishedPortfolio(
      (snapshot) => {
        if (cancelled) return;
        setLastError(null);

        if (snapshot) {
          const normalized = normalizeWithDefaults(snapshot.data);
          const nextSig = bundleSignature(normalized);
          if (nextSig !== lastSignatureRef.current) {
            lastSignatureRef.current = nextSig;
            setData(normalized);
          }
          if (snapshot.updatedAt !== updatedAtRef.current) {
            updatedAtRef.current = snapshot.updatedAt;
            setUpdatedAt(snapshot.updatedAt);
          }
          if (snapshot.isCustomized !== isCustomizedRef.current) {
            isCustomizedRef.current = snapshot.isCustomized;
            setIsCustomized(snapshot.isCustomized);
          }
          writeCachedSnapshot({
            data: normalized,
            updatedAt: snapshot.updatedAt,
            isCustomized: snapshot.isCustomized,
          });
        } else {
          const defaults = getDefaultPortfolioBundle();
          const defaultSig = bundleSignature(defaults);
          if (defaultSig !== lastSignatureRef.current) {
            lastSignatureRef.current = defaultSig;
            setData(defaults);
          }
          if (updatedAtRef.current !== null) {
            updatedAtRef.current = null;
            setUpdatedAt(null);
          }
          if (isCustomizedRef.current !== false) {
            isCustomizedRef.current = false;
            setIsCustomized(false);
          }
          writeCachedSnapshot(null);
        }
        setLoadedFromServer(true);
      },
      (err) => {
        if (!cancelled) {
          setLastError(err.message);
          setLoadedFromServer(true);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const applyPortfolio = useCallback(
    (
      nextData: PortfolioBundle,
      meta?: { updatedAt?: string | null; isCustomized?: boolean }
    ) => {
      const normalized = normalizeWithDefaults(nextData);
      const nextSig = bundleSignature(normalized);
      const nextUpdatedAt =
        meta && 'updatedAt' in meta ? (meta.updatedAt ?? null) : updatedAtRef.current;
      const nextCustomized =
        meta && 'isCustomized' in meta ? Boolean(meta.isCustomized) : isCustomizedRef.current;

      lastSignatureRef.current = nextSig;
      updatedAtRef.current = nextUpdatedAt;
      isCustomizedRef.current = nextCustomized;

      setData(normalized);
      setUpdatedAt(nextUpdatedAt);
      setIsCustomized(nextCustomized);
      writeCachedSnapshot({
        data: normalized,
        updatedAt: nextUpdatedAt,
        isCustomized: nextCustomized,
      });
    },
    []
  );

  const value = useMemo<PortfolioContextValue>(
    () => ({
      data,
      updatedAt,
      isCustomized,
      loadedFromServer,
      lastError,
      applyPortfolio,
    }),
    [data, updatedAt, isCustomized, loadedFromServer, lastError, applyPortfolio]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    return {
      data: getDefaultPortfolioBundle(),
      updatedAt: null,
      isCustomized: false,
      loadedFromServer: false,
      lastError: null,
      applyPortfolio: () => { },
    };
  }
  return ctx;
}
