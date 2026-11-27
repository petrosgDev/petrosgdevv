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
import {
  isFirebaseConfigured,
  subscribePublishedPortfolio,
  testFirestoreConnection,
} from '@/lib/firebase';

const PORTFOLIO_CACHE_KEY = 'petros_portfolio_snapshot_v1';

interface CachedPortfolioSnapshot {
  data: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
}

function readCachedSnapshot(): CachedPortfolioSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedPortfolioSnapshot>;
    const validated = validatePortfolioBundle(parsed?.data);
    if (!validated.ok) return null;
    return {
      data: validated.data,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      isCustomized: Boolean(parsed.isCustomized),
    };
  } catch {
    return null;
  }
}

function writeCachedSnapshot(snapshot: CachedPortfolioSnapshot | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!snapshot || !snapshot.isCustomized) {
      window.localStorage.removeItem(PORTFOLIO_CACHE_KEY);
      return;
    }
    window.localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

interface PortfolioContextValue {
  data: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
  loadedFromServer: boolean;
  applyPortfolio: (
    nextData: PortfolioBundle,
    meta?: { updatedAt?: string | null; isCustomized?: boolean }
  ) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioBundle>(() => getDefaultPortfolioBundle());
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isCustomized, setIsCustomized] = useState(false);
  const [loadedFromServer, setLoadedFromServer] = useState(false);
  const hasLoadedLiveRef = useRef(false);

  // Hydrate last known published snapshot before first paint to prevent flashing old defaults
  useLayoutEffect(() => {
    const cached = readCachedSnapshot();
    if (cached && !hasLoadedLiveRef.current) {
      setData(cached.data);
      setUpdatedAt(cached.updatedAt);
      setIsCustomized(cached.isCustomized);
    }
  }, []);

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
          const nextUpdatedAt = typeof json.updatedAt === 'string' ? json.updatedAt : null;
          const nextCustomized = Boolean(json.isCustomized);
          hasLoadedLiveRef.current = true;
          setData(json.data);
          setUpdatedAt(nextUpdatedAt);
          setIsCustomized(nextCustomized);
          writeCachedSnapshot({
            data: json.data,
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
        hasLoadedLiveRef.current = true;
        if (snapshot) {
          setData(snapshot.data);
          setUpdatedAt(snapshot.updatedAt);
          setIsCustomized(snapshot.isCustomized);
          writeCachedSnapshot(snapshot);
        } else {
          setData(getDefaultPortfolioBundle());
          setUpdatedAt(null);
          setIsCustomized(false);
          writeCachedSnapshot(null);
        }
        setLoadedFromServer(true);
      },
      () => {
        if (!cancelled) {
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
      hasLoadedLiveRef.current = true;
      const nextUpdatedAt =
        meta && 'updatedAt' in meta ? (meta.updatedAt ?? null) : updatedAt;
      const nextCustomized =
        meta && 'isCustomized' in meta ? Boolean(meta.isCustomized) : isCustomized;

      setData(nextData);
      if (meta && 'updatedAt' in meta) {
        setUpdatedAt(nextUpdatedAt);
      }
      if (meta && 'isCustomized' in meta) {
        setIsCustomized(nextCustomized);
      }
      writeCachedSnapshot({
        data: nextData,
        updatedAt: nextUpdatedAt,
        isCustomized: nextCustomized,
      });
    },
    [updatedAt, isCustomized]
  );

  const value = useMemo<PortfolioContextValue>(
    () => ({
      data,
      updatedAt,
      isCustomized,
      loadedFromServer,
      applyPortfolio,
    }),
    [data, updatedAt, isCustomized, loadedFromServer, applyPortfolio]
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
      applyPortfolio: () => { },
    };
  }
  return ctx;
}
