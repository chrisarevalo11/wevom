# Evom Web

Headless Shopify storefront built with Next.js, Tailwind CSS v4, GSAP, TanStack Query, and Zustand.

## Stack

- **Framework:** Next.js (App Router)
- **Commerce:** Shopify Storefront API
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP + `@gsap/react`
- **Data:** TanStack Query (client), Server Actions (cart)
- **State:** Zustand (cart UI)
- **Tooling:** Biome, Husky, TypeScript

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Add your Shopify credentials to `.env`:

- `SHOPIFY_STORE_DOMAIN` — e.g. `your-store.myshopify.com`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — from Shopify Admin → Settings → Apps → Headless / Storefront API

3. Install dependencies and run the dev server:

```bash
bun install
bun run dev
```

4. (Optional) Generate typed GraphQL definitions:

```bash
bun run codegen
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run Biome checks |
| `bun run format` | Format with Biome |
| `bun run check` | Lint + format + safe fixes |
| `bun run codegen` | Generate Shopify GraphQL types |

## Project structure

```
src/
├── app/              # Next.js routes (marketing, shop, cart)
├── components/       # Shared UI, layout, landing sections
├── features/         # Domain-specific modules (cart, products)
├── lib/              # Shopify client, GSAP, Three.js utilities
│   └── three/        # model-paths.ts, motion hooks
├── components/
│   └── three/        # R3F scenes and model components
├── hooks/            # Shared React hooks
├── stores/           # Zustand stores
├── config/           # Site config and constants
└── env.ts            # Typed environment variables
```

## 3D models (landing hero)

Place GLB files under `public/models/`:

```
public/models/body/body-model.glb   ← hero body model
```

Until that file exists, a placeholder silhouette renders automatically. See `public/models/body/README.md` for the full folder convention.

## Checkout flow

Cart mutations run through Next.js Server Actions. When the customer is ready to pay, they are redirected to Shopify's hosted `checkoutUrl` for secure payment processing.

## Notes

- Without Shopify env vars configured, product pages show a setup notice instead of crashing.
- Pre-commit hooks run Biome on staged files via Husky.
