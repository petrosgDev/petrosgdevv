'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Compass,
  FolderGit2,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
  Search,
  Settings,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import type { AdminSectionKey } from '@/lib/portfolioSchema';

export type AdminTabId = 'overview' | AdminSectionKey;

interface NavEntry {
  id: AdminTabId;
  index: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface NavGroup {
  heading: string;
  items: NavEntry[];
}

interface AdminSidebarProps {
  brand: string;
  activeTab: AdminTabId;
  dirtySections: AdminSectionKey[];
  counts: {
    projects: number;
    skills: number;
    experiences: number;
    navigation: number;
  };
  isCustomized: boolean;
  userEmail?: string | null;
  firebaseConfigured: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectTab: (tab: AdminTabId) => void;
  onLogout: () => void;
}

export function AdminSidebar({
  brand,
  activeTab,
  dirtySections,
  counts,
  isCustomized,
  userEmail,
  firebaseConfigured,
  mobileOpen,
  onCloseMobile,
  onSelectTab,
  onLogout,
}: AdminSidebarProps) {
  const groups: NavGroup[] = [
    {
      heading: 'Workspace',
      items: [{ id: 'overview', index: '00', label: 'Overview', icon: LayoutDashboard }],
    },
    {
      heading: 'Content & Media',
      items: [
        { id: 'profile', index: '01', label: 'Profile & Hero', icon: User },
        {
          id: 'projects',
          index: '02',
          label: 'Projects & Work',
          icon: FolderGit2,
          count: counts.projects,
        },
        {
          id: 'skills',
          index: '03',
          label: 'Skills & Stack',
          icon: Wrench,
          count: counts.skills,
        },
        {
          id: 'experience',
          index: '04',
          label: 'Experience',
          icon: Layers,
          count: counts.experiences,
        },
        { id: 'about', index: '05', label: 'About & Philosophy', icon: Sparkles },
        { id: 'contact', index: '06', label: 'Contact & Blog', icon: Mail },
        {
          id: 'navigation',
          index: '07',
          label: 'Navigation & Footer',
          icon: Compass,
          count: counts.navigation,
        },
        { id: 'media', index: '09', label: 'Media Library', icon: ImageIcon },
      ],
    },
    {
      heading: 'Appearance & System',
      items: [
        { id: 'appearance', index: '08', label: 'UI Colors & Theme', icon: Palette },
        { id: 'seo', index: '10', label: 'SEO & Metadata', icon: Search },
        { id: 'settings', index: '11', label: 'Backup & Settings', icon: Settings },
      ],
    },
  ];

  const sidebarBody = (
    <div className="flex h-full flex-col justify-between bg-[#FAFAFA] dark:bg-[#0E0E0D] border-r border-[#EAEAEA] dark:border-[#222220]">
      {/* Brand Block */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-[#EAEAEA] dark:border-[#222220]">
          <Link
            href="/"
            className="flex items-center gap-2.5 min-w-0 group"
            title="Return to public portfolio"
          >
            <span className="font-sans text-[12px] font-semibold tracking-[0.16em] text-[#1A1A1A] dark:text-[#F0F0EE] truncate">
              {brand}
            </span>
            <span className="rounded-full border border-black/[0.1] dark:border-white/[0.12] px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-[0.1em] text-[#666666] dark:text-[#9A9A96]">
              CMS
            </span>
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] text-[#666666] dark:text-[#9A9A96] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav
          aria-label="Admin sections"
          className="flex-1 overflow-y-auto px-3 py-5 space-y-6"
        >
          {groups.map((group) => (
            <div key={group.heading} className="space-y-1.5">
              <p className="px-3 text-[10px] font-mono uppercase tracking-[0.16em] text-[#666666] dark:text-[#9A9A96]">
                {group.heading}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  const dirty =
                    item.id !== 'overview' &&
                    dirtySections.includes(item.id as AdminSectionKey);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`group w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all cursor-pointer ${
                        active
                          ? 'bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A] font-medium shadow-sm'
                          : 'text-[#555553] dark:text-[#A3A6AB] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono text-[10px] tabular-nums ${
                            active
                              ? 'text-white/65 dark:text-[#0A0A0A]/65'
                              : 'text-[#666666]/70 dark:text-[#9A9A96]/70'
                          }`}
                        >
                          {item.index}
                        </span>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>

                      <span className="flex items-center gap-1.5 shrink-0">
                        {dirty ? (
                          <span
                            title="Unsaved changes"
                            className={`h-2 w-2 rounded-full ${
                              active ? 'bg-amber-300 dark:bg-amber-600' : 'bg-amber-500'
                            }`}
                          />
                        ) : null}
                        {typeof item.count === 'number' ? (
                          <span
                            className={`font-mono text-[10.5px] tabular-nums ${
                              active
                                ? 'text-white/75 dark:text-[#0A0A0A]/75'
                                : 'text-[#666666] dark:text-[#9A9A96]'
                            }`}
                          >
                            {item.count}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Status & Links */}
      <div className="shrink-0 border-t border-[#EAEAEA] dark:border-[#222220] p-4 space-y-2.5">
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
          <span className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                firebaseConfigured
                  ? isCustomized
                    ? 'bg-emerald-500'
                    : 'bg-sky-500'
                  : 'bg-amber-500'
              }`}
            />
            {firebaseConfigured
              ? isCustomized
                ? 'Firestore Synced'
                : 'Firestore Seed'
              : 'Firebase Pending'}
          </span>
          <span>Google Auth</span>
        </div>

        {userEmail ? (
          <p className="px-1 text-[10.5px] font-mono text-[#666666] dark:text-[#9A9A96] truncate">
            {userEmail}
          </p>
        ) : null}

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#111110] px-3.5 py-2 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
        >
          <span>Open Live Portfolio</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 px-3.5 py-2 text-[12px] font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-[272px] shrink-0 h-screen sticky top-0 z-30">
        {sidebarBody}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            aria-hidden="true"
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full shadow-2xl">
            {sidebarBody}
          </aside>
        </div>
      ) : null}
    </>
  );
}
