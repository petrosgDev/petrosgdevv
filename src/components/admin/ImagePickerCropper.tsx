'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Crop,
  FolderOpen,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import type { MediaAssetItem } from '@/app/api/media/route';
import type { ProjectImage } from '@/data/portfolio';
import { Field, INPUT_CLASS, TextInput } from '@/components/admin/AdminFields';

interface ImagePickerCropperProps {
  id: string;
  label: string;
  value: string;
  onChange: (nextSrc: string) => void;
  authHeaders?: Record<string, string>;
  aspectHint?: ProjectImage['aspect'] | 'square';
  showMetadata?: {
    alt: string;
    caption: string;
    aspect: ProjectImage['aspect'];
    onChangeMeta: (patch: Partial<ProjectImage>) => void;
  };
}

export function ImagePickerCropper({
  id,
  label,
  value,
  onChange,
  authHeaders = {},
  aspectHint = 'wide',
  showMetadata,
}: ImagePickerCropperProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaAssetItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Interactive crop state
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropAspect, setCropAspect] = useState<'16:10' | '4:3' | '3:4' | '1:1'>(
    aspectHint === 'portrait'
      ? '3:4'
      : aspectHint === 'standard'
        ? '4:3'
        : aspectHint === 'square'
          ? '1:1'
          : '16:10'
  );
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const loadMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media/', { cache: 'no-store' });
      if (!res.ok) return;
      const json = (await res.json()) as { items?: MediaAssetItem[] };
      setMediaItems(json.items ?? []);
    } catch {
      // Ignore transient errors
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (showLibrary) {
      void loadMedia();
    }
  }, [showLibrary]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/media/', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });
      const json = (await res.json()) as { item?: MediaAssetItem; error?: string };
      if (!res.ok || !json.item) {
        setError(json.error || 'Image upload failed.');
        return;
      }
      onChange(json.item.url);
      if (showLibrary) {
        await loadMedia();
      }
    } catch {
      setError('Network error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  // Render interactive crop canvas
  useEffect(() => {
    if (!cropSource || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dims: Record<'16:10' | '4:3' | '3:4' | '1:1', [number, number]> = {
      '16:10': [640, 400],
      '4:3': [560, 420],
      '3:4': [390, 520],
      '1:1': [440, 440],
    };
    const [w, h] = dims[cropAspect];
    canvas.width = w;
    canvas.height = h;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#141413';
      ctx.fillRect(0, 0, w, h);

      const baseScale = Math.max(w / img.width, h / img.height);
      const drawW = img.width * baseScale * zoom;
      const drawH = img.height * baseScale * zoom;
      const dx = (w - drawW) / 2 + offsetX * 2;
      const dy = (h - drawH) / 2 + offsetY * 2;

      ctx.drawImage(img, dx, dy, drawW, drawH);
    };
    img.src = cropSource;
  }, [cropSource, cropAspect, zoom, offsetX, offsetY]);

  const applyCropAndUpload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], `cropped-${Date.now()}.png`, {
        type: 'image/png',
      });
      await uploadFile(croppedFile);
      setCropSource(null);
    }, 'image/png');
  };

  const aspectFrameClass =
    aspectHint === 'portrait'
      ? 'aspect-[3/4] max-w-[140px]'
      : aspectHint === 'square'
        ? 'aspect-square max-w-[160px]'
        : aspectHint === 'standard'
          ? 'aspect-[4/3] max-w-[220px]'
          : 'aspect-[16/10] max-w-[240px]';

  return (
    <div className="rounded-xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0E0E0D] p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail Preview */}
        <div
          className={`w-full shrink-0 overflow-hidden rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-[#F6F6F5] dark:bg-[#141413] flex items-center justify-center ${aspectFrameClass}`}
        >
          {value ? (
            <img
              src={value}
              alt={showMetadata?.alt || label}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-[#666666] dark:text-[#9A9A96]">
              <ImageIcon className="h-5 w-5 opacity-50" />
              <span className="text-[10px] font-mono">No image</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3 min-w-0">
          <Field id={id} label={label} hint="Relative path or HTTPS URL">
            <input
              id={id}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/images/project-aman-pay.png"
              className={INPUT_CLASS}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-3.5 text-[11.5px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 cursor-pointer"
            >
              <Upload className="h-3 w-3" />
              <span>{uploading ? 'Uploading…' : 'Upload Image'}</span>
            </button>

            <input
              ref={cropInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCropSource(reader.result as string);
                    setZoom(1);
                    setOffsetX(0);
                    setOffsetY(0);
                  };
                  reader.readAsDataURL(file);
                }
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (value && !value.endsWith('.svg')) {
                  setCropSource(value);
                  setZoom(1);
                  setOffsetX(0);
                  setOffsetY(0);
                } else {
                  cropInputRef.current?.click();
                }
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
            >
              <Crop className="h-3 w-3" />
              <span>Crop / Frame</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLibrary((v) => !v)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
            >
              <FolderOpen className="h-3 w-3" />
              <span>{showLibrary ? 'Hide Library' : 'Pick from Library'}</span>
            </button>
          </div>

          {error ? (
            <p className="text-[11.5px] font-mono text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </div>
      </div>

      {/* Metadata fields for ProjectImage */}
      {showMetadata ? (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#EAEAEA] dark:border-[#222220]">
          <div className="sm:col-span-5">
            <TextInput
              id={`${id}-alt`}
              label="Alt Text"
              maxLength={240}
              value={showMetadata.alt}
              onChange={(alt) => showMetadata.onChangeMeta({ alt })}
              placeholder="Descriptive image alt text"
            />
          </div>
          <div className="sm:col-span-5">
            <TextInput
              id={`${id}-caption`}
              label="Caption"
              maxLength={400}
              value={showMetadata.caption}
              onChange={(caption) => showMetadata.onChangeMeta({ caption })}
              placeholder="Short image caption"
            />
          </div>
          <div className="sm:col-span-2">
            <Field id={`${id}-aspect`} label="Aspect">
              <select
                id={`${id}-aspect`}
                value={showMetadata.aspect}
                onChange={(e) =>
                  showMetadata.onChangeMeta({
                    aspect: e.target.value as ProjectImage['aspect'],
                  })
                }
                className={INPUT_CLASS}
              >
                <option value="wide">Wide</option>
                <option value="standard">Standard</option>
                <option value="portrait">Portrait</option>
              </select>
            </Field>
          </div>
        </div>
      ) : null}

      {/* Inline Media Library Picker */}
      {showLibrary ? (
        <div className="pt-3 border-t border-[#EAEAEA] dark:border-[#222220] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#666666] dark:text-[#9A9A96]">
              Available Assets ({mediaItems.length})
            </span>
            {loadingMedia ? (
              <span className="text-[11px] font-mono text-[#666666]">Loading…</span>
            ) : null}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            {mediaItems.map((item) => {
              const selected = value === item.url;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    setShowLibrary(false);
                  }}
                  title={item.url}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-lg border transition-all cursor-pointer ${
                    selected
                      ? 'border-[#1A1A1A] dark:border-[#F0F0EE] ring-2 ring-[#1A1A1A] dark:ring-[#F0F0EE]'
                      : 'border-black/[0.08] dark:border-white/[0.1] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE]'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover bg-[#F6F6F5] dark:bg-[#141413]"
                  />
                  {selected ? (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Crop Modal */}
      {cropSource ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#111110] p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Crop &amp; Reframe Image
                </h3>
                <p className="text-[12px] text-[#666666] dark:text-[#9A9A96]">
                  Adjust aspect, zoom, and position, then save a new asset copy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCropSource(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.1] dark:border-white/[0.12] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-center rounded-xl bg-[#0A0A0A] p-4 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[300px] w-auto rounded-lg border border-white/10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <Field id={`${id}-crop-aspect`} label="Aspect">
                <select
                  id={`${id}-crop-aspect`}
                  value={cropAspect}
                  onChange={(e) =>
                    setCropAspect(e.target.value as '16:10' | '4:3' | '3:4' | '1:1')
                  }
                  className={INPUT_CLASS}
                >
                  <option value="16:10">16:10 Wide</option>
                  <option value="4:3">4:3 Standard</option>
                  <option value="3:4">3:4 Portrait</option>
                  <option value="1:1">1:1 Square</option>
                </select>
              </Field>
              <Field id={`${id}-crop-zoom`} label={`Zoom (${zoom.toFixed(2)}x)`}>
                <input
                  id={`${id}-crop-zoom`}
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#1A1A1A] dark:accent-[#F0F0EE]"
                />
              </Field>
              <Field id={`${id}-crop-x`} label={`Pan X (${offsetX})`}>
                <input
                  id={`${id}-crop-x`}
                  type="range"
                  min={-150}
                  max={150}
                  step={2}
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="w-full accent-[#1A1A1A] dark:accent-[#F0F0EE]"
                />
              </Field>
              <Field id={`${id}-crop-y`} label={`Pan Y (${offsetY})`}>
                <input
                  id={`${id}-crop-y`}
                  type="range"
                  min={-150}
                  max={150}
                  step={2}
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full accent-[#1A1A1A] dark:accent-[#F0F0EE]"
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAEAEA] dark:border-[#222220]">
              <button
                type="button"
                onClick={() => cropInputRef.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Choose Different File</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCropSource(null)}
                  className="inline-flex h-9 items-center rounded-full px-4 text-[12px] font-medium text-[#666666] dark:text-[#9A9A96] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCropAndUpload}
                  disabled={uploading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-45 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{uploading ? 'Saving…' : 'Apply & Save Image'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
