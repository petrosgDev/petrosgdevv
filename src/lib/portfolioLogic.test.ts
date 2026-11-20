import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS } from '../data/portfolio';
import {
  filterProjects,
  getAdjacentProjects,
  getCategoryCounts,
  getFeaturedProjects,
  getProjectBySlug,
  getRelatedProjects,
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
