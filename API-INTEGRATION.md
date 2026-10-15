# Booking platform API integration

The host and guest UI now uses the booking platform backend, keeping Redux as a client cache. Demo listing/reservation/room/review/chat/wishlist records are no longer initialized or used as fallbacks. Mutations update state only after successful server responses. Switching accounts clears private data; late responses from a previous account are discarded. Chat threads poll every five seconds, and account lists refresh every 30 seconds while the tab is visible.

## Local setup

The supplied `.env.local` points at `http://localhost:3109/api/v1`. Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend's `/api/v1` root for deployment. It must not include `/booking-platform`, because auth remains under `/auth/user` and the backend supports the platform's unprefixed route aliases. Restart/rebuild Next.js after changing a public environment variable.

```powershell
npm ci
npm run typecheck
npm run test:api
npm run build
npm run dev
```

The backend must be running with the new `src/app/router.ts` routes compiled and its migrations applied. Its previous legacy build errors are a separate prerequisite for a complete main-server deployment. Browser origins must be allowed by backend CORS. Local `http://localhost:3000` is already in its allowlist; other frontend origins must be added deliberately.

## Connected flows

- Existing login, OTP, profile, refresh-token and role switching continue using the existing auth APIs.
- Listings and search load from PostgreSQL-backed APIs. Details fetch by ID without falling back to another property. Search checks server availability and filters before loading results. Map requests use the backend; the old Next.js mock map endpoint is now a proxy.
- Hosts create listings and manage room types. Create a **Hotel** listing first, then add its room types through the hotel selector. Room images upload to S3 before their HTTPS URLs are submitted. Room edit includes a daily inventory/rate editor, guarded by backend reservation checks.
- Guest booking uses a server quote and an idempotency key. Billing details are collected for ShurjoPay; card credentials are entered at hosted checkout. Prices are displayed as **BDT**. A returned reservation stays pending until payment verification succeeds. Trips includes a button for pending/remaining-balance checkout.
- Guest cancellation, host status changes, guest/host reviews and review responses call the server. The former "simulate completed stay" action now re-fetches the actual server state and only opens a review for a completed stay.
- Wishlist, chat inquiries/messages/read receipts, notifications, host reports/standards and payout destination/tax/welcome settings are persisted or derived through their APIs. Reports show actual payment transactions and can export the booking ledger to CSV. FAQ/blog content and room amenity catalogs load from the backend.

## ShurjoPay return URL

Configure these **backend-only** environment variables: `SHURJOPAY_USERNAME`, `SHURJOPAY_PASSWORD`, `SHURJOPAY_PREFIX`, and `SHURJOPAY_CALLBACK_URL`.

For the frontend return experience, set:

```dotenv
SHURJOPAY_CALLBACK_URL=https://YOUR_PUBLIC_FRONTEND_HOST/api/payments/shurjopay/return
```

The Next.js return handler forwards `order_id` to the backend's verified callback, then redirects to the user's localized Trips page. It never trusts a browser-supplied payment amount or success flag. A public HTTPS frontend and reachable backend are required for a real ShurjoPay callback. A localhost-only frontend needs an approved public development URL for gateway testing. Merchant credentials must never be placed in `NEXT_PUBLIC_*` variables.

Refund queues and saved bank details do not execute automatic refunds or bank disbursements. Email/SMS/push delivery is not implemented by the backend. Chat uses HTTP polling rather than the old unauthenticated socket rooms.

## Verification

The frontend TypeScript check, production Next.js build, focused lint of the new API/data/checkout modules, and six API integration tests were run. Tests cover pagination/auth headers, persistence before state changes, failed saves, reservation retry keys, server IDs, removal of forged host/chat identity fields, and avatar paths. These tests mock HTTP responses; they do not make live gateway payments. The backend's 12 PostgreSQL/API integration tests are available via `npm run test:booking-platform` in the backend project.
