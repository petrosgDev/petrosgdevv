# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary audience:** Clients and recruiters hiring for full-stack and AI engineering, visiting to evaluate Petros Geto's shipped work and initiate a contact or project inquiry.
- **Owner / Operator:** Petros Geto (`petrosgeto7@gmail.com`), managing portfolio content, media, SEO metadata, and theme tokens via the `/boss` Studio CMS.

## Product Purpose

Showcase Petros Geto's production software engineering and AI work with verifiable case studies, experience timeline, Telegram-synced engineering notes (`/blog`), and a direct inquiry path (`/contact`), backed by a private Firebase Firestore CMS (`/boss`) for live updates without code redeploys.

## Positioning

End-to-end production systems and AI-powered products shipped in Ethiopia and globally — demonstrated through 9 real case studies, live system architecture details, and self-managed publishing via Firebase Firestore.

## Operating Context

- **Public portfolio routes:** `/`, `/about`, `/work`, `/work/[slug]`, `/blog`, `/contact` (SSR-first Next.js 16 App Router with Firestore-backed live overrides).
- **Private Studio CMS (`/boss`):** Accessible only via Google Sign-In (`petrosgeto7@gmail.com`), publishing directly to `/portfolio/published` in Firebase Firestore (`petrosgdev`) and managing uploads in `/api/media`.
- **Blog feed (`/blog`):** Syncs dispatches from the configured Telegram channel (`@abysiniyatech` by default) via `/api/telegram`.

## Capabilities and Constraints

- **Public UI preservation:** Keep the existing public portfolio UI unchanged unless explicitly requested; focus new refinements on `/boss` Studio or explicitly requested features.
- **Security & privacy:** `/boss` and `/api/*` carry `noindex, nofollow` headers and `robots.txt` disallow rules; Firestore rules restrict writes on `/portfolio/published` strictly to verified `petrosgeto7@gmail.com`.
- **Single source of truth:** Built-in fallback data lives in `src/data/portfolio.ts` (vault-encoded); live overrides persist in Firestore `/portfolio/published`.

## Brand Commitments

- **Identity:** `PETROS G DEV` / `Petros Geto` — Software Engineer & AI Developer based in Addis Ababa, Ethiopia.
- **No fabricated claims:** Never invent testimonials, metrics, clients, or benchmarks outside verified project data.

## Evidence on Hand

- 9 case studies in `src/data/portfolioVault.ts` (including `aman-pay`, `event-hub`, `ethio-massage`, and flagship projects).
- Experience history including INSA 5th Round Summer Camp and full-stack product delivery.
- Live Firebase Firestore project `petrosgdev` configured in `firebase-applet-config.json`.

## Product Principles

- **Proof over hype:** Lead with real shipped systems, architecture notes, and working demos rather than generic claims.
- **Zero-friction inquiry:** Make evaluating skills and reaching out via `/contact` or direct channels effortless for hiring managers and clients.
- **Owner autonomy:** Every text, image, link, blog channel, SEO field, and theme token is editable from `/boss` without touching source code.
- **Strict scope discipline:** Protect the stability of the public portfolio while iterating cleanly on `/boss` and requested features.

