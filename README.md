# Foodieez Junction

Foodieez Junction is a Next.js 16 + React 19 + TypeScript restaurant storefront and admin panel for a street-food business in Hubballi, Karnataka.

The app includes:

- Customer-facing menu browsing with cart and WhatsApp ordering
- QR table ordering with printable/exportable table QR codes
- LocalStorage-backed admin panel for order settings, menu, tables, reviews, payments, and storefront controls
- Review submission and moderation flow
- Maintenance mode gate for public routes while preserving admin access

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form + Zod
- Sonner
- qrcode.react + html-to-image + jszip
- @dnd-kit for drag reorder in admin modules

## Install

Use this install command for the full project, including the added QR and drag-and-drop dependencies:

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is currently required because the repo contains a `react-day-picker` and `date-fns` peer-version mismatch.

## Environment Variables

Create a `.env.local` file with:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
ADMIN_SESSION_SECRET=replace-with-a-random-secret-at-least-16-chars
```

Notes:

- Admin authentication is server-validated against these environment variables.
- Admin sessions are stored in an HTTP-only cookie.
- App content settings, menu data, reviews, and table management are LocalStorage-backed by design.

## Run

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm test
```

## Implemented Features

### Customer App

- Hero, categories, dynamic menu, about, contact, and reviews sections
- Cart with LocalStorage persistence and 2-hour restore window
- Minimum order enforcement and per-item max quantity limits
- Operating-hours checks
- Multi-step checkout modal
- WhatsApp order message builder with generated order tokens
- Dine-in and takeaway routing with configurable numbers
- QR table detection from `?table=` and sticky dine-in indicator
- Public reviews page with filters and average rating

### Admin Panel

- Login/logout with middleware-protected admin routes
- Dashboard shell and sidebar navigation
- Order settings management
- UPI management
- Restaurant settings including maintenance mode
- Menu CRUD with category editing
- Table management with QR preview, PNG download, ZIP download, print-all, active/inactive toggles, and drag reorder
- Review moderation with pending/approved tabs, pinning, delete, approve, reject, and home visibility toggle
- Security dashboard for env status, secret health, and session logout

## QR Table Ordering

### How It Works

Each table QR points to:

```text
https://foodieezjunction.com?table=TABLE_NUMBER
```

When a customer opens the link:

- the table number is captured into client state
- the dine-in banner appears
- the checkout flow defaults to dine-in with the scanned table

### Admin QR Operations

From the admin tables page you can:

- create tables
- activate or deactivate tables
- download a single QR as PNG
- download all QR codes as a ZIP
- open a print layout for all tables
- drag reorder table cards

## Persistence Model

This implementation intentionally uses LocalStorage rather than a database.

Primary storage keys:

- `fj-app-settings-v1`
- `fj-cart-v1`
- `fj-reviews-v1`
- `fj-tables-v1`
- `fj-menu-overrides-v1`

This means admin data persists in the browser profile currently being used.

## Important Architecture Notes

- Do not use `useSearchParams` inside the root provider stack. Query-param sync is handled at page level to avoid Next.js prerender issues.
- LocalStorage-backed client rendering should hydrate from `useEffect` into state rather than reading browser storage during render.
- Maintenance mode blocks public routes but keeps `/admin` available.

## Main Files Added Or Extended

Core app and settings:

- `src/lib/app-config.ts`
- `src/context/AppSettingsContext.tsx`
- `src/context/TableContext.tsx`
- `src/utils/storage.ts`
- `src/providers/index.tsx`
- `src/components/MaintenanceGate.tsx`

Ordering and cart:

- `src/providers/CartProvider.tsx`
- `src/components/CartDrawer.tsx`
- `src/components/OrderModal.tsx`
- `src/components/TableIndicatorBanner.tsx`
- `src/components/TableParamSync.tsx`
- `src/utils/order.ts`
- `src/utils/whatsapp.ts`
- `src/hooks/useOperatingHours.ts`

Reviews:

- `src/components/reviews/ReviewCard.tsx`
- `src/components/reviews/ReviewsSection.tsx`
- `src/components/reviews/WriteReviewDialog.tsx`
- `src/app/reviews/page.tsx`
- `src/app/admin/reviews/page.tsx`
- `src/utils/reviews.ts`

Menu:

- `src/utils/menu.ts`
- `src/hooks/useMenuCatalog.ts`
- `src/app/admin/menu/page.tsx`
- `src/components/MenuSection.tsx`
- `src/components/CategoriesGrid.tsx`
- `src/components/FeaturedCarousel.tsx`

Admin auth and security:

- `middleware.ts`
- `src/lib/admin-session.ts`
- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/logout/route.ts`
- `src/app/api/admin/security/status/route.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/security/page.tsx`

Tables:

- `src/app/admin/tables/page.tsx`
- `src/utils/qrcode.ts`

## Validation Status

Validated successfully with:

- `npm run build`
- `npm test`

## Deployment Notes

- Set the three admin env variables in your deployment target.
- Update `baseDomain` in admin settings if the production URL changes.
- `metadataBase` is set to `https://foodieezjunction.com` in the app metadata.

