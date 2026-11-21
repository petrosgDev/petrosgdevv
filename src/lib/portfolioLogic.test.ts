import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPERIENCES, PROJECTS } from '../data/portfolio';
import {
  computeExpandedExperienceIds,
  computeIframePreviewMetrics,
  filterProjects,
  formatLiveHost,
  getActiveExperienceId,
  getAdjacentProjects,
  getCategoryCounts,
  getFeaturedProjects,
  getProjectBySlug,
  getRelatedProjects,
  shouldSkipSplash,
} from './portfolioLogic';
import {
  buildMailtoUrl,
  hasValidationErrors,
  submitContactInquiry,
  validateContactForm,
} from './contact';

test('portfolio contains all 8 verified projects with unique slugs', () => {
  assert.equal(PROJECTS.length, 8);
  const slugs = new Set(PROJECTS.map((p) => p.slug));
  assert.equal(slugs.size, 8);
});

test('filterProjects filters accurately by category and search query', () => {
  const desktop = filterProjects(PROJECTS, 'Desktop & Systems', '');
  assert.equal(desktop.length, 2);
  assert.deepEqual(
    desktop.map((p) => p.slug),
    ['nexus-campus-services', 'banking-system']
  );

  const qtSearch = filterProjects(PROJECTS, 'All', 'qt 6');
  assert.equal(qtSearch.length, 1);
  assert.equal(qtSearch[0].slug, 'banking-system');

  const combined = filterProjects(PROJECTS, 'Web Applications', 'whatsapp');
  assert.equal(combined.length, 1);
  assert.equal(combined[0].slug, 'ethio-massage');

  const noMatch = filterProjects(PROJECTS, 'Mobile', 'postgresql');
  assert.equal(noMatch.length, 0);
});

test('getCategoryCounts totals match project inventory', () => {
  const counts = getCategoryCounts(PROJECTS);
  assert.equal(counts.All, 8);
  assert.equal(counts['Web Applications'], 3);
  assert.equal(counts['Brand & Hospitality'], 2);
  assert.equal(counts['Desktop & Systems'], 2);
  assert.equal(counts.Mobile, 1);
});

test('getFeaturedProjects returns the 4 flagship projects', () => {
  const featured = getFeaturedProjects(PROJECTS);
  assert.equal(featured.length, 4);
  assert.equal(featured[0].slug, 'aman-pay');
});

test('getProjectBySlug, getAdjacentProjects, and getRelatedProjects work reliably', () => {
  const first = getProjectBySlug(PROJECTS, 'aman-pay');
  assert.ok(first);
  assert.equal(first.title, 'Aman Pay');

  const adjFirst = getAdjacentProjects(PROJECTS, 'aman-pay');
  assert.equal(adjFirst.previous?.slug, 'banking-system');
  assert.equal(adjFirst.next?.slug, 'event-hub');

  const related = getRelatedProjects(PROJECTS, 'aman-pay', 2);
  assert.equal(related.length, 2);
  assert.ok(related.every((p) => p.slug !== 'aman-pay'));
  assert.ok(related.every((p) => p.category === 'Web Applications'));
});

test('contact form validation catches empty and malformed fields and accepts valid input', () => {
  const emptyErrors = validateContactForm({ name: '', email: 'bad', subject: 'Hi', message: 'short' });
  assert.equal(hasValidationErrors(emptyErrors), true);
  assert.ok(emptyErrors.name);
  assert.ok(emptyErrors.email);
  assert.ok(emptyErrors.subject);
  assert.ok(emptyErrors.message);

  const validValues = {
    name: 'Alex Rivera',
    email: 'alex@example.com',
    subject: 'Full-stack collaboration',
    message: 'Hi Petros, I would like to discuss building a Next.js web platform together.',
  };
  const noErrors = validateContactForm(validValues);
  assert.equal(hasValidationErrors(noErrors), false);

  const mailto = buildMailtoUrl('petrosgeto7@gmail.com', validValues);
  assert.ok(mailto.startsWith('mailto:petrosgeto7@gmail.com?'));
  assert.ok(mailto.includes('subject=Full-stack+collaboration'));
});

test('submitContactInquiry without endpoint returns honest mailto_ready status', async () => {
  const result = await submitContactInquiry(
    {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      subject: 'Project Inquiry',
      message: 'Looking forward to discussing a web application build.',
    },
    'petrosgeto7@gmail.com',
    ''
  );
  assert.equal(result.status, 'mailto_ready');
  assert.ok(result.mailtoUrl?.startsWith('mailto:petrosgeto7@gmail.com?'));
});

test('EXPERIENCES dataset covers INSA 5th Round Summer Camp, education, and skills without project names', () => {
  assert.ok(EXPERIENCES.length >= 4);
  const ids = new Set(EXPERIENCES.map((item) => item.id));
  assert.equal(ids.size, EXPERIENCES.length);

  const insa = EXPERIENCES.find((item) => item.id === 'insa-summer-camp');
  assert.ok(insa);
  assert.equal(insa.organizationUrl, 'https://www.insa.gov.et/');
  assert.match(insa.role, /web\s*&\s*app development/i);
  assert.match(insa.summary, /5th round/i);

  const projectNames = ['Aman Pay', 'EventHub', 'Ethio Massage', 'Raman Caffe', 'Wende Dubai', 'Nexus Campus'];
  for (const item of EXPERIENCES) {
    assert.ok(item.organization.length > 0);
    assert.ok(item.role.length > 0);
    assert.ok(item.points.length >= 2);
    assert.ok(item.stack.length >= 2);
    const fullText = [item.organization, item.role, item.summary, ...item.points.map((p) => `${p.lead ?? ''} ${p.text}`)].join(' ');
    for (const projectName of projectNames) {
      assert.equal(fullText.includes(projectName), false, `Experience should not mention project "${projectName}"`);
    }
  }
});

test('getActiveExperienceId tracks scroll position and bottom boundary accurately', () => {
  assert.equal(getActiveExperienceId([]), null);

  const positions = [
    { id: 'first', top: 380 },
    { id: 'second', top: 760 },
    { id: 'third', top: 1140 },
  ];
  assert.equal(getActiveExperienceId(positions, 240, false), 'first');

  const midScroll = [
    { id: 'first', top: -180 },
    { id: 'second', top: 210 },
    { id: 'third', top: 640 },
  ];
  assert.equal(getActiveExperienceId(midScroll, 240, false), 'second');

  const deepScroll = [
    { id: 'first', top: -700 },
    { id: 'second', top: -240 },
    { id: 'third', top: 190 },
  ];
  assert.equal(getActiveExperienceId(deepScroll, 240, false), 'third');

  assert.equal(getActiveExperienceId(midScroll, 240, true), 'third');
});

test('computeIframePreviewMetrics scales virtual desktop and mobile viewports accurately', () => {
  const desktopCard = computeIframePreviewMetrics(560, 350, 1440);
  assert.equal(desktopCard.iframeWidth, 1440);
  assert.ok(desktopCard.scale > 0.38 && desktopCard.scale < 0.39);
  assert.ok(desktopCard.iframeHeight >= 899 && desktopCard.iframeHeight <= 905);

  // Should never upscale above 1:1 when container is wider than virtual width (e.g. mobile preview mode)
  const mobileInWideContainer = computeIframePreviewMetrics(500, 620, 390);
  assert.equal(mobileInWideContainer.scale, 1);
  assert.equal(mobileInWideContainer.iframeWidth, 390);
  assert.equal(mobileInWideContainer.iframeHeight, 620);

  // Zero-size container guard
  const zeroGuard = computeIframePreviewMetrics(0, 0, 1440);
  assert.equal(zeroGuard.scale, 1);
  assert.equal(zeroGuard.iframeWidth, 1440);
  assert.equal(zeroGuard.iframeHeight, 900);
});

test('formatLiveHost extracts clean hostname without protocol or trailing slash', () => {
  assert.equal(formatLiveHost('https://aman-pay-lake.vercel.app/'), 'aman-pay-lake.vercel.app');
  assert.equal(formatLiveHost('https://www.insa.gov.et/programs/'), 'insa.gov.et/programs');
  assert.equal(formatLiveHost(''), '');
  assert.equal(formatLiveHost('event-hub-mu-five.vercel.app/'), 'event-hub-mu-five.vercel.app');
});

test('shouldSkipSplash respects session memory, reduced motion, and query overrides', () => {
  assert.equal(
    shouldSkipSplash({ search: '', sessionSeen: false, prefersReducedMotion: false }),
    false
  );
  assert.equal(
    shouldSkipSplash({ search: '', sessionSeen: true, prefersReducedMotion: false }),
    true
  );
  assert.equal(
    shouldSkipSplash({ search: '', sessionSeen: false, prefersReducedMotion: true }),
    true
  );
  assert.equal(
    shouldSkipSplash({ search: '?nosplash=1', sessionSeen: false, prefersReducedMotion: false }),
    true
  );
  assert.equal(
    shouldSkipSplash({ search: '?autostart=1', sessionSeen: false, prefersReducedMotion: false }),
    true
  );
});

test('computeExpandedExperienceIds expands cards progressively on scroll with hysteresis', () => {
  const vh = 800; // openThreshold = 528, closeThreshold = 672
  const initialPositions = [
    { id: 'first', top: 420 },
    { id: 'second', top: 680 },
    { id: 'third', top: 960 },
  ];

  // Only the card above 66% viewport height opens; lower cards stay reduced
  const step1 = computeExpandedExperienceIds(initialPositions, new Set(), vh, false);
  assert.deepEqual(step1, ['first']);

  // Scrolling down brings the second card into the trigger zone while third remains reduced
  const scrolledPositions = [
    { id: 'first', top: 100 },
    { id: 'second', top: 480 },
    { id: 'third', top: 760 },
  ];
  const step2 = computeExpandedExperienceIds(scrolledPositions, new Set(step1), vh, false);
  assert.deepEqual(step2, ['first', 'second']);

  // Hysteresis: slight scroll up keeping second between 66% and 84% does not flicker closed
  const slightScrollUp = [
    { id: 'first', top: 220 },
    { id: 'second', top: 600 },
    { id: 'third', top: 880 },
  ];
  const step3 = computeExpandedExperienceIds(slightScrollUp, new Set(step2), vh, false);
  assert.deepEqual(step3, ['first', 'second']);

  // Scrolling further up pushes second below 84% so it retracts back to reduced state
  const scrolledBackUp = [
    { id: 'first', top: 380 },
    { id: 'second', top: 720 },
    { id: 'third', top: 1000 },
  ];
  const step4 = computeExpandedExperienceIds(scrolledBackUp, new Set(step3), vh, false);
  assert.deepEqual(step4, ['first']);

  // At page bottom, visible trailing card opens even if its top is below 66%
  const bottomPositions = [
    { id: 'first', top: -300 },
    { id: 'second', top: 120 },
    { id: 'third', top: 640 },
  ];
  const stepBottom = computeExpandedExperienceIds(bottomPositions, new Set(['first', 'second']), vh, true);
  assert.deepEqual(stepBottom, ['first', 'second', 'third']);
});

test('data shield vault obfuscates personal and project data and decodes cleanly', async () => {
  const { decodeVault, encodeVault, isAiCrawlerUserAgent } = await import('./dataShield');
  const { PORTFOLIO_VAULT } = await import('../data/portfolioVault');

  const sample = { email: 'petrosgeto7@gmail.com', role: 'Software Engineer', items: [1, 2, 3] };
  const encoded = encodeVault(sample);
  assert.equal(encoded.includes('petrosgeto7'), false);
  assert.equal(encoded.includes('Software Engineer'), false);
  assert.deepEqual(decodeVault(encoded), sample);

  // Verify shipped portfolio vault does not expose plaintext sensitive strings
  for (const sensitive of [
    'petrosgeto7@gmail.com',
    '+251 903 433 857',
    'Aman Pay',
    'INSA Summer Camp',
    'Debre Birhan University',
  ]) {
    assert.equal(
      PORTFOLIO_VAULT.includes(sensitive),
      false,
      `PORTFOLIO_VAULT must not contain plaintext "${sensitive}"`
    );
  }

  // AI crawlers and CLI scrapers are flagged
  assert.equal(isAiCrawlerUserAgent('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2'), true);
  assert.equal(isAiCrawlerUserAgent('ClaudeBot/1.0; +claudebot@anthropic.com'), true);
  assert.equal(isAiCrawlerUserAgent('PerplexityBot/1.0'), true);
  assert.equal(isAiCrawlerUserAgent('Google-Extended'), true);
  assert.equal(isAiCrawlerUserAgent('CCBot/2.0'), true);
  assert.equal(isAiCrawlerUserAgent('curl/8.5.0'), true);
  assert.equal(isAiCrawlerUserAgent('python-requests/2.31.0'), true);

  // Standard human browsers are allowed
  assert.equal(
    isAiCrawlerUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'),
    false
  );
  assert.equal(
    isAiCrawlerUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'),
    false
  );
});


