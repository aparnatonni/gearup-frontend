<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# gearup-frontend

Gear-rental marketplace frontend: Next.js 16 (App Router) + React 19 + Tailwind v4. Pure client-side app — no route handlers, Server Components, or API routes; every page is a `'use client'` component fetching from an external backend.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (runs type checking; fails on TS errors)
- `npm run start` — serve production build
- `npm run lint` — ESLint (whole project)
- No test suite. No `typecheck` script; verify types with `npm run build` or `npx tsc --noEmit`.

## Architecture

- `lib/api.ts` is the only API client: reads the `token` cookie (via `js-cookie`), sends `Authorization: Bearer <token>`, and wraps responses as `{ success, message, data }`. Throws `Error(message)` on non-2xx.
- Backend base URL is `NEXT_PUBLIC_API_URL` from `.env.local` (gitignored — ask for it if missing).
- Auth: login/register set `token` + `role` cookies (7-day expiry). Protected pages check `Cookies.get('token')` in `useEffect` and `router.push('/auth/login')` if absent, clearing cookies on API failure. Role routing: PROVIDER → `/dashboard/provider`, ADMIN → `/dashboard/admin`, else `/dashboard/customer`.
- `lib/types.ts` holds only auth types (`Role`, `User`, `AuthResponse`). Domain types (Gear, Order, Category, etc.) are defined inline in each page file — keep that pattern, don't centralize them.
- Order status flow: `PLACED` → `CONFIRMED` → `PAID` → `PICKED_UP` → `RETURNED`, plus `CANCELLED` (see `app/dashboard/provider/orders/page.tsx`).

## Conventions

- Path alias `@/*` → repo root.
- Tailwind v4 is CSS-first: no `tailwind.config.*`; theme lives in `app/globals.css` via `@theme`.
- Dates are sent to the API as ISO strings (`new Date(...).toISOString()`).
- External image URLs use `<img>` with `// eslint-disable-next-line @next/next/no-img-element` — the existing pattern; don't force `next/image` here.
