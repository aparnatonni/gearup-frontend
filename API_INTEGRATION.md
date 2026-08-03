# API Integration

All requests go through the single client in `lib/api.ts`, which:
- Reads the `token` cookie (`js-cookie`) and sends `Authorization: Bearer <token>`.
- Wraps every response as `{ success, message, data }`.
- Throws `Error(message)` on non-2xx so UI layers can surface the backend message.

Base URL: `NEXT_PUBLIC_API_URL` (see `.env.local`).

## Endpoint → Component map

### Auth
| Method | Endpoint | Component |
|---|---|---|
| POST | `/auth/register` | `app/auth/register/page.tsx` |
| POST | `/auth/login` | `app/auth/login/page.tsx` |
| GET | `/auth/me` | `app/dashboard/customer/page.tsx`, `app/dashboard/provider/page.tsx`, `app/dashboard/admin/page.tsx` |

### Marketplace
| Method | Endpoint | Component |
|---|---|---|
| GET | `/gear` | `app/page.tsx`, `app/gear/page.tsx` |
| GET | `/gear/:id` | `app/gear/[id]/page.tsx` |
| GET | `/categories` | `app/page.tsx`, `app/gear/page.tsx`, `app/dashboard/provider/gear/new/page.tsx`, `app/dashboard/provider/gear/[id]/edit/page.tsx` |

### Rentals / Orders
| Method | Endpoint | Component |
|---|---|---|
| POST | `/rentals` | `app/gear/[id]/page.tsx` (place rental) |
| GET | `/rentals` | `app/dashboard/customer/page.tsx`, `app/dashboard/customer/orders/page.tsx` |
| GET | `/rentals/:id` | `app/dashboard/customer/orders/[id]/pay/page.tsx`, `app/payment/success/page.tsx` |

### Payments (Stripe Checkout)
| Method | Endpoint | Component |
|---|---|---|
| POST | `/payments/create` | `app/dashboard/customer/orders/page.tsx`, `app/dashboard/customer/orders/[id]/pay/page.tsx` (redirects to `checkoutUrl`) |
| GET | `/payments` | `app/dashboard/customer/page.tsx`, `app/dashboard/customer/payments/page.tsx` |
| GET | `/payment/success` (callback) | `app/payment/success/page.tsx` |
| GET | `/payment/cancel` (callback) | `app/payment/cancel/page.tsx` |

### Reviews
| Method | Endpoint | Component |
|---|---|---|
| POST | `/reviews` | `app/dashboard/customer/orders/page.tsx` |

### Provider
| Method | Endpoint | Component |
|---|---|---|
| GET | `/provider/gear` | `app/dashboard/provider/page.tsx` |
| POST | `/provider/gear` | `app/dashboard/provider/gear/new/page.tsx` |
| GET | `/provider/gear/:id` | `app/dashboard/provider/gear/[id]/edit/page.tsx` |
| PUT | `/provider/gear/:id` | `app/dashboard/provider/gear/[id]/edit/page.tsx` (update + `{ available }` toggle) |
| GET | `/provider/orders` | `app/dashboard/provider/page.tsx`, `app/dashboard/provider/orders/page.tsx` |
| PATCH | `/provider/orders/:id` | `app/dashboard/provider/orders/page.tsx` (`{ status }` advance) |

### Admin
| Method | Endpoint | Component |
|---|---|---|
| GET | `/admin/users` | `app/dashboard/admin/page.tsx`, `app/dashboard/admin/users/page.tsx` |
| PATCH | `/admin/users/:id` | `app/dashboard/admin/users/page.tsx` (`{ status: "ACTIVE" \| "SUSPENDED" }`) |
| GET | `/admin/gear` | `app/dashboard/admin/page.tsx`, `app/dashboard/admin/gear/page.tsx` |
| GET | `/admin/rentals` | `app/dashboard/admin/page.tsx`, `app/dashboard/admin/rentals/page.tsx` |
