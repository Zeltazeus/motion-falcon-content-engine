# Motion Falcon Content Engine

An autonomous content marketing dashboard for [Motion Falcon](https://motionfalcon.com) — a 3D CGI animation studio. Generate blog posts and LinkedIn content with Claude, queue them, and auto-publish to LinkedIn (via Zapier) and Wix Blog.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and the **Anthropic SDK**. State is stored in `localStorage` — no database required. Deploy-ready for Vercel.

## Features

- **Dashboard** — stat cards, activity log, day progress, and a "Generate now" shortcut.
- **Generate** — auto-generate by focus + audience + tone, or write your own topic and key points. Shows a 4-step generation overlay while Claude works.
- **Queue** — all scheduled / published / failed posts with publish-now and remove actions.
- **Schedule** — daily/3x/weekly cadence with per-day topic toggles.
- **Channels** — connect LinkedIn (via a Zapier webhook) and Wix Blog (via API key + Site ID).
- **Settings** — brand name, website, services, industries, signature/CTA, hashtags.
- Dark cinematic theme (Syne + DM Mono), toast notifications, copy-to-clipboard, full mobile responsiveness.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- `@anthropic-ai/sdk` for content generation
- `localStorage` for persistent state

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd blogposterautoclaude
npm install
```

### 2. Add your environment

Copy the example env file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and set:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key from [console.anthropic.com](https://console.anthropic.com/).

> The app will fall back to a templated response if the key is missing, so the UI stays functional during local demos.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build

```bash
npm run build
npm start
```

## Deploying to Vercel

1. Push the project to a Git repository (GitHub / GitLab / Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In **Project Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Click **Deploy**. No `vercel.json` is needed — the default Next.js preset works.

All other secrets (Zapier webhook URL, Wix API key + Site ID) live in the user's browser via `localStorage` — they never reach the server env.

## Connecting channels

### LinkedIn (via Zapier)

1. In Zapier, create a Zap.
2. Trigger: **Webhooks by Zapier → Catch Hook**.
3. Copy the webhook URL it generates.
4. In the app, go to **Channels** and paste it into the LinkedIn field (must start with `https://hooks.zapier.com`).
5. Add an action step to your Zap: **LinkedIn → Create Share Update**. Map the `message` field from the webhook payload.
6. Turn the Zap on.

The engine POSTs `{ title, message }` to the webhook when it publishes.

### Wix Blog

1. In your Wix dashboard, go to **Settings → API Keys** and create a key with **Blog (Write)** permissions.
2. Find your **Site ID** under **Settings → Business Info**.
3. In the app, go to **Channels** and paste both values into the Wix section.
4. Hit **Connect**.

## localStorage keys

Everything is namespaced with the `mf_` prefix:

- `mf_queue` — queued posts
- `mf_settings` — brand settings
- `mf_log` — activity log (capped at 200 entries)
- `mf_channels` — channel connection config
- `mf_schedule` — schedule config
- `mf_stats` — publish counters

Clear them via devtools (`localStorage.clear()`) if you want to reset.

## API routes

### `POST /api/generate`

Generates a blog post and LinkedIn post.

Request:
```json
{
  "topic": "...",
  "tone": "Expert authority",
  "audience": "Marketing Directors/CMOs",
  "keyPoints": "optional",
  "cta": "optional",
  "settings": { "companyName": "...", "website": "...", ... }
}
```

Response:
```json
{
  "blogTitle": "...",
  "blogBody": "...",
  "linkedinPost": "..."
}
```

### `POST /api/publish`

Publishes generated content to connected channels.

Request:
```json
{
  "type": ["linkedin", "wix"],
  "webhookUrl": "https://hooks.zapier.com/...",
  "wixApiKey": "...",
  "wixSiteId": "...",
  "title": "...",
  "blogBody": "...",
  "linkedinPost": "..."
}
```

Response:
```json
{ "success": true, "channels": ["linkedin", "wix"] }
```

## Project structure

```
app/
  api/
    generate/route.ts    # Claude content generation
    publish/route.ts     # LinkedIn (Zapier) + Wix publish
  channels/page.tsx
  generate/page.tsx
  queue/page.tsx
  schedule/page.tsx
  settings/page.tsx
  globals.css
  layout.tsx
  page.tsx               # Dashboard
components/
  Badge.tsx
  Button.tsx
  Card.tsx
  CopyButton.tsx
  GenerationOverlay.tsx
  Input.tsx
  PageHeader.tsx
  Sidebar.tsx
  ToastProvider.tsx
lib/
  constants.ts
  storage.ts
  types.ts
  utils.ts
```

## License

MIT. Free to use, fork, and adapt.
