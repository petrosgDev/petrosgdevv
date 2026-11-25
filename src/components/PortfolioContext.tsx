'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PortfolioBundle } from '@/data/portfolio';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import {
  isFirebaseConfigured,
  subscribePublishedPortfolio,
  testFirestoreConnection,
} from '@/lib/firebase';

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
          setData(json.data);
          setUpdatedAt(typeof json.updatedAt === 'string' ? json.updatedAt : null);
          setIsCustomized(Boolean(json.isCustomized));
        }
      } catch {
        // Keep built-in defaults if offline or unavailable
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
        if (snapshot) {
          setData(snapshot.data);
          setUpdatedAt(snapshot.updatedAt);
          setIsCustomized(snapshot.isCustomized);
          setLoadedFromServer(true);
        } else {
          void loadLocalRecord();
        }
      },
      () => {
        if (!cancelled) {
          void loadLocalRecord();
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
      setData(nextData);
      if (meta && 'updatedAt' in meta) {
        setUpdatedAt(meta.updatedAt ?? null);
      }
      if (meta && 'isCustomized' in meta) {
        setIsCustomized(Boolean(meta.isCustomized));
      }
    },
    []
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
      applyPortfolio: () => {},
    };
  }
  return ctx;
}
