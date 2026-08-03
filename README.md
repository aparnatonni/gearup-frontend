# GearUp Frontend

Gear-rental marketplace frontend built with **Next.js 16 (App Router)** + **React 19** + **Tailwind CSS v4**. Pure client-side app — every page is a `'use client'` component that talks to the GearUp backend via `lib/api.ts`.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file with the backend base URL:

   ```
   NEXT_PUBLIC_API_URL=https://gearup-backend-a27i.onrender.com/api
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (fails on TS errors) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint over the whole project |

## Roles & Routing

- **Customer** → `/dashboard/customer` — browse gear, place rentals, pay for confirmed orders, review returned orders, view payment history.
- **Provider** → `/dashboard/provider` — manage gear listings, confirm incoming orders, advance order status.
- **Admin** → `/dashboard/admin` — manage users, moderate gear, oversee rentals.

Order status flow: `PLACED` → `CONFIRMED` → `PAID` → `PICKED_UP` → `RETURNED` (+ `CANCELLED`).

## Admin Credentials

| Email | Password |
|---|---|
| `admin@gearup.com` | `admin123` |

## Payments

Stripe Checkout is integrated. When an order is `CONFIRMED`, the customer calls `POST /payments/create` and is redirected to the returned `checkoutUrl`. Stripe sends the user back to `/payment/success` or `/payment/cancel`.

## API Integration

See [`API_INTEGRATION.md`](./API_INTEGRATION.md) for the full map of frontend components to backend endpoints.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) — learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) — an interactive Next.js tutorial.
