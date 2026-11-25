'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import type { PortfolioBundle } from '@/data/portfolio';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import {
  getDirtySections,
  type AdminSectionKey,
  validatePortfolioBundle,
} from '@/lib/portfolioSchema';
import { DEFAULT_THEME_TOKENS } from '@/lib/themeSystem';
import { usePortfolio } from '@/components/PortfolioContext';
import {
  AdminErrorBoundary,
  CARD_CLASS,
  INPUT_CLASS,
} from '@/components/admin/AdminFields';
import { AdminSidebar, type AdminTabId } from '@/components/admin/AdminSidebar';
import { AdminWorkspaceHeader } from '@/components/admin/AdminWorkspaceHeader';
import { OverviewSection } from '@/components/admin/OverviewSection';
import { ProfileSection } from '@/components/admin/ProfileSection';
import { ProjectsSection } from '@/components/admin/ProjectsSection';
import { SkillsSection } from '@/components/admin/SkillsSection';
import { ExperienceSection } from '@/components/admin/ExperienceSection';
import { AboutSection } from '@/components/admin/AboutSection';
import { ContactBlogSection } from '@/components/admin/ContactBlogSection';
import { NavigationFooterSection } from '@/components/admin/NavigationFooterSection';
import { AppearanceSection } from '@/components/admin/AppearanceSection';
import { MediaLibrarySection } from '@/components/admin/MediaLibrarySection';
import { SeoSection } from '@/components/admin/SeoSection';
import { SettingsSection } from '@/components/admin/SettingsSection';
import { LivePreviewPane } from '@/components/admin/LivePreviewPane';

type AuthMode = 'loading' | 'open' | 'env' | 'claimed' | 'claim';

const TAB_TITLES: Record<AdminTabId, string> = {
  overview: '00 · Studio Overview',
  profile: '01 · Profile & Hero',
  projects: '02 · Projects & Case Studies',
  skills: '03 · Skills & Stack',
  experience: '04 · Experience Timeline',
  about: '05 · About & Philosophy',
  contact: '06 · Contact & Blog',
  navigation: '07 · Navigation & Footer',
  appearance: '08 · UI Colors & Theme',
  media: '09 · Media Library',
  seo: '10 · SEO & Metadata',
  settings: '11 · Backup & Settings',
};

function AdminStudioContent() {
  const { applyPortfolio } = usePortfolio();

  const [authMode, setAuthMode] = useState<AuthMode>('loading');
  const [authorized, setAuthorized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [draft, setDraft] = useState<PortfolioBundle>(() => getDefaultPortfolioBundle());
  const [savedBundle, setSavedBundle] = useState<PortfolioBundle>(() =>
    getDefaultPortfolioBundle()
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isCustomized, setIsCustomized] = useState(false);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadPortfolioRecord = useCallback(async (activeToken: string | null) => {
    const pRes = await fetch('/api/portfolio/', {
      headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
      cache: 'no-store',
    });
    if (!pRes.ok) return;
    const pData = await pRes.json();
    if (pData?.data) {
      const defaults = getDefaultPortfolioBundle();
      const hydrated: PortfolioBundle = {
        ...defaults,
        ...pData.data,
        THEME_TOKENS: pData.data.THEME_TOKENS ?? defaults.THEME_TOKENS,
        SEO_SETTINGS: pData.data.SEO_SETTINGS ?? defaults.SEO_SETTINGS,
        BLOG_SETTINGS: pData.data.BLOG_SETTINGS ?? defaults.BLOG_SETTINGS,
      };
      setDraft(hydrated);
      setSavedBundle(hydrated);
      setUpdatedAt(pData.updatedAt || null);
      setIsCustomized(Boolean(pData.isCustomized));
    }
  }, []);

  const checkStatus = useCallback(
    async (existingToken?: string | null) => {
      try {
        const activeToken = existingToken ?? token;
        const res = await fetch('/api/admin/auth/status/', {
          headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
          cache: 'no-store',
        });
        if (!res.ok) {
          setAuthMode('claim');
          setAuthorized(false);
          return;
        }
        const data = (await res.json()) as {
          mode: Exclude<AuthMode, 'loading'>;
          authenticated: boolean;
        };
        setAuthMode(data.mode);
        setAuthorized(Boolean(data.authenticated));
        if (data.authenticated) {
          await loadPortfolioRecord(activeToken);
        }
      } catch {
        setAuthMode('claim');
        setAuthorized(false);
      }
    },
    [loadPortfolioRecord, token]
  );

  useEffect(() => {
    const savedToken =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('petros_admin_token')
        : null;
    if (savedToken) {
      setToken(savedToken);
    }
    void checkStatus(savedToken);
  }, [checkStatus]);

  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const endpoint =
      authMode === 'claim' ? '/api/admin/auth/claim/' : '/api/admin/auth/login/';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();
      if (!res.ok) {
        setAuthError(json.error || 'Authentication failed.');
        return;
      }

      if (json.token) {
        setToken(json.token);
        sessionStorage.setItem('petros_admin_token', json.token);
        setPassword('');
        await checkStatus(json.token);
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('petros_admin_token');
    setToken(null);
    setAuthorized(false);
    setAuthMode('claimed');
    setActiveTab('overview');
  };

  const dirtySections = useMemo<AdminSectionKey[]>(
    () => getDirtySections(savedBundle, draft),
    [savedBundle, draft]
  );

  const handleSave = async () => {
    setStatusMessage(null);
    const validation = validatePortfolioBundle(draft);
    if (!validation.ok) {
      setStatusMessage({
        type: 'error',
        text: validation.errors[0] || 'Validation error in portfolio data.',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/portfolio/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(validation.data),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusMessage({
          type: 'error',
          text: json.error || 'Failed to publish portfolio changes.',
        });
        return;
      }

      setDraft(validation.data);
      setSavedBundle(validation.data);
      setUpdatedAt(json.updatedAt || new Date().toISOString());
      setIsCustomized(true);
      applyPortfolio(validation.data, {
        updatedAt: json.updatedAt,
        isCustomized: true,
      });

      setStatusMessage({
        type: 'success',
        text: 'All portfolio text, images, links, blog settings, and UI colors published!',
      });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error while saving portfolio.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setResetting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/portfolio/reset/', {
        method: 'POST',
        headers: authHeaders,
      });

      if (!res.ok) {
        const json = await res.json();
        setStatusMessage({
          type: 'error',
          text: json.error || 'Failed to reset portfolio.',
        });
        return;
      }

      const defaults = getDefaultPortfolioBundle();
      setDraft(defaults);
      setSavedBundle(defaults);
      setUpdatedAt(null);
      setIsCustomized(false);
      applyPortfolio(defaults, { updatedAt: null, isCustomized: false });
      setStatusMessage({
        type: 'success',
        text: 'Portfolio restored to built-in default configuration.',
      });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to reset portfolio.' });
    } finally {
      setResetting(false);
    }
  };

  const handleDiscardDraft = () => {
    setDraft(JSON.parse(JSON.stringify(savedBundle)) as PortfolioBundle);
    setStatusMessage({
      type: 'success',
      text: 'Unsaved draft edits discarded.',
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petros-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const validated = validatePortfolioBundle(parsed);
        if (validated.ok) {
          setDraft(validated.data);
          setStatusMessage({
            type: 'success',
            text: 'Snapshot imported into draft! Click "Publish Changes" to apply live.',
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: `Invalid JSON: ${validated.errors[0]}`,
          });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'Malformed JSON file.' });
      }
    };
    reader.readAsText(file);
  };

  if (authMode === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0A0A0A] p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white" />
      </div>
    );
  }

  if (!authorized && authMode !== 'open') {
    const isClaim = authMode === 'claim';

    return (
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="w-full max-w-md space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.12em] text-[#666666] dark:text-[#9A9A96] hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Portfolio</span>
          </Link>

          <div
            className={`${CARD_CLASS} border border-black/10 dark:border-white/10 p-7 sm:p-8 space-y-6 shadow-xl`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-[24px] font-extrabold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Portfolio Studio
                </h1>
                <p className="text-[12px] text-[#666666] dark:text-[#9A9A96]">
                  {isClaim
                    ? 'Set up initial administrative password'
                    : 'Administrative authentication'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96] mb-1.5">
                  {isClaim ? 'New Admin Password (8+ chars)' : 'Admin Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={INPUT_CLASS}
                  required
                  autoFocus
                />
              </div>

              {authError ? (
                <p className="text-[12px] text-red-600 dark:text-red-400 font-mono">
                  {authError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={authLoading || !password.trim()}
                className="w-full h-11 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A] font-medium text-[13px] tracking-wide hover:opacity-85 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
              >
                {authLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black" />
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>{isClaim ? 'Claim Admin Access' : 'Sign In to Studio'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F0F0EE]">
      {/* Left Sidebar Navigation */}
      <AdminSidebar
        brand={draft.SITE_PROFILE.brand}
        activeTab={activeTab}
        dirtySections={dirtySections}
        counts={{
          projects: draft.PROJECTS.length,
          skills: draft.SKILL_CATEGORIES.length,
          experiences: draft.EXPERIENCES.length,
          navigation: draft.NAVIGATION_LINKS.length,
        }}
        isCustomized={isCustomized}
        authMode={authMode}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminWorkspaceHeader
          sectionTitle={TAB_TITLES[activeTab]}
          dirtyCount={dirtySections.length}
          saving={saving}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((v) => !v)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onDiscardDraft={handleDiscardDraft}
          onPublish={() => void handleSave()}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {statusMessage ? (
            <div
              role="status"
              className={`mb-6 flex items-center gap-2.5 rounded-2xl p-4 text-[13px] border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          ) : null}

          <div
            className={`grid grid-cols-1 gap-8 items-start ${
              showPreview ? 'xl:grid-cols-12' : ''
            }`}
          >
            <div className={showPreview ? 'xl:col-span-8 min-w-0' : 'max-w-5xl'}>
              {activeTab === 'overview' && (
                <OverviewSection
                  draft={draft}
                  updatedAt={updatedAt}
                  isCustomized={isCustomized}
                  dirtySections={dirtySections}
                  resetting={resetting}
                  onNavigate={(nextTab) => setActiveTab(nextTab)}
                  onExportJson={handleExportJson}
                  onImportJson={handleImportJson}
                  onResetDefaults={handleResetDefaults}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileSection
                  profile={draft.SITE_PROFILE}
                  authHeaders={authHeaders}
                  onChange={(SITE_PROFILE) => setDraft({ ...draft, SITE_PROFILE })}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsSection
                  projects={draft.PROJECTS}
                  authHeaders={authHeaders}
                  onChange={(PROJECTS) => setDraft({ ...draft, PROJECTS })}
                />
              )}

              {activeTab === 'skills' && (
                <SkillsSection
                  categories={draft.SKILL_CATEGORIES}
                  onChange={(SKILL_CATEGORIES) =>
                    setDraft({ ...draft, SKILL_CATEGORIES })
                  }
                />
              )}

              {activeTab === 'experience' && (
                <ExperienceSection
                  items={draft.EXPERIENCES}
                  onChange={(EXPERIENCES) => setDraft({ ...draft, EXPERIENCES })}
                />
              )}

              {activeTab === 'about' && (
                <AboutSection
                  pillars={draft.PHILOSOPHY_PILLARS}
                  interests={draft.TECHNICAL_INTERESTS}
                  onChangePillars={(PHILOSOPHY_PILLARS) =>
                    setDraft({ ...draft, PHILOSOPHY_PILLARS })
                  }
                  onChangeInterests={(TECHNICAL_INTERESTS) =>
                    setDraft({ ...draft, TECHNICAL_INTERESTS })
                  }
                />
              )}

              {activeTab === 'contact' && (
                <ContactBlogSection
                  profile={draft.SITE_PROFILE}
                  socialLinks={draft.SOCIAL_LINKS}
                  blogSettings={draft.BLOG_SETTINGS}
                  onChangeProfile={(SITE_PROFILE) =>
                    setDraft({ ...draft, SITE_PROFILE })
                  }
                  onChangeSocialLinks={(SOCIAL_LINKS) =>
                    setDraft({ ...draft, SOCIAL_LINKS })
                  }
                  onChangeBlogSettings={(BLOG_SETTINGS) =>
                    setDraft({ ...draft, BLOG_SETTINGS })
                  }
                />
              )}

              {activeTab === 'navigation' && (
                <NavigationFooterSection
                  navigationLinks={draft.NAVIGATION_LINKS}
                  projectCategories={draft.PROJECT_CATEGORIES}
                  profile={draft.SITE_PROFILE}
                  onChangeNavigation={(NAVIGATION_LINKS) =>
                    setDraft({ ...draft, NAVIGATION_LINKS })
                  }
                  onChangeProfile={(SITE_PROFILE) =>
                    setDraft({ ...draft, SITE_PROFILE })
                  }
                />
              )}

              {activeTab === 'appearance' && (
                <AppearanceSection
                  tokens={draft.THEME_TOKENS ?? DEFAULT_THEME_TOKENS}
                  onChange={(THEME_TOKENS) => setDraft({ ...draft, THEME_TOKENS })}
                />
              )}

              {activeTab === 'media' && (
                <MediaLibrarySection draft={draft} authHeaders={authHeaders} />
              )}

              {activeTab === 'seo' && (
                <SeoSection
                  seo={draft.SEO_SETTINGS}
                  authHeaders={authHeaders}
                  onChange={(SEO_SETTINGS) => setDraft({ ...draft, SEO_SETTINGS })}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsSection
                  authMode={authMode}
                  isCustomized={isCustomized}
                  updatedAt={updatedAt}
                  resetting={resetting}
                  onExportJson={handleExportJson}
                  onImportJson={handleImportJson}
                  onResetDefaults={handleResetDefaults}
                />
              )}
            </div>

            {showPreview ? (
              <div className="xl:col-span-4 min-w-0">
                <LivePreviewPane draft={draft} />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminErrorBoundary>
      <AdminStudioContent />
    </AdminErrorBoundary>
  );
}
