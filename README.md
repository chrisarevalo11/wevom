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
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — from Shopify Admin → Settings → Apps and sales channels → Develop apps (or the Headless channel). The app needs the Storefront API scopes `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_read_checkouts` and `unauthenticated_write_checkouts`, and products must be published to that app's sales channel.

3. Install dependencies and run the dev server:

```bash
bun install
bun run dev
```

4. Generate typed GraphQL definitions (re-run after editing any query under `src/lib/shopify`; the generated `types/storefront.*.d.ts` are committed, the schema JSON is not):

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
├── app/              # Next.js routes (marketing, shop)
├── components/       # Shared UI, layout, landing sections
├── features/         # Domain-specific modules (cart, products)
│   └── products/catalog.ts   # The only Shopify → view-model mapping (showcase, catalog, detail)
├── lib/              # Shopify client, GSAP, Three.js utilities
│   └── three/        # model-paths.ts, motion hooks
├── components/
│   └── three/        # R3F scenes and model components
├── hooks/            # Shared React hooks
├── stores/           # Zustand stores
├── config/           # Site config and constants
│   ├── product-categories.ts # Filter families + Shopify "Product type" → family aliases
│   └── catalog-layout.ts     # Authored scatter slots for the catalog and home showcase
└── env.ts            # Typed environment variables
```

## 3D models (landing hero)

Place GLB files under `public/models/`:

```
public/models/body/body-model.glb   ← hero body model
```

Until that file exists, a placeholder silhouette renders automatically. See `public/models/body/README.md` for the full folder convention.

## Products

- The home showcase shows the newest products (up to the number of showcase slots); the catalog lists everything. Both read Shopify through `src/features/products/catalog.ts`, which is the single place to change when the showcase moves to a curated collection.
- The category filter is driven by each product's **Product type** in Shopify Admin. Types are matched case- and accent-insensitively against the alias table in `src/config/product-categories.ts` (e.g. "Chaquetas" → jackets). A product with an empty or unknown type still appears under "All".
- The second product image is the card's hover frame.
- Storefront calls are cached for 60 s and tagged `products` / `product:<handle>`, ready for webhook-driven revalidation.

## Checkout flow

Cart mutations run through Next.js Server Actions. When the customer is ready to pay, they are redirected to Shopify's hosted `checkoutUrl` for secure payment processing.

## Notes

- Without Shopify env vars, the home showcase is hidden, `/products` shows a setup notice, and product pages return 404.
- Pre-commit hooks run Biome on staged files via Husky.
