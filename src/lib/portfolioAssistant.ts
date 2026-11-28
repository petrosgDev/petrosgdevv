import type { ExperienceItem, PortfolioBundle, ProjectItem } from '@/data/portfolio';

export interface AssistantLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface AssistantReply {
  answer: string;
  links: AssistantLink[];
  mode: 'llm' | 'portfolio-engine';
}

function dedupeLinks(links: AssistantLink[]): AssistantLink[] {
  const seen = new Set<string>();
  const out: AssistantLink[] = [];
  for (const link of links) {
    if (!link.href || seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out.slice(0, 4);
}

/**
 * Builds a grounded system prompt from the live PortfolioBundle for optional LLM providers.
 */
export function buildPortfolioSystemPrompt(bundle: PortfolioBundle): string {
  const { SITE_PROFILE, EXPERIENCES, PROJECTS, SKILL_CATEGORIES } = bundle;

  const expSummary = EXPERIENCES.map(
    (e) =>
      `- ${e.role} at ${e.organization} (${e.location}, ${e.period}): ${e.summary} [Stack: ${e.stack.join(', ')}]`
  ).join('\n');

  const projSummary = PROJECTS.map(
    (p) =>
      `- ${p.title} (${p.category}, ${p.year}) [slug: /work/${p.slug}/]: ${p.subtitle}. Summary: ${p.summary} [Tech: ${p.technologies.join(', ')}]`
  ).join('\n');

  const skillsSummary = SKILL_CATEGORIES.map(
    (c) => `- ${c.name}: ${c.items.join(', ')}`
  ).join('\n');

  return [
    `You are the portfolio Q&A assistant representing ${SITE_PROFILE.fullName} (${SITE_PROFILE.brand}), a ${SITE_PROFILE.role} based in ${SITE_PROFILE.location}.`,
    `Answer visitor, client, and recruiter questions honestly, concisely, and critically based ONLY on the verified portfolio facts below.`,
    `Do not invent employers, metrics, salaries, degrees, or project claims not present in this data. If asked a hiring evaluation ("What is his good side?", "Should I hire him?", "What are his weaknesses?"), give a balanced, grounded assessment citing specific experiences, projects, and honest scope (e.g., he is an undergraduate software engineering student actively shipping real full-stack, backend, mobile, and desktop systems).`,
    `Keep answers under 160 words, clear and scannable with short bullet points when helpful. Avoid emojis and hype.`,
    ``,
    `PROFILE:`,
    `Name: ${SITE_PROFILE.fullName} | Role: ${SITE_PROFILE.role} | Location: ${SITE_PROFILE.location}`,
    `Bio: ${SITE_PROFILE.heroIntro}`,
    `Philosophy: ${SITE_PROFILE.shortPhilosophy}`,
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

function findMatchingProjects(queryLower: string, projects: readonly ProjectItem[]): ProjectItem[] {
  const tokens = queryLower
    .split(/[^a-z0-9+]+/)
    .filter((t) => t.length >= 2 && !['the', 'and', 'for', 'with', 'his', 'him', 'what', 'did', 'has', 'have', 'about'].includes(t));

  if (tokens.length === 0) return [];

  const scored = projects
    .map((p) => {
      const haystack = `${p.title} ${p.slug} ${p.category} ${p.subtitle} ${p.summary} ${p.technologies.join(' ')} ${p.keyFeatures.join(' ')}`.toLowerCase();
      let score = 0;
      if (haystack.includes(queryLower)) score += 6;
      for (const tok of tokens) {
        if (p.title.toLowerCase().includes(tok) || p.slug.includes(tok)) {
          score += 5;
        } else if (p.technologies.some((tech) => tech.toLowerCase().includes(tok))) {
          score += 3;
        } else if (haystack.includes(tok)) {
          score += 1;
        }
      }
      return { project: p, score };
    })
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.project);
}

function findMatchingExperiences(
  queryLower: string,
  experiences: readonly ExperienceItem[]
): ExperienceItem[] {
  const tokens = queryLower
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
  return experiences.filter((exp) => {
    const text = `${exp.role} ${exp.organization} ${exp.location} ${exp.summary} ${exp.stack.join(' ')}`.toLowerCase();
    return tokens.some((tok) => text.includes(tok));
  });
}

/**
 * Deterministic, critical, and grounded portfolio QA engine.
 * Runs cleanly without external API keys and powers fallback when no LLM provider is configured.
 */
export function answerPortfolioQuestion(
  rawQuestion: string,
  bundle: PortfolioBundle
): AssistantReply {
  const q = rawQuestion.trim();
  const lower = q.toLowerCase();
  const { SITE_PROFILE, EXPERIENCES, PROJECTS, SKILL_CATEGORIES } = bundle;

  const projectCount = PROJECTS.length;
  const featured = PROJECTS.filter((p) => p.featured);
  const remoteExp = EXPERIENCES.find((e) => e.id === 'remote-fullstack-backend');
  const sprintExp = EXPERIENCES.find((e) => e.id === 'sprint-studio-internship');
  const risetechExp = EXPERIENCES.find((e) => e.id === 'risetech-internship');
  const insaExp = EXPERIENCES.find((e) => e.id === 'insa-summer-camp');
  const eduExp = EXPERIENCES.find((e) => e.id === 'software-engineering-education');

  // 1. Weaknesses / Limitations / Honest Critique
  if (
    /\b(weak|weakness|weaknesses|bad side|flaw|flaws|downside|downsides|limit|limitation|limitations|gap|gaps|risk|risks|con|cons|negative|drawback|critique)\b/i.test(
      lower
    )
  ) {
    return {
      mode: 'portfolio-engine',
      answer: [
        `Here is an honest, realistic assessment of where ${SITE_PROFILE.fullName} is still growing:`,
        ``,
        `• Early career stage: He is an undergraduate Software Engineering student at ${eduExp?.organization ?? 'Debre Birhan University'}, so his track record reflects internships, remote client work, and shipped products rather than 8+ years of enterprise staff tenure.`,
        `• Core focus vs. niche specialization: His verified strength is full-stack TypeScript/Next.js, Node.js/SQL backends, cross-platform mobile (Flutter/React Native), and Java/C++ systems—not legacy enterprise tooling (e.g., SAP, Kubernetes platform SRE, or large-org compliance).`,
        `• Why teams still back him: Strong CS fundamentals (DSA, relational DBs, 3-tier OOP), INSA security-aware training, and fast delivery across ${projectCount} documented projects.`,
      ].join('\n'),
      links: dedupeLinks([
        { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
        { label: 'Explore All Projects', href: '/work' },
        { label: 'Contact Petros', href: '/contact' },
      ]),
    };
  }

  // 2. "What is his good side?" / Strengths
  if (
    /\b(good side|good|strength|strengths|best at|strong|strongest|upside|pros|advantage|advantages|stand out|why is he)\b/i.test(
      lower
    )
  ) {
    return {
      mode: 'portfolio-engine',
      answer: [
        `${SITE_PROFILE.fullName}'s strongest qualities across engineering and delivery:`,
        ``,
        `• Full-stack + systems versatility: Builds modern React/Next.js/TypeScript products alongside lower-level C++17 (Qt 6) and 3-tier Java (JavaFX) software—giving him deeper architecture instincts than a frontend-only developer.`,
        `• Backend & database discipline: Experienced with Node.js, Express, Spring Boot, PostgreSQL, MySQL, and Firebase Firestore (schema design, RBAC, and REST APIs).`,
        `• Proven shipping & remote execution: Completed internships at ${risetechExp?.organization ?? 'RiseTech'} and ${sprintExp?.organization ?? 'Sprint Studio'}, works with remote international teams, and earned formal Web & App certification at the ${insaExp?.organization ?? 'INSA Summer Camp'}.`,
        `• Product-minded craft: ${projectCount} documented end-to-end projects (including fintech escrow like Aman Pay and campus event systems like Event Hub).`,
      ].join('\n'),
      links: dedupeLinks([
        { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
        { label: 'Flagship Work', href: '/work' },
        { label: 'Contact Petros', href: '/contact' },
      ]),
    };
  }

  // 3. "Did I hire him?" / "Should I hire him?" / Hiring Fit
  if (
    /\b(hire|hiring|employ|recruit|candidate|worth|should i|did i|good fit|team fit|interview|freelance|contract)\b/i.test(
      lower
    )
  ) {
    return {
      mode: 'portfolio-engine',
      answer: [
        `If you are looking for a capable Software Engineer or Full-Stack / Backend developer who ships cleanly and learns fast, ${SITE_PROFILE.fullName} is a strong hire:`,
        ``,
        `• Best role fit: Full-stack web applications (Next.js, React, TypeScript), Node.js/SQL/Firebase backends, cross-platform MVPs (Flutter / React Native), and remote agile product teams.`,
        `• Evidence of execution: Shipped ${projectCount} public projects, trained in security-conscious development at INSA, and delivered production work with ${sprintExp?.organization ?? 'Sprint Studio'}, ${risetechExp?.organization ?? 'RiseTech'}, and remote clients.`,
        `• Balanced caveat: Best suited as an individual contributor / product builder on agile teams rather than a lead managing legacy enterprise cloud migrations.`,
        ``,
        `${SITE_PROFILE.availabilityNote}`,
      ].join('\n'),
      links: dedupeLinks([
        { label: 'Download Resume (PDF)', href: '/api/resume/', external: true },
        { label: 'Send Message', href: '/contact' },
        { label: 'Review Projects', href: '/work' },
      ]),
    };
  }

  // 4. Backend & Database Engineering
  if (
    /\b(backend|database|databases|sql|postgres|postgresql|mysql|firestore|firebase|api|apis|server|auth|rbac|schema)\b/i.test(
      lower
    )
  ) {
    return {
      mode: 'portfolio-engine',
      answer: [
        `Backend & database work is one of ${SITE_PROFILE.fullName}'s core strengths:`,
        ``,
        `• APIs & Servers: Node.js, Express, Next.js server routes, Spring Boot, RESTful API design, input validation, and role-based access control.`,
        `• Databases: Relational normalization and transactional SQL in PostgreSQL and MySQL, plus real-time document modeling and security rules in Firebase Firestore.`,
        `• Applied examples: Escrow transaction state flows in Aman Pay, ticketing & attendance workflows in Event Hub, and transactional banking records in Banking System.`,
      ].join('\n'),
      links: dedupeLinks([
        { label: 'Aman Pay', href: '/work/aman-pay/' },
        { label: 'Event Hub', href: '/work/event-hub/' },
        { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      ]),
    };
  }

  // 5. AI & Automation Experience
  if (/\b(ai|artificial intelligence|llm|machine learning|ml|automation|chatbot|smart)\b/i.test(lower)) {
    return {
      mode: 'portfolio-engine',
      answer: [
        `How ${SITE_PROFILE.fullName} applies AI and automation in practice:`,
        ``,
        `• Applied AI focus: Focuses on practical AI-assisted product features, intelligent matching/discovery workflows, and Python-backed automation rather than theoretical-only demos.`,
        `• Shipped integrations: Built AI-powered campus event discovery in Event Hub and maintains automated Telegram content syncing on his own platform.`,
        `• Foundation: Solid CS & Python background from his Software Engineering degree at Debre Birhan University combined with clean Next.js/TypeScript interfaces.`,
      ].join('\n'),
      links: dedupeLinks([
        { label: 'Event Hub Case Study', href: '/work/event-hub/' },
        { label: 'Engineering Blog', href: '/blog' },
        { label: 'Contact Petros', href: '/contact' },
      ]),
    };
  }

  // 6. Availability, Contact, Location, Timezone, Resume
  if (
    /\b(available|availability|contact|reach|email|phone|whatsapp|telegram|resume|cv|pdf|location|where|ethiopia|addis|remote|timezone|rate|cost|price|salary)\b/i.test(
      lower
    )
  ) {
    return {
      mode: 'portfolio-engine',
      answer: [
        `Location, availability, and direct contact details for ${SITE_PROFILE.fullName}:`,
        ``,
        `• Based in: ${SITE_PROFILE.location} (UTC+3), collaborating seamlessly with remote teams internationally.`,
        `• Availability: ${SITE_PROFILE.availabilityNote}`,
        `• Direct reach: ${SITE_PROFILE.email} · ${SITE_PROFILE.phoneDisplay} · GitHub (${SITE_PROFILE.githubHandle}) · LinkedIn (${SITE_PROFILE.linkedinHandle}).`,
        `• Compensation & scope: Project pricing or salary expectations depend on role scope and engagement type—message him directly on the Contact page for a prompt response.`,
      ].join('\n'),
      links: dedupeLinks([
        { label: 'Send Direct Message', href: '/contact' },
        { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
        { label: 'GitHub Profile', href: SITE_PROFILE.githubUrl, external: true },
      ]),
    };
  }

  // 7. Specific Project or Technology Match
  const matchedProjects = findMatchingProjects(lower, PROJECTS);
  if (matchedProjects.length > 0 && /\b(project|projects|built|build|work|portfolio|show|app|system|demo|case|aman|event|ethio|wende|lock|raman|nexus|ncs|myapp|banking|fintech|payment|mobile|desktop|flutter|react|c\+\+|java|qt|next\.?js|typescript|python)\b/i.test(lower)) {
    const lines = matchedProjects.map(
      (p) => `• ${p.title} (${p.category}): ${p.subtitle} [${p.technologies.slice(0, 4).join(', ')}]`
    );
    return {
      mode: 'portfolio-engine',
      answer: [
        `Relevant project${matchedProjects.length > 1 ? 's' : ''} by ${SITE_PROFILE.fullName}:`,
        ``,
        ...lines,
      ].join('\n'),
      links: dedupeLinks([
        ...matchedProjects.map((p) => ({ label: p.title, href: `/work/${p.slug}/` })),
        { label: `All ${projectCount} Projects`, href: '/work' },
      ]),
    };
  }

  // 8. Experience, Education, Certifications, Skills
  const matchedExps = findMatchingExperiences(lower, EXPERIENCES);
  if (
    /\b(experience|intern|internship|risetech|sprint|linkedin|insa|certif|education|university|degree|dbu|debre|school|background|skill|skills|stack|tech|languages|framework|tools)\b/i.test(
      lower
    )
  ) {
    const expList = (matchedExps.length > 0 ? matchedExps : EXPERIENCES.slice(0, 4))
      .map((e) => `• ${e.role} — ${e.organization} (${e.period}): ${e.summary}`)
      .join('\n');

    const skillList = SKILL_CATEGORIES.map(
      (c) => `• ${c.name}: ${c.items.join(', ')}`
    ).join('\n');

    const showSkills = /\b(skill|skills|stack|tech|language|languages|framework|tools|know)\b/i.test(lower);

    return {
      mode: 'portfolio-engine',
      answer: showSkills
        ? [`Verified technical stack for ${SITE_PROFILE.fullName}:`, ``, skillList].join('\n')
        : [`Experience & training highlights for ${SITE_PROFILE.fullName}:`, ``, expList].join('\n'),
      links: dedupeLinks([
        { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
        { label: 'Explore Work', href: '/work' },
        { label: 'Contact Petros', href: '/contact' },
      ]),
    };
  }

  // 9. Matched project fallback even without explicit trigger word
  if (matchedProjects.length > 0) {
    const top = matchedProjects[0];
    return {
      mode: 'portfolio-engine',
      answer: [
        `${top.title} (${top.category}, ${top.year}):`,
        `${top.summary}`,
        ``,
        `Technologies: ${top.technologies.join(', ')}`,
      ].join('\n'),
      links: dedupeLinks([
        { label: `Open ${top.title}`, href: `/work/${top.slug}/` },
        { label: `All ${projectCount} Projects`, href: '/work' },
      ]),
    };
  }

  // 10. Clean General Overview / Greeting
  const featuredNames = featured.map((p) => p.title).join(', ');
  return {
    mode: 'portfolio-engine',
    answer: [
      `${SITE_PROFILE.fullName} is a ${SITE_PROFILE.role} in ${SITE_PROFILE.location} (${eduExp?.organization ?? 'Debre Birhan University'}).`,
      ``,
      `• What he brings: Production full-stack apps (Next.js, React, TypeScript), Node.js/SQL/Firebase backends, Flutter/React Native mobile apps, and C++17/Java desktop systems.`,
      `• Credentials: ${insaExp?.organization ?? 'INSA 5th Round'} Web & App certified, remote client engineering (${remoteExp ? 'active' : 'verified'}), and internships at RiseTech & Sprint Studio.`,
      `• Featured work: ${featuredNames} (${projectCount} documented projects total).`,
      ``,
      `You can ask specific questions like "What is his good side?", "Should I hire him?", "What are his limitations?", or ask about any specific technology or project.`,
    ].join('\n'),
    links: dedupeLinks([
      { label: 'View Resume (PDF)', href: '/api/resume/', external: true },
      { label: 'Explore Projects', href: '/work' },
      { label: 'Contact Petros', href: '/contact' },
    ]),
  };
}
