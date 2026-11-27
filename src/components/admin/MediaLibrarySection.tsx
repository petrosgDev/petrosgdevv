'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, RefreshCw, Trash2, Upload } from 'lucide-react';
import type { MediaAssetItem } from '@/app/api/media/route';
import type { PortfolioBundle } from '@/data/portfolio';
import { CARD_CLASS, INPUT_CLASS, SectionHeader } from '@/components/admin/AdminFields';

interface MediaLibrarySectionProps {
  draft: PortfolioBundle;
  authHeaders?: Record<string, string>;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function MediaLibrarySection({
  draft,
  authHeaders = {},
}: MediaLibrarySectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'uploaded' | 'builtin'>('all');
  const [query, setQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media/', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as { items?: MediaAssetItem[] };
      setItems(json.items ?? []);
    } catch {
      setError('Unable to load media files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/media/', {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: string };
          setError(json.error || `Failed to upload ${file.name}`);
        }
      }
      await loadAssets();
    } catch {
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/media/?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error || 'Failed to delete asset.');
        return;
      }
      await loadAssets();
    } catch {
      setError('Failed to delete asset.');
    }
  };

  const getUsages = (url: string): string[] => {
    const usages: string[] = [];
    if (draft.SITE_PROFILE.portraitSrc === url) usages.push('Portrait');
    if (draft.SEO_SETTINGS?.ogImage === url) usages.push('OG Image');
    for (const p of draft.PROJECTS) {
      if (p.heroImage.src === url || p.gallery.some((g) => g.src === url)) {
        usages.push(p.title);
      }
    }
    return usages;
  };

  const visibleItems = items.filter((item) => {
    if (filter === 'uploaded' && !item.isUploaded) return false;
    if (filter === 'builtin' && item.isUploaded) return false;
    const q = query.trim().toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="09. Media Assets"
        title="Media Library & Uploads"
        description="Upload new images, inspect existing portfolio assets, copy asset paths, or remove uploaded media."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadAssets()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3.5 text-[12px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                void handleUploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{uploading ? 'Uploading…' : 'Upload Images'}</span>
            </button>
          </div>
        }
      />

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-50/70 dark:bg-red-950/25 px-4 py-3 text-[12.5px] font-mono text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}

      {/* Filter & Search Bar */}
      <div className={`${CARD_CLASS} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'uploaded', 'builtin'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-medium capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]'
                  : 'border border-black/[0.1] dark:border-white/[0.12] text-[#666666] dark:text-[#9A9A96]'
              }`}
            >
              {tab === 'builtin' ? 'Built-in' : tab}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter assets by name..."
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Assets Grid */}
      {visibleItems.length === 0 ? (
        <div className={`${CARD_CLASS} text-center py-12 text-[13px] text-[#666666] dark:text-[#9A9A96]`}>
          {loading ? 'Loading assets…' : 'No matching images found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleItems.map((item) => {
            const usages = getUsages(item.url);
            const copied = copiedUrl === item.url;
            return (
              <div
                key={item.url}
                className="rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#111110] overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] bg-[#F6F6F5] dark:bg-[#141413] p-3 flex items-center justify-center border-b border-[#EAEAEA] dark:border-[#222220]">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12.5px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE] truncate">
                        {item.name}
                      </p>
                      <span className="text-[10.5px] font-mono text-[#666666] dark:text-[#9A9A96] shrink-0">
                        {formatBytes(item.size)}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96] truncate">
                      {item.url}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {usages.length > 0 ? (
                        usages.map((u) => (
                          <span
                            key={u}
                            className="rounded-full border border-[#EAEAEA] dark:border-[#222220] px-2 py-0.5 text-[10px] font-mono text-[#1A1A1A] dark:text-[#F0F0EE]"
                          >
                            Used: {u}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-[#666666] dark:text-[#9A9A96]">
                          Unused
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAEAEA] dark:border-[#222220]">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(item.url);
                          setCopiedUrl(item.url);
                          setTimeout(() => setCopiedUrl(null), 1800);
                        } catch {
                          // Ignore clipboard errors
                        }
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/[0.1] dark:border-white/[0.12] px-3 text-[11px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? 'Copied' : 'Copy Path'}</span>
                    </button>

                    {item.isUploaded ? (
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.url)}
                        className="inline-flex h-8 items-center gap-1 rounded-full border border-red-500/25 px-3 text-[11px] font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[#666666] dark:text-[#9A9A96]">
                        Built-in
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
