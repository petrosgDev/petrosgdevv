'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { User } from 'firebase/auth';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import type { PortfolioBundle } from '@/data/portfolio';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import {
  getDirtySections,
  type AdminSectionKey,
  validatePortfolioBundle,
} from '@/lib/portfolioSchema';
import { DEFAULT_THEME_TOKENS } from '@/lib/themeSystem';
import {
  AUTHORIZED_ADMIN_EMAIL,
  getFirebaseAdminIdToken,
  getFirebaseProjectInfo,
  isAuthorizedAdminUser,
  resetPublishedPortfolio,
  savePublishedPortfolio,
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeAdminAuth,
  subscribePublishedPortfolio,
} from '@/lib/firebase';
import { usePortfolio } from '@/components/PortfolioContext';
import { AdminErrorBoundary, CARD_CLASS } from '@/components/admin/AdminFields';
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

function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

function AdminStudioContent() {
  const { applyPortfolio } = usePortfolio();
  const firebaseInfo = useMemo(() => getFirebaseProjectInfo(), []);

  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [draft, setDraft] = useState<PortfolioBundle>(() => getDefaultPortfolioBundle());
  const [savedBundle, setSavedBundle] = useState<PortfolioBundle>(() =>
    getDefaultPortfolioBundle()
  );
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isCustomized, setIsCustomized] = useState(false);
  const [bundleReady, setBundleReady] = useState(false);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const authorized = isAuthorizedAdminUser(user);
  const savingRef = useRef(false);
  const hasDirtyRef = useRef(false);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeAdminAuth(async (nextUser) => {
      setUser(nextUser);
      if (nextUser && isAuthorizedAdminUser(nextUser)) {
        const token = await getFirebaseAdminIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore /portfolio/published when verified owner is signed in
  useEffect(() => {
    if (!authorized) {
      setBundleReady(false);
      return;
    }

    const unsubscribe = subscribePublishedPortfolio(
      (snapshot) => {
        // Ignore snapshot echoes while saving or while the user has unsaved edits in the editor
        if (savingRef.current) {
          setBundleReady(true);
          return;
        }

        const defaults = getDefaultPortfolioBundle();
        if (snapshot) {
          const hydrated: PortfolioBundle = {
            ...defaults,
            ...snapshot.data,
            THEME_TOKENS: snapshot.data.THEME_TOKENS ?? defaults.THEME_TOKENS,
            SEO_SETTINGS: snapshot.data.SEO_SETTINGS ?? defaults.SEO_SETTINGS,
            BLOG_SETTINGS: snapshot.data.BLOG_SETTINGS ?? defaults.BLOG_SETTINGS,
          };
          setSavedBundle(hydrated);
          if (!hasDirtyRef.current) {
            setDraft(hydrated);
          }
          setUpdatedAt(snapshot.updatedAt ?? new Date().toISOString());
          setIsCustomized(snapshot.isCustomized);
          applyPortfolio(hydrated, {
            updatedAt: snapshot.updatedAt ?? new Date().toISOString(),
            isCustomized: snapshot.isCustomized,
          });
        } else {
          setSavedBundle(defaults);
          if (!hasDirtyRef.current) {
            setDraft(defaults);
          }
          setUpdatedAt(null);
          setIsCustomized(false);
        }
        setBundleReady(true);
      },
      (err) => {
        setBundleReady(true);
        setStatusMessage({
          type: 'error',
          text: `Firestore read warning: ${err.message}`,
        });
      }
    );

    return () => unsubscribe();
  }, [authorized, applyPortfolio]);

  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
    return headers;
  }, [idToken]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const signedInUser = await signInAdminWithGoogle();
      if (!isAuthorizedAdminUser(signedInUser)) {
        setAuthError(
          `Signed in as ${signedInUser.email || 'unknown account'}. Only verified ${AUTHORIZED_ADMIN_EMAIL} is permitted.`
        );
      } else {
        const token = await getFirebaseAdminIdToken();
        setIdToken(token);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Google Sign-In did not complete.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthError(null);
    await signOutAdmin();
    setUser(null);
    setIdToken(null);
    setActiveTab('overview');
  };

  const dirtySections = useMemo<AdminSectionKey[]>(
    () => getDirtySections(savedBundle, draft),
    [savedBundle, draft]
  );

  useEffect(() => {
    hasDirtyRef.current = dirtySections.length > 0;
  }, [dirtySections]);

  const handleSave = async () => {
    if (!user || !isAuthorizedAdminUser(user)) {
      setStatusMessage({
        type: 'error',
        text: `Only verified ${AUTHORIZED_ADMIN_EMAIL} can publish to Firestore.`,
      });
      return;
    }

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
      const saved = await savePublishedPortfolio(validation.data, user);
      setDraft(saved.data);
      setSavedBundle(saved.data);
      setUpdatedAt(saved.updatedAt);
      setIsCustomized(true);
      applyPortfolio(saved.data, {
        updatedAt: saved.updatedAt,
        isCustomized: true,
      });

      setStatusMessage({
        type: 'success',
        text: 'Published live to Firebase Firestore (/portfolio/published)!',
      });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to save portfolio to Firebase Firestore.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!user || !isAuthorizedAdminUser(user)) return;

    setResetting(true);
    setStatusMessage(null);
    try {
      await resetPublishedPortfolio(user);
      const defaults = getDefaultPortfolioBundle();
      setDraft(defaults);
      setSavedBundle(defaults);
      setUpdatedAt(null);
      setIsCustomized(false);
      applyPortfolio(defaults, { updatedAt: null, isCustomized: false });
      setStatusMessage({
        type: 'success',
        text: 'Deleted Firestore override and restored built-in portfolio defaults.',
      });
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to reset Firestore document.',
      });
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
            text: 'Snapshot imported into draft! Click "Publish Changes" to write to Firestore.',
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

  if (!authReady || (authorized && !bundleReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0A0A0A] p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white" />
      </div>
    );
  }

  // Gate 1: Signed in with an unauthorized Google account
  if (user && !authorized) {
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
            className={`${CARD_CLASS} border border-red-500/25 p-7 sm:p-8 space-y-5 shadow-xl`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-red-700 dark:text-red-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-[24px] font-extrabold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Access Denied
                </h1>
                <p className="text-[12px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Unauthorized Google Account
                </p>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
              Signed in as{' '}
              <strong className="text-[#1A1A1A] dark:text-[#F0F0EE]">
                {user.email || 'Unknown'}
              </strong>
              . This account is not authorized to access Portfolio Studio.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  await handleSignOut();
                  await handleGoogleSignIn();
                }}
                className="w-full h-11 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A] font-medium text-[13px] hover:opacity-85 transition-opacity flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <GoogleMark />
                <span>Switch Google Account</span>
              </button>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="w-full h-10 rounded-full border border-black/[0.12] dark:border-white/[0.14] text-[12.5px] font-medium hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gate 2: Not signed in — Google Sign-In screen
  if (!user) {
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
            className={`${CARD_CLASS} border border-black/10 dark:border-white/10 p-7 sm:p-8 space-y-5 shadow-xl`}
          >
            <h1 className="font-display text-[22px] font-extrabold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
              Portfolio Studio
            </h1>

            {!firebaseInfo.configured ? (
              <div className="rounded-xl border border-amber-500/35 bg-amber-50/70 dark:bg-amber-950/25 p-3.5 flex items-start gap-2.5 text-[12px] text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Firebase is not configured. Check{' '}
                  <code className="font-mono">firebase-applet-config.json</code>.
                </span>
              </div>
            ) : null}

            {authError ? (
              <p className="text-[12px] text-red-600 dark:text-red-400 font-mono">
                {authError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={authLoading || !firebaseInfo.configured}
              className="w-full h-11 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A] font-medium text-[13px] tracking-wide hover:opacity-85 disabled:opacity-45 transition-opacity flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black" />
              ) : (
                <>
                  <GoogleMark />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0A0A0A] text-[#1A1A1A] dark:text-[#F0F0EE]">
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
        userEmail={user.email}
        firebaseConfigured={firebaseInfo.configured}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={() => void handleSignOut()}
      />

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
              className={`mb-6 flex items-center gap-2.5 rounded-2xl p-4 text-[13px] border ${statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
                }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          ) : null}

          <div
            className={`grid grid-cols-1 gap-8 items-start ${showPreview ? 'xl:grid-cols-12' : ''
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
                  userEmail={user.email}
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
