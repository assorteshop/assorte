# ASSORTE — Architecture v1.0 & Foundation Sprint 01

**Status:** Architecture approved; implementation not yet verified  
**Purpose:** Source-of-truth technical brief for Claude Project Knowledge and Claude Code  
**Market:** Ukraine · **Storefront language:** Ukrainian · **Currency:** UAH  
**Business:** Independent curated multi-category e-commerce store operated through a Ukrainian ФОП  
**Last consolidated:** 25 October 2026

> **Important distinction:** This document specifies an approved plan, not evidence that a repository, database, deployment, integrations, or live shop already exist.

## 1. Product and business boundaries

ASSORTE is a curated store of useful, aesthetically appealing and distinctive products. It is independent of Talent Mates and MATE: separate brand, codebase, repository, infrastructure, credentials, finances, analytics, and customer data.

### Approved categories

| Category | Slug | Initial research candidates |
|---|---|---|
| Sport & Active | `/category/sport-active` | Smart counting jump rope; reaction ball |
| Tech & Gadgets | `/category/tech-gadgets` | Compact power bank with integrated cables |
| Gifts & Discoveries | `/category/gifts-discoveries` | Mechanical puzzle gift box |
| Style & Comfort | `/category/style-comfort` | Crossbody hand-warmer / muff bag |

These are **candidates**, not confirmed SKUs, inventory, wholesale offers, or retail prices. Start with a few validated products, but implement all four categories immediately.

### Operating model

- Mixed fulfilment: own stock and supplier-sourced products, tracked per SKU and stock source.
- Payments: online card and cash on delivery (COD), subject to provider and compliance verification.
- Delivery: Nova Poshta. Manual shipment/TTN processing is acceptable initially.
- Initial infrastructure target: **USD 30–70/month**, excluding ads, inventory, payment fees, taxes, and development. Verify current provider prices and overage terms.
- Product-specific landing pages with a shared cart and checkout.
- No fake reviews, ratings, sales counts, stock claims, delivery guarantees, or fabricated legal details.

## 2. Approved brand design system v1.0

The founder-approved homepage screenshot is the **primary visual reference**. Add the screenshot to Claude Project Knowledge alongside this file. Do not replace it with a generic template.

- **Signature Red:** `#B60016`
- **Pure White:** `#FFFFFF`
- **Graphite:** `#171717`
- **Warm Ivory:** `#F6F4F1`
- **Headlines:** Manrope Medium (500)
- **Body and UI:** Inter Regular (400), Medium (500)
- **Wordmark:** `ASSORTE` uppercase with generous tracking
- **Hero copy:** «Продумані деталі для кращих моментів»
- **Emotional signature:** «Більше, ніж просто речі ♡»

Visual language: premium editorial restraint, warm realistic lifestyle photography, whitespace, clear product focus, selective red CTA accents, responsive layouts, accessible contrast. Avoid generic AI gradients, glassmorphism, heavy animations and visual clutter. For the handwritten signature, use a legible Cyrillic-compatible font or custom SVG if appropriate.

## 3. Architecture v1.0 — approved stack

| Layer | Technology | Notes |
|---|---|---|
| Web application | Next.js App Router | Single application, no separate backend or microservices |
| Language | TypeScript strict | Typed domain and integrations |
| Styling | Tailwind CSS | Tokenized approved design system |
| Hosting | Vercel commercial plan | Production and preview environments separated |
| Database | Supabase PostgreSQL | SQL migrations, transactions, backups |
| Authentication | Supabase Auth | Admin authentication only at MVP |
| Media | Supabase Storage | Product media and access policies |
| Source control | Private GitHub repo | Owned by founder, independent of other ventures |
| Validation | Zod | All server entry points |
| Unit/integration tests | Vitest | Domain rules, checkout, stock, webhooks |
| End-to-end tests | Playwright | Mobile and desktop checkout flows |

**Engineering boundary:** Next.js server routes/actions own commerce operations. Browsers cannot set authoritative price, payment status, order totals, or inventory counts.

### Logical modules

1. **Storefront:** home, category pages, product pages, cart, checkout, legal and service pages.
2. **Commerce domain:** catalogue, variants, pricing, inventory, reservations, orders, payments, shipments.
3. **Admin:** protected product/content management, stock and orders.
4. **Adapters:** payment provider, Nova Poshta, fiscal receipt provider; implementations deferred until verified.
5. **Infrastructure:** Supabase, migrations, Vercel environments, CI and observability.

## 4. Data model — baseline

Core tables:

- `categories` — four category records with stable slugs and ordering.
- `products` — title, slug, description, category associations, publication status, merchandising metadata.
- `product_variants` — SKU, options, active status, authoritative price in integer kopiykas.
- `product_media` — product images/videos, alt text, ordering.
- `landing_pages` — product-specific landing configurations.
- `landing_sections` — typed sections and their content/order.
- `stock_locations` — own warehouse or supplier-associated location/source.
- `inventory` — SKU-by-location available/on-hand information.
- `inventory_reservations` — order-linked reserved quantities and expiry.
- `orders` — customer, amounts, state, fulfilment and audit metadata.
- `order_items` — immutable SKU, title, quantity and price snapshots.
- `payments` — provider, external IDs, verified states and amounts.
- `shipments` — carrier, method, destination, tracking/TTN and states.
- `order_events` — append-only audit events.
- `admin_users` — authorized admin identities/roles.
- `integration_events` — inbound provider event IDs, processing state and deduplication.

Additional supporting tables and join tables may be introduced with justification (e.g., product-to-category relation). Avoid premature abstraction.

**Critical data rules:**

- Store money as integer minor units (kopiykas), never floating-point currency values.
- Capture immutable order item descriptions, quantities and prices at checkout.
- Reserve stock atomically with order creation; handle concurrency and reservation expiry.
- Supplier inventory must not be presented as guaranteed without a verified availability process.
- Separate **order**, **payment**, and **shipment** state machines.
- Webhooks must verify provider authenticity and be idempotent.
- Mark online payments paid only after trusted verification; COD is not paid merely because goods were dispatched or delivered.
- RLS, least-privilege database grants and server-side authorization are mandatory. Never expose service-role secrets.

## 5. Planned routes

- `/` — homepage
- `/category/[slug]` — category listing
- `/products/[slug]` — reusable product landing page
- `/cart` — cart
- `/checkout` — checkout
- `/delivery-and-payment` — shipping and payment information
- `/returns` — returns information
- `/privacy` — privacy policy
- `/terms` — public offer / terms
- `/admin` — protected back office and nested management routes

Actual legal copy, seller identifiers, provider terms, guarantees and policy details must be confirmed before publication.

## 6. Integrations and compliance gates

### Payment adapter

Implement a typed provider interface, but **do not invent a payment provider API**. Provider selection remains open pending current fee, settlement, contract, API, and Ukrainian fiscalization review. Use hosted card checkout where supported. Never store card details.

### Nova Poshta adapter

Implement typed shipping contracts. Manual shipment creation is sufficient for initial pilot. Branch/parcel-locker lookup, TTN generation and status updates can follow when verified against official APIs and account access.

### Fiscalization adapter

Design an interface only until Ukrainian accountant/legal review establishes the correct PRRO/receipt workflow for card and COD settlement arrangements.

### Go-live blockers

Before accepting real orders, confirm with qualified Ukrainian professionals and providers: ФОП/KVED suitability, fiscalization, COD remittance, consumer rights/returns, product-specific compliance (especially batteries), seller identification, privacy, warranty and payment-provider requirements.

## 7. Foundation Sprint 01 — Claude Code implementation brief

### Role

Act as Principal Engineer and Technical Lead. Implement a secure, maintainable, testable foundation. The approved architecture and design are binding. Work in a new private `assorte` repository, separate from Talent Mates/MATE.

### First action: inspect and plan

1. Inspect the current working directory, installed tools, existing files and accessible services.
2. Do **not** claim credentials, GitHub access, Supabase project access or deployment access unless confirmed.
3. Produce a concise implementation plan, dependencies, risks and acceptance checks.
4. Prefer incremental milestones and report blockers rather than simulating success.

### Milestone A — repository and framework

- Create Next.js App Router project with strict TypeScript and Tailwind.
- Add ESLint, formatting, environment validation, `.env.example`, safe `.gitignore`, and setup README.
- Organize storefront, domain, adapters and admin into clear modules.
- Set up a private GitHub repository only if authorization and access exist.
- Add basic CI for typecheck, lint, tests and build.

### Milestone B — approved storefront

- Implement homepage faithful to founder-approved screenshot and Design System v1.0.
- Build all four category routes and dynamic product landing pages.
- Implement reusable product components, cart and checkout UI.
- Use **clearly labelled demo products** until real product data exists.
- Use real, licensed/authorized images or clearly marked placeholders; do not fabricate claims.
- Verify mobile layout, loading states, accessibility and keyboard navigation.

### Milestone C — database and admin

- Create versioned SQL migrations for the baseline data model.
- Seed four categories and demo products as unpublished/demo data.
- Implement Supabase Auth for admin and enforce server-side authorization.
- Implement admin CRUD for products, variants, media, landing content, inventory and order viewing.
- Apply and test RLS and database privileges, including negative-access cases.

### Milestone D — safe development checkout

- Implement server-authoritative totals and validated checkout payloads.
- Persist development-mode orders and immutable line-item snapshots.
- Reserve inventory atomically with transaction-safe concurrency behavior.
- Implement reservation expiry/release and retry-safe idempotency.
- Provide **simulated** card and COD pathways clearly identified as non-production.
- Do not claim real payment success; no real charges, real shipments or real fiscal receipts.

### Milestone E — adapter contracts and tests

- Define typed payment, shipping and fiscalization adapter interfaces.
- Implement development mocks only; no guessed third-party endpoints.
- Add Vitest tests for money arithmetic, stock reservation, order snapshots, authorization and webhook idempotency.
- Add Playwright tests for home → category → product → cart → checkout, mobile responsiveness and admin access denial.
- Run typecheck, lint, tests and production build; record actual results.

### Milestone F — preview and handoff

- Deploy to Vercel preview **only if** authorized credentials and infrastructure exist.
- Provide preview URL if deployed; otherwise give exact steps and identify blockers.
- Report changed files, migrations, environment variables, test evidence, known gaps and next steps.
- **Stop before activating production payment acceptance.**

## 8. Definition of Done — Foundation Sprint 01

A sprint is complete only when verified evidence exists for all applicable criteria:

- [ ] Repository is private and founder-controlled (if repo access granted).
- [ ] Next.js application typechecks, lints, tests and builds successfully.
- [ ] Homepage matches approved screenshot and typography/colour system.
- [ ] Four category pages exist and render correctly.
- [ ] Demo product landing pages use a reusable template.
- [ ] Cart and development checkout work end-to-end.
- [ ] Orders persist in Supabase with immutable line-item snapshots.
- [ ] Inventory reservations are transactional and concurrency-tested.
- [ ] Admin is authenticated and protected by server checks and database policies.
- [ ] No secrets are exposed to the browser or repository.
- [ ] No real payment is falsely marked successful.
- [ ] Payment, shipping and fiscal adapters have documented typed interfaces.
- [ ] Responsive/mobile and critical failure paths are tested.
- [ ] Preview deployment works, **or** its blockers are explicitly documented.
- [ ] README includes setup, migrations, tests, environment variables and operational caveats.

**Not included in Sprint 01:** real card acceptance, real COD settlement, live Nova Poshta automation, PRRO activation, customer accounts, loyalty, mobile app, AI recommendations, multi-vendor marketplace, large catalogue, international rollout.

## 9. Cost, IP and operational controls

- Founder owns all code, designs, domain, credentials, data and IP.
- Keep third-party accounts and billing in founder-controlled identities.
- Separate dev/preview and production environment variables and databases.
- Avoid subscriptions or complex services without demonstrated necessity.
- Confirm actual Vercel/Supabase costs and backup/restore capabilities before launch.
- Use minimal PII collection and implement appropriate retention and access controls.
- Require explicit approval before irreversible migrations, paid provisioning, live integrations or destructive actions.

## 10. Decision log and unresolved work

### Approved

- Ukraine-only launch; Ukrainian UI; UAH; Ukrainian ФОП.
- Four categories and initial candidate list.
- Brand visual design and two Ukrainian brand lines.
- Next.js + TypeScript + Tailwind + Vercel + Supabase + private GitHub.
- Shared cart and checkout; per-product landing pages; simple admin.
- Online card and COD requirement; Nova Poshta shipping direction.
- Mixed inventory sources; security and test requirements.

### Not approved / not yet verified

- Suppliers, wholesale terms, final SKUs, actual stock and retail prices.
- Payment gateway, COD payout arrangement, fiscal receipt vendor.
- Production legal pages, warranty terms and product compliance.
- Actual repo state, completed code, connected Supabase, deployment.
- Proven conversion rate, customer acquisition costs or product-market fit.

## 11. Next execution sequence

1. Upload this document and the **approved homepage screenshot** into Claude Project Knowledge.
2. Open Claude Code in a fresh `assorte` workspace.
3. Ask for an inspection and milestone plan before coding.
4. Implement and verify Milestones A and B first; then proceed to database/admin/checkout with evidence.
5. In parallel, verify suppliers and operational/legal readiness before any production launch.

**Operating principle:** Validate the product and economics; build a reliable store; never mistake a beautiful demo for a trading business.
