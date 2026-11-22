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

interface PortfolioContextValue {
  data: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
  loadedFromServer: boolean;
  refreshPortfolio: () => Promise<void>;
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

  const refreshPortfolio = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio/', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as {
        data?: PortfolioBundle;
        updatedAt?: string | null;
        isCustomized?: boolean;
      };
      if (json && json.data && json.data.SITE_PROFILE && Array.isArray(json.data.PROJECTS)) {
        setData(json.data);
        setUpdatedAt(typeof json.updatedAt === 'string' ? json.updatedAt : null);
        setIsCustomized(Boolean(json.isCustomized));
      }
    } catch {
      // Keep decoded vault defaults when offline
    } finally {
      setLoadedFromServer(true);
    }
  }, []);

  useEffect(() => {
    void refreshPortfolio();
  }, [refreshPortfolio]);

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
      refreshPortfolio,
      applyPortfolio,
    }),
    [data, updatedAt, isCustomized, loadedFromServer, refreshPortfolio, applyPortfolio]
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
      refreshPortfolio: async () => {},
      applyPortfolio: () => {},
    };
  }
  return ctx;
}
