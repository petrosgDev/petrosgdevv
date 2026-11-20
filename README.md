# PETROS G DEV — Personal Portfolio (Next.js)

Personal developer portfolio for **Petros Geto**, built with **Next.js App Router**, **React 19**, **TypeScript**, and **Tailwind CSS v4** using static export (`output: 'export'`) so it deploys cleanly with zero adapters on both **Cloudflare Pages** and **Vercel**.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build, Type-Check & Tests

```bash
npm run lint
npm test
npm run build
```

Production static output is generated in `out/` with pre-rendered HTML for every route (`/`, `/work`, `/work/[slug]`, `/about`, `/contact`, and `/404`).

## Deploy to Cloudflare Pages

### Option A — Git Integration (Recommended)
1. Push this repository to GitHub (`main`).
2. In **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**, select the repository and use:
   - **Framework preset**: `Next.js (Static HTML Export)` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node version**: automatically pinned to `22` via `.node-version`

`wrangler.jsonc` and `public/_headers` are pre-configured for `out/`.

### Option B — Direct CLI Deploy
```bash
npm run deploy:cf
```

## Deploy to Vercel

### Option A — Git Integration (Recommended)
1. Import the GitHub repository in **Vercel → Add New Project**.
2. Vercel auto-detects Next.js and deploys automatically with zero extra settings (`npm run build`).

### Option B — Direct CLI Deploy
```bash
npm run deploy:vercel
```
