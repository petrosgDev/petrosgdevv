# PETROS G DEV — Personal Portfolio

Personal developer portfolio for **Petros Geto**, built with **Next.js App Router**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, featuring a live Telegram channel blog synced from `@abysiniyatech`.

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

## Routes

- `/` — Home (Hero, Featured Projects with live interactive site frames, About preview, Skills, Experience, Live Telegram Blog preview, Collaboration)
- `/work` and `/work/[slug]` — Full project gallery & detailed case studies
- `/blog` — Live dispatches synced server-side via `/api/telegram/` from `https://t.me/abysiniyatech`
- `/about` — Background, engineering philosophy, capabilities, and experience
- `/contact` — Direct channels & validated inquiry form

## Deploy to Vercel

1. Push this repository to GitHub (`main`).
2. Import the repository in **Vercel → Add New Project**.
3. `vercel.json` is pre-configured (`framework: "nextjs"`, `buildCommand: "npm run build"`, anti-crawler headers).
