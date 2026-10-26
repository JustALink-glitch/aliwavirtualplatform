# Synqop web

Frontend for Synqop V1 — admin, trainer and participant apps (desktop and mobile web).
Screens: Figma `u0Cotvhu5Xk0mr2zoD5GYA`. Rules: *Synqop Development Reference V1*.

> The previous Training Ops UI is in `legacy/` for reference only.

## Stack

Vite, React 19, TypeScript, React Router, TanStack Query, Tailwind CSS 4, Supabase Auth, Lucide icons, Inter.

## Setup

```bash
nvm use
npm install
cp .env.example .env.local   # API URL, Supabase URL and publishable key
npm run dev                  # http://localhost:5173
```

The API (`synqopbackend`, branch `synqop-v1`) must be running for sign-in to complete.

## Structure

```
src/
  app/          router and per-role navigation (§04)
  auth/         Supabase session + /v1/me (organisation, role); area guards
  components/   shared UI; shell/ is the app shell
  lib/          env, API client, Supabase client, roles
  pages/        screens, grouped by area as they're built
  styles/       design tokens (§09) and base styles
```

## Design tokens

`src/styles/index.css` maps the Figma variables one-to-one. Use semantic utilities, never raw colours:

| Figma | Tailwind |
|---|---|
| `color/bg/canvas` | `bg-canvas` |
| `color/surface/default` · `hover` · `selected` | `bg-surface` · `bg-surface-hover` · `bg-surface-selected` |
| `color/text/primary` · `secondary` · `muted` | `text-primary` · `text-secondary` · `text-muted` |
| `color/border/default` · `strong` | `border-default` · `border-strong` |
| `color/brand/primary` | `bg-brand`, `text-brand-text` for brand text |
| `color/status/success bg · fg · solid` | `bg-success-bg` · `text-success-fg` · `bg-success` |
| `radius/sm … xl` | `rounded-sm … rounded-xl` |
| `layout/page-gutter`, `sidebar-width`, `topbar-height`, `control-height` | `px-gutter`, `w-sidebar`, `h-topbar`, `h-control` |
| Text styles (Title/Page, Body/Default, Metric/Large…) | `text-page-title`, `text-body`, `text-metric-large`… |

Dark theme tokens are defined and switch with `<html data-theme="dark">`; V1 screens are designed in light mode.

## Rules

- Product data goes through the API (`src/lib/api.ts`). The browser uses Supabase only for auth and file uploads.
- Area guards are for navigation only. The API enforces every permission.
- Show "—" or the designed empty state when a metric has nothing to measure. Never default to 100%.
