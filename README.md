# Knowledge Copilot: frontend

React UI for Knowledge Copilot, a RAG assistant that answers questions from your own documents and cites its sources. The API lives in [knowledge-copilot-backend](https://github.com/Dev-G29/knowledge-copilot-backend).

**Stack:** React 19 · Vite · Tailwind CSS v4 · React Router · react-markdown + highlight.js · Motion · Sonner

## Features

- **Landing, About and Contact pages**, with light and dark themes (follows the system setting, with a toggle).
- **Chat** in a ChatGPT-style layout:
  - answers stream in token by token over server-sent events, with a Stop button;
  - Markdown rendering with code highlighting;
  - source chips that expand to show the passage each answer used, plus a confidence badge;
  - conversations you can link to (`/chat/:id`).
- **Sidebar** with conversations grouped by date, search, inline rename and delete.
- **Knowledge base**:
  - everyone sees the list of documents and stats;
  - admins also get drag-and-drop upload with per-file progress, and delete.
- **Auth**: inline validation; registering signs you straight in; an expired token signs you out with a message.
- **Responsive** down to 360 px, with a drawer sidebar on mobile.

## Run locally

```bash
npm install
cp .env.example .env.local   # VITE_API_BASE_URL=http://localhost:8080
npm run dev                  # http://localhost:5173
```

You need the backend running on port 8080. With no Gemini key, run `./mvnw spring-boot:test-run` in the backend repo: it starts a throwaway pgvector database and a demo AI, with admin login `admin@example.com` / `admin12345`.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |

## Deploy to Vercel

1. In Vercel: **Add New → Project** → import `knowledge-copilot-frontend`. The framework (Vite) is detected; `vercel.json` adds the SPA rewrite and asset caching.
2. **Environment variables**: `VITE_API_BASE_URL` = `https://<your-api>.duckdns.org` (no trailing slash).
3. Deploy, then add the Vercel URL to the backend's `CORS_ALLOWED_ORIGINS`. Preview deployments can be allowed with a pattern such as `https://knowledge-copilot-*.vercel.app`.

Vercel serves static files from its CDN, so the frontend never cold-starts. Every push to `main` redeploys automatically.

## Project layout

```
src/
  lib/          api.js (axios + auth interceptor), sse.js (streaming client), format.js
  context/      AuthContext, ThemeContext, ConversationsContext
  components/   ui/ (Button, Field, Dialog, Menu, Badge…), layout/ (AppShell, Sidebar, PublicLayout), brand/
  features/     chat/, documents/, auth/
  pages/        Landing, About, Contact, NotFound
```
