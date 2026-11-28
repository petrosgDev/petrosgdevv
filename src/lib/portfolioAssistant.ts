import type { ExperienceItem, PortfolioBundle, ProjectItem } from '@/data/portfolio';

export interface AssistantLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface AssistantHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantReply {
  answer: string;
  links: AssistantLink[];
  followUps?: string[];
  mode: 'llm' | 'portfolio-engine';
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'his',
  'him',
  'her',
  'what',
  'which',
  'when',
  'where',
  'who',
  'why',
  'how',
  'did',
  'does',
  'has',
  'have',
  'had',
  'was',
  'were',
  'are',
  'can',
  'could',
  'would',
  'should',
  'about',
  'into',
  'from',
  'more',
  'tell',
  'give',
  'show',
  'know',
  'this',
  'that',
  'there',
  'they',
  'them',
  'some',
  'any',
  'all',
  'very',
  'much',
  'petros',
  'geto',
  // Query-facet / intent meta words that should not falsely trigger unrelated project body matches
  'challenge',
  'challenges',
  'problem',
  'problems',
  'solve',
  'solved',
  'hard',
  'hardest',
  'difficult',
  'stack',
  'tech',
  'technology',
  'technologies',
  'architecture',
  'structure',
  'build',
  'built',
  'contribution',
  'role',
  'feature',
  'features',
  'project',
  'projects',
  'work',
  'app',
  'system',
  'live',
  'demo',
  'repo',
  'repository',
  'code',
  'link',
  'links',
  'website',
  'site',
  'strength',
  'strengths',
  'weakness',
  'weaknesses',
  'limitation',
  'limitations',
  'good',
  'bad',
  'side',
  'hire',
  'hiring',
  'engineering',
  'engineer',
  'software',
  'developer',
  'fit',
  'experience',
  'skills',
  'skill',
  'use',
  'used',
  'using',
]);

const QUERY_SYNONYMS: Record<string, readonly string[]> = {
  fintech: ['aman', 'escrow', 'chapa', 'payment', 'banking'],
  payment: ['aman', 'chapa', 'escrow', 'event'],
  payments: ['aman', 'chapa', 'escrow', 'event'],
  escrow: ['aman', 'pay'],
  bank: ['banking', 'cpp', 'qt', 'mysql'],
  banking: ['banking', 'cpp', 'qt', 'mysql'],
  ticket: ['event', 'hub', 'qr', 'chapa'],
  ticketing: ['event', 'hub', 'qr', 'chapa'],
  campus: ['event', 'nexus', 'ncs', 'java'],
  wellness: ['ethio', 'massage', 'whatsapp'],
  spa: ['ethio', 'massage'],
  booking: ['ethio', 'massage', 'whatsapp'],
  fitness: ['lock', 'workout', 'pwa'],
  workout: ['lock', 'pwa'],
  habit: ['lock', 'pwa'],
  interior: ['wende', 'dubai', 'swiper'],
  luxury: ['wende', 'dubai'],
  coffee: ['raman', 'caffe'],
  cafe: ['raman', 'caffe'],
  desktop: ['nexus', 'banking', 'javafx', 'qt', 'c++', 'java'],
  mobile: ['myapp', 'expo', 'react native', 'flutter', 'dart', 'pwa', 'offline'],
  android: ['myapp', 'flutter', 'react native', 'expo'],
  ios: ['myapp', 'flutter', 'react native', 'expo'],
  backend: ['node', 'express', 'spring', 'postgresql', 'mysql', 'api', 'rbac', 'server'],
  database: ['postgresql', 'mysql', 'sql', 'jdbc', 'schema'],
  databases: ['postgresql', 'mysql', 'sql', 'jdbc', 'schema'],
  db: ['postgresql', 'mysql', 'sql'],
  frontend: ['react', 'next.js', 'typescript', 'tailwind', 'html5', 'css3'],
  ui: ['tailwind', 'react', 'next.js', 'javafx', 'qt', 'design'],
  ux: ['design', 'ui/ux', 'tailwind', 'swiper'],
  cpp: ['c++', 'c++17', 'qt', 'banking'],
  'c++': ['c++17', 'qt', 'banking'],
  qt: ['qt 6', 'c++17', 'banking'],
  java: ['javafx', 'maven', 'jdbc', 'nexus', 'spring'],
  ai: ['event', 'python', 'automation', 'llm', 'machine learning'],
  ml: ['ai', 'python', 'machine learning'],
  security: ['insa', 'rbac', 'escrow', 'authentication'],
  insa: ['insa', 'summer camp', 'security'],
};

function dedupeLinks(links: AssistantLink[]): AssistantLink[] {
  const seen = new Set<string>();
  const out: AssistantLink[] = [];
  for (const link of links) {
    if (!link.href || seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out.slice(0, 5);
}

function dedupeFollowUps(items: string[], currentQuestionLower: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const clean = raw.trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key) || key === currentQuestionLower) continue;
    seen.add(key);
    out.push(clean);
  }
  return out.slice(0, 3);
}

function tokenizeQuery(queryLower: string): string[] {
  const baseTokens = queryLower
    .split(/[^a-z0-9+#.]+/)
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));

  const expanded = new Set<string>(baseTokens);
  for (const tok of baseTokens) {
    const syns = QUERY_SYNONYMS[tok];
    if (syns) {
      for (const s of syns) expanded.add(s);
    }
  }
  return Array.from(expanded);
}

interface ScoredProject {
  project: ProjectItem;
  score: number;
}

function scoreProjects(queryLower: string, projects: readonly ProjectItem[]): ScoredProject[] {
  const rawTokens = queryLower
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
  const tokens = tokenizeQuery(queryLower);

  if (tokens.length === 0) return [];

  return projects
    .map((p) => {
      const titleLower = p.title.toLowerCase();
      const slugClean = p.slug.replace(/-/g, ' ');
      const techLower = p.technologies.join(' ').toLowerCase();
      const archLower = (p.architecture ?? []).join(' ').toLowerCase();
      const challengeLower = (p.challengesAndSolutions ?? [])
        .map((c) => `${c.challenge} ${c.solution}`)
        .join(' ')
        .toLowerCase();
      const coreText = `${p.subtitle} ${p.summary} ${p.contribution} ${p.keyFeatures.join(' ')}`.toLowerCase();
      const deepText = `${p.overview} ${p.problemStatement} ${p.objectives.join(' ')} ${p.category}`.toLowerCase();

      let score = 0;
      if (queryLower.includes(titleLower) || queryLower.includes(slugClean)) {
        score += 14;
      }

      for (const tok of tokens) {
        const isDirect = rawTokens.includes(tok);
        const weightMult = isDirect ? 1 : 0.6;

        if (titleLower.includes(tok) || slugClean.includes(tok)) {
          score += 7 * weightMult;
        }
        if (techLower.includes(tok)) {
          score += 4.5 * weightMult;
        }
        if (archLower.includes(tok) || challengeLower.includes(tok)) {
          score += 3 * weightMult;
        }
        if (coreText.includes(tok)) {
          score += 2.2 * weightMult;
        }
        if (deepText.includes(tok)) {
          score += 1.4 * weightMult;
        }
      }

      return { project: p, score };
    })
    .filter((entry) => entry.score >= 3)
    .sort((a, b) => b.score - a.score);
}

function scoreExperiences(
  queryLower: string,
  experiences: readonly ExperienceItem[]
): ExperienceItem[] {
  const tokens = tokenizeQuery(queryLower);
  if (tokens.length === 0) return [];

  return experiences
    .map((exp) => {
      const titleText = `${exp.role} ${exp.organization}`.toLowerCase();
      const bodyText = `${exp.location} ${exp.summary} ${exp.points.map((pt) => `${pt.lead ?? ''} ${pt.text}`).join(' ')}`.toLowerCase();
      const stackText = exp.stack.join(' ').toLowerCase();

      let score = 0;
      for (const tok of tokens) {
        if (titleText.includes(tok)) score += 5;
        if (stackText.includes(tok)) score += 3;
        if (bodyText.includes(tok)) score += 1.5;
      }
      return { exp, score };
    })
    .filter((entry) => entry.score >= 3)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.exp);
}

interface HistoryContext {
  recentProjects: ProjectItem[];
  recentTopics: Set<string>;
}

function extractHistoryContext(
  history: readonly AssistantHistoryTurn[],
  projects: readonly ProjectItem[]
): HistoryContext {
  const recentProjects: ProjectItem[] = [];
  const seenSlugs = new Set<string>();
  const recentTopics = new Set<string>();

  const recentTurns = [...history].slice(-6).reverse();

  for (const turn of recentTurns) {
    const lower = turn.content.toLowerCase();

    for (const project of projects) {
      const slugPhrase = project.slug.replace(/-/g, ' ');
      if (
        (lower.includes(project.title.toLowerCase()) || lower.includes(slugPhrase)) &&
        !seenSlugs.has(project.slug)
      ) {
        seenSlugs.add(project.slug);
        recentProjects.push(project);
      }
    }

    if (/\b(backend|api|database|sql|postgresql|mysql)\b/i.test(lower)) {
      recentTopics.add('backend');
    }
    if (/\b(mobile|flutter|react native|expo|myapp)\b/i.test(lower)) {
      recentTopics.add('mobile');
    }
    if (/\b(desktop|c\+\+|qt|java|javafx)\b/i.test(lower)) {
      recentTopics.add('desktop');
    }
    if (/\b(hire|hiring|strength|weakness|limitation)\b/i.test(lower)) {
      recentTopics.add('evaluation');
    }
  }

  return { recentProjects, recentTopics };
}

function isFollowUpQuery(queryLower: string, directProjects: readonly ScoredProject[]): boolean {
  if (directProjects.length > 0) return false;
  const wordCount = queryLower.split(/\s+/).filter(Boolean).length;
  const hasPronounOrEllipsis =
    /\b(it|its|that|this|them|they|there|more|else|detail|details|deeper|challenge|challenges|architecture|stack|tech|demo|live|github|repo|code|problem|feature|features|role|contribution|why|how)\b/i.test(
      queryLower
    );
  return hasPronounOrEllipsis || wordCount <= 5;
}

/**
 * Builds a rich, grounded system prompt from the live PortfolioBundle for optional LLM providers.
 */
export function buildPortfolioSystemPrompt(bundle: PortfolioBundle): string {
  const {
    SITE_PROFILE,
    EXPERIENCES,
    PROJECTS,
    SKILL_CATEGORIES,
    PHILOSOPHY_PILLARS,
    TECHNICAL_INTERESTS,
  } = bundle;

  const expSummary = EXPERIENCES.map((e) => {
    const pts = e.points
      .map((pt) => `${pt.lead ? `${pt.lead}: ` : ''}${pt.text}`)
      .join('; ');
    return `- ${e.role} at ${e.organization} (${e.location}, ${e.period}): ${e.summary}${pts ? ` | Highlights: ${pts}` : ''} [Stack: ${e.stack.join(', ')}]`;
  }).join('\n');

  const projSummary = PROJECTS.map((p) => {
    const arch = p.architecture?.length ? ` | Architecture: ${p.architecture.join('; ')}` : '';
    const chall = p.challengesAndSolutions?.length
      ? ` | Challenge Solved: ${p.challengesAndSolutions.map((c) => `${c.challenge} -> ${c.solution}`).join('; ')}`
      : '';
    const urls = [p.liveUrl ? `Live: ${p.liveUrl}` : '', p.githubUrl ? `GitHub: ${p.githubUrl}` : '']
      .filter(Boolean)
      .join(', ');
    return `- ${p.title} (${p.category}, ${p.year}) [/work/${p.slug}/]: ${p.subtitle}. Overview: ${p.overview} Problem: ${p.problemStatement} Role: ${p.contribution} [Tech: ${p.technologies.join(', ')}]${arch}${chall}${urls ? ` | Links: ${urls}` : ''}`;
  }).join('\n');

  const skillsSummary = SKILL_CATEGORIES.map(
    (c) => `- ${c.name}: ${c.items.join(', ')}`
  ).join('\n');

  const philosophySummary = PHILOSOPHY_PILLARS.map((p) => `${p.title}: ${p.description}`).join(' | ');
  const interestsSummary = TECHNICAL_INTERESTS.map((i) => i.title).join(', ');

  return [
    `You are the portfolio intelligence assistant representing ${SITE_PROFILE.fullName} (${SITE_PROFILE.brand}), a ${SITE_PROFILE.role} based in ${SITE_PROFILE.location}.`,
    `Answer visitor, client, founder, and technical recruiter questions honestly, analytically, and concisely using ONLY the verified portfolio facts below.`,
    `Never invent employers, salary numbers, GPA/grades, fake metrics, or skills absent from this data.`,
    `When asked evaluative questions ("Should I hire him?", "What is his good side?", "What are his weaknesses?", "Is he good for backend?"), synthesize specific projects, architecture decisions, internships, and realistic scope tradeoffs (e.g., he is an undergraduate Software Engineering student shipping end-to-end systems rather than a 10-year enterprise architect).`,
    `Use prior conversation history to resolve pronouns ("it", "that project", "what challenges did he solve there?") naturally.`,
    `Keep replies crisp, scannable, and under 190 words with clean section labels or short bullets. No emojis or filler hype.`,
    ``,
    `PROFILE:`,
    `Name: ${SITE_PROFILE.fullName} | Role: ${SITE_PROFILE.role} | Location: ${SITE_PROFILE.location}`,
    `Bio: ${SITE_PROFILE.heroIntro}`,
    `Philosophy: ${SITE_PROFILE.shortPhilosophy} | Pillars: ${philosophySummary}`,
    `Focus Areas: ${interestsSummary}`,
    `Availability: ${SITE_PROFILE.availabilityNote}`,
    `Contact: Email ${SITE_PROFILE.email} | Phone ${SITE_PROFILE.phoneDisplay} | GitHub ${SITE_PROFILE.githubUrl} | LinkedIn ${SITE_PROFILE.linkedinUrl}`,
    ``,
    `EXPERIENCE & EDUCATION:`,
    expSummary,
    ``,
    `PROJECTS (${PROJECTS.length} total):`,
    projSummary,
    ``,
    `TECHNICAL SKILLS:`,
    skillsSummary,
  ].join('\n');
}

function formatProjectDeepDive(
  project: ProjectItem,
  facets: {
    wantsChallenges: boolean;
    wantsArchitecture: boolean;
    wantsStack: boolean;
    wantsFeatures: boolean;
    wantsLinks: boolean;
  }
): string {
  const lines: string[] = [`${project.title} (${project.category}, ${project.year}) — ${project.subtitle}`];
  lines.push('');

  const anySpecificFacet =
    facets.wantsChallenges ||
    facets.wantsArchitecture ||
    facets.wantsStack ||
    facets.wantsFeatures ||
    facets.wantsLinks;

  if (!anySpecificFacet) {
    lines.push(`• Overview: ${project.overview}`);
    lines.push(`• Petros's Role (${project.role}): ${project.contribution}`);
    lines.push(`• Key Stack: ${project.technologies.join(', ')}`);
    if (project.challengesAndSolutions && project.challengesAndSolutions.length > 0) {
      const first = project.challengesAndSolutions[0];
      lines.push(`• Problem Solved: ${first.challenge} -> ${first.solution}`);
    } else if (project.architecture && project.architecture.length > 0) {
      lines.push(`• Architecture: ${project.architecture.slice(0, 2).join('; ')}`);
    }
    return lines.join('\n');
  }

  if (facets.wantsChallenges) {
    lines.push(`• Problem Statement: ${project.problemStatement}`);
    if (project.challengesAndSolutions && project.challengesAndSolutions.length > 0) {
      for (const item of project.challengesAndSolutions) {
        lines.push(`• Engineering Challenge: ${item.challenge}`);
        lines.push(`• Solution Built: ${item.solution}`);
      }
    } else {
      lines.push(`• Engineering Execution: ${project.contribution}`);
    }
  }

  if (facets.wantsArchitecture) {
    lines.push(`• Contribution (${project.role}): ${project.contribution}`);
    if (project.architecture && project.architecture.length > 0) {
      lines.push(`• System Architecture:`);
      for (const step of project.architecture) {
        lines.push(`  - ${step}`);
      }
    } else {
      lines.push(`• Implementation Summary: ${project.overview}`);
    }
  }

  if (facets.wantsFeatures) {
    lines.push(`• Core Capabilities: ${project.keyFeatures.slice(0, 4).join('; ')}`);
    if (project.objectives.length > 0) {
      lines.push(`• Objectives: ${project.objectives.slice(0, 2).join('; ')}`);
    }
  }

  if (facets.wantsStack) {
    lines.push(`• Tech Stack: ${project.technologies.join(', ')}`);
  }

  if (facets.wantsLinks) {
    const endpoints: string[] = [];
    if (project.liveUrl) endpoints.push(`Live Demo: ${project.liveUrl}`);
    if (project.githubUrl) endpoints.push(`GitHub: ${project.githubUrl}`);
    endpoints.push(`Case Study: /work/${project.slug}/`);
    lines.push(`• Verified Links: ${endpoints.join(' · ')}`);
  }

  return lines.join('\n');
}

function buildRoleFitSection(
  roleType: 'backend' | 'frontend' | 'fullstack' | 'mobile' | 'desktop' | 'ai',
  bundle: PortfolioBundle
): { lines: string[]; links: AssistantLink[]; followUps: string[] } {
  const { SITE_PROFILE, PROJECTS, SKILL_CATEGORIES } = bundle;
  const byCat = new Map(SKILL_CATEGORIES.map((c) => [c.id, c.items]));
  const backendTech = byCat.get('backend') ?? [];
  const dbTech = byCat.get('databases') ?? [];
  const frontendTech = byCat.get('frontend') ?? [];

  if (roleType === 'backend') {
    const aman = PROJECTS.find((p) => p.slug === 'aman-pay');
    const eventHub = PROJECTS.find((p) => p.slug === 'event-hub');
    const banking = PROJECTS.find((p) => p.slug === 'banking-system');
    const sqlEngines = dbTech.filter((item) => /postgres|mysql|sql|mongo|redis|firebase/i.test(item));
    return {
      lines: [
        `Backend & Database Engineering Fit:`,
        `• APIs & Server Runtime: ${backendTech.join(', ')} alongside Next.js App Router server routes and RBAC validation.`,
        `• Relational & Transactional Persistence: ${sqlEngines.length > 0 ? sqlEngines.join(', ') : 'PostgreSQL, MySQL'} with normalized schemas, JDBC/SQL queries, and transactional state integrity.`,
        `• Concrete Proof: ${aman?.title ?? 'Aman Pay'} (escrow payment state flows + Chapa integration), ${eventHub?.title ?? 'Event Hub'} (PostgreSQL ticketing & attendance), and ${banking?.title ?? 'Banking System'} (transactional MySQL persistence).`,
      ],
      links: [
        { label: 'Aman Pay', href: '/work/aman-pay/' },
        { label: 'Event Hub', href: '/work/event-hub/' },
        { label: 'Banking System', href: '/work/banking-system/' },
      ],
      followUps: [
        'What challenges did Aman Pay solve?',
        'Should I hire him as a backend developer?',
        'How is his database schema design experience?',
      ],
    };
  }

  if (roleType === 'mobile') {
    const myapp = PROJECTS.find((p) => p.slug === 'myapp');
    const lockin = PROJECTS.find((p) => p.slug === 'lock-in');
    return {
      lines: [
        `Mobile & Offline-First Engineering Fit:`,
        `• Frameworks: React Native (Expo), Flutter (Dart), and installable PWAs (${frontendTech.filter((i) => /flutter|react native|next/i.test(i)).join(', ')}).`,
        `• Applied Proof: ${myapp?.title ?? 'MyApp'} (offline-first React Native Expo app designed for low-connectivity resilience) and ${lockin?.title ?? 'LOCK IN'} (offline-capable TypeScript fitness PWA).`,
      ],
      links: [
        { label: 'MyApp', href: '/work/myapp/' },
        { label: 'LOCK IN', href: '/work/lock-in/' },
        { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      ],
      followUps: [
        'Tell me more about MyApp architecture',
        'Does he use Flutter or React Native?',
        'How does LOCK IN handle offline state?',
      ],
    };
  }

  if (roleType === 'desktop') {
    const nexus = PROJECTS.find((p) => p.slug === 'nexus-campus-services');
    const banking = PROJECTS.find((p) => p.slug === 'banking-system');
    return {
      lines: [
        `Desktop & Systems Programming Fit:`,
        `• Languages & Toolkits: C++17 (Qt 6 Widgets, custom data structures, memory management) and Java (JavaFX, Maven, JDBC, 3-tier OOP).`,
        `• Proof of Execution: ${nexus?.title ?? 'Nexus Campus Services (NCS)'} (multi-role campus Java/MySQL desktop suite) and ${banking?.title ?? 'Banking System'} (C++17 + Qt 6 + MySQL financial ledger app).`,
      ],
      links: [
        { label: 'Nexus Campus Services', href: '/work/nexus-campus-services/' },
        { label: 'Banking System', href: '/work/banking-system/' },
      ],
      followUps: [
        'What architecture does Nexus Campus Services use?',
        'What challenges did Banking System solve?',
        'Does he also build web full-stack apps?',
      ],
    };
  }

  if (roleType === 'ai') {
    const eventHub = PROJECTS.find((p) => p.slug === 'event-hub');
    return {
      lines: [
        `Applied AI & Automation Fit:`,
        `• Practical Integration Focus: Applies Python, TypeScript/Next.js server workflows, and intelligent product features (discovery, classification, messaging automation) rather than toy-only notebooks.`,
        `• Live Examples: Built intelligent event/ticketing workflows in ${eventHub?.title ?? 'Event Hub'}, an interactive Q&A portfolio engine on his own site, and automated Telegram content sync pipelines.`,
        `• Academic Grounding: Studying Software Engineering at Debre Birhan University alongside active Applied AI & Cross-Platform Mobile work.`,
      ],
      links: [
        { label: 'Event Hub', href: '/work/event-hub/' },
        { label: 'Engineering Blog', href: '/blog' },
        { label: 'Contact Petros', href: '/contact' },
      ],
      followUps: [
        'What backend stack powers his AI apps?',
        'What are his limitations in AI/ML?',
        'Should I hire him for an AI product MVP?',
      ],
    };
  }

  if (roleType === 'frontend') {
    return {
      lines: [
        `Frontend & Product UI Fit:`,
        `• Modern Web Stack: Next.js (App Router), React, TypeScript, Tailwind CSS, semantic HTML5/CSS3, light/dark theming, and accessible motion.`,
        `• Verified Work: Clean monochrome engineering across ${SITE_PROFILE.brand}, interactive hospitality interfaces like Wende Dubai Interior Design & Raman Caffe, plus full-stack dashboards (Aman Pay, Event Hub).`,
      ],
      links: [
        { label: 'Aman Pay', href: '/work/aman-pay/' },
        { label: 'Wende Dubai', href: '/work/wende-dubai-interior-design/' },
        { label: 'LOCK IN', href: '/work/lock-in/' },
      ],
      followUps: [
        'Show his live website demos',
        'Can he handle backend APIs too?',
        'Tell me about Wende Dubai Interior Design',
      ],
    };
  }

  // fullstack default
  return {
    lines: [
      `End-to-End Full-Stack Fit:`,
      `• Owns the full product cycle: Next.js/React/TypeScript frontend -> Node.js/Express/Spring Boot APIs -> PostgreSQL/MySQL persistence -> Docker/Vercel/Render deployment.`,
      `• Verified across ${PROJECTS.length} documented projects spanning fintech escrow, ticketing, wellness booking, mobile PWAs, and desktop systems.`,
    ],
    links: [
      { label: 'Aman Pay', href: '/work/aman-pay/' },
      { label: 'Event Hub', href: '/work/event-hub/' },
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
    ],
    followUps: [
      'What is his good side vs limitations?',
      'Which project shows his strongest architecture?',
      'Is he available for remote work?',
    ],
  };
}

/**
 * Intelligent, multi-intent, context-aware grounded portfolio QA engine.
 * Combines weighted field retrieval, synonym expansion, conversation history resolution,
 * balanced recruiter reasoning, and deep project/experience extraction.
 */
export function answerPortfolioQuestion(
  rawQuestion: string,
  bundle: PortfolioBundle,
  history: readonly AssistantHistoryTurn[] = []
): AssistantReply {
  const q = rawQuestion.trim();
  const lower = q.toLowerCase();
  const {
    SITE_PROFILE,
    EXPERIENCES,
    PROJECTS,
    SKILL_CATEGORIES,
    PHILOSOPHY_PILLARS,
  } = bundle;

  const projectCount = PROJECTS.length;
  const featured = PROJECTS.filter((p) => p.featured);
  const insaExp = EXPERIENCES.find((e) => e.id === 'insa-summer-camp');
  const remoteExp = EXPERIENCES.find((e) => e.id === 'remote-fullstack-backend');
  const sprintExp = EXPERIENCES.find((e) => e.id === 'sprint-studio-internship');
  const risetechExp = EXPERIENCES.find((e) => e.id === 'risetech-internship');
  const eduExp = EXPERIENCES.find((e) => e.id === 'software-engineering-education');

  // 1. Score direct entity matches and resolve multi-turn follow-ups from history
  const scoredProjects = scoreProjects(lower, PROJECTS);
  const directMatchedProjects = scoredProjects.map((s) => s.project);
  const historyCtx = extractHistoryContext(history, PROJECTS);
  const explicitProjectTitleMatch = PROJECTS.some(
    (p) => lower.includes(p.title.toLowerCase()) || lower.includes(p.slug.replace(/-/g, ' '))
  );
  const hasAnaphoricPronoun = /\b(it|its|that|this|there|them|they)\b/i.test(lower);
  const followUpDetected = isFollowUpQuery(lower, scoredProjects);

  const activeProjects: ProjectItem[] =
    hasAnaphoricPronoun && !explicitProjectTitleMatch && historyCtx.recentProjects.length > 0
      ? historyCtx.recentProjects.slice(0, 1)
      : directMatchedProjects.length > 0
        ? directMatchedProjects.slice(0, 3)
        : followUpDetected && historyCtx.recentProjects.length > 0
          ? historyCtx.recentProjects.slice(0, 1)
          : [];

  const matchedExperiences = scoreExperiences(lower, EXPERIENCES);

  // 2. Detect multi-intent signals (allows compound questions like "strengths vs weaknesses for backend")
  const wantsWeaknesses =
    /\b(weak|weakness|weaknesses|bad side|flaw|flaws|downside|downsides|limit|limitation|limitations|gap|gaps|risk|risks|con|cons|negative|drawback|critique|shortcoming|missing|senior)\b/i.test(
      lower
    );
  const wantsStrengths =
    /\b(good side|good|strength|strengths|best at|strong|strongest|upside|pros|advantage|advantages|stand out|why is he|better than|impressive)\b/i.test(
      lower
    );
  const wantsDidIHire = /\b(did i hire|have i hired)\b/i.test(lower);
  const wantsHiring =
    /\b(hire|hiring|employ|recruit|candidate|worth|should i|did i|good fit|team fit|interview|freelance|contract|lead a team|junior|intern)\b/i.test(
      lower
    );
  const wantsContactOrRate =
    /\b(available|availability|contact|reach|email|phone|whatsapp|telegram|resume|cv|pdf|location|where|ethiopia|addis|remote|timezone|utc|rate|cost|price|salary|compensation|pay)\b/i.test(
      lower
    );
  const wantsPhilosophy =
    /\b(philosophy|values|approach|mindset|principle|principles|culture|how does he work|work style)\b/i.test(
      lower
    );
  const wantsSkills =
    /\b(skill|skills|stack|tech|technology|technologies|language|languages|framework|frameworks|tools|devops|docker)\b/i.test(
      lower
    );
  const wantsExperience =
    /\b(experience|experiences|intern|internship|internships|risetech|sprint|linkedin|insa|certif|certified|education|university|degree|dbu|debre|school|background|career|where has he|worked)\b/i.test(
      lower
    );

  // Role lenses
  const asksBackend = /\b(backend|back-end|api|apis|server|database|databases|sql|postgres|postgresql|mysql|rbac|schema|spring)\b/i.test(
    lower
  );
  const asksFrontend = /\b(frontend|front-end|ui|ux|design|tailwind|css|html|theme)\b/i.test(lower);
  const asksMobile = /\b(mobile|flutter|dart|react native|expo|android|ios|offline|pwa)\b/i.test(
    lower
  );
  const asksDesktop = /\b(desktop|c\+\+|cpp|qt|java|javafx|jdbc|native)\b/i.test(lower);
  const asksAi = /\b(ai|artificial intelligence|llm|machine learning|ml|automation|chatbot|smart)\b/i.test(
    lower
  );
  const asksFullstack = /\b(full-stack|fullstack|full stack|end-to-end)\b/i.test(lower);

  // Project facets
  const wantsChallenges = /\b(challenge|challenges|hard|hardest|difficult|problem|solve|solved|obstacle|issue|fixed|bug)\b/i.test(
    lower
  );
  const wantsArchitecture = /\b(arch|architecture|design|how it works|how does it work|structure|built|build|contribution|role|did he do)\b/i.test(
    lower
  );
  const wantsFeatures = /\b(feature|features|capability|capabilities|what does it do|objective|objectives)\b/i.test(
    lower
  );
  const wantsLinks = /\b(live|demo|url|link|links|website|site|github|repo|repository|source|code)\b/i.test(
    lower
  );

  const matchedRole: 'backend' | 'frontend' | 'fullstack' | 'mobile' | 'desktop' | 'ai' | null =
    asksBackend
      ? 'backend'
      : asksAi
        ? 'ai'
        : asksMobile
          ? 'mobile'
          : asksDesktop
            ? 'desktop'
            : asksFrontend
              ? 'frontend'
              : asksFullstack
                ? 'fullstack'
                : null;

  // Determine whether an explicit project deep-dive is the primary intent
  const isDeepProjectQuestion =
    activeProjects.length > 0 &&
    (explicitProjectTitleMatch ||
      ((hasAnaphoricPronoun || followUpDetected) && historyCtx.recentProjects.length > 0) ||
      (/\b(project|projects|case study|app|system|demo|repo)\b/i.test(lower) &&
        !wantsStrengths &&
        !wantsWeaknesses &&
        !wantsHiring));

  // If user directly asks for a deep dive or follow-up on a specific project (e.g. Aman Pay, Event Hub, Banking System)
  if (isDeepProjectQuestion && !wantsStrengths && !wantsWeaknesses && !wantsHiring) {
    const primary = activeProjects[0];
    const extraProjects = activeProjects.slice(1);
    const hasSpecificFacet =
      wantsChallenges || wantsArchitecture || wantsSkills || wantsFeatures || wantsLinks;

    const sections: string[] = [
      formatProjectDeepDive(primary, {
        wantsChallenges,
        wantsArchitecture,
        wantsStack: wantsSkills,
        wantsFeatures,
        wantsLinks,
      }),
    ];

    if (extraProjects.length > 0 && !hasSpecificFacet && !explicitProjectTitleMatch) {
      sections.push('');
      sections.push('Related Projects:');
      for (const p of extraProjects) {
        sections.push(
          `• ${p.title} (${p.category}): ${p.subtitle} [${p.technologies.slice(0, 4).join(', ')}]`
        );
      }
    }

    const links: AssistantLink[] = [{ label: `${primary.title} Case Study`, href: `/work/${primary.slug}/` }];
    if (primary.liveUrl) links.push({ label: 'Live Demo', href: primary.liveUrl, external: true });
    if (primary.githubUrl) links.push({ label: 'GitHub Repo', href: primary.githubUrl, external: true });
    for (const p of extraProjects) {
      links.push({ label: p.title, href: `/work/${p.slug}/` });
    }
    links.push({ label: `All ${projectCount} Projects`, href: '/work' });

    const followUps: string[] = [];
    if (!wantsChallenges && (primary.challengesAndSolutions?.length || primary.problemStatement)) {
      followUps.push(`What challenges did ${primary.title} solve?`);
    }
    if (!wantsArchitecture) {
      followUps.push(`Explain ${primary.title} architecture and Petros's role`);
    }
    if (!wantsSkills) {
      followUps.push(`What tech stack did ${primary.title} use?`);
    }
    followUps.push(`How does ${primary.title} prove hiring readiness?`);

    return {
      mode: 'portfolio-engine',
      answer: sections.join('\n'),
      links: dedupeLinks(links),
      followUps: dedupeFollowUps(followUps, lower),
    };
  }

  // 3. Multi-Intent Composer for Evaluative, Role-Fit, Experience, Skills & Contact Questions
  const sections: string[] = [];
  const collectedLinks: AssistantLink[] = [];
  const collectedFollowUps: string[] = [];

  // Clarify "Did I hire him?" naturally before giving "Should I hire him?" assessment
  if (wantsDidIHire) {
    sections.push(
      `Note: I don't have access to private employer records—only ${SITE_PROFILE.fullName}'s verified public portfolio. If you are deciding whether to hire or contract him, here is the evidence-based verdict:`
    );
  }

  // Hiring Verdict & Role Fit
  if (wantsHiring) {
    const roleQualifier =
      matchedRole === 'backend'
        ? 'Backend / API-focused Engineer'
        : matchedRole === 'ai'
          ? 'Applied AI & Full-Stack Builder'
          : matchedRole === 'mobile'
            ? 'Cross-Platform Mobile Developer'
            : matchedRole === 'desktop'
              ? 'Java / C++ Desktop & Systems Developer'
              : 'Software Engineer (Full-Stack / Backend)';

    sections.push(
      [
        `Hiring Assessment — ${roleQualifier}:`,
        `• Verdict: Strong hire for teams seeking an execution-focused builder who owns products end-to-end and ramps quickly in agile or remote workflows.`,
        `• Verified Track Record: Completed internships at ${sprintExp?.organization ?? 'Sprint Studio'} and ${risetechExp?.organization ?? 'RiseTech'}, delivers remote client engineering, earned Web & App certification at ${insaExp?.organization ?? 'INSA Summer Camp'}, and shipped ${projectCount} documented systems.`,
        `• Realistic Scope Fit: Excels as a high-ownership individual contributor or MVP builder; if you specifically require an 8+ year staff SRE or legacy enterprise architect, calibrate expectations accordingly (${eduExp?.organization ?? 'Debre Birhan University'} Software Engineering student).`,
        `• Current Status: ${SITE_PROFILE.availabilityNote}`,
      ].join('\n')
    );

    collectedLinks.push(
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      { label: 'Send Message', href: '/contact' },
      { label: 'Review Projects', href: '/work' }
    );
    collectedFollowUps.push(
      'What are his honest limitations?',
      'Which project shows his strongest architecture?',
      'Is he available for remote work right now?'
    );
  }

  // Strengths / "Good Side"
  if (wantsStrengths) {
    sections.push(
      [
        `Core Strengths ("Good Side"):`,
        `• Full-Stack + Lower-Level Depth: Ships production Next.js/React/TypeScript web apps while also mastering C++17 (Qt 6) and 3-tier Java (JavaFX, JDBC)—giving him stronger systems and memory intuition than typical web-only candidates.`,
        `• Backend, Auth & Database Rigor: Hands-on with Node.js, Express, Spring Boot, PostgreSQL, and MySQL—building normalized schemas, RBAC, and payment/escrow state workflows.`,
        `• High Shipping Velocity: ${projectCount} public projects with clear problem statements and real deployments (e.g., Aman Pay, Event Hub, Ethio Massage, LOCK IN).`,
        `• Security & Remote Readiness: Security-conscious training at ${insaExp?.organization ?? 'INSA'} plus proven remote delivery in UTC+3.`,
      ].join('\n')
    );

    collectedLinks.push(
      { label: 'Aman Pay', href: '/work/aman-pay/' },
      { label: 'Event Hub', href: '/work/event-hub/' },
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true }
    );
    collectedFollowUps.push(
      'What are his honest limitations?',
      'Should I hire him for a backend role?',
      'What hard technical problems has he solved?'
    );
  }

  // Weaknesses / Honest Critique / Limitations
  if (wantsWeaknesses) {
    sections.push(
      [
        `Honest Limitations & Growth Areas:`,
        `• Career Tenure: Still pursuing his B.Sc. in Software Engineering at ${eduExp?.organization ?? 'Debre Birhan University'}, so his real-world track record comes from internships, remote client work, and shipped products rather than 5–10 years in large enterprise orgs.`,
        `• Stack Boundaries: Deepest in TypeScript/Next.js, Node.js, SQL, Java, C++, Flutter/React Native, and Python—does not claim enterprise Kubernetes/Terraform platform SRE or legacy ERP experience.`,
        `• Scale Context: Most documented systems target startup MVPs, regional payment/booking workflows (Chapa/WhatsApp), and campus/financial suites rather than hyperscale multi-region distributed infrastructure.`,
        `• Mitigating Factor: Compensates with strong CS fundamentals (DSA, OOP, relational normalization), fast iteration, and clean maintainable code.`,
      ].join('\n')
    );

    collectedLinks.push(
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      { label: 'Explore Projects', href: '/work' },
      { label: 'Ask Petros Directly', href: '/contact' }
    );
    collectedFollowUps.push(
      'What is his good side?',
      'Compare his backend vs frontend strength',
      'What hard challenges has he solved in projects?'
    );
  }

  // Role-Specific Evidence (if user asked about Backend / AI / Mobile / Desktop / Frontend / Full-Stack)
  if (matchedRole) {
    const roleSection = buildRoleFitSection(matchedRole, bundle);
    sections.push(roleSection.lines.join('\n'));
    collectedLinks.push(...roleSection.links);
    collectedFollowUps.push(...roleSection.followUps);
  }

  // Experience & Education Details (extracts exact `exp.points`)
  const shouldIncludeExperiences =
    wantsExperience ||
    (!matchedRole && !wantsHiring && !wantsStrengths && !wantsWeaknesses && matchedExperiences.length > 0);
  if (shouldIncludeExperiences) {
    const targets =
      matchedExperiences.length > 0 ? matchedExperiences.slice(0, 3) : EXPERIENCES.slice(0, 4);
    const expLines = targets.map((e) => {
      const firstPt = e.points[0];
      const cleanLead = firstPt?.lead?.replace(/:+\s*$/, '');
      const pointHighlight = firstPt
        ? ` ${cleanLead ? `Key focus (${cleanLead}):` : 'Highlight:'} ${firstPt.text}`
        : '';
      return `• ${e.role} — ${e.organization} (${e.period}, ${e.location}): ${e.summary}${pointHighlight}`;
    });
    sections.push(['Verified Experience & Education:', ...expLines].join('\n'));

    collectedLinks.push(
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      { label: 'Explore Work', href: '/work' }
    );
    collectedFollowUps.push(
      'What did he do at Sprint Studio and RiseTech?',
      'What certification did he earn at INSA?',
      'Show his full technical stack'
    );
  }

  // Verified Skills Breakdown
  if (wantsSkills && !matchedRole) {
    const skillLines = SKILL_CATEGORIES.map(
      (c) => `• ${c.name}: ${c.items.join(', ')}`
    );
    sections.push(['Verified Technical Stack:', ...skillLines].join('\n'));
    collectedLinks.push(
      { label: 'Explore All Projects', href: '/work' },
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true }
    );
    collectedFollowUps.push(
      'Which projects use Next.js and PostgreSQL?',
      'Show his C++ and Java desktop projects',
      'Should I hire him for a full-stack team?'
    );
  }

  // Contact, Location, Availability, Compensation
  if (wantsContactOrRate) {
    sections.push(
      [
        `Availability, Location & Contact:`,
        `• Location: ${SITE_PROFILE.location} (UTC+3), experienced collaborating across international timezones.`,
        `• Availability: ${SITE_PROFILE.availabilityNote}`,
        `• Direct Reach: ${SITE_PROFILE.email} · ${SITE_PROFILE.phoneDisplay} · GitHub (${SITE_PROFILE.githubHandle}) · LinkedIn (${SITE_PROFILE.linkedinHandle}).`,
        `• Rates & Scope: Specific project pricing or contract terms depend on scope and timeline—use the Contact page or email directly for a fast reply.`,
      ].join('\n')
    );

    collectedLinks.push(
      { label: 'Send Direct Message', href: '/contact' },
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      { label: 'GitHub', href: SITE_PROFILE.githubUrl, external: true }
    );
    collectedFollowUps.push(
      'Should I hire him?',
      'Explore his flagship projects',
      'What is his typical engineering workflow?'
    );
  }

  // Philosophy / Engineering Style
  if (wantsPhilosophy) {
    const pillars = PHILOSOPHY_PILLARS.map((p) => `• ${p.title}: ${p.description}`);
    sections.push([`Engineering Approach & Philosophy:`, `• Core ethos: ${SITE_PROFILE.shortPhilosophy}`, ...pillars].join('\n'));
    collectedLinks.push(
      { label: 'About Petros', href: '/#about' },
      { label: 'Explore Projects', href: '/work' }
    );
    collectedFollowUps.push(
      'What challenges did he solve in Aman Pay?',
      'What is his good side?',
      'Should I hire him?'
    );
  }

  // Hard Technical Challenges Query (without specific project name)
  if (wantsChallenges && sections.length === 0) {
    const withChallenges = PROJECTS.filter(
      (p) => p.challengesAndSolutions && p.challengesAndSolutions.length > 0
    ).slice(0, 3);
    const chLines = withChallenges.map((p) => {
      const c = p.challengesAndSolutions![0];
      return `• ${p.title}: ${c.challenge} -> ${c.solution}`;
    });
    sections.push(['Notable Engineering Challenges Solved:', ...chLines].join('\n'));
    for (const p of withChallenges) {
      collectedLinks.push({ label: p.title, href: `/work/${p.slug}/` });
    }
    collectedFollowUps.push(
      'Dive deeper into Aman Pay architecture',
      'Dive deeper into Banking System C++ design',
      'What are his strengths for backend engineering?'
    );
  }

  // Links / Live Demos / GitHub Overview (without specific project name)
  if (wantsLinks && sections.length === 0) {
    const liveProjects = PROJECTS.filter((p) => p.liveUrl).slice(0, 5);
    const lines = [
      `Verified Live Deployments & Code Repositories:`,
      ...liveProjects.map((p) => `• ${p.title} (${p.year}): Live at ${p.liveUrl}`),
      `• GitHub Profile: ${SITE_PROFILE.githubUrl} (${projectCount} documented projects in portfolio)`,
    ];
    sections.push(lines.join('\n'));
    for (const p of liveProjects.slice(0, 3)) {
      collectedLinks.push({ label: p.title, href: `/work/${p.slug}/` });
    }
    collectedLinks.push({ label: 'GitHub Profile', href: SITE_PROFILE.githubUrl, external: true });
    collectedFollowUps.push(
      'Tell me about Aman Pay',
      'Tell me about Event Hub',
      'Which projects have desktop code on GitHub?'
    );
  }

  // Attach specifically referenced project summary when combined with hiring/evaluative questions
  if (explicitProjectTitleMatch && activeProjects.length > 0 && sections.length > 0) {
    const p = activeProjects[0];
    sections.push(
      [
        `Referenced Project — ${p.title}:`,
        `• ${p.subtitle} (${p.category}, ${p.year}): ${p.summary}`,
        `• Tech Stack: ${p.technologies.join(', ')}`,
      ].join('\n')
    );
    collectedLinks.unshift({ label: p.title, href: `/work/${p.slug}/` });
  }

  // Return composed multi-intent reply if at least one domain matched
  if (sections.length > 0) {
    const filteredFollowUps = collectedFollowUps.filter((item) => {
      const f = item.toLowerCase();
      if (wantsWeaknesses && /limitation|weakness/.test(f)) return false;
      if (wantsStrengths && /good side|strength/.test(f)) return false;
      if (wantsHiring && /should i hire/.test(f)) return false;
      if (wantsContactOrRate && /available|remote/.test(f)) return false;
      return true;
    });
    if (filteredFollowUps.length < 3) {
      filteredFollowUps.push(
        'What challenges did Aman Pay solve?',
        'Explain Event Hub architecture',
        'How can I contact him directly?'
      );
    }

    return {
      mode: 'portfolio-engine',
      answer: sections.join('\n\n'),
      links: dedupeLinks(
        collectedLinks.length > 0
          ? collectedLinks
          : [
              { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
              { label: 'Explore Work', href: '/work' },
              { label: 'Contact Petros', href: '/contact' },
            ]
      ),
      followUps: dedupeFollowUps(filteredFollowUps, lower),
    };
  }

  // Fallback for general/greeting questions or unmatched single project
  if (activeProjects.length > 0) {
    const top = activeProjects[0];
    return {
      mode: 'portfolio-engine',
      answer: formatProjectDeepDive(top, {
        wantsChallenges,
        wantsArchitecture,
        wantsStack: wantsSkills,
        wantsFeatures,
        wantsLinks,
      }),
      links: dedupeLinks([
        { label: `Open ${top.title}`, href: `/work/${top.slug}/` },
        ...(top.liveUrl ? [{ label: 'Live Demo', href: top.liveUrl, external: true }] : []),
        { label: `All ${projectCount} Projects`, href: '/work' },
      ]),
      followUps: dedupeFollowUps(
        [
          `What challenges did ${top.title} solve?`,
          `What architecture does ${top.title} use?`,
          `Should I hire Petros for similar work?`,
        ],
        lower
      ),
    };
  }

  const featuredNames = featured.map((p) => p.title).join(', ');
  const isGreeting = /\b(hi|hello|hey|salam|selam|greetings|help|who is petros)\b/i.test(lower);
  const introLine = isGreeting
    ? `${SITE_PROFILE.fullName} is a ${SITE_PROFILE.role} in ${SITE_PROFILE.location} (${eduExp?.organization ?? 'Debre Birhan University'}).`
    : `I answer specifically from ${SITE_PROFILE.fullName}'s verified portfolio rather than guessing outside it. Here is his grounded snapshot:`;

  return {
    mode: 'portfolio-engine',
    answer: [
      introLine,
      ``,
      `• Engineering Range: Next.js/React/TypeScript frontend, Node.js/Express/Spring Boot/SQL backends, React Native/Flutter mobile apps, and C++17/Java desktop systems.`,
      `• Credentials: ${insaExp?.organization ?? 'INSA 5th Round'} Web & App certified, remote client delivery${remoteExp ? ' (active)' : ''}, and internships at ${sprintExp?.organization ?? 'Sprint Studio'} & ${risetechExp?.organization ?? 'RiseTech'}.`,
      `• Flagship Projects (${projectCount} total): ${featuredNames}.`,
    ].join('\n'),
    links: dedupeLinks([
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      { label: 'Explore Projects', href: '/work' },
      { label: 'Contact Petros', href: '/contact' },
    ]),
    followUps: dedupeFollowUps(
      [
        'Should I hire him?',
        'What is his good side vs limitations?',
        'Which project shows his strongest backend work?',
      ],
      lower
    ),
  };
}
