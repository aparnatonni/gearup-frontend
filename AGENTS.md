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
- Route guarding lives in `proxy.ts` (Next 16's replacement for `middleware.ts`): redirects authenticated users off `/auth/*` and blocks `/dashboard/*` without a token; the role cookie drives which dashboard section a user can open. Both files must stay in sync if you change role routing.
- `lib/types.ts` holds only auth types (`Role`, `User`, `AuthResponse`). Domain types (Gear, Order, Category, etc.) are defined inline in each page file — keep that pattern, don't centralize them.
- Order status flow: `PLACED` → `CONFIRMED` → `PAID` → `PICKED_UP` → `RETURNED`, plus `CANCELLED` (see `app/dashboard/provider/orders/page.tsx`). Payment initiation: `POST /payments/create { rentalOrderId }` → `{ checkoutUrl }`, redirect via `window.location.assign()`.
- Shared components: `components/StatusBadge.tsx` (status pill + `nextProviderAction()` for the provider's next-step button), `components/Toast.tsx` (`useToast()` — use for success/error feedback, not `alert`), `components/GearCard.tsx`, `components/Skeleton.tsx`, `components/Spinner.tsx`.
- Gear image field is an array: `images: string[]` (NOT a single `imageUrl`) — matches the backend contract in `GearUp API.postman_collection.json`. Provider add/edit forms collect a list of image URLs.
- Admin endpoints (backend): `GET /admin/users`, `PATCH /admin/users/:id { status: "ACTIVE" | "SUSPENDED" }`, `GET /admin/gear`, `GET /admin/rentals` (see `app/dashboard/admin/*`). No `DELETE /provider/gear/:id` exists — use `PUT /provider/gear/:id` with `{ available: false }` to take gear offline.

## Conventions

- Path alias `@/*` → repo root.
- Tailwind v4 is CSS-first: no `tailwind.config.*`; theme lives in `app/globals.css` via `@theme`.
- Dates are sent to the API as ISO strings (`new Date(...).toISOString()`).
- External image URLs use `next/image` with `fill` inside a `relative` sized wrapper (e.g. `relative aspect-video` / `relative h-12 w-12`). `next.config.ts` allows any remote host via `remotePatterns` wildcard; do not use plain `<img>`.
