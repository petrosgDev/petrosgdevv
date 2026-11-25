'use client';

import React, { useRef, useState } from 'react';
import { Download, RotateCcw, Shield, Upload } from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase';
import { CARD_CLASS, SectionHeader } from '@/components/admin/AdminFields';

interface SettingsSectionProps {
  authMode: 'open' | 'env' | 'claimed' | 'claim';
  isCustomized: boolean;
  updatedAt: string | null;
  resetting: boolean;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onResetDefaults: () => Promise<void>;
}

export function SettingsSection({
  authMode,
  isCustomized,
  updatedAt,
  resetting,
  onExportJson,
  onImportJson,
  onResetDefaults,
}: SettingsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const firebaseActive = isFirebaseConfigured();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="11. System & Recovery"
        title="Backup, Security & Storage"
        description="Export full portfolio snapshots, restore defaults, and review active storage and authentication settings."
      />

      {/* Environment & Storage Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${CARD_CLASS} space-y-2.5`}>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
            <Shield className="h-3.5 w-3.5" />
            <span>Authentication State</span>
          </div>
          <p className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            {authMode === 'open'
              ? 'Local Dev Mode (Open)'
              : authMode === 'env'
                ? 'Env Passcode Active'
                : 'Claimed Passcode'}
          </p>
          <p className="text-[12.5px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
            {authMode === 'open'
              ? 'Password prompts are skipped while running locally in development mode. Setting ADMIN_PASSCODE or building for production re-enables strict authentication.'
              : 'Administrative write routes require a signed session bearer token.'}
          </p>
        </div>

        <div className={`${CARD_CLASS} space-y-2.5`}>
          <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
            Persistence Layer
          </p>
          <p className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            {firebaseActive ? 'Firestore + Local CMS' : 'Local Disk Store (.data)'}
          </p>
          <p className="text-[12.5px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
            {isCustomized
              ? `Customized configuration saved (${updatedAt ? new Date(updatedAt).toLocaleString() : 'Active'}).`
              : 'Serving built-in portfolio defaults from src/data/portfolioVault.ts.'}
          </p>
        </div>
      </div>

      {/* Backup & Reset */}
      <div className={`${CARD_CLASS} space-y-5`}>
        <div className="space-y-1">
          <h3 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            JSON Backup, Import &amp; Factory Reset
          </h3>
          <p className="text-[12.5px] leading-relaxed text-[#666666] dark:text-[#9A9A96] max-w-[64ch]">
            Export every text, image path, link, blog setting, SEO setting, and UI color palette into a portable JSON file, or reset back to the shipped defaults.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Full JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportJson(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import JSON Snapshot</span>
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              disabled={resetting}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-red-500/30 px-4 text-[12px] font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Defaults</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-red-500/35 bg-red-50/70 dark:bg-red-950/25 px-3 py-1.5">
              <span className="text-[11.5px] font-medium text-red-800 dark:text-red-300 px-1">
                Restore built-in defaults?
              </span>
              <button
                type="button"
                disabled={resetting}
                onClick={async () => {
                  await onResetDefaults();
                  setConfirmReset(false);
                }}
                className="inline-flex h-7 items-center rounded-full bg-red-700 px-3 text-[11px] font-medium text-white hover:bg-red-800 cursor-pointer disabled:opacity-50"
              >
                {resetting ? 'Resetting…' : 'Confirm Reset'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-medium hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
