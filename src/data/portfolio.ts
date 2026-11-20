export type ProjectCategory =
  | 'Web Applications'
  | 'Brand & Hospitality'
  | 'Desktop & Systems'
  | 'Mobile';

export interface ProjectImage {
  src: string;
  alt: string;
  caption: string;
  aspect: 'wide' | 'standard' | 'portrait';
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  originalTag: string;
  year: string;
  status: string;
  featured: boolean;
  featuredSpan: 'wide' | 'standard';
  role: string;
  summary: string;
  overview: string;
  problemStatement: string;
  objectives: string[];
  contribution: string;
  technologies: string[];
  keyFeatures: string[];
  architecture?: string[];
  challengesAndSolutions?: {
    challenge: string;
    solution: string;
  }[];
  heroImage: ProjectImage;
  gallery: ProjectImage[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface SkillCategory {
  id: string;
  index: string;
  name: string;
  description: string;
  items: string[];
}

export interface MilestoneItem {
  id: string;
  period: string;
  type: string;
  title: string;
  context: string;
  description: string;
  highlights: string[];
}

export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  href: string;
  external: boolean;
}

export interface PhilosophyPillar {
  index: string;
  title: string;
  description: string;
}

export const SITE_PROFILE = {
  brand: 'PETROS G DEV',
  fullName: 'Petros Geto',
  role: 'Software Engineer & AI Developer',
  secondaryRole: 'Full-Stack Applications & AI-Powered Solutions',
  location: 'Addis Ababa, Ethiopia',
  email: 'petrosgeto7@gmail.com',
  phoneDisplay: '+251 903 433 857',
  phoneHref: 'tel:+251903433857',
  githubHandle: '@petrosgDev',
  githubUrl: 'https://github.com/petrosgDev',
  linkedinHandle: 'in/petros-geto',
  linkedinUrl: 'https://www.linkedin.com/in/petros-geto-0b1a1b1b3/',
  telegramHandle: '@petrosgdev',
  telegramUrl: 'https://t.me/petrosgdev',
  whatsappUrl: 'https://wa.me/251903433857',
  existingSiteUrl: 'https://petrosgeto.pages.dev/',
  logoSrc: '/images/logo-petros.png',
  portraitSrc: '/images/portrait-petros.png',
  heroGreeting: 'HELLO WORLD.',
  heroHeadline: 'Building practical software, scalable web platforms, and AI-powered products.',
  heroIntro:
    "I'm Petros Geto, a software engineer building full-stack applications and AI-powered solutions. I turn ideas into functional, scalable digital products through clean code, thoughtful design, and engineering-driven problem solving.",
  shortPhilosophy:
    'Building digital products that solve real problems through thoughtful design, clean code, and purposeful innovation.',
  copyrightYear: 2026,
  availabilityNote: 'Available for software engineering collaborations, freelance product builds, and technical inquiries.',
  // Verified profile highlights directly backed by petrosgdev.pages.dev & github.com/petrosgDev
  heroMetrics: [
    { value: '08', label: 'Selected Projects' },
    { value: '23', label: 'Public GitHub Repositories' },
    { value: '04', label: 'Platforms (Web, Mobile, Desktop, Systems)' },
    { value: 'Addis Ababa', label: 'Based in Ethiopia' },
  ],
} as const;

export const NAVIGATION_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Work', path: '/work' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
] as const;

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'email',
    label: 'Email',
    handle: 'petrosgeto7@gmail.com',
    href: 'mailto:petrosgeto7@gmail.com',
    external: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: '@petrosgDev',
    href: 'https://github.com/petrosgDev',
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'in/petros-geto',
    href: 'https://www.linkedin.com/in/petros-geto-0b1a1b1b3/',
    external: true,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    handle: '@petrosgdev',
    href: 'https://t.me/petrosgdev',
    external: true,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: '+251 903 433 857',
    href: 'https://wa.me/251903433857',
    external: true,
  },
  {
    id: 'phone',
    label: 'Phone',
    handle: '+251 903 433 857',
    href: 'tel:+251903433857',
    external: false,
  },
];

export const PHILOSOPHY_PILLARS: PhilosophyPillar[] = [
  {
    index: '01',
    title: 'Engineering-Driven Problem Solving',
    description:
      'Every project begins with the operational friction it needs to eliminate—whether reducing online payment risk through escrow, unifying campus events, or implementing reliable data structures for desktop financial records.',
  },
  {
    index: '02',
    title: 'Clean, Maintainable Architecture',
    description:
      'Separating domain models, business logic, and interface layers makes applications resilient over time—from 3-tier JavaFX systems and C++17 data-structure engines to modular Next.js web platforms.',
  },
  {
    index: '03',
    title: 'Thoughtful User Experience',
    description:
      'Functional software should feel calm, clear, and responsive across devices. Visual clarity, direct workflows like WhatsApp booking or QR check-in, and fast page loads turn technical systems into usable products.',
  },
];

export const TECHNICAL_INTERESTS = [
  {
    title: 'Full-Stack Web Engineering',
    description:
      'Designing end-to-end applications with Next.js, React, TypeScript, Node.js, Express, and relational databases like PostgreSQL and MySQL.',
  },
  {
    title: 'AI-Powered Software & Automation',
    description:
      'Integrating practical AI capabilities—such as smart item-matching workflows, intelligent campus assistance, and modern API-driven assistants—into everyday products.',
  },
  {
    title: 'Cross-Platform & Native Systems',
    description:
      'Building responsive offline-first mobile interfaces with Flutter and React Native (Expo), alongside native desktop applications in Java/JavaFX and C++/Qt.',
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    index: '01',
    name: 'Frontend & Mobile',
    description: 'Modern component-driven web and cross-platform mobile interfaces.',
    items: [
      'React',
      'Next.js',
      'HTML5',
      'CSS3',
      'Tailwind CSS',
      'Flutter',
      'React Native (Expo)',
      'Swiper.js',
    ],
  },
  {
    id: 'backend',
    index: '02',
    name: 'Backend & APIs',
    description: 'Server-side architecture, payment integrations, and structured API services.',
    items: [
      'Node.js',
      'Express',
      'Spring Boot',
      'REST APIs',
      'WhatsApp API',
      'Escrow & Payment Workflows',
    ],
  },
  {
    id: 'languages',
    index: '03',
    name: 'Programming Languages',
    description: 'Core languages verified across web, mobile, and native desktop repositories.',
    items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Dart'],
  },
  {
    id: 'databases',
    index: '04',
    name: 'Databases & Native UI',
    description: 'Relational persistence and desktop application frameworks.',
    items: ['PostgreSQL', 'MySQL', 'JavaFX', 'Qt 6 Widgets'],
  },
  {
    id: 'devops',
    index: '05',
    name: 'DevOps & Platforms',
    description: 'Version control, containerization, and continuous deployment.',
    items: ['Git', 'GitHub', 'Docker', 'Vercel', 'Render', 'CI/CD'],
  },
];

export const MILESTONES: MilestoneItem[] = [
  {
    id: 'web-platforms',
    period: '2026',
    type: 'Product Engineering',
    title: 'Production Web Platforms & Client Deployments',
    context: 'Vercel · Next.js · Node.js · PostgreSQL',
    description:
      'Designed, built, and deployed live web applications spanning fintech escrow workflows (Aman Pay), university event management (EventHub DBU), local wellness booking (Ethio Massage), and luxury brand showcases (Wende Dubai Interior Design, Raman Caffe).',
    highlights: [
      'Integrated Ethiopian payment and communication workflows including Chapa and WhatsApp API.',
      'Delivered responsive, production-hosted frontends and full-stack Next.js platforms.',
    ],
  },
  {
    id: 'campus-systems',
    period: '2026',
    type: 'Software Engineering Systems',
    title: 'Nexus Campus Services & EventHub DBU',
    context: 'Debre Birhan University Context · Java 17 · TypeScript',
    description:
      'Engineered both a native 3-tier Java/JavaFX desktop suite and a web-based campus events platform targeting real university workflows: room booking, club management, QR attendance, lost-and-found smart matching, and digital certificates.',
    highlights: [
      'Implemented token-similarity matching (SmartMatcher) and offline JDBC simulation in Java.',
      'Designed role-based views for students, club leaders, organizers, and administrators.',
    ],
  },
  {
    id: 'dsa-banking',
    period: '2026',
    type: 'Academic Engineering Coursework',
    title: 'Design & Analysis of Data Structures and Algorithms (SEng2022)',
    context: 'C++17 · Qt 6 Widgets · MySQL 8.0',
    description:
      'Built a multi-role GUI banking system bridging fundamental in-memory data structures (custom Singly Linked List and FIFO Transaction Queue) with persistent MySQL relational storage.',
    highlights: [
      'Implemented O(1) tail insertion for account records and ordered FIFO transaction processing.',
      'Delivered 4-tier RBAC across Admin, Manager, Accountant, and Customer interfaces.',
    ],
  },
  {
    id: 'open-source',
    period: '2025 – 2026',
    type: 'Open Source & Continuous Practice',
    title: 'GitHub Portfolio & Multi-Language Exploration',
    context: 'github.com/petrosgDev · 23 Public Repositories',
    description:
      'Maintains active public repositories spanning Flutter e-commerce and weather apps, Java desktop tools, Python OOP and testing exercises, C++ systems, and TypeScript web applications.',
    highlights: [
      'Cross-disciplinary foundation across web, mobile (Flutter & Expo), and native desktop software.',
      'Editable slot: formal employment history or certifications can be added directly in src/data/portfolio.ts.',
    ],
  },
];

export const PROJECT_CATEGORIES: readonly ('All' | ProjectCategory)[] = [
  'All',
  'Web Applications',
  'Brand & Hospitality',
  'Desktop & Systems',
  'Mobile',
] as const;

export const PROJECTS: ProjectItem[] = [
  {
    id: 'aman-pay',
    slug: 'aman-pay',
    title: 'Aman Pay',
    subtitle: 'Escrow-protected online commerce platform for secure transactions in ETB',
    category: 'Web Applications',
    originalTag: 'Fintech & Escrow',
    year: '2026',
    status: 'Live Deployment',
    featured: true,
    featuredSpan: 'wide',
    role: 'Full-Stack Developer',
    summary:
      'An escrow payment web platform built with Next.js, React, and Node.js that protects buyers and sellers across goods, services, vehicles, and electronics deals.',
    overview:
      'Aman Pay addresses trust gaps in peer-to-peer and online commerce by holding funds in escrow until both buyer and seller fulfill agreed terms. Designed for Ethiopian Birr (ETB) transactions, the platform guides users through a clear five-step settlement flow with Chapa payment integration and identity-backed verification concepts.',
    problemStatement:
      'Online buyers and sellers frequently face fraud, non-delivery, and chargeback risk when transacting directly without a neutral intermediary holding funds during delivery.',
    objectives: [
      'Provide a transparent, step-by-step escrow flow that both buyers and sellers can follow effortlessly.',
      'Support multiple transaction categories—including general goods, services, vehicles, electronics, and jewelry—denominated in ETB.',
      'Present high-trust fintech messaging, onboarding flows, and authentication in a responsive web experience.',
    ],
    contribution:
      'Architected and implemented the full-stack Next.js and Node.js application, transaction setup flow, escrow step presentation, authentication integration, and Vercel deployment.',
    technologies: ['Next.js', 'React', 'Node.js', 'Escrow', 'Chapa', 'Tailwind CSS'],
    keyFeatures: [
      'Interactive buyer/seller role toggle and deal category selector for ETB transactions',
      'Clear 5-stage escrow lifecycle: agreement, fund deposit, delivery, buyer approval, and seller payout',
      'Chapa payment integration design and Fayda-backed identity security framing',
      'User authentication (Log in / Register), FAQ, and responsive fintech landing architecture',
    ],
    architecture: [
      'Next.js App Router frontend with React interactive transaction setup controls',
      'Node.js backend workflow handling escrow state stages and authentication',
      'Deployed continuously on Vercel for low-latency web access',
    ],
    challengesAndSolutions: [
      {
        challenge:
          'Communicating multi-party escrow mechanics to first-time online buyers and sellers without overwhelming legal jargon.',
        solution:
          'Structured the interface around an interactive deal-initiator widget and a numbered 5-step visual progression that clarifies exactly when funds are locked and released.',
      },
    ],
    heroImage: {
      src: '/images/project-aman-pay.png',
      alt: 'Aman Pay escrow fintech web application interface preview',
      caption: 'Aman Pay landing interface featuring buyer/seller escrow deal initiation in ETB.',
      aspect: 'wide',
    },
    gallery: [
      {
        src: '/images/project-aman-pay.png',
        alt: 'Aman Pay primary escrow dashboard and landing screen',
        caption: 'Primary escrow deal workflow and trust architecture on Aman Pay.',
        aspect: 'wide',
      },
    ],
    liveUrl: 'https://aman-pay-lake.vercel.app/',
    githubUrl: 'https://github.com/petrosgDev',
  },
  {
    id: 'event-hub',
    slug: 'event-hub',
    title: 'Event Hub',
    subtitle: 'AI-powered campus event discovery, ticketing, and attendance platform for DBU',
    category: 'Web Applications',
    originalTag: 'Website',
    year: '2026',
    status: 'Live Deployment',
    featured: true,
    featuredSpan: 'standard',
    role: 'Full-Stack Developer',
    summary:
      'A university event management platform for Debre Birhan University built with Next.js, TypeScript, Node.js, and PostgreSQL featuring registration, QR attendance, and Chapa payments.',
    overview:
      'EventHub DBU centralizes workshops, seminars, hackathons, and cultural events at Debre Birhan University into a unified digital platform. Students can discover upcoming campus events, locate venues on a campus map, register instantly, and access tickets, while organizers manage event creation, attendance tracking, and digital certificates.',
    problemStatement:
      'University workshops, hackathons, and student club events are often scattered across posters and chat groups, causing missed registrations, manual attendance sheets, and poor organizer visibility.',
    objectives: [
      'Unify campus event discovery and category browsing for students and organizers at Debre Birhan University.',
      'Streamline registration, ticket lookup, Chapa payments, and QR-based attendance verification.',
      'Provide venue mapping across campus landmarks alongside real-time analytics and admin governance.',
    ],
    contribution:
      'Developed the full-stack Next.js, TypeScript, Node.js, and PostgreSQL codebase, database models, organizer and attendee workflows, and live deployment on Vercel.',
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Chapa'],
    keyFeatures: [
      'Category-based event discovery and upcoming campus event directory',
      'Instant student registration, ticket finder, and QR attendance tracking',
      'Campus venue mapping (Main Auditorium, CS Building & Innovation Hub, Business School & Library)',
      'Organizer portal for event creation, Chapa payment support, real-time analytics, and digital certificates',
    ],
    architecture: [
      'Next.js & TypeScript web application with API routes for categories, events, and analytics',
      'Node.js backend connected to PostgreSQL for structured event, ticket, and user persistence',
      'Role-aware workflows separating student attendees, event organizers, and campus administrators',
    ],
    challengesAndSolutions: [
      {
        challenge:
          'Supporting both rapid student event discovery and structured organizer governance within one coherent platform.',
        solution:
          'Separated attendee journeys (Explore Events, Find My Tickets, Campus Map) from organizer tooling (Create Events, QR Attendance, Analytics, Governance) with dedicated navigation paths.',
      },
    ],
    heroImage: {
      src: '/images/project-event-hub.png',
      alt: 'Event Hub DBU campus event management platform interface',
      caption: 'EventHub DBU homepage showcasing campus event discovery and quick ticket access.',
      aspect: 'wide',
    },
    gallery: [
      {
        src: '/images/project-event-hub.png',
        alt: 'Event Hub platform overview screenshot',
        caption: 'Campus event discovery, venue guidance, and organizer onboarding flow.',
        aspect: 'wide',
      },
    ],
    liveUrl: 'https://event-hub-mu-five.vercel.app/',
    githubUrl: 'https://github.com/petrosgDev/event-hub',
  },
  {
    id: 'ethio-massage',
    slug: 'ethio-massage',
    title: 'Ethio Massage',
    subtitle: 'House-to-house and hotel wellness booking platform in Addis Ababa',
    category: 'Web Applications',
    originalTag: 'Wellness Platform',
    year: '2026',
    status: 'Live Deployment',
    featured: true,
    featuredSpan: 'standard',
    role: 'Frontend & Integration Developer',
    summary:
      'A wellness service and direct booking web platform built with Next.js, React, Tailwind CSS, and WhatsApp API integration for mobile massage therapy across Addis Ababa.',
    overview:
      'Ethio Massage delivers a calm, hospitality-focused booking experience for house-to-house (bet-le-bet), hotel, and private-space massage therapy in Addis Ababa. Visitors can browse signature treatments, view service galleries and client reviews, toggle appearance modes, and initiate appointments directly through WhatsApp.',
    problemStatement:
      'Local wellness providers often lose bookings when prospective clients cannot clearly review treatment menus, service availability, or book rapidly from mobile phones.',
    objectives: [
      'Present a curated catalog of massage therapies—including Swedish, Deep Tissue, Sports, Couples, Hot Stone, and Aromatherapy—with clear visual polish.',
      'Remove booking friction by connecting service selections directly to WhatsApp API messaging and phone contact.',
      'Deliver a mobile-first responsive layout with both light and dark appearance modes.',
    ],
    contribution:
      'Built the Next.js, React, and Tailwind CSS frontend, structured the treatment catalog, gallery, and review sections, and integrated direct WhatsApp booking links.',
    technologies: ['Next.js', 'React', 'WhatsApp API', 'Tailwind CSS'],
    keyFeatures: [
      'Comprehensive catalog of signature therapies (Swedish, Deep Tissue, Sports, Couples, Hot Stone, Aromatherapy)',
      'Direct WhatsApp API appointment booking and tap-to-call contact triggers',
      'Service gallery, client reviews, and mobile drawer navigation',
      'Built-in light and dark mode appearance switcher',
    ],
    architecture: [
      'Next.js and React component architecture styled with Tailwind CSS',
      'Zero-friction WhatsApp deep-link API workflow tailored for mobile-heavy local audiences',
    ],
    challengesAndSolutions: [
      {
        challenge:
          'Traditional multi-step web checkout forms create drop-off for local on-demand home services where clients prefer instant confirmation.',
        solution:
          'Paired structured treatment discovery with one-tap WhatsApp API booking prompts so clients transition directly from browsing to confirming an appointment.',
      },
    ],
    heroImage: {
      src: '/images/project-ethio-massage.png',
      alt: 'Ethio Massage wellness booking platform interface',
      caption: 'Ethio Massage storefront presenting Addis Ababa mobile wellness services and instant booking.',
      aspect: 'wide',
    },
    gallery: [
      {
        src: '/images/project-ethio-massage.png',
        alt: 'Ethio Massage hero and booking experience',
        caption: 'Wellness service navigation and WhatsApp-enabled booking interface.',
        aspect: 'wide',
      },
    ],
    liveUrl: 'https://ethio-massage.vercel.app/',
    githubUrl: 'https://github.com/petrosgDev/ethio-massage',
  },
  {
    id: 'wende-dubai-interior-design',
    slug: 'wende-dubai-interior-design',
    title: 'Wende Dubai Interior Design',
    subtitle: 'Luxury interior architecture and complete fit-out showcase in Dubai',
    category: 'Brand & Hospitality',
    originalTag: 'Live Preview',
    year: '2026',
    status: 'Live Deployment',
    featured: true,
    featuredSpan: 'wide',
    role: 'Frontend Developer',
    summary:
      'A visual corporate showcase for Wende Luxury Interior & Finishing in Dubai crafted with semantic HTML5, CSS3, vanilla JavaScript, and Swiper.js carousels.',
    overview:
      'Built for Wende Luxury Interior & Finishing, this brand website showcases residential and commercial interior design, full fit-out execution, tiling, false ceilings, painting, electrical, plumbing, HVAC, and deep-cleaning services in Dubai through full-bleed photography and interactive Swiper.js slides.',
    problemStatement:
      'Interior design and technical fit-out firms rely heavily on visual credibility to win villa, office, and retail clients, requiring fast-loading media showcases across desktop and mobile.',
    objectives: [
      'Communicate Dubai-inspired luxury craftsmanship across ten specialized interior and finishing service lines.',
      'Implement smooth, touch-friendly showcase carousels using Swiper.js without heavy framework overhead.',
      'Provide immediate inquiry pathways via direct phone, email, and structured service navigation.',
    ],
    contribution:
      'Designed and coded the responsive HTML5/CSS3 layout, interactive JavaScript controls, Swiper.js hero and service galleries, and Vercel deployment.',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Swiper.js'],
    keyFeatures: [
      'Full-bleed interactive Swiper.js hero and service showcase sliders',
      'Dedicated coverage of interior design, fit-out, tiling, ceiling partitions, painting, electrical, plumbing, and HVAC',
      'Lightweight vanilla HTML5/CSS3/JS build for crisp load performance',
      'Direct client contact bar and mobile-responsive navigation',
    ],
    architecture: [
      'Static HTML5, modular CSS3, and vanilla JavaScript enhanced with Swiper.js',
      'Optimized image-first presentation deployed on Vercel',
    ],
    heroImage: {
      src: '/images/project-wende-dubai.png',
      alt: 'Wende Dubai Interior Design luxury fit-out website preview',
      caption: 'Wende Luxury Interior & Finishing hero showcase with Swiper.js transitions.',
      aspect: 'wide',
    },
    gallery: [
      {
        src: '/images/project-wende-dubai.png',
        alt: 'Wende Dubai Interior Design main showcase',
        caption: 'Editorial interior showcase presenting Dubai fit-out and finishing services.',
        aspect: 'wide',
      },
    ],
    liveUrl: 'https://wende-dubai-interiordesign.vercel.app/',
  },
  {
    id: 'raman-caffe',
    slug: 'raman-caffe',
    title: 'Raman Caffe',
    subtitle: 'Ethiopian highland coffee and culinary hospitality experience in Debre Birhan',
    category: 'Brand & Hospitality',
    originalTag: 'Café & Dining',
    year: '2026',
    status: 'Live Deployment',
    featured: false,
    featuredSpan: 'standard',
    role: 'Frontend & UI/UX Developer',
    summary:
      'An editorial dining and coffee-house website celebrating Ethiopian highland hospitality, clay-pot Jebena Bunna, culinary menus, and table reservations.',
    overview:
      'Raman Caffe translates the atmosphere of Debre Birhan’s highland café culture into an immersive web presence. Featuring traditional clay-pot Jebena Bunna, sautéed Tibs, spiced Chechebsa, and highland culinary storytelling, the site pairs atmospheric photography with menu exploration and table reservation flows.',
    problemStatement:
      'Independent cafés and heritage dining venues need a distinctive digital presence that captures their culinary craft and lets guests browse menus and reserve tables seamlessly.',
    objectives: [
      'Highlight authentic Ethiopian highland heritage—3050m altitude coffee, organic Arabica, and traditional Jebena brewing.',
      'Combine editorial storytelling with practical menu browsing and reservation calls to action.',
      'Craft an atmospheric visual hierarchy with responsive typography and balanced pacing.',
    ],
    contribution:
      'Designed the UI/UX direction and implemented the responsive frontend experience, menu exploration interface, and brand sections.',
    technologies: ['TypeScript', 'HTML5', 'CSS3', 'JavaScript', 'UI/UX'],
    keyFeatures: [
      'Editorial hero storytelling centered on Ethiopian highland hospitality and Jebena Bunna',
      'Culinary menu showcase featuring traditional dishes and highland coffee brews',
      'Table reservation entry points, legacy journal, and salon sections',
      'Responsive hospitality layout tailored for desktop and mobile diners',
    ],
    heroImage: {
      src: '/images/project-raman-caffe.png',
      alt: 'Raman Caffe Ethiopian hospitality website preview',
      caption: 'Raman Caffe homepage highlighting highland coffee heritage and culinary menu navigation.',
      aspect: 'wide',
    },
    gallery: [
      {
        src: '/images/project-raman-caffe.png',
        alt: 'Raman Caffe culinary showcase interface',
        caption: 'Atmospheric hospitality presentation for Raman Cafe in Debre Birhan.',
        aspect: 'wide',
      },
    ],
    liveUrl: 'https://raman-caffe.vercel.app/',
    githubUrl: 'https://github.com/petrosgDev/raman-caffe',
  },
  {
    id: 'nexus-campus-services',
    slug: 'nexus-campus-services',
    title: 'Nexus Campus Services (NCS)',
    subtitle: 'Native 3-tier Java desktop platform unifying campus operations and resource booking',
    category: 'Desktop & Systems',
    originalTag: 'Campus Management',
    year: '2026',
    status: 'Completed Repository',
    featured: false,
    featuredSpan: 'wide',
    role: 'Java Software Engineer',
    summary:
      'A native JDK 17+ and JavaFX campus management system backed by MySQL, featuring collision-free room booking, club portals, RBAC, and a token-similarity lost-and-found matcher.',
    overview:
      'Nexus Campus Services (NCS) is a centralized Java desktop platform designed to replace fragmented manual campus administration. Built with a clean 3-tier object-oriented architecture using JDK 17+, JavaFX, Maven, and MySQL, it serves Students, Club Leaders, and Administrators with unified notices, events, club memberships, room bookings, lost-and-found matching, and feedback workflows.',
    problemStatement:
      'Manual campus processes lead to double-booked lecture halls, missed club announcements, untracked student complaints, and disconnected lost-and-found records.',
    objectives: [
      'Consolidate notices, events, club memberships, room bookings, and student feedback into one unified portal.',
      'Guarantee collision-free room scheduling and structured multi-role access control.',
      'Automate lost-and-found item discovery using weighted token-similarity matching.',
    ],
    contribution:
      'Designed the relational MySQL schema (`schema.sql`), domain models (`User`, `Event`, `Club`, `Room`, `Booking`, `LostItem`, `Notification`), SmartMatcher similarity utility, JDBC connection layer with offline simulator mode, and JavaFX interface.',
    technologies: ['Java', 'JavaFX', 'MySQL', 'Maven', 'JDBC'],
    keyFeatures: [
      'Centralized campus portal for notices, events, club memberships, and automated notifications',
      'Collision-free room and resource booking engine with role-based administrative approval',
      'SmartMatcher item similarity engine using token weights to match lost and found reports',
      'DatabaseConnection JDBC pool with seamless Offline Simulator Mode for local testing without MySQL',
      'Role-based access control tailored for Students, Club Leaders, and Administrators',
    ],
    architecture: [
      'Modular 3-tier Java Maven layout: model (domain state), controller (business workflows), and util (JDBC & matching algorithms)',
      'Relational MySQL schema with indexed tables for users, rooms, bookings, clubs, lost items, and feedback complaints',
      'Dual-mode persistence allowing live MySQL connectivity or offline in-memory simulation',
    ],
    challengesAndSolutions: [
      {
        challenge:
          'Ensuring evaluators and developers can run the full campus dashboard even in environments without a running MySQL server.',
        solution:
          'Engineered an Offline Simulator Mode inside `DatabaseConnection.java` that seamlessly mirrors relational entities when a live JDBC connection is absent.',
      },
    ],
    heroImage: {
      src: '/images/project-ncs.jpg',
      alt: 'Nexus Campus Services Java desktop platform preview',
      caption: 'Nexus Campus Services (NCS) desktop interface and unified campus operations dashboard.',
      aspect: 'wide',
    },
    gallery: [
      {
        src: '/images/project-ncs.jpg',
        alt: 'Nexus Campus Services interface overview',
        caption: 'Native JavaFX campus management workspace supporting bookings, clubs, and lost-and-found.',
        aspect: 'wide',
      },
    ],
    githubUrl: 'https://github.com/petrosgDev/nexus-campus-service',
  },
  {
    id: 'myapp',
    slug: 'myapp',
    title: 'MyApp',
    subtitle: 'Offline-first mobile companion for daily tasks, notes, workouts, and routines',
    category: 'Mobile',
    originalTag: 'Mobile App',
    year: '2026',
    status: 'Mobile Prototype',
    featured: false,
    featuredSpan: 'standard',
    role: 'Mobile Application Developer',
    summary:
      'An offline-first React Native and Expo personal productivity app unifying daily tasks, notes, workout tracking, daily challenges, and personal devotions in a calm dark UI.',
    overview:
      'MyApp brings everyday personal organization into a single offline-first mobile workspace built with React Native and Expo. Designed to remain fast and dependable without an internet connection, its daily overview surfaces pending and completed tasks, saved notes, logged workouts, daily challenges, and faith & devotions modules through intuitive bottom tab navigation.',
    problemStatement:
      'Tracking daily tasks, quick notes, fitness sessions, and personal habits across separate cloud-dependent apps creates friction—especially when connectivity is inconsistent.',
    objectives: [
      'Deliver an instant, offline-first mobile experience that stores daily data reliably on-device.',
      'Surface key daily progress metrics (pending tasks, completed items, saved notes, workouts) at a glance.',
      'Provide clean thumb-friendly bottom navigation across Home, Tasks, and Notes.',
    ],
    contribution:
      'Designed the dark-theme mobile UI and developed the React Native (Expo) screens, offline local state management, and daily productivity modules.',
    technologies: ['React Native', 'Expo', 'Offline-First', 'JavaScript'],
    keyFeatures: [
      'Time-aware daily dashboard summarizing pending tasks, completed items, saved notes, and workouts',
      'Offline-first architecture built with React Native and Expo for reliable local access',
      'Dedicated sections for Daily Challenges and Faith & Devotions',
      'Clean bottom tab bar switching between Home, Tasks, and Notes views',
    ],
    architecture: [
      'React Native & Expo mobile client with local offline-first persistence',
      'Modular card-based mobile dashboard with dark-mode visual hierarchy',
    ],
    heroImage: {
      src: '/images/project-myapp.png',
      alt: 'MyApp React Native offline-first mobile productivity dashboard',
      caption: 'MyApp mobile dashboard displaying tasks, saved notes, workouts, and bottom navigation.',
      aspect: 'portrait',
    },
    gallery: [
      {
        src: '/images/project-myapp.png',
        alt: 'MyApp mobile screen preview',
        caption: 'Dark-theme daily overview with pending tasks, notes, workouts, and quick tab switching.',
        aspect: 'portrait',
      },
    ],
    githubUrl: 'https://github.com/petrosgDev',
  },
  {
    id: 'banking-system',
    slug: 'banking-system',
    title: 'Banking System',
    subtitle: 'High-performance C++17 & Qt 6 desktop banking application with custom data structures',
    category: 'Desktop & Systems',
    originalTag: 'Desktop System',
    year: '2026',
    status: 'Completed Repository',
    featured: false,
    featuredSpan: 'standard',
    role: 'C++ Systems & GUI Developer',
    summary:
      'A GUI banking application built with C++17, Qt 6 Widgets, and MySQL 8.0 implementing a custom Singly Linked List, FIFO transaction queue, and 4-role RBAC.',
    overview:
      'Developed for the Design and Analysis of Data Structures and Algorithms (SEng2022) course, the Simple Banking System bridges theoretical computer science structures with practical financial operations. Built in C++17 with Qt 6 Widgets and MySQL 8.0 persistence, it manages accounts, deposits, withdrawals, peer-to-peer transfers, and real-time audit trails under role-based access control.',
    problemStatement:
      'Financial desktop software requires both predictable, ordered in-memory transaction handling and durable relational persistence while enforcing strict operational boundaries across staff and customer roles.',
    objectives: [
      'Implement core data structures—Singly Linked List and FIFO Queue—from scratch in C++17 for real application state.',
      'Synchronize dequeued financial transactions reliably with a MySQL 8.0 database.',
      'Provide an intuitive Qt 6 desktop dashboard supporting Admin, Manager, Accountant, and Customer roles.',
    ],
    contribution:
      'Implemented the custom `LinkedList` and FIFO Queue data structures in C++17, built the Qt 6 Widgets multi-role GUI, designed the MySQL persistence mappers, and documented the project build workflow.',
    technologies: ['C++17', 'Qt 6 Widgets', 'MySQL', 'Data Structures'],
    keyFeatures: [
      '4-tier Role-Based Access Control: Admin, Manager, Accountant, and Customer views',
      'Full account lifecycle (create, update, delete) plus deposits, withdrawals, and peer-to-peer transfers',
      'Custom Singly Linked List (`src/core/LinkedList.cpp`) enabling O(1) tail insertion for active accounts',
      'Custom FIFO Queue processing asynchronous transaction requests in exact arrival order before MySQL sync',
      'Interactive dashboard with financial stat cards, transaction queue monitoring, audit logs, and ID/name search',
    ],
    architecture: [
      'C++17 core engine with custom Singly Linked List (accounts) and FIFO Queue (transactions)',
      'Qt 6 Widgets native GUI layer built via qmake / Qt Creator',
      'MySQL 8.0+ relational backend via Qt MySQL driver (QMYSQL) with custom object mappers',
    ],
    challengesAndSolutions: [
      {
        challenge:
          'Keeping custom in-memory C++ data structures synchronized with durable database records during concurrent financial actions.',
        solution:
          'Routed every deposit, withdrawal, and transfer through an ordered FIFO transaction queue that commits each dequeued operation to MySQL and updates audit logs atomically.',
      },
    ],
    heroImage: {
      src: '/images/project-banking-system.png',
      alt: 'Simple Banking System C++17 Qt 6 desktop interface',
      caption: 'Simple Banking System Qt 6 desktop UI featuring role-based dashboard and transaction monitoring.',
      aspect: 'wide',
    },
    gallery: [
      {
        src: '/images/project-banking-system.png',
        alt: 'Banking System Qt Widgets desktop screen',
        caption: 'Desktop dashboard showing financial summaries, queue tracking, and account controls.',
        aspect: 'wide',
      },
    ],
    githubUrl: 'https://github.com/petrosgDev/banking_system',
  },
];
