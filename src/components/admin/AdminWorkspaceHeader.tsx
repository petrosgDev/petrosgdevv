'use client';

import React from 'react';
import { Eye, EyeOff, Menu, Moon, RotateCcw, Save, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

interface AdminWorkspaceHeaderProps {
  sectionTitle: string;
  dirtyCount: number;
  saving: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onOpenMobileSidebar: () => void;
  onDiscardDraft: () => void;
  onPublish: () => void;
}

export function AdminWorkspaceHeader({
  sectionTitle,
  dirtyCount,
  saving,
  showPreview,
  onTogglePreview,
  onOpenMobileSidebar,
  onDiscardDraft,
  onPublish,
}: AdminWorkspaceHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#EAEAEA] dark:border-[#222220] bg-white/90 dark:bg-[#0A0A0A]/90 px-4 sm:px-6 lg:px-8 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open admin navigation"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-[#F5F5F4] dark:bg-[#17191C] text-[#1A1A1A] dark:text-[#F0F0EE] cursor-pointer shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="font-display text-[18px] sm:text-[20px] font-extrabold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE] truncate">
            {sectionTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onTogglePreview}
          title={showPreview ? 'Hide live preview pane' : 'Show live preview pane'}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-medium transition-colors cursor-pointer ${
            showPreview
              ? 'border-[#1A1A1A] dark:border-[#F0F0EE] bg-[#F5F5F4] dark:bg-[#17191C] text-[#1A1A1A] dark:text-[#F0F0EE]'
              : 'border-black/[0.1] dark:border-white/[0.12] text-[#666666] dark:text-[#9A9A96] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
          }`}
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden md:inline">{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-[#F5F5F4]/80 dark:bg-[#17191C]/80 text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {dirtyCount > 0 ? (
          <button
            type="button"
            onClick={onDiscardDraft}
            title="Discard unsaved changes"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3.5 text-[12px] font-medium text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Discard</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onPublish}
          disabled={saving || dirtyCount === 0}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 sm:px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-40 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Publishing…' : 'Publish Changes'}</span>
        </button>
      </div>
    </header>
  );
}
